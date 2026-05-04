// server/index.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { db, init } = require('./db.js');

init();

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/app/data';
const PHOTOS_DIR = path.join(DATA_DIR, 'photos');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// ── Helpers ──────────────────────────────────────────────────
function parseBody(req) {
  return new Promise((res, rej) => {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 20e6) rej(new Error('Too large')); });
    req.on('end', () => {
      try { res(JSON.parse(body)); } catch { res({}); }
    });
    req.on('error', rej);
  });
}

function parseMultipart(req) {
  return new Promise((res, rej) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => res(Buffer.concat(chunks)));
    req.on('error', rej);
  });
}

function json(res, data, code = 200) {
  const body = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(body);
}

function err(res, msg, code = 400) { json(res, { error: msg }, code); }

function serveFile(res, filePath, mime) {
  fs.readFile(filePath, (e, data) => {
    if (e) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

// ── Session store (in-memory, simple) ────────────────────────
const sessions = {};
function getSession(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/sid=([^;]+)/);
  return m ? sessions[m[1]] : null;
}
function createSession(user) {
  const sid = Math.random().toString(36).slice(2) + Date.now();
  sessions[sid] = { id: user.id, name: user.name, role: user.role, branch: user.branch };
  return sid;
}

// ── Eval code generator ──────────────────────────────────────
function evalCode() {
  const d = new Date();
  return `EVL-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*9000+1000)}`;
}
function invCode() {
  const count = db.prepare('SELECT COUNT(*) as c FROM inventory').get().c;
  return `INV-${String(count+1).padStart(3,'0')}`;
}

// ── Valuation engine ──────────────────────────────────────────
const BASE_PRICES = {
  'Alto 800':300000,'Alto K10':380000,'Swift':620000,'Swift Dzire':680000,
  'Baleno':640000,'Wagon R':510000,'Ertiga':820000,'Brezza':980000,
  'Grand i10':480000,'Grand i10 Nios':540000,'i20':710000,'Elite i20':680000,
  'Xcent':600000,'Aura':660000,'Verna':980000,'Creta':1050000,'Venue':730000,
  'Alcazar':1650000,'Brio':480000,'Amaze':700000,'Jazz':760000,'City':1080000,
  'WR-V':860000,'Elevate':1100000,'Civic':1700000,'CR-V':3000000,
  'Tiago':500000,'Tigor':620000,'Nexon':840000,'Harrier':1380000,'Safari':1560000,
  'Punch':560000,'Altroz':650000,'Tiago EV':820000,'Nexon EV':1400000,
  'Glanza':680000,'Innova Crysta':1800000,'Innova Hycross':1900000,
  'Fortuner':3200000,'Camry':4200000,'Urban Cruiser Hyryder':1050000,
  'Bolero':820000,'Bolero Neo':950000,'Scorpio':1200000,'Scorpio N':1300000,
  'XUV 500':1400000,'XUV700':1400000,'XUV300':860000,'Thar':1500000,
  'Seltos':1050000,'Sonet':760000,'Carens':1000000,'Carnival':3000000,
  'Kwid':420000,'Triber':580000,'Kiger':620000,'Duster':900000,
  'Taigun':1150000,'Virtus':1150000,'Polo':680000,'Vento':900000,
  'Kushaq':1100000,'Slavia':1100000,'Octavia':3400000,'Superb':4800000,
  'Figo':520000,'Aspire':660000,'EcoSport':900000,'Endeavour':3000000,
  'Hector':1400000,'ZS EV':2100000,'Astor':1050000,'Windsor EV':1350000,
  'Compass':1900000,'Meridian':2800000,'Wrangler':5500000,
  'Magnite':600000,'Kicks':960000,'Terrano':950000,
  'Innova':1600000,'Etios':600000,'3 Series':5200000,'5 Series':7200000,
  'X1':4400000,'X3':6800000,'C-Class':5800000,'E-Class':8000000,'GLA':4900000,
  'A4':5200000,'Q3':4900000,'Q5':7000000,'XC40':5200000,'XC60':7000000,
  'D-Max':1900000,'mu-X':2800000,
};

const REPAIR_TABLE = {
  exterior: [{c:5,l:0,p:0},{c:4,l:2000,p:500},{c:3,l:4000,p:2000},{c:2,l:8000,p:5000},{c:1,l:15000,p:10000}],
  interior: [{c:5,l:0,p:0},{c:4,l:1000,p:500},{c:3,l:3000,p:2000},{c:2,l:6000,p:4000},{c:1,l:12000,p:8000}],
  engine:   [{c:5,l:0,p:0},{c:4,l:2000,p:1000},{c:3,l:3500,p:3000},{c:2,l:8000,p:6000},{c:1,l:18000,p:15000}],
  tyres:    [{c:5,l:0,p:0},{c:4,l:1000,p:4000},{c:3,l:2000,p:8000},{c:2,l:2000,p:16000},{c:1,l:2000,p:22000}],
  electricals:[{c:5,l:0,p:0},{c:4,l:500,p:500},{c:3,l:2000,p:3000},{c:2,l:5000,p:8000},{c:1,l:10000,p:15000}],
};

function calcValuation(data) {
  const base = BASE_PRICES[data.model] || 700000;
  const currentYear = new Date().getFullYear();
  const age = currentYear - (data.reg_year || currentYear - 3);
  let dep = 0;
  for (let i = 0; i < age; i++) dep += i === 0 ? 0.15 : 0.10;
  dep = Math.min(dep, 0.70);
  const marketBase = Math.round(base * (1 - dep));

  const expectedKm = age * 15000;
  const kmAdj = Math.round(((data.odometer || 0) - expectedKm) * -0.5);

  let idvAdj = 0;
  if (data.insurance_idv > 0) {
    const ratio = data.insurance_idv / base;
    if (ratio > 0.7) idvAdj = 8000;
    else if (ratio < 0.5) idvAdj = -10000;
  }

  let repairTotal = 0;
  const repairBreakdown = {};
  for (const [comp, table] of Object.entries(REPAIR_TABLE)) {
    const rating = data[`cond_${comp}`] || 3;
    const row = table.find(r => r.c === rating) || { l: 0, p: 0 };
    repairBreakdown[comp] = { rating, labour: row.l, parts: row.p, total: row.l + row.p };
    repairTotal += row.l + row.p;
  }

  const ownerPenalty = { '1st': 0, '2nd': -15000, '3rd': -30000, '4th+': -50000 };
  const penalty = ownerPenalty[data.ownership] || 0;

  const ideal = Math.max(80000, marketBase + kmAdj + idvAdj + penalty - repairTotal);
  const min = Math.round(ideal * 0.88);
  const max = Math.round(ideal * 1.15);
  const resale = Math.round(ideal * 1.22);
  const margin = resale - ideal - repairTotal;

  return { marketBase, kmAdj, idvAdj, penalty, repairTotal, repairBreakdown, ideal, min, max, resale, margin };
}

// ── Router ────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`);
  const pathname = url.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end(); return;
  }

  // ── Static files ──
  if (pathname === '/' || pathname === '/index.html') { serveFile(res, path.join(PUBLIC_DIR, 'index.html'), 'text/html'); return; }
  if (pathname.startsWith('/photos/')) {
    const fname = pathname.replace('/photos/', '');
    serveFile(res, path.join(PHOTOS_DIR, fname), 'image/jpeg'); return;
  }

  // ── Auth ──
  if (pathname === '/api/login' && method === 'POST') {
    const body = await parseBody(req);
    const user = db.prepare('SELECT * FROM users WHERE phone=? AND password=? AND active=1').get(body.phone, body.password);
    if (!user) { err(res, 'Invalid credentials'); return; }
    const sid = createSession(user);
    res.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': `sid=${sid}; Path=/; HttpOnly; SameSite=Strict`, 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ ok: true, user: { id: user.id, name: user.name, role: user.role, branch: user.branch } }));
    return;
  }

  if (pathname === '/api/me' && method === 'GET') {
    const sess = getSession(req);
    if (!sess) { err(res, 'Unauthorised', 401); return; }
    json(res, sess); return;
  }

  // ── Evaluations ──
  if (pathname === '/api/evaluations' && method === 'GET') {
    const sess = getSession(req);
    if (!sess) { err(res, 'Unauthorised', 401); return; }
    let rows;
    if (sess.role === 'sales_exec') {
      rows = db.prepare('SELECT e.*, u.name as evaluator_name FROM evaluations e LEFT JOIN users u ON e.evaluator_id=u.id WHERE e.evaluator_id=? ORDER BY e.created_at DESC LIMIT 50').all(sess.id);
    } else {
      rows = db.prepare('SELECT e.*, u.name as evaluator_name FROM evaluations e LEFT JOIN users u ON e.evaluator_id=u.id ORDER BY e.created_at DESC LIMIT 100').all();
    }
    json(res, rows); return;
  }

  if (pathname === '/api/evaluations' && method === 'POST') {
    const sess = getSession(req);
    if (!sess) { err(res, 'Unauthorised', 401); return; }
    const body = await parseBody(req);
    const val = calcValuation(body);
    const code = evalCode();
    const stmt = db.prepare(`INSERT INTO evaluations
      (eval_code,branch,evaluator_id,make,model,variant,reg_year,reg_number,color,fuel,transmission,ownership,odometer,
       insurance_status,insurance_idv,insurance_expiry,service_history,chassis_no,engine_no,
       cond_exterior,cond_interior,cond_engine,cond_tyres,cond_electricals,
       rem_exterior,rem_interior,rem_engine,rem_tyres,rem_electricals,
       repair_total,repair_breakdown,market_base,km_adj,idv_adj,ideal_price,min_price,max_price,resale_est,expected_margin,
       evaluator_notes,photos,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    stmt.run(
      code, body.branch || sess.branch, sess.id,
      body.make, body.model, body.variant, body.reg_year, body.reg_number, body.color,
      body.fuel, body.transmission, body.ownership, body.odometer,
      body.insurance_status, body.insurance_idv || 0, body.insurance_expiry, body.service_history,
      body.chassis_no || '', body.engine_no || '',
      body.cond_exterior||3, body.cond_interior||3, body.cond_engine||3, body.cond_tyres||3, body.cond_electricals||3,
      body.rem_exterior||'', body.rem_interior||'', body.rem_engine||'', body.rem_tyres||'', body.rem_electricals||'',
      val.repairTotal, JSON.stringify(val.repairBreakdown),
      val.marketBase, val.kmAdj, val.idvAdj, val.ideal, val.min, val.max, val.resale, val.margin,
      body.evaluator_notes || '', body.photos || '[]', 'pending_approval'
    );
    json(res, { ok: true, eval_code: code }); return;
  }

  // Single eval
  const evalMatch = pathname.match(/^\/api\/evaluations\/(\d+)$/);
  if (evalMatch) {
    const id = evalMatch[1];
    if (method === 'GET') {
      const row = db.prepare('SELECT e.*, u.name as evaluator_name FROM evaluations e LEFT JOIN users u ON e.evaluator_id=u.id WHERE e.id=?').get(id);
      if (!row) { err(res, 'Not found', 404); return; }
      json(res, row); return;
    }
    if (method === 'PUT') {
      const sess = getSession(req);
      const body = await parseBody(req);
      // Approval action
      if (body.action === 'approve' || body.action === 'counter' || body.action === 'reject') {
        if (!sess || !['admin','trust_ic'].includes(sess.role)) { err(res, 'Forbidden', 403); return; }
        db.prepare('UPDATE evaluations SET status=?,approved_price=?,approver_remarks=?,approver_id=?,approved_at=datetime("now","localtime") WHERE id=?')
          .run(body.action === 'approve' ? 'approved' : body.action === 'counter' ? 'countered' : 'rejected',
               body.approved_price || null, body.approver_remarks || '', sess.id, id);
        if (body.action === 'approve') {
          const ev = db.prepare('SELECT * FROM evaluations WHERE id=?').get(id);
          const ic = invCode();
          db.prepare('INSERT OR IGNORE INTO inventory (eval_id,inv_code,make,model,variant,reg_year,reg_number,fuel,transmission,ownership,color,odometer,buy_price,resale_est,repair_total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
            .run(id, ic, ev.make, ev.model, ev.variant, ev.reg_year, ev.reg_number, ev.fuel, ev.transmission, ev.ownership, ev.color, ev.odometer, body.approved_price || ev.ideal_price, ev.resale_est, ev.repair_total);
        }
        json(res, { ok: true }); return;
      }
      // Update photos or other fields
      if (body.photos) {
        db.prepare('UPDATE evaluations SET photos=? WHERE id=?').run(JSON.stringify(body.photos), id);
        json(res, { ok: true }); return;
      }
    }
  }

  // ── Photo upload ──
  if (pathname.match(/^\/api\/evaluations\/(\d+)\/photo$/) && method === 'POST') {
    const eid = pathname.split('/')[3];
    const ct = req.headers['content-type'] || '';
    if (ct.includes('application/json')) {
      // base64 upload
      const body = await parseBody(req);
      const { dataUrl, slot } = body;
      const ext = dataUrl.split(';')[0].split('/')[1] || 'jpg';
      const fname = `eval_${eid}_${slot}_${Date.now()}.${ext}`;
      const b64 = dataUrl.split(',')[1];
      fs.writeFileSync(path.join(PHOTOS_DIR, fname), Buffer.from(b64, 'base64'));
      // Update photos array in DB
      const ev = db.prepare('SELECT photos FROM evaluations WHERE id=?').get(eid);
      const photos = JSON.parse(ev?.photos || '[]');
      photos[slot] = fname;
      db.prepare('UPDATE evaluations SET photos=? WHERE id=?').run(JSON.stringify(photos), eid);
      json(res, { ok: true, filename: fname, url: `/photos/${fname}` }); return;
    }
  }

  // ── Procurement (seller info) ──
  if (pathname === '/api/procurement' && method === 'POST') {
    const sess = getSession(req);
    if (!sess || !['admin','trust_ic'].includes(sess.role)) { err(res, 'Forbidden', 403); return; }
    const body = await parseBody(req);
    db.prepare(`INSERT OR REPLACE INTO procurement (eval_id,seller_name,seller_phone,seller_aadhaar,seller_pan,seller_address,bank_account,bank_name,bank_ifsc,docs_checklist,final_price,payment_mode,deal_closed_at,deal_closed_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime'),?)`)
      .run(body.eval_id,body.seller_name,body.seller_phone,body.seller_aadhaar||'',body.seller_pan||'',
           body.seller_address,body.bank_account||'',body.bank_name||'',body.bank_ifsc||'',
           JSON.stringify(body.docs_checklist||{}),body.final_price,body.payment_mode||'cash',sess.id);
    db.prepare('UPDATE evaluations SET status="deal_closed" WHERE id=?').run(body.eval_id);
    json(res, { ok: true }); return;
  }

  if (pathname.match(/^\/api\/procurement\/\d+$/) && method === 'GET') {
    const eid = pathname.split('/')[3];
    const row = db.prepare('SELECT * FROM procurement WHERE eval_id=?').get(eid);
    json(res, row || {}); return;
  }

  // ── Inventory ──
  if (pathname === '/api/inventory' && method === 'GET') {
    const rows = db.prepare('SELECT * FROM inventory ORDER BY added_at DESC').all();
    json(res, rows); return;
  }

  // ── Users ──
  if (pathname === '/api/users' && method === 'GET') {
    const sess = getSession(req);
    if (!sess || sess.role !== 'admin') { err(res, 'Forbidden', 403); return; }
    const rows = db.prepare('SELECT id,name,phone,role,branch,active,created_at FROM users ORDER BY id').all();
    json(res, rows); return;
  }
  if (pathname === '/api/users' && method === 'POST') {
    const sess = getSession(req);
    if (!sess || sess.role !== 'admin') { err(res, 'Forbidden', 403); return; }
    const body = await parseBody(req);
    db.prepare('INSERT INTO users (name,phone,role,branch,password) VALUES (?,?,?,?,?)').run(body.name,body.phone,body.role||'sales_exec',body.branch,body.password||'AutoCRM@2026');
    json(res, { ok: true }); return;
  }
  if (pathname.match(/^\/api\/users\/\d+$/) && method === 'DELETE') {
    const sess = getSession(req);
    if (!sess || sess.role !== 'admin') { err(res, 'Forbidden', 403); return; }
    const uid = pathname.split('/')[3];
    db.prepare('UPDATE users SET active=0 WHERE id=?').run(uid);
    json(res, { ok: true }); return;
  }

  // ── Valuation calculator ──
  if (pathname === '/api/valuate' && method === 'POST') {
    const body = await parseBody(req);
    json(res, calcValuation(body)); return;
  }

  // ── Dashboard stats ──
  if (pathname === '/api/dashboard' && method === 'GET') {
    const today = new Date().toISOString().slice(0, 10);
    const stats = {
      evals_today: db.prepare("SELECT COUNT(*) as c FROM evaluations WHERE date(created_at)=?").get(today).c,
      pending_approval: db.prepare("SELECT COUNT(*) as c FROM evaluations WHERE status='pending_approval'").get().c,
      inventory_count: db.prepare("SELECT COUNT(*) as c FROM inventory WHERE status='available'").get().c,
      evals_pending: db.prepare("SELECT e.*,u.name as evaluator_name FROM evaluations e LEFT JOIN users u ON e.evaluator_id=u.id WHERE e.status='pending_approval' ORDER BY e.created_at DESC LIMIT 10").all(),
      recent_inventory: db.prepare("SELECT * FROM inventory ORDER BY added_at DESC LIMIT 5").all(),
    };
    json(res, stats); return;
  }

  // 404
  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => console.log(`[SERVER] AutoCRM running on :${PORT}`));
