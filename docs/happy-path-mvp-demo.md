# Happy Path MVP Demo — Aron (Comprehensive Script)

Date: **2026-02-02**  
Goal: Run a clean, end-to-end demo of **what is implemented today** using the built-in seed + happy path flows.

---

## Demo prerequisites (2 minutes)

- **Local app running**: `http://localhost:3000`
- **Environment**: ensure you have your `.env` set (at minimum `JWT_SECRET`; plus DB env if using Turso).
- **DB schema up to date** (local SQLite): run:

```bash
cd yesod-platform
node scripts/db-ensure.mjs
```

### Reset + seed (Jewish-themed demo)

There are two “reset” levels:

- **Soft reset (recommended for demos)**: wipes only the demo donor/org data and re-seeds.
- **Hard reset (full DB flush)**: deletes the local SQLite file and recreates schema.

#### Soft reset (recommended)

1. Login as **admin**.
2. Open: `http://localhost:3000/admin/happy-path`
3. Set **Theme → “Jewish causes”**
4. Leave **Reset first** checked
5. Click **Seed Demo Data**

#### Hard reset (flush the entire local DB)

From the repo root:

```bash
cd yesod-platform
rm -f yesod.db
npm run db:ensure
```

Then start the app again and run the **Soft reset** steps above.

### What you will show (high-level)
- **Admin**: seed demo data + quick links
- **Invite gating**: invite-only signup; **role lock** on invite links
- **Donor**:
  - Concierge “Impact Vision” conversation persisted in DB
  - Impact Vision Board + share actions (copy summary / share link / print)
  - Opportunities list + detail + actions + **history**
  - Leverage offer creation (persisted)
  - Submission links: create/revoke/track + public intake
- **Public intake**: `/submit/<token>` validates and accepts a lightweight submission
- **Requestor (Nonprofit) portal**:
  - New shell (collapse + top bar + avatar sign-out)
  - Create request wizard
  - **Evidence & documents upload** (MVP-local: saved under `public/uploads/tmp/`)

---

## Part A — Admin (seed + navigation) (2–4 minutes)

### A1) Login as Admin
- Open: `http://localhost:3000/admin/login`
- Log in with your seeded/known admin credentials.

If you don’t have an admin yet (fresh DB), seed one:

```bash
cd yesod-platform
npm run db:ensure
ADMIN_NAME="Admin" ADMIN_EMAIL="admin@aron.local" ADMIN_PASSWORD="change-me" npm run admin:seed
```

### A2) Seed demo data
- Open: `http://localhost:3000/admin/happy-path`
- Click **Seed Demo Data**

Expected:
- You see confirmation + a list of links (donor dashboard, concierge, impact board, submit link, etc.).

### A3) (Optional) Show admin chrome polish
- Point out:
  - Collapsible left sidebar
  - Top bar page title
  - Avatar dropdown → **Sign out**

---

## Part B — Invite gating (1–2 minutes)

### B1) Show invite-only signup gating (landing validates invite)
- Open: `http://localhost:3000/`
- Paste a known invite code into the Invite field and continue.

Expected:
- Valid invite routes you to signup.

### B2) Show role-lock on invite link
- Open a **requestor invite link** example:
  - `http://localhost:3000/auth/signup?invite=XXXX-XXXX-XXXX&role=requestor`

Expected:
- “Nonprofit” is selected and the “Donor” toggle is disabled (greyed out).

---

## Part C — Donor “Impact Vision” (5–8 minutes)

### C1) Open concierge conversation
- Open: `http://localhost:3000/donor/legacy`

Demo prompt (paste into chat):
- `In 12 months I want 5,000 households protected with measurable outcomes. Budget $250k/year. Israel + Miami.`

Expected:
- Assistant responds with guided prompts / next-best questions.
- Refreshing the page preserves the conversation (DB-backed).

### C2) Open Impact Vision Board
- Open: `http://localhost:3000/donor/impact`

