# Weekly Update — Aron (Yesod Platform)
Week ending: **2026-02-02**

## Highlights (what shipped)
- **Donor core flows moved from mock → DB/API-backed**: Concierge conversation persistence + Impact Vision Board generation + Opportunities list/detail/actions + Leverage offers persistence.
- **Happy-path presentation tooling**: one-click demo data seeding + guided links for end-to-end verification.
- **Admin console upgraded**: donor/org management (CRUD-ish) + ability to disable users + “soft orgs” view + improved admin shell UI.
- **Invite + submission intake**: donor-generated submission links + public `/submit/<token>` intake + deterministic extraction (“LLM stub”) from text/video into structured fields.

---

## Product / UX Deliverables

### Donor Experience
- **Concierge AI (Impact Vision)**:
  - Thread persists across refresh (DB-backed).
  - “Demo AI” upgraded with a state machine (discover → clarify → confirm → activated), guided choices, and non-stuck replies.
  - Captures update cadence + verification level via guided options and reflects them in the board.
- **Impact Vision Board** (`/donor/impact`):
  - Renders from persisted board JSON; updates from concierge messages.
  - Added happy-path example copy block.
  - Added **shareability inside app**:
    - Copy summary
    - Copy share link
    - Print / PDF
  - Added **Donor-to-donor matching (Level 2) opt-in insights** (anonymized “Donor (private)”; no automation).
- **Opportunities** (`/donor`):
  - Email-list-first layout with right-pane detail.
  - Persisted actions (pass / shortlist) + history feed.
  - Added “Auto-extraction (demo)” section showing extracted cause/geo/amount/urgency for submissions.
- **Leverage**:
  - Leverage drawer now creates offers via API (persisted) while still keeping the UI ripple effects.
- **Donor Invites**:
  - UI upgraded to match admin: expires/max-uses/note controls, full-width table, better listing.

### Public Intake / Requester Path (Phase 1)
- **Donor submission links**:
  - Donor UI: `/donor/submission-links`
  - Public intake: `/submit/<token>`
  - Tracking: visits/submissions + revoke/expiry/max submissions.
- **Deterministic “LLM auto-extraction” stub**:
  - Extracts cause/geo/amount/urgency from submission text/video URL and stores it.

---

## Admin / Concierge Deliverables
- **Admin shell UI**:
  - Collapsible left sidebar + top bar title + avatar sign-out (donor-shell style).
  - Improved spacing on `/admin/invites`.
- **Admin invites console**:
  - Create/list invite codes for donors or nonprofits.
- **Admin donors + organizations management**:
  - `/admin/donors`: create donor, disable/enable, reset password.
  - `/admin/organizations`: requestor accounts + “soft orgs” aggregated from submissions/links + convert-to-account.
- **Account disabling**:
  - Added `disabled_at` support and enforced in login.
- **Happy-path demo tooling**:
  - `/admin/happy-path`: one-click seed + credentials + guided links.
  - Demo submission “video link” updated to the provided URL.

---

## Additional Updates (shipped after the first draft)

### Access model refinements
- **Invite roles enforced (product rule)**:
  - Admin can generate **donor** invites only.
  - Donors can generate **nonprofit/requestor** invites only.
  - Both UI + API enforce this (no bypass).
- **Signup role-lock for invite links**:
  - `/auth/signup?invite=...&role=requestor` now locks the toggle so a requestor can’t self-select “Donor”.

### Donor Experience polish
- **Opportunity history is now human-readable**:
  - Events render as “Requested more info”, “Drafted leverage offer”, etc. (no underscores).
  - Consecutive duplicates are collapsed.
  - Event timestamps are reliably present (explicitly set on insert).

### Requestor (nonprofit) portal upgrade
- **Requestor shell UI now matches donor/admin**:
  - Collapsible sidebar + top bar title + avatar/sign-out.
  - Consistent logo usage (shared `AronLogo`) + cleaned up requestor pages to fit the new chrome.
- **Evidence & documents uploads activated (MVP-local)**:
  - New `POST /api/uploads` (requestor-only) supports PDF/XLS/XLSX up to 10MB.
  - Stores files locally under `public/uploads/tmp/` (gitignored) and shows the uploaded file(s) in the wizard UI.
  - Hardened for file-like payloads (no fragile `instanceof File` checks).

### Public intake hardening
- **Fixed `/submit/<token>` validation**:
  - Public token validation endpoint now safely resolves Next.js route params (prevents false “Invalid link”).

### Branding / terminology sweep
- **“Legacy” terminology replaced with “Impact Vision / Impact” in user-facing copy**:
  - Landing page taglines + hero copy updated.
  - Donor sidebar tagline updated.
  - Concierge input placeholder updated.

---

## Technical / Platform Changes
- **DB schema expanded (idempotent)** via `scripts/db-ensure.mjs` (no migrations folder yet):
  - `donor_profiles` now stores vision/board JSON, share token, opt-in settings.
  - `concierge_messages` table for persistent conversation.
  - `donor_opportunity_state` + `donor_opportunity_events` for persisted actions/history.
  - `leverage_offers` for persisted leverage offers.
  - `submission_entries` now stores extracted fields (extraction stub).
- **API additions**:
  - `/api/concierge`
  - `/api/opportunities/*` + actions endpoint
  - `/api/leverage-offers/*`
  - `/api/impact/share` + `/share/impact/<token>`
  - `/api/donor/collaboration-*`
  - `/api/admin/demo-seed`
- **Bug fixes & polish**
  - Fixed JSON parsing errors caused by invalid timestamp formatting in opportunities API.
  - Fixed `useLegacy` runtime error on `/donor/legacy` by migrating the Impact Vision canvas to concierge API data.
  - Fixed toggle knob overflow in collaboration insights.
  - Favicon readability improved (larger mark + white background).

---

## Meeting-ready “Happy Path” Demo Script (quick)
1. Admin: open `/admin/happy-path` → **Seed Demo Data**
2. Login as demo donor → open `/donor/legacy`
3. Follow guided prompts → confirm vision → open `/donor/impact`
4. Show share actions (copy summary / share link / print)
5. Open `/donor` → open seeded submission → show extraction box → shortlist/pass → leverage

