import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const defaultDatabasePath = fileURLToPath(new URL('../data/inventory.sqlite', import.meta.url));

export const categories = ['Fabrics', 'Threads', 'Trims & notions', 'Tools & equipment', 'Packaging'];
export const units = ['meter', 'piece', 'cone', 'spool', 'pack', 'roll', 'set'];
export const publicUser = row => row && ({ id: row.id, name: row.name, email: row.email, role: row.role, createdAt: row.created_at });
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password, hash) {
  const [salt, key] = hash.split(':');
  return timingSafeEqual(Buffer.from(key, 'hex'), scryptSync(password, salt, 64));
}
export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const result = fn(); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function createDatabase(path = defaultDatabasePath) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','staff','viewer')),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, contact TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY, sku TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL,
      category TEXT NOT NULL, color TEXT NOT NULL DEFAULT '', unit TEXT NOT NULL,
      quantity_milli INTEGER NOT NULL CHECK(quantity_milli >= 0),
      reorder_milli INTEGER NOT NULL CHECK(reorder_milli >= 0),
      cost_cents INTEGER NOT NULL CHECK(cost_cents >= 0), location TEXT NOT NULL DEFAULT '',
      supplier_id INTEGER REFERENCES suppliers(id), notes TEXT NOT NULL DEFAULT '',
      archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS movements (
      id INTEGER PRIMARY KEY, item_id INTEGER NOT NULL REFERENCES items(id),
      type TEXT NOT NULL CHECK(type IN ('opening','receive','issue','adjust')),
      delta_milli INTEGER NOT NULL, before_milli INTEGER NOT NULL, after_milli INTEGER NOT NULL CHECK(after_milli >= 0),
      reference TEXT NOT NULL DEFAULT '', reason TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id), created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS movements_date ON movements(created_at);
    CREATE INDEX IF NOT EXISTS movements_item ON movements(item_id);
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    PRAGMA user_version = 1;
  `);
  if (!db.prepare('SELECT id FROM users LIMIT 1').get()) seed(db);
  return db;
}

export function getItems(db) {
  return db.prepare(`SELECT i.*, s.name AS supplier_name FROM items i
    LEFT JOIN suppliers s ON s.id = i.supplier_id WHERE i.archived = 0 ORDER BY i.id DESC`).all().map(item => ({
    id: item.id, sku: item.sku, name: item.name, category: item.category, color: item.color,
    unit: item.unit, quantity: item.quantity_milli / 1000, reorderLevel: item.reorder_milli / 1000,
    unitCost: item.cost_cents / 100, location: item.location, supplierId: item.supplier_id,
    supplierName: item.supplier_name || '', notes: item.notes, updatedAt: item.updated_at,
    status: item.quantity_milli === 0 ? 'Out of stock' : item.quantity_milli <= item.reorder_milli ? 'Low stock' : 'In stock',
  }));
}
export function getMovements(db) {
  return db.prepare(`SELECT m.*, i.name AS item_name, i.sku, i.unit, i.category, u.name AS user_name
    FROM movements m JOIN items i ON i.id=m.item_id JOIN users u ON u.id=m.user_id
    ORDER BY m.created_at DESC, m.id DESC`).all().map(m => ({
    id: m.id, itemId: m.item_id, itemName: m.item_name, sku: m.sku, category: m.category,
    unit: m.unit, type: m.type, quantity: Math.abs(m.delta_milli) / 1000,
    delta: m.delta_milli / 1000, before: m.before_milli / 1000, after: m.after_milli / 1000,
    reference: m.reference, reason: m.reason, userName: m.user_name, createdAt: m.created_at,
  }));
}

function seed(db) {
  const now = new Date().toISOString();
  const ago = (days, hour = 8) => {
    const d = new Date(); d.setUTCDate(d.getUTCDate() - days); d.setUTCHours(hour, 20, 0, 0); return d.toISOString();
  };
  transaction(db, () => {
    const user = db.prepare('INSERT INTO users(name,email,password_hash,role,created_at) VALUES(?,?,?,?,?)');
    user.run('Alex Reyes', 'admin@threadstock.local', hashPassword('Admin123!'), 'admin', now);
    user.run('Jamie Santos', 'staff@threadstock.local', hashPassword('Staff123!'), 'staff', now);
    user.run('Morgan Cruz', 'viewer@threadstock.local', hashPassword('Viewer123!'), 'viewer', now);
    const supplier = db.prepare('INSERT INTO suppliers(name,contact,email,phone,address,created_at) VALUES(?,?,?,?,?,?)');
    supplier.run('Metro Textile Trading', 'Andrea Lim', 'orders@metrotextile.example', '0900 000 0101', 'Sample address · Divisoria, Manila', now);
    supplier.run('Golden Spool Supply', 'Rico Tan', 'hello@goldenspool.example', '0900 000 0102', 'Sample address · Marilao, Bulacan', now);
    supplier.run('Sewing Essentials Co.', 'Mika Dela Cruz', 'sales@sewingessentials.example', '0900 000 0103', 'Sample address · Meycauayan, Bulacan', now);
    supplier.run('Everyday Packaging', 'Sam Garcia', 'orders@everydaypack.example', '0900 000 0104', 'Sample address · Valenzuela City', now);
    const rows = [
      ['FAB-001','Cotton twill','Fabrics','Sand','meter',42.5,15,185,'Rack A · Shelf 1',1,'150 cm width. Uniforms and everyday trousers.'],
      ['FAB-002','Linen blend','Fabrics','Natural','meter',8.25,10,295,'Rack A · Shelf 2',1,'140 cm width. Keep covered when not in use.'],
      ['FAB-003','Polyester gabardine','Fabrics','Navy','meter',68,20,145,'Rack A · Shelf 1',1,'150 cm width. School and office uniforms.'],
      ['FAB-004','Premium poplin','Fabrics','White','meter',54.75,15,125,'Rack B · Shelf 1',1,'115 cm width. Shirting fabric.'],
      ['FAB-005','Stretch denim','Fabrics','Indigo','meter',23.5,10,265,'Rack B · Shelf 2',1,'150 cm width. Medium weight.'],
      ['FAB-006','Satin charmeuse','Fabrics','Champagne','meter',6.5,8,210,'Rack B · Shelf 3',1,'150 cm width. Store rolled to avoid creasing.'],
      ['FAB-007','Cotton canvas','Fabrics','Olive','meter',31,10,195,'Rack A · Shelf 3',1,'150 cm width. Bags and workwear.'],
      ['FAB-008','Polyester lining','Fabrics','Black','meter',0,10,65,'Rack B · Shelf 3',1,'150 cm width. Jacket and dress lining.'],
      ['THR-001','All-purpose sewing thread','Threads','Black','cone',24,10,85,'Drawer C · Bin 1',2,'5,000 yards per cone.'],
      ['THR-002','All-purpose sewing thread','Threads','White','cone',8,10,85,'Drawer C · Bin 1',2,'5,000 yards per cone.'],
      ['THR-003','All-purpose sewing thread','Threads','Navy','cone',18,6,85,'Drawer C · Bin 2',2,'5,000 yards per cone.'],
      ['THR-004','Overlock thread','Threads','White','cone',32,12,65,'Drawer C · Bin 3',2,'High-speed serger thread.'],
      ['TRM-001','Invisible zipper · 20 cm','Trims & notions','Black','piece',45,20,18,'Drawer D · Bin 1',3,'Concealed zipper for skirts and dresses.'],
      ['TRM-002','Shirt button · 11 mm','Trims & notions','White','pack',16,5,45,'Drawer D · Bin 2',3,'100 pieces per pack.'],
      ['TRM-003','Woven elastic · 25 mm','Trims & notions','White','meter',12.5,15,22,'Drawer D · Bin 3',3,'Waistband elastic.'],
      ['TRM-004','Fusible interfacing','Trims & notions','White','meter',28.75,10,55,'Rack C · Shelf 1',1,'Lightweight woven. 90 cm width.'],
      ['TRM-005','Hook and eye fastener','Trims & notions','Silver','pack',12,4,35,'Drawer D · Bin 4',3,'24 pairs per pack.'],
      ['TRM-006','Bias binding · 12 mm','Trims & notions','Black','roll',7,3,120,'Drawer D · Bin 5',3,'50 yards per roll.'],
      ['EQP-001','Tailor scissors · 10 inch','Tools & equipment','Steel','piece',6,2,650,'Tool cabinet',3,'For fabric cutting only.'],
      ['EQP-002','Machine needle · size 14','Tools & equipment','Steel','pack',3,5,95,'Tool cabinet',3,'10 needles per pack.'],
      ['EQP-003','Measuring tape · 150 cm','Tools & equipment','Yellow','piece',8,3,35,'Tool cabinet',3,'Double-sided metric and imperial.'],
      ['PKG-001','Garment cover · medium','Packaging','Clear','pack',14,5,145,'Packing station',4,'50 covers per pack.'],
      ['PKG-002','Paper garment tag','Packaging','Kraft','pack',9,3,75,'Packing station',4,'100 tags per pack.'],
      ['PKG-003','Carry bag · large','Packaging','Kraft','pack',0,4,180,'Packing station',4,'25 bags per pack.'],
    ];
    const insert = db.prepare(`INSERT INTO items(sku,name,category,color,unit,quantity_milli,reorder_milli,cost_cents,location,supplier_id,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const move = db.prepare('INSERT INTO movements(item_id,type,delta_milli,before_milli,after_milli,reference,reason,user_id,created_at) VALUES(?,?,?,?,?,?,?,?,?)');
    rows.forEach((r, index) => {
      const [sku,name,category,color,unit,quantity,reorder,cost,location,supplierId,notes] = r;
      const opening = Math.round((quantity + 6) * 1000);
      const id = Number(insert.run(sku,name,category,color,unit,Math.round(quantity*1000),Math.round(reorder*1000),Math.round(cost*100),location,supplierId,notes,ago(20),ago(1)).lastInsertRowid);
      move.run(id,'opening',opening,0,opening,'OPENING-DEMO','Opening demo balance',1,ago(20));
      let balance = opening;
      const deltas = unit === 'meter' ? [-2500,-3250,4500,-4750] : [-2000,-3000,4000,-5000];
      deltas.forEach((delta,j) => {
        const type = delta > 0 ? 'receive' : 'issue';
        const date = ago([12,8,5,1][j] + index % 3, 1 + index % 7);
        move.run(id,type,delta,balance,balance+delta,`${delta>0?'PO':'JOB'}-${String(1040+index*4+j).padStart(4,'0')}`,delta>0?'Material delivery received':'Issued for tailoring order',j%2+1,date);
        balance += delta;
      });
    });
  });
}
