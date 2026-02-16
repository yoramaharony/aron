# Happy Path MVP Demo — Aron (Comprehensive Script)

Date: **2026-02-16**
Goal: Run a clean, end-to-end demo of **what is implemented today** using the built-in seed + happy path flows.

---

## Demo prerequisites (2 minutes)

- **Local app running**: `http://localhost:3000`
- **Environment**: ensure you have your `.env` set (at minimum `JWT_SECRET`; plus DB env if using Turso).
- **DB schema up to date** (local SQLite): run:

```bash
cd yesod-platform
npm run db:ensure
```

Note: `npm run dev` already runs `npm run db:ensure` automatically.

### Mailgun (live email demo) (optional but recommended)

If you want to demo **real email sending** (invites + forgot password), set:

- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_FROM`
- (EU region only) `MAILGUN_API_BASE_URL=https://api.eu.mailgun.net`

Quick verification steps:

1. Go to `http://localhost:3000/admin/invites`
2. Choose **Email Invite**
3. Enter your email as the recipient and click **Generate Code**
4. Expected: UI shows "Email sent to …" and you receive the email.

Then test forgot password:

1. Go to `http://localhost:3000/auth/forgot-password`
2. Enter a known user email (e.g. demo donor below)
3. Expected: reset email arrives; reset link loads; password can be changed.

### Reset + seed (Jewish-themed demo)

There are two "reset" levels:

- **Soft reset (recommended for demos)**: wipes only the demo donor/org data and re-seeds.
- **Hard reset (full DB flush)**: deletes the local SQLite file and recreates schema.

#### Soft reset (recommended)

1. Login as **admin**.
2. Open: `http://localhost:3000/admin/happy-path`
3. Set **Theme → "Jewish causes"**
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
  - Concierge "Impact Vision" conversation persisted in DB
  - Impact Vision Board + share actions (copy summary / share link / print)
  - Opportunities list + detail + full pipeline actions + history
  - Full workflow: Discover → Request Info → Schedule Meeting → Meeting Completion → Due Diligence → Approve & Pledge / Structure Leverage
  - Pledge page with real funded opportunities + leverage offers
  - Submission links: create/revoke/track + public intake
- **Public intake**: `/submit/<token>` validates and accepts a lightweight submission
- **Requestor (Nonprofit) portal**:
  - New shell (collapse + top bar + avatar sign-out)
  - Create request wizard
  - **Evidence & documents upload** (MVP-local or Vercel Blob)

---

## Part A — Admin (seed + navigation) (2–4 minutes)

### A1) Login as Admin
- Open: `http://localhost:3000/admin/login`
- Log in with your seeded/known admin credentials.

If you don't have an admin yet (fresh DB), set env vars and log in (dev auto-creates it):

```bash
cd yesod-platform
npm run db:ensure
# in yesod-platform/.env:
# ADMIN_EMAIL=admin@aron.local
# ADMIN_PASSWORD=change-me
# ADMIN_NAME=Admin
```

### A2) Seed demo data
- Open: `http://localhost:3000/admin/happy-path`
- Click **Seed Demo Data**

