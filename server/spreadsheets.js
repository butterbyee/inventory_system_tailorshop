import ExcelJS from 'exceljs';
import { getItems, transaction } from './db.js';
import { itemSchema, parse } from './validation.js';

const headers=['SKU','Name','Category','Color','Unit','Quantity','Reorder level','Unit cost','Location','Supplier','Notes'];
const keys=['sku','name','category','color','unit','quantity','reorderLevel','unitCost','location','supplierName','notes'];
export function inventoryBook(items,template=false) {
  const book = new ExcelJS.Workbook(); book.creator='Thread & Stock';
  const sheet=book.addWorksheet('Inventory',{views:[{state:'frozen',ySplit:1}]});
  sheet.columns=headers.map((header,i)=>({header,key:keys[i],width:[18,32,23,18,14,14,16,16,24,28,44][i]}));
  for(const item of items) sheet.addRow(item);
  sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};
  sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF6F4B33'}};
  sheet.getRow(1).height=25;
  sheet.autoFilter={from:'A1',to:'K1'};
  sheet.getColumn('unitCost').numFmt='#,##0.00';
  sheet.getColumn('quantity').numFmt='#,##0.###';
  sheet.getColumn('reorderLevel').numFmt='#,##0.###';
  if(template) {
    const help=book.addWorksheet('Read me');
    help.columns=[{width:110}];
    ['Thread & Stock — provisional import template',
      'The original shop workbook has not been provided. These columns are provisional.',
      'Replace the example row in Inventory. Keep all column headings. Maximum 1,000 rows.',
      'Categories: Fabrics, Threads, Trims & notions, Tools & equipment, Packaging.',
      'Units: meter, piece, cone, spool, pack, roll, set. Only meter accepts fractional quantities (3 decimals).',
      'Quantity and Reorder level: non-negative. Unit cost: Philippine pesos with at most 2 decimals.',
      'SKU must be new and unique. Import adds new materials only; existing stock uses Receive or Issue.',
      'Supplier must match an existing supplier name, or be blank. Create new suppliers first.',
      'Preview never saves. Confirm import validates every row again and saves all rows together.',
      'Do not use formulas. Save as .xlsx and upload the Inventory sheet.',
    ].forEach(line=>help.addRow([line]));
  }
  return book;
}
export function movementBook(rows) {
  const book=new ExcelJS.Workbook(); const sheet=book.addWorksheet('Stock movements');
  sheet.columns=[['Date','createdAt',25],['SKU','sku',18],['Material','itemName',30],['Type','type',14],['Change','delta',14],['Unit','unit',14],['Before','before',14],['After','after',14],['Reference','reference',22],['Reason','reason',42],['Recorded by','userName',24]].map(([header,key,width])=>({header,key,width}));
  rows.forEach(row=>sheet.addRow(row)); sheet.getRow(1).font={bold:true}; return book;
}

export async function previewImport(db,buffer) {
  const book=new ExcelJS.Workbook();
  try { await book.xlsx.load(buffer); } catch { return {rows:[],errors:[{row:0,message:'This file could not be read. Upload a valid .xlsx workbook using the template.'}]}; }
  const sheet=book.getWorksheet('Inventory');
  if(!sheet) return {rows:[],errors:[{row:1,message:'The workbook needs an Inventory sheet. Download the import template.'}]};
  if(sheet.rowCount>1001) return {rows:[],errors:[{row:0,message:'Import at most 1,000 rows at a time.'}]};
  const actual=headers.map((_,i)=>String(sheet.getRow(1).getCell(i+1).value || '').trim());
  if(actual.some((v,i)=>v!==headers[i])) return {rows:[],errors:[{row:1,message:'Column headings do not match the template. Download the template and keep its headings.'}]};
  const suppliers=db.prepare('SELECT id,name FROM suppliers').all();
  const existing=new Set(getItems(db).map(i=>i.sku.toLowerCase()));
  const rows=[],errors=[],seen=new Set();
  for(let n=2;n<=sheet.rowCount;n++) {
    const values=headers.map((_,i)=>sheet.getRow(n).getCell(i+1).value);
    if(values.every(v=>v==null || v==='')) continue;
    if(values.some(v=>typeof v==='object' && v!==null)) {errors.push({row:n,message:'Use plain values. Formulas, dates and rich text are not supported.'});continue;}
    const input={}; keys.forEach((key,i)=>input[key]=values[i]==null?'':values[i]);
    const supplierName=String(input.supplierName).trim();
    const supplier=suppliers.find(s=>s.name.toLowerCase()===supplierName.toLowerCase());
    if(supplierName&&!supplier) {errors.push({row:n,message:`Supplier "${supplierName}" does not exist. Create it first.`});continue;}
    for(const key of ['quantity','reorderLevel','unitCost']) input[key]=input[key]===''?0:Number(input[key]);
    input.supplierId=supplier?.id || null;
    for(const key of ['sku','name','category','color','unit','location','notes']) input[key]=String(input[key]);
    try {
      const row=parse(itemSchema,input), sku=row.sku.toLowerCase();
      if(existing.has(sku)||seen.has(sku)) throw new Error(`SKU ${row.sku} already exists or is duplicated in this file.`);
      seen.add(sku); rows.push({...row,row:n,supplierName});
    } catch(error) { errors.push({row:n,message:error.message}); }
  }
  if(!rows.length&&!errors.length) errors.push({row:2,message:'Add at least one material to the Inventory sheet.'});
  return {rows,errors};
}
export function insertItem(db,item,userId,reference='OPENING') {
  const now=new Date().toISOString();
  const id=Number(db.prepare(`INSERT INTO items(sku,name,category,color,unit,quantity_milli,reorder_milli,cost_cents,location,supplier_id,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(item.sku,item.name,item.category,item.color,item.unit,Math.round(item.quantity*1000),Math.round(item.reorderLevel*1000),Math.round(item.unitCost*100),item.location,item.supplierId,item.notes,now,now).lastInsertRowid);
  db.prepare('INSERT INTO movements(item_id,type,delta_milli,before_milli,after_milli,reference,reason,user_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id,'opening',Math.round(item.quantity*1000),0,Math.round(item.quantity*1000),reference,'Opening stock balance',userId,now);
  return id;
}
export function commitImport(db,rows,userId) {
  return transaction(db,()=> rows.map(row=>insertItem(db,row,userId,'EXCEL-IMPORT')));
}