Expected:
- Board renders from persisted vision/board JSON.
- You can use:
  - **Copy summary**
  - **Copy share link**
  - **Print / PDF**

### C3) (Optional) Donor-to-donor insights toggle
- On `/donor/impact`, toggle collaboration insights on.

Expected:
- Panel appears with anonymized suggestions (“Donor (private)”), no automation.

---

## Part D — Donor opportunities + actions + history (5–8 minutes)

### D1) Open opportunities feed
- Open: `http://localhost:3000/donor`

Expected:
- Left list + right detail pane.
- Selecting an item loads detail on the right.

### D2) Show deterministic extraction (stub “LLM”)
- Open a **submission** opportunity.

Expected:
- “Auto-extraction (demo)” shows extracted **cause / geo / amount / urgency** if available.

### D3) Take actions and show history readability
- Click actions like:
  - **Shortlist**
  - **Pass**
  - **Request more info** (for submissions)

Expected:
- History shows human-readable items (no underscores) and timestamps.
- Duplicate actions don’t spam (consecutive duplicates collapsed).

### D4) Create a leverage offer
- Click **Leverage** and create an offer.

Expected:
- Offer is created via API (persisted).
- History shows “Drafted leverage offer”.

---

## Part E — Donor-generated submission link → public intake (5–8 minutes)

### E1) Create a submission link
- Open: `http://localhost:3000/donor/submission-links`
- Fill:
  - Organization name: `Demo Organization`
  - (Optional) email / note
- Click **Create Link**

Expected:
- Link row appears with tracking.
- Link is copied to clipboard (best-effort).

### E2) Open the public submit page (no login needed)
- Open the generated URL:
  - `http://localhost:3000/submit/<token>`

Expected:
- “Validating link…” then the form appears (no “Invalid link”).

### E3) Submit a brief request
- Fill the **Brief summary** (required), optionally add:
  - Amount
  - Video URL
- Click **Submit**

Expected:
- Success state.
- Back on `/donor/submission-links`, “opens” and “submissions” counts increase after refresh.
- On donor `/donor`, the new submission appears as an opportunity.

---

## Part F — Requestor (Nonprofit) portal (5–8 minutes)

### F1) Open requestor portal shell
- Open: `http://localhost:3000/requestor`

Show:
- Collapse/expand sidebar in top bar
- Avatar menu → **Sign out**

### F2) Create a request (wizard)
- Step through and submit a request.

Suggested content:
- Title: `Emergency Bridge Funding – 5,000 kits`
- Location: `Israel + Miami`
- Target: `250000`
- Summary: `We can start distribution within 14 days.`

Expected:
- “Request Submitted” success state with reference ID.

### F3) Upload evidence/documents (activated)
- In “Evidence & Documents”:
  - Click upload area
  - Choose a PDF (under 10MB)

Expected:
- Green check appears with the filename.
- “Open uploaded file” opens the stored file URL.

Notes:
- Storage is MVP-local in `public/uploads/tmp/` (gitignored).

### F4) Verify it appears in “My Requests”
- Open: `http://localhost:3000/requestor/requests`

Expected:
- The request appears in the list.

---

## Troubleshooting quick hits

- **Upload doesn’t show**:
  - Ensure you are logged in as a **requestor** (upload endpoint is requestor-only).
  - File types allowed: **PDF/XLS/XLSX** only, max 10MB.
- **`/submit/<token>` shows “Invalid link”**:
  - Refresh once; ensure token copied fully.
  - If still invalid, open `/donor/submission-links` and re-copy the link, then try again.
- **DB errors (“no such column…”)**:
  - Run `node scripts/db-ensure.mjs` again.

---

## What is intentionally MVP / stubbed

- “LLM extraction” is deterministic keyword-based (Phase 1 stub).
- Matching insights are anonymized and deterministic (no real matching automation).
- Upload storage is local filesystem (for demo); production storage (S3/GCS) is a later step.

