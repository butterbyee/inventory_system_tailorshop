import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/db.js';

let db,server,base,admin,staff,viewer;
async function request(path,{body,method=body?'POST':'GET',cookie=admin,headers={}}={}) {
  const response=await fetch(`${base}/api${path}`,{method,headers:{...(cookie?{cookie}:{}),...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:body instanceof FormData?body:JSON.stringify(body)}:{})});
  const data=response.headers.get('content-type')?.includes('application/json')?await response.json():Buffer.from(await response.arrayBuffer());
  return {response,status:response.status,data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
const newItem=(overrides={})=>({sku:`TEST-${crypto.randomUUID().slice(0,8)}`,name:'Test cotton',category:'Fabrics',color:'Natural',unit:'meter',quantity:10.5,reorderLevel:5,unitCost:125.25,location:'Test shelf',supplierId:1,notes:'Integration test',...overrides});
before(async()=>{
  const result=createApp({databasePath:':memory:'});db=result.db;
  server=result.app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  base=`http://127.0.0.1:${server.address().port}`;
  admin=(await request('/auth/login',{body:{email:'admin@threadstock.local',password:'Admin123!'},cookie:null})).cookie;
  staff=(await request('/auth/login',{body:{email:'staff@threadstock.local',password:'Staff123!'},cookie:null})).cookie;
  viewer=(await request('/auth/login',{body:{email:'viewer@threadstock.local',password:'Viewer123!'},cookie:null})).cookie;
});
after(async()=>{await new Promise(resolve=>server.close(resolve));db.close();});

test('authentication requires session; passwords and token hashes never leave the API',async()=>{
  assert.equal((await request('/workspace',{cookie:null})).status,401);
  assert.equal((await request('/auth/login',{body:{email:'admin@threadstock.local',password:'wrong'},cookie:null})).status,401);
  const r=await request('/workspace');assert.equal(r.status,200);assert.equal(r.data.items.length,24);assert.equal(r.data.user.role,'admin');
  assert(!JSON.stringify(r.data).includes('password_hash'));assert(!JSON.stringify(r.data).includes('token_hash'));
  const login=await request('/auth/login',{body:{email:'admin@threadstock.local',password:'Admin123!'},cookie:null});
  assert.match(login.response.headers.get('set-cookie'),/HttpOnly/);assert.match(login.response.headers.get('set-cookie'),/SameSite=Strict/);
  assert.equal((await request('/auth/logout',{method:'POST',cookie:login.cookie})).status,200);
  assert.equal((await request('/auth/me',{cookie:login.cookie})).status,401);
});
test('roles and foreign origins are rejected by the server',async()=>{
  assert.equal((await request('/items',{body:newItem(),cookie:viewer})).status,403);
  assert.equal((await request('/users',{body:{name:'New user',email:'new@example.com',password:'Password123!',role:'admin'},cookie:staff})).status,403);
  assert.equal((await request('/movements',{body:{itemId:1,type:'adjust',quantity:1,expectedQuantity:42.5,reason:'Test count'},cookie:staff})).status,403);
  assert.equal((await request('/items',{body:newItem(),headers:{origin:'https://external.example'}})).status,403);
  assert.equal((await request('/workspace',{cookie:viewer})).data.users.length,0);
});
test('stock remains exact across fractional receipts/issues and rejected overdrafts',async()=>{
  const created=await request('/items',{body:newItem()});assert.equal(created.status,201);const id=created.data.id;
  for(const [type,quantity] of [['receive',0.1],['receive',0.2],['issue',0.3]]) assert.equal((await request('/movements',{body:{itemId:id,type,quantity,reference:'JOB-TEST',reason:'Fractional stock test'},cookie:staff})).status,201);
  let row=db.prepare('SELECT quantity_milli FROM items WHERE id=?').get(id);assert.equal(row.quantity_milli,10500);
  const count=db.prepare('SELECT COUNT(*) AS n FROM movements WHERE item_id=?').get(id).n;
  assert.equal((await request('/movements',{body:{itemId:id,type:'issue',quantity:20,reason:'Too much stock'}})).status,409);
  row=db.prepare('SELECT quantity_milli FROM items WHERE id=?').get(id);assert.equal(row.quantity_milli,10500);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM movements WHERE item_id=?').get(id).n,count);
  assert.equal((await request('/movements',{body:{itemId:id,type:'receive',quantity:0.0001,reason:'Too precise'}})).status,400);
});
test('countable stock rejects fractions; metadata cannot bypass the ledger',async()=>{
  assert.equal((await request('/items',{body:newItem({unit:'piece',quantity:1.5})})).status,400);
  const item=newItem({unit:'piece',quantity:10,reorderLevel:2});const {data:{id}}=await request('/items',{body:item});
  assert.equal((await request('/movements',{body:{itemId:id,type:'receive',quantity:0.5,reason:'Fraction not valid'}})).status,400);
  assert.equal((await request(`/items/${id}`,{method:'PATCH',body:item})).status,400);
  const {quantity,...metadata}=item;
  assert.equal((await request(`/items/${id}`,{method:'PATCH',body:{...metadata,unit:'meter'}})).status,400);
  assert.equal((await request(`/items/${id}`,{method:'PATCH',body:{...metadata,name:'Renamed material'}})).status,200);
});
test('reconciliation detects a stale count and writes a signed difference on success',async()=>{
  const {data:{id}}=await request('/items',{body:newItem()});
  assert.equal((await request('/movements',{body:{itemId:id,type:'adjust',quantity:8.25,expectedQuantity:9,reason:'Physical stock check'}})).status,409);
  assert.equal((await request('/movements',{body:{itemId:id,type:'adjust',quantity:8.25,expectedQuantity:10.5,reason:'Physical stock check'}})).status,201);
  const row=db.prepare('SELECT * FROM movements WHERE item_id=? ORDER BY id DESC LIMIT 1').get(id);
  assert.equal(row.delta_milli,-2250);assert.equal(row.before_milli,10500);assert.equal(row.after_milli,8250);
});
test('simultaneous issues cannot spend the same balance twice',async()=>{
  const {data:{id}}=await request('/items',{body:newItem({quantity:1})});
  const results=await Promise.all([1,2].map(()=>request('/movements',{body:{itemId:id,type:'issue',quantity:0.75,reason:'Concurrent tailoring orders'}})));
  assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
  assert.equal(db.prepare('SELECT quantity_milli FROM items WHERE id=?').get(id).quantity_milli,250);
});
test('unique SKUs, supplier links and user accounts are validated',async()=>{
  const item=newItem();assert.equal((await request('/items',{body:item})).status,201);assert.equal((await request('/items',{body:item})).status,409);
  assert.equal((await request('/items',{body:newItem({supplierId:999999})})).status,400);
  const supplier=await request('/suppliers',{body:{name:'Test supply',contact:'Test person',email:'test@example.com',phone:'',address:''},cookie:staff});assert.equal(supplier.status,201);
  const user=await request('/users',{body:{name:'New viewer',email:'testviewer@example.com',password:'Password123!',role:'viewer'}});assert.equal(user.status,201);
  const login=await request('/auth/login',{body:{email:'testviewer@example.com',password:'Password123!'},cookie:null});assert.equal(login.status,200);assert.equal(login.data.user.role,'viewer');
});
test('Excel preview is read-only and confirmation imports exact decimal values',async()=>{
  const template=await request('/import/template');assert.equal(template.status,200);
  const book=new ExcelJS.Workbook();await book.xlsx.load(template.data);
  const sheet=book.getWorksheet('Inventory');sheet.getCell('A2').value='EXCEL-TEST-001';sheet.getCell('B2').value='Imported linen';sheet.getCell('F2').value=2.125;sheet.getCell('G2').value=1;sheet.getCell('H2').value=100.25;
  const buffer=await book.xlsx.writeBuffer();
  const form=()=>{const f=new FormData();f.set('file',new Blob([buffer]),'materials.xlsx');return f;};
  const beforeCount=db.prepare('SELECT COUNT(*) AS n FROM items').get().n;
  const preview=await request('/import/preview',{body:form()});assert.equal(preview.status,200);assert.equal(preview.data.errors.length,0);assert.equal(preview.data.rows[0].quantity,2.125);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM items').get().n,beforeCount);
  const imported=await request('/import/confirm',{body:form()});assert.equal(imported.status,201);assert.equal(imported.data.count,1);
  const row=db.prepare('SELECT * FROM items WHERE sku=?').get('EXCEL-TEST-001');assert.equal(row.quantity_milli,2125);assert.equal(row.cost_cents,10025);
  assert.equal((await request('/import/confirm',{body:form()})).status,400);
  const exported=await request('/export/inventory?q=EXCEL-TEST-001');const result=new ExcelJS.Workbook();await result.xlsx.load(exported.data);assert.equal(result.getWorksheet('Inventory').getCell('F2').value,2.125);
});
test('invalid Excel rows prevent every row from importing; malformed files fail safely',async()=>{
  const template=await request('/import/template');const book=new ExcelJS.Workbook();await book.xlsx.load(template.data);const sheet=book.getWorksheet('Inventory');sheet.getCell('A2').value='EXCEL-SHOULD-NOT-SAVE';sheet.addRow(['EXCEL-INVALID','Bad item','Fabrics','','meter',-5,1,100,'','','']);
  const f=new FormData();f.set('file',new Blob([await book.xlsx.writeBuffer()]),'invalid.xlsx');assert.equal((await request('/import/confirm',{body:f})).status,400);
  assert(!db.prepare('SELECT id FROM items WHERE sku=?').get('EXCEL-SHOULD-NOT-SAVE'));
  const invalid=new FormData();invalid.set('file',new Blob(['broken workbook']),'broken.xlsx');const r=await request('/import/preview',{body:invalid});assert.equal(r.status,200);assert(r.data.errors.length>0);
});
test('SQLite data survives closing and reopening without reseeding',()=>{
  const directory=mkdtempSync(join(tmpdir(),'threadstock-test-')),path=join(directory,'inventory.sqlite');
  let disk=createDatabase(path);const initial=disk.prepare('SELECT COUNT(*) AS n FROM items').get().n;
  disk.prepare('UPDATE items SET notes=? WHERE id=1').run('Persisted across restart');disk.close();
  disk=createDatabase(path);assert.equal(disk.prepare('SELECT notes FROM items WHERE id=1').get().notes,'Persisted across restart');assert.equal(disk.prepare('SELECT COUNT(*) AS n FROM items').get().n,initial);disk.close();
  rmSync(directory,{recursive:true});
});
