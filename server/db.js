// server/db.js — SQLite via node:sqlite (Node 22+)
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || '/app/data';
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const PHOTOS_DIR = path.join(DATA_DIR, 'photos');
if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'autocrm.db'));

function init() {
  db.exec(`PRAGMA journal_mode=WAL;`);

  // Users / Employees
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'sales_exec',
    branch TEXT NOT NULL DEFAULT 'Forbesganj',
    password TEXT NOT NULL DEFAULT 'AutoCRM@2026',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )`);

  // Evaluations (vehicle info + condition + valuation)
  db.exec(`CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eval_code TEXT UNIQUE,
    branch TEXT,
    evaluator_id INTEGER,
    -- Vehicle
    make TEXT, model TEXT, variant TEXT,
    reg_year INTEGER, reg_number TEXT, color TEXT,
    fuel TEXT, transmission TEXT, ownership TEXT,
    odometer INTEGER,
    insurance_status TEXT, insurance_idv INTEGER, insurance_expiry TEXT,
    service_history TEXT,
    -- Condition ratings (1-5)
    cond_exterior INTEGER DEFAULT 3,
    cond_interior INTEGER DEFAULT 3,
    cond_engine INTEGER DEFAULT 3,
    cond_tyres INTEGER DEFAULT 3,
    cond_electricals INTEGER DEFAULT 3,
    -- Condition remarks
    rem_exterior TEXT, rem_interior TEXT, rem_engine TEXT,
    rem_tyres TEXT, rem_electricals TEXT,
    -- Repair costs (auto-calculated)
    repair_total INTEGER DEFAULT 0,
    repair_breakdown TEXT,
    -- Valuation
    market_base INTEGER, km_adj INTEGER, idv_adj INTEGER,
    ideal_price INTEGER, min_price INTEGER, max_price INTEGER,
    resale_est INTEGER, expected_margin INTEGER,
    -- Workflow
    evaluator_notes TEXT,
    status TEXT DEFAULT 'pending_approval',
    -- Approval
    approver_id INTEGER,
    approved_price INTEGER,
    approver_remarks TEXT,
    approved_at TEXT,
    -- Photos (JSON array of filenames)
    photos TEXT DEFAULT '[]',
    -- Chassis/Engine from RC scan
    chassis_no TEXT, engine_no TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )`);

  // Procurement / Seller info — collected AFTER approval
  db.exec(`CREATE TABLE IF NOT EXISTS procurement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eval_id INTEGER UNIQUE,
    -- Seller info
    seller_name TEXT, seller_phone TEXT,
    seller_aadhaar TEXT, seller_pan TEXT,
    seller_address TEXT,
    bank_account TEXT, bank_name TEXT, bank_ifsc TEXT,
    -- Doc checklist (JSON)
    docs_checklist TEXT DEFAULT '{}',
    -- Deal
    final_price INTEGER,
    payment_mode TEXT,
    deal_closed_at TEXT,
    deal_closed_by INTEGER,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  )`);

  // Inventory
  db.exec(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eval_id INTEGER UNIQUE,
    inv_code TEXT UNIQUE,
    make TEXT, model TEXT, variant TEXT, reg_year INTEGER,
    reg_number TEXT, fuel TEXT, transmission TEXT, ownership TEXT,
    color TEXT, odometer INTEGER,
    buy_price INTEGER, resale_est INTEGER, repair_total INTEGER,
    status TEXT DEFAULT 'available',
    days_in_stock INTEGER DEFAULT 0,
    added_at TEXT DEFAULT (datetime('now','localtime')),
    sold_at TEXT, sold_price INTEGER, sold_margin INTEGER
  )`);

  // Sales leads / pipeline
  db.exec(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT, customer_phone TEXT,
    vehicle_interest TEXT,
    stage TEXT DEFAULT 'new',
    assigned_to INTEGER,
    branch TEXT,
    source TEXT DEFAULT 'walk-in',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  )`);

  console.log('[DB] Tables ready');
}

module.exports = { db, init };