Expected:
- You see confirmation + a list of links (donor dashboard, concierge, impact board, submit link, etc.).
- Theme defaults to **Jewish causes** and seeds multiple Jewish-themed submissions (e.g. Bikur Cholim, Hatzolah, Kimcha d'Pischa, Chinuch, Mikveh, Yeshiva building, Gemach).

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
- "Nonprofit" is selected and the "Donor" toggle is disabled (greyed out).

---

## Part C — Donor "Impact Vision" (5–8 minutes)

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
- Panel appears with anonymized suggestions ("Donor (private)"), no automation.

---

## Part D — Donor full opportunity pipeline (10–15 minutes)

This is the **core demo flow** — walking an opportunity from discovery through to funded pledge.

### D1) Open opportunities feed
- Open: `http://localhost:3000/donor/opportunities`

Expected:
- Left list + right detail pane.
- Three tabs: **Discover** | **Shortlist** | **Passed**.
- Selecting an item loads detail on the right with a workflow stepper at the top.

### D2) Show deterministic extraction (stub "LLM")
- Open a **submission** opportunity.

Expected:
- "Auto-extraction (demo)" shows extracted **cause / geo / amount / urgency** if available.

### D3) Request more info
- On a submission, click **Request Info**.

Expected:
- Opportunity moves to "Info Requested" stage in the stepper.
- History shows "Requested more info" with timestamp.
- A `/more-info/<token>` link is generated and visible in History.
- The opportunity stays selected in the Shortlist tab.

### D4) Schedule a meeting
- Click **Schedule Meeting**.
- Fill in meeting details (type, date, time, location, notes).
- Click **Schedule**.

Expected:
- Opportunity moves to "Meeting" stage in the stepper.
- History shows "Scheduled meeting" with meeting details visible.
- The opportunity remains in the Shortlist tab.

### D5) Complete the meeting (post-meeting summary modal)
- Click **Mark Meeting Complete**.
- Fill in:
  - **Summary**: describe the meeting outcome
  - **Tone**: select Very Positive / Promising / Neutral / Concerning
  - **Amount confirmed**: Yes / No / Partially
  - **Amount negotiable**: Yes / No / Unknown
  - **Expected timeline**: e.g. "6 months"
  - **Follow-up items**: check boxes for site visit, reference calls, financial audit, etc.
  - **Documents**: drag & drop or click to upload meeting documents (PDF, images, spreadsheets)
- Click **Submit**.

Expected:
- Opportunity advances to "Due Diligence" stage.
- Full details auto-expand (the expanded view opens automatically at this stage).
- **Meeting Outcomes** card appears showing summary, tone, amount confirmation, follow-ups.
- Uploaded documents appear in both the Meeting Outcomes card and the **Materials** section under "Meeting Documents" — all clickable/downloadable with gold underlined links.

### D6) Due diligence review
- The **Diligence Checklist** is now visible (always open — no extra button click needed).
- Check off items as you review them (site visit, references, financial audit, etc.).
- The checklist items are pre-populated from the follow-ups you marked in the meeting form.

**Materials section** shows three standardized sections:
- **Organization Documents** — files submitted by the org with the info request
- **Video** — video link if provided
- **Meeting Documents** — files uploaded during meeting completion

All use the same visual style: uppercase section labels, paperclip icons, gold underlined clickable links.

### D7) Complete due diligence
- Click **Complete Due Diligence** (gold button).

Expected:
- Opportunity advances to "Decision" stage in the stepper.
- Two new action buttons appear: **Approve & Pledge** (gold) and **Structure Leverage** (outline).

### D8) Option A — Approve & Pledge (direct)
- Click **Approve & Pledge**.

Expected:
- The `funded` action is persisted to the database.
- Browser navigates to `/donor/pledges`.
- The opportunity now appears as an **Active Commitment** on the Pledges page.

### D9) Option B — Structure Leverage (then pledge)
- Click **Structure Leverage**.
- The leverage drawer slides in from the right.
- Configure:
  - **Anchor commitment** (slider + preset buttons: $50k, $100k, $250k)
  - **Challenge goal** (Match Me 1:1 or Cover Remainder)
  - **Challenge deadline** (date picker, defaults to 60 days out)
  - **Terms** (verification required, milestone release)
- Click **Create Offer** → Confirm.

Expected:
- Leverage offer is persisted to the database.
- History shows "Drafted leverage offer" with details.
- You can then click **Approve & Pledge** to fund the opportunity.

### D10) Notes (editable, any stage)
- At any stage, the **Notes** section is inline-editable.
- Click the edit icon, type a note, it auto-saves after you stop typing.
- Notes persist across sessions (DB-backed).

---

## Part E — Pledges page (3–5 minutes)

### E1) View active commitments
- Open: `http://localhost:3000/donor/pledges`

Expected:
- **Active Commitments** section shows all opportunities you've funded, with:
  - Title, organization name (from the original opportunity)
  - Total committed amount
  - Paid to date ($0 for new commitments)
  - Status: "New Commitment"
  - Grant ID: `GR-{year}-{XXXX}` (deterministic, stable)

### E2) Open commitment detail drawer
- Click any commitment card.

Expected:
- Slide-out drawer shows:
  - **Header**: title, org, grant ID
  - **Key stats**: Total Pledge + Paid
  - **Progress bar**: visual fulfillment percentage (0% for new)
  - **Commitment Date**: the date you clicked "Approve & Pledge"
  - **Leverage Offers** (if any): anchor amount, challenge goal, deadline, status
  - **Actions**: View Grant Agreement / Download Tax Receipt (stubs)
  - **Status message**: "New commitment. Payment schedule will be configured by your concierge."

### E3) Conditional Offers section
- If you created leverage offers for any funded opportunities, the **Conditional Offers** section appears at the top of the page with gold accent cards showing anchor, challenge, and deadline.

### E4) Past Fulfillment
- Scroll to bottom.
- Three Jewish-themed historical items are shown:
  - Hachnasas Kallah Essentials Fund 5784
  - Chesed Shel Emes Emergency Appeal
  - Beit Midrash Renovation — Yeshivat Ohr Somayach

---

## Part F — Donor-generated submission link → public intake (5–8 minutes)

### F1) Create a submission link
- Open: `http://localhost:3000/donor/submission-links`
- Fill:
  - Organization name: `Demo Organization`
  - (Optional) email / note
- Click **Create Link**

Expected:
- Link row appears with tracking.
- Link is copied to clipboard (best-effort).

### F2) Open the public submit page (no login needed)
- Open the generated URL:
  - `http://localhost:3000/submit/<token>`

Expected:
- "Validating link…" then the form appears (no "Invalid link").

### F3) Submit a brief request
- Fill the **Brief summary** (required), optionally add:
  - Amount
  - Video URL
- Click **Submit**

Expected:
- Success state.
- Back on `/donor/submission-links`, "opens" and "submissions" counts increase after refresh.
- On donor `/donor/opportunities`, the new submission appears as an opportunity.

### F4) (Optional) Show "Request more info" public form

- On `/donor/opportunities`, open the seeded submission "Refuah / Bikur Cholim …"
- Click **Request Info**
- Open the copied link (or click "copy link" in History) → `/more-info/<token>`

Expected:
- Form loads (no login required).
- "Complexity" label changes based on amount (Basic/Detailed/Comprehensive).
- Submitting the form makes those details appear under **Due diligence** for that submission.

---

## Part G — Requestor (Nonprofit) portal (5–8 minutes)

### G1) Open requestor portal shell
- Open: `http://localhost:3000/requestor`

Show:
- Collapse/expand sidebar in top bar
- Avatar menu → **Sign out**

### G2) Create a request (wizard)
- Step through and submit a request.

Suggested content:
- Title: `Emergency Bridge Funding – 5,000 kits`
- Location: `Israel + Miami`
- Target: `250000`
- Summary: `We can start distribution within 14 days.`

Expected:
- "Request Submitted" success state with reference ID.

### G3) Upload evidence/documents (activated)
- In "Evidence & Documents":
  - Click upload area or drag & drop files
  - Choose a PDF (under 10MB)

Expected:
- Green check appears with the filename.
- "Open uploaded file" opens the stored file URL.

Notes:
- Storage: Vercel Blob in production, local `public/uploads/tmp/` in dev (gitignored).
- Both donors and requestors can upload files.

### G4) Verify it appears in "My Requests"
- Open: `http://localhost:3000/requestor/requests`

Expected:
- The request appears in the list.

---

## Troubleshooting quick hits

- **Upload doesn't show**:
  - Ensure you are logged in (upload endpoint allows both **donor** and **requestor** roles).
  - File types allowed: **PDF/XLS/XLSX/PNG/JPG/JPEG/WEBP**, max 10MB.
- **`/submit/<token>` shows "Invalid link"**:
  - Refresh once; ensure token copied fully.
  - If still invalid, open `/donor/submission-links` and re-copy the link, then try again.
- **DB errors ("no such column…")**:
  - Run `npm run db:ensure` again (from `yesod-platform/`) and restart `npm run dev`.
- **Meeting documents not downloadable**:
  - Ensure the upload API is accepting donor role (already fixed).
  - Check that the upload completed without errors in the browser console.

---

## What is intentionally MVP / stubbed

- "LLM extraction" is deterministic keyword-based (Phase 1 stub).
- Matching insights are anonymized and deterministic (no real matching automation).
- Upload storage is local filesystem for dev; Vercel Blob for production.
- Pledge payment schedules are placeholder ("configured by your concierge").
- Grant Agreement / Tax Receipt downloads are stubs (buttons present, not functional).
- Past Fulfillment items on the Pledges page are demo-only (hardcoded Jewish-themed entries).
