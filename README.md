# AutoCRM — Used Car CRM
## Prakash Auto Hub · Forbesganj / Purnea / Bhagalpur

---

## Railway Deployment

### One-time setup

1. **Push to GitHub**
   ```
   git init
   git add .
   git commit -m "AutoCRM v1"
   git remote add origin https://github.com/YOUR_USERNAME/autocrm.git
   git push -u origin main
   ```

2. **Create Railway project**
   - Go to https://railway.app → New Project → Deploy from GitHub
   - Select your `autocrm` repo

3. **Add Persistent Volume**
   - In Railway dashboard → your service → Volumes
   - Mount path: `/app/data`
   - This stores the SQLite DB and all uploaded photos

4. **Set Environment Variables**
   - `DATA_DIR` = `/app/data`
   - `PORT` = `3000` (Railway sets this automatically)
   - `NODE_ENV` = `production`

5. **Set Start Command** (in Settings → Deploy → Start Command)
   ```
   node --experimental-sqlite seed.js && node --experimental-sqlite server/index.js
   ```

6. **Generate Domain**
   - Railway → Settings → Networking → Generate Domain
   - Share this URL with your team

---

## Default Login Credentials

| Name | Mobile | Password | Role |
|------|--------|----------|------|
| Admin | 9000000000 | Admin@2026 | Admin |
| Dilnawaz Khan | 9100000001 | Dilnawaz@2026 | Trust Incharge |
| Arjun Mehta | 9100000002 | AutoCRM@2026 | Sales Executive |
| Priya Sharma | 9100000003 | AutoCRM@2026 | Sales Executive |
| Ravi Kumar | 9100000004 | AutoCRM@2026 | Sales Executive |
| Sunita Yadav | 9100000005 | AutoCRM@2026 | Sales Executive |

---

## Features

### Evaluation Workflow
1. **Sales Exec** evaluates vehicle (5 steps):
   - Vehicle details (19 makes, 188+ models, all variants + "Other" option)
   - Photos (camera / gallery — 8 slots with GPS tag)
   - Condition assessment (5 components, 1-5 dots, auto-repair calculation)
   - AI Valuation (market base → km adj → IDV adj → repair deduction)
   - Submit to Dilnawaz

2. **Dilnawaz** reviews and sets final price (Approve / Counter / Reject)

3. **Post-approval** → Seller information collected:
   - Full KYC (name, Aadhaar, PAN, address)
   - Bank details for payment
   - Document checklist (RC, keys, Form 29/30, NOC, etc.)
   - Deal closure → auto-added to inventory

### Key Decisions
- ✅ Seller info collected AFTER approval (not during evaluation)
- ✅ Photos open device camera OR gallery (no capture restriction)
- ✅ No manual chassis/engine entry (scan RC or OCR in future)
- ✅ Variant has "Other" + free-text option
- ✅ Full mobile-first UI (bottom nav, sheets, touch-optimized)
- ✅ Insurance IDV prominently affects valuation
- ✅ Role-based: Sales Exec cannot approve/see margin/close deals

---

## File Structure
```
autocrm/
├── package.json
├── seed.js              ← Runs on every deploy (idempotent)
├── server/
│   ├── index.js         ← HTTP server + all API routes
│   └── db.js            ← SQLite setup + schema
└── public/
    └── index.html       ← Full mobile PWA frontend
```

## Data (persisted on Railway volume at /app/data)
```
/app/data/
├── autocrm.db           ← SQLite database
└── photos/              ← Uploaded evaluation photos
```
