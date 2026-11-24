import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { randomBytes, createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { z } from 'zod';
import { createDatabase, getItems, getMovements, publicUser, verifyPassword, hashPassword, transaction, categories, units } from './db.js';
import { itemSchema, supplierSchema, userSchema, movementSchema, parse, fail, text } from './validation.js';
import { inventoryBook, movementBook, previewImport, insertItem, commitImport } from './spreadsheets.js';

const tokenHash=value=>createHash('sha256').update(value).digest('hex');
const cookieOptions={httpOnly:true,sameSite:'strict',secure:false,path:'/'};
export function createApp({databasePath=process.env.DATABASE_PATH || 'data/inventory.sqlite'}={}) {
  const db=createDatabase(databasePath), app=express();
  app.disable('x-powered-by');
  app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],fontSrc:["'self'"],imgSrc:["'self'","data:"],connectSrc:["'self'"],upgradeInsecureRequests:null}},strictTransportSecurity:false}));
  app.use(express.json({limit:'100kb'}),cookieParser());
  app.use('/api',(req,res,next)=> {
    res.set('Cache-Control','no-store');
    if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin) {
      let origin;
      try { origin=new URL(req.headers.origin); } catch { return res.status(403).json({error:'Invalid request origin.'}); }
      const allowed=new Set([`http://127.0.0.1:${req.socket.localPort}`,`http://localhost:${req.socket.localPort}`,'http://127.0.0.1:5173','http://localhost:5173']);
      if(!allowed.has(origin.origin)) return res.status(403).json({error:'This local app only accepts requests from its own workspace.'});
    }
    next();
  });
  const attempts=new Map();
  app.get('/api/health',(req,res)=>res.json({status:'ok',database:'sqlite',mode:'local'}));
  app.post('/api/auth/login',(req,res)=> {
    const {email,password}=parse(z.object({email:z.email().max(200),password:z.string().min(1).max(128)}),req.body);
    const key=req.ip, now=Date.now(); let attempt=attempts.get(key);
    if(attempt&&attempt.until<now) { attempts.delete(key); attempt=null; }
    if(attempt?.count>=10) return res.status(429).json({error:'Too many sign-in attempts. Try again in 15 minutes.'});
    const user=db.prepare('SELECT * FROM users WHERE email=?').get(email.trim().toLowerCase());
    if(!user||!verifyPassword(password,user.password_hash)) {
      attempts.set(key,{count:(attempt?.count||0)+1,until:attempt?.until||now+15*60*1000});
      return res.status(401).json({error:'Email or password is incorrect. Check the demo credentials below.'});
    }
    attempts.delete(key); db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString());
    if(req.cookies.session) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(req.cookies.session));
    const token=randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(tokenHash(token),user.id,new Date(now+8*3600*1000).toISOString());
    res.cookie('session',token,{...cookieOptions,maxAge:8*3600*1000}).json({user:publicUser(user)});
  });
  app.use('/api',(req,res,next)=> {
    const token=req.cookies.session;
    const user=token&&db.prepare('SELECT u.* FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').get(tokenHash(token),new Date().toISOString());
    if(!user) return res.status(401).json({error:'Your session has ended. Sign in to continue.'});
    req.user=user; next();
  });
  const write=(req,res,next)=>req.user.role==='viewer'?res.status(403).json({error:'Your viewer account has read-only access.'}):next();
  const admin=(req,res,next)=>req.user.role!=='admin'?res.status(403).json({error:'An administrator account is required.'}):next();
  app.get('/api/auth/me',(req,res)=>res.json({user:publicUser(req.user)}));
  app.post('/api/auth/logout',(req,res)=> {
    db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(req.cookies.session));
    res.clearCookie('session',cookieOptions).json({ok:true});
  });
  app.get('/api/workspace',(req,res)=>res.json({
    user:publicUser(req.user),items:getItems(db),movements:getMovements(db),
    suppliers:db.prepare('SELECT * FROM suppliers ORDER BY name').all(),
    users:req.user.role==='admin'?db.prepare('SELECT id,name,email,role,created_at FROM users ORDER BY id').all().map(publicUser):[],
    categories,units,
  }));
  function checkSupplier(id) { if(id&&!db.prepare('SELECT id FROM suppliers WHERE id=?').get(id)) fail(400,'Choose an existing supplier.'); }
  app.post('/api/items',write,(req,res)=> {
    const item=parse(itemSchema,req.body);checkSupplier(item.supplierId);
    const id=transaction(db,()=>insertItem(db,item,req.user.id));
    res.status(201).json({id});
  });
  app.patch('/api/items/:id',write,(req,res)=> {
    const current=db.prepare('SELECT * FROM items WHERE id=? AND archived=0').get(req.params.id);
    if(!current) fail(404,'Material not found.');
    if(Object.hasOwn(req.body,'quantity')) fail(400,'Use Receive, Issue, or Reconcile to change stock quantities.');
    const item=parse(itemSchema,{...req.body,quantity:current.quantity_milli/1000});
    if(item.unit!==current.unit) fail(400,'A material’s unit cannot change after its opening balance. Create a separate material for a different unit.');
    checkSupplier(item.supplierId);
    db.prepare('UPDATE items SET sku=?,name=?,category=?,color=?,unit=?,reorder_milli=?,cost_cents=?,location=?,supplier_id=?,notes=?,updated_at=? WHERE id=?').run(item.sku,item.name,item.category,item.color,item.unit,Math.round(item.reorderLevel*1000),Math.round(item.unitCost*100),item.location,item.supplierId,item.notes,new Date().toISOString(),current.id);
    res.json({ok:true});
  });
  app.post('/api/movements',write,(req,res)=> {
    const m=parse(movementSchema,req.body);
    if(m.type==='adjust'&&req.user.role!=='admin') fail(403,'Only administrators can reconcile a physical stock count.');
    transaction(db,()=> {
      const item=db.prepare('SELECT * FROM items WHERE id=? AND archived=0').get(m.itemId);
      if(!item) fail(404,'Material not found.');
      if(item.unit!=='meter'&&!Number.isInteger(m.quantity)) fail(400,`${item.unit} quantities must be whole numbers.`);
      const amount=Math.round(m.quantity*1000);
      if(m.type!=='adjust'&&amount===0) fail(400,'Enter a quantity greater than zero.');
      if(m.type==='adjust'&&(m.expectedQuantity===undefined||Math.round(m.expectedQuantity*1000)!==item.quantity_milli)) fail(409,'Stock changed since this count was opened. Refresh and check the balance again.');
      const delta=m.type==='adjust'?amount-item.quantity_milli:m.type==='issue'?-amount:amount;
      if(delta===0) fail(400,'The physical count already matches the current stock.');
      const after=item.quantity_milli+delta;
      if(after<0) fail(409,`Not enough stock. Only ${item.quantity_milli/1000} ${item.unit} available.`);
      if(after>1_000_000_000) fail(400,'The resulting balance exceeds the supported quantity.');
      const now=new Date().toISOString();
      db.prepare('UPDATE items SET quantity_milli=?,updated_at=? WHERE id=?').run(after,now,item.id);
      db.prepare('INSERT INTO movements(item_id,type,delta_milli,before_milli,after_milli,reference,reason,user_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(item.id,m.type,delta,item.quantity_milli,after,m.reference,m.reason,req.user.id,now);
    });
    res.status(201).json({ok:true});
  });
  app.post('/api/suppliers',write,(req,res)=> {
    const s=parse(supplierSchema,req.body);
    const id=Number(db.prepare('INSERT INTO suppliers(name,contact,email,phone,address,created_at) VALUES(?,?,?,?,?,?)').run(s.name,s.contact,s.email,s.phone,s.address,new Date().toISOString()).lastInsertRowid);
    res.status(201).json({id});
  });
  app.patch('/api/suppliers/:id',write,(req,res)=> {
    const s=parse(supplierSchema,req.body);
    if(!db.prepare('SELECT id FROM suppliers WHERE id=?').get(req.params.id)) fail(404,'Supplier not found.');
    db.prepare('UPDATE suppliers SET name=?,contact=?,email=?,phone=?,address=? WHERE id=?').run(s.name,s.contact,s.email,s.phone,s.address,req.params.id);
    res.json({ok:true});
  });
  app.post('/api/users',admin,(req,res)=> {
    const user=parse(userSchema,req.body);
    const id=Number(db.prepare('INSERT INTO users(name,email,password_hash,role,created_at) VALUES(?,?,?,?,?)').run(user.name,user.email,hashPassword(user.password),user.role,new Date().toISOString()).lastInsertRowid);
    res.status(201).json({id});
  });
  app.patch('/api/profile',(req,res)=> {
    const {name}=parse(z.object({name:text(100).min(2)}),req.body);
    db.prepare('UPDATE users SET name=? WHERE id=?').run(name,req.user.id);
    res.json({ok:true});
  });
  async function download(res,book,filename) {
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',`attachment; filename="${filename}"`);
    res.send(Buffer.from(await book.xlsx.writeBuffer()));
  }
  app.get('/api/export/inventory',(req,res)=> {
    let items=getItems(db);const {q,category,status}=req.query;
    if(typeof q==='string') items=items.filter(i=>[i.name,i.sku,i.color,i.location,i.supplierName].join(' ').toLowerCase().includes(q.toLowerCase()));
    if(typeof category==='string'&&category) items=items.filter(i=>i.category===category);
    if(typeof status==='string'&&status) items=items.filter(i=>status==='attention'?i.status!=='In stock':i.status===status);
    return download(res,inventoryBook(items),'thread-stock-inventory.xlsx');
  });
  app.get('/api/export/movements',(req,res)=>download(res,movementBook(getMovements(db)),'thread-stock-movements.xlsx'));
  app.get('/api/import/template',(req,res)=>download(res,inventoryBook([{sku:'FAB-NEW-001',name:'Example cotton fabric',category:'Fabrics',color:'Natural',unit:'meter',quantity:10.5,reorderLevel:5,unitCost:150,location:'Rack A',supplierName:'',notes:'Replace this example before importing.'}],true),'thread-stock-import-template.xlsx'));
  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:4*1024*1024,files:1},fileFilter:(req,file,cb)=>cb(file.originalname.toLowerCase().endsWith('.xlsx')?null:Object.assign(new Error('Upload an .xlsx workbook.'),{status:400}),file.originalname.toLowerCase().endsWith('.xlsx'))});
  for(const action of ['preview','confirm']) app.post(`/api/import/${action}`,write,upload.single('file'),async(req,res)=> {
    if(!req.file) fail(400,'Choose an .xlsx workbook to import.');
    const preview=await previewImport(db,req.file.buffer);
    if(action==='preview') return res.json(preview);
    if(preview.errors.length) return res.status(400).json({error:'Fix the workbook errors before importing.',...preview});
    // Recheck SKU and supplier constraints when the transaction commits; any conflict rolls back every row.
    const ids=commitImport(db,preview.rows,req.user.id);
    res.status(201).json({count:ids.length});
  });
  app.use('/api',(req,res)=>res.status(404).json({error:'This API endpoint does not exist.'}));
  if(existsSync(resolve('dist/index.html'))) {
    app.use(express.static(resolve('dist')));
    app.get('/{*path}',(req,res)=>res.sendFile(resolve('dist/index.html')));
  }
  app.use((error,req,res,next)=> {
    if(res.headersSent) return next(error);
    if(error.code==='LIMIT_FILE_SIZE') return res.status(400).json({error:'Workbook is too large. Maximum file size is 4 MB.'});
    if(error.code==='SQLITE_CONSTRAINT_UNIQUE'||/UNIQUE constraint failed/.test(error.message)) return res.status(409).json({error:'That SKU or email already exists. Use a unique value.'});
    if(error.type==='entity.parse.failed') return res.status(400).json({error:'The request contains invalid JSON.'});
    const status=error.status || 500;
    if(status>=500) console.error(error);
    res.status(status).json({error:status>=500?'The request could not be saved. Please try again.':error.message});
  });
  return {app,db};
}
