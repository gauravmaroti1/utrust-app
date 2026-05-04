// seed.js — run once on startup
const { db, init } = require('./server/db.js');

init();

// Seed default users if none exist
const existing = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (existing.c === 0) {
  const users = [
    { name: 'Admin', phone: '9000000000', role: 'admin', branch: 'Forbesganj', password: 'Admin@2026' },
    { name: 'Dilnawaz Khan', phone: '9100000001', role: 'trust_ic', branch: 'Forbesganj', password: 'Dilnawaz@2026' },
    { name: 'Arjun Mehta', phone: '9100000002', role: 'sales_exec', branch: 'Forbesganj', password: 'AutoCRM@2026' },
    { name: 'Priya Sharma', phone: '9100000003', role: 'sales_exec', branch: 'Bhagalpur', password: 'AutoCRM@2026' },
    { name: 'Ravi Kumar', phone: '9100000004', role: 'sales_exec', branch: 'Forbesganj', password: 'AutoCRM@2026' },
    { name: 'Sunita Yadav', phone: '9100000005', role: 'sales_exec', branch: 'Purnea', password: 'AutoCRM@2026' },
  ];
  const ins = db.prepare('INSERT INTO users (name,phone,role,branch,password) VALUES (?,?,?,?,?)');
  users.forEach(u => ins.run(u.name, u.phone, u.role, u.branch, u.password));
  console.log('[SEED] Users seeded');
}

// Seed sample inventory
const inv = db.prepare('SELECT COUNT(*) as c FROM inventory').get();
if (inv.c === 0) {
  const items = [
    { inv_code: 'INV-001', make: 'Maruti Suzuki', model: 'Swift', variant: 'VXI', reg_year: 2021, reg_number: 'BR-01-MN-2021', fuel: 'Petrol', transmission: 'Manual', ownership: '1st', color: 'Pearl White', odometer: 38500, buy_price: 440000, resale_est: 540000, repair_total: 29000, status: 'available' },
    { inv_code: 'INV-002', make: 'Hyundai', model: 'Creta', variant: 'SX', reg_year: 2020, reg_number: 'BR-05-AA-2020', fuel: 'Diesel', transmission: 'Manual', ownership: '1st', color: 'Typhoon Silver', odometer: 54200, buy_price: 720000, resale_est: 920000, repair_total: 18000, status: 'available' },
    { inv_code: 'INV-003', make: 'Maruti Suzuki', model: 'Ertiga', variant: 'ZXI', reg_year: 2019, reg_number: 'BR-03-KL-2019', fuel: 'CNG', transmission: 'Manual', ownership: '1st', color: 'Auburn Silver', odometer: 68000, buy_price: 650000, resale_est: 810000, repair_total: 12000, status: 'available' },
    { inv_code: 'INV-004', make: 'Tata Motors', model: 'Nexon', variant: 'XZ+', reg_year: 2022, reg_number: 'BR-07-NX-2022', fuel: 'Diesel', transmission: 'Manual', ownership: '2nd', color: 'Calgary White', odometer: 28000, buy_price: 880000, resale_est: 1050000, repair_total: 8000, status: 'available' },
  ];
  const ins2 = db.prepare('INSERT OR IGNORE INTO inventory (inv_code,make,model,variant,reg_year,reg_number,fuel,transmission,ownership,color,odometer,buy_price,resale_est,repair_total,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  items.forEach(i => ins2.run(i.inv_code,i.make,i.model,i.variant,i.reg_year,i.reg_number,i.fuel,i.transmission,i.ownership,i.color,i.odometer,i.buy_price,i.resale_est,i.repair_total,i.status));
  console.log('[SEED] Inventory seeded');
}

console.log('[SEED] Done');
