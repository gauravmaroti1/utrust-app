# Utrust Vehicle Management — Railway Deployment

## Files
- `index.html` — Full Utrust app (React + Firebase)
- `server.js` — Node.js server for Railway
- `package.json` — Project config

---

## Deploy to Railway (Step by Step)

### Step 1 — Create GitHub repo
1. Go to github.com → New repository
2. Name it: `utrust-railway` (or any name)
3. Set to **Public** (Railway free tier requires public repo)
4. Click **Create repository**

### Step 2 — Upload these files to GitHub
Upload all 4 files:
- `index.html`
- `server.js`
- `package.json`
- `.gitignore`

### Step 3 — Deploy on Railway
1. Go to **railway.app** → Sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `utrust-railway` repo
4. Railway auto-detects Node.js and runs `npm start`
5. Click **Settings** → **Networking** → **Generate Domain**
6. Your URL will be: `https://utrust-railway-xxxx.railway.app`

### Step 4 — Done!
The app is live. Share the Railway URL with your team.

---

## Migrate Old Data from GitHub Pages

Your existing Firestore data is already in the cloud — it doesn't need migration!
The app connects to Firebase `utrust-app` project regardless of where it's hosted.

**Old URL:** avmaroti1.github.io/utrust  
**New URL:** your-railway-url.railway.app

Both URLs connect to the **same Firestore database**. All evaluations, vehicles,
and records made on GitHub Pages are immediately visible on Railway.

**No data migration needed.**

---

## Firestore Rules (Required)

In Firebase Console → Firestore → Rules, set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /vehicles/{id} {
      allow read, write: if true;
    }
  }
}
```

---

## Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@1234 | Administrator |
| dilnawaz.purnea | Utrust@2025 | Utrust Incharge |
| [staff] | Utrust@2025 | Evaluator |

---

## Algorithm — How Price is Calculated

**With active insurance:**
Base (IDV) → Age depreciation (RTO rates) → Odometer adj → Accidental penalty →
Claim history → Engine condition → Fuel type → 8% dealer margin → **Challan deduction**

**With expired insurance:**
Base (Purchase value) → 10% no-insurance penalty → Higher depreciation →
Same adjustments → 8% dealer margin → **Challan deduction**

Challan amount is fully deducted (₹1 challan = ₹1 off purchase price).
