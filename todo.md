# Aron Major Donor App — MVP TODO (Exec Standup → Build Plan)

Date: 2026-02-16 (updated)
Source: Executive standup notes (Jan 26, 2026)
Target: **2-week MVP (by Feb 9, 2026)** — *presentable UI + core donor/requester journeys; minimal backend complexity*

Legend:

- `[x]` Done (Real): DB/API-backed
- `[~]` Done (Demo/UI): present but uses mocks/client-only state
- `[ ]` Not started / missing

---

## Phase 1 (2-week MVP) — "Presentable + self-explanatory"

### Access model (invite-only / quality control)

- `[x]` **Invite-only signup gating** (landing validates invite; signup redeems one-time code)
- `[x]` **Donor-generated submission links** (unique donor→org relationship; revocable; expirable; tracked)
  - Donor UI: `/donor/submission-links`
  - Public intake: `/submit/<token>` (brief text + optional video link)
  - Tracking: opens + submissions + last activity; revoke/expiry/max-submissions enforced

### Donor experience (core)

- `[x]` **AI concierge conversation** (help donor articulate "Impact Vision" — not preferences)
- `[x]` **Vision / Impact Board** output (visual, shareable inside app)
- `[x]` **Opportunity dashboard** (email/inbox-style list view + right-pane detail + hover actions)
- `[x]` **Opportunity actions + history** (New → Requested Info → Scheduled → Meeting Completed → Due Diligence → Decision → Funded/Passed)
- `[x]` **Full opportunity pipeline** — complete end-to-end flow:
  - Discover → Request Info → Schedule Meeting → Post-Meeting Summary → Due Diligence Checklist → Complete Due Diligence → Approve & Pledge / Structure Leverage
  - `diligence_completed` action persisted to DB, advances workflow to decision stage
  - Auto-expand full details at due diligence stage
  - Diligence checklist always visible (no extra button click)
  - Decision stage: "Approve & Pledge" (gold) + "Structure Leverage" (outline)
- `[x]` **Post-meeting summary modal** with drag & drop file upload
  - Meeting outcomes card: summary, tone, amount confirmation, follow-ups
  - Documents uploaded as meeting attachments (downloadable)
  - Drag & drop zone with visual feedback, removable file chips
- `[x]` **Materials section** (standardized across both views)
  - Organization Documents (renamed from "Proof links")
  - Video link
  - Meeting Documents
  - All sections use consistent style: uppercase labels, paperclip icons, gold underlined links
- `[x]` **Inline-editable Notes** (auto-save, DB-backed, works in all views including full details)
- `[x]` **Leverage engine UI** (create catalytic offer / leverage terms — persisted to DB via API)
- `[x]` **Donor-to-donor matching (Level 2)** surfaced as opt-in insight (Phase 1: light UI + toggle; no automation)
- `[x]` **Pledges page** — wired to real DB data:
  - Active Commitments: funded opportunities fetched via `GET /api/pledges`
  - Detail drawer: real title, org, grant ID, commitment date, progress bar, leverage offers
  - Conditional Offers: from DB leverage offers (not client-only state)
  - Past Fulfillment: Jewish-themed demo entries (Hachnasas Kallah, Chesed Shel Emes, Beit Midrash)
  - Empty state with link to opportunities pipeline
- `[x]` **Upload API** accepts both donor and requestor roles

### Requester/org experience (progressive disclosure)

- `[x]` **Lightweight initial submission** (brief text + optional video link) via donor-generated link
- `[x]` **LLM auto-extraction** from video/text (cause, geo, amount, urgency, etc.) — Phase 1 deterministic extraction
- `[x]` **"Request more info"** path (only after donor signals interest) → unlocks detailed form
- `[x]` **Dynamic complexity by amount** (small vs medium vs large ask)
- `[x]` **Scoring/completeness indicator** (labels like "Basic / Detailed / Comprehensive")

### Trust & verification (MVP-lite)

- `[x]` **Org KYC onboarding (one-time)** (Phase 1: "verified by concierge" toggle in admin)
- `[x]` **Promise vs Due Diligence separation** (two tabs/layers in detail view; overhead/financials in Due diligence)

### Charidy integration (Phase 1: manual curation)

- `[x]` **Curated Charidy campaigns** appear as opportunities (manual list in code is OK for MVP)
- `[x]` **Context framing** for major gifts (naming opportunity, funding gap, outcomes)

### UX / polish requirements (demo readiness)

- `[~]` Dark mode-first, futuristic magenta accents, premium motion
- `[~]` Landing hero with rotating videos + polished CTA
- `[~]` Donor shell UI polish across core routes
- `[x]` Terminology sweep: replace "Legacy" language with **Impact Vision / Vision Board** language throughout donor experience

---

## Recent session work log (Feb 16, 2026)

### Opportunity pipeline completion

- Fixed redirect bug: `stateToTab('scheduled')` now maps to `'shortlist'` (was falling to `'discover'`)
- Expanded `stayActions` in `act()` for progression actions to keep donor on opportunity
- Added `diligence_completed` action to API (`actionToState` map)
- Wired "Complete Due Diligence" → "Approve & Pledge" / "Structure Leverage" button flow
- Auto-expand details at due diligence stage
- Removed "Open Checklist" button — checklist always visible at due diligence
- Removed unused `checklistOpen`, `reviewBegunByKey`, `decisionReadyByKey` state

### Meeting & documents

- Fixed upload API: added `donor` role to allowed roles (was requestor-only, donors got 403)
- Added drag & drop file upload to post-meeting summary modal
- Meeting documents now appear in Materials section (both views)
- Documents are clickable/downloadable with gold underlined links

### UI standardization

- Renamed "Proof links" to "Organization Documents"
- Standardized all Materials sections (Org Docs, Video, Meeting Docs) to same visual style
- Activated inline-editable Notes in full details view (was static placeholder)
- Removed useless "More Info Requested" placeholder
- Reordered review mode layout: action buttons → engagement timeline → diligence checklist → meeting outcomes
- Summary card (Cause/Amount/Geography/Urgency) hides when details expanded

### Pledges page

- Created `GET /api/pledges` endpoint (queries funded opportunities + events + leverage offers)
- Rewrote pledges page: real data from API, removed hardcoded mocks
- Removed `useLeverage()` dependency — leverage data from API per pledge
- Added Jewish-themed Past Fulfillment entries
- Detail drawer shows commitment date, leverage offers, progress bar, grant ID
- Empty state links to opportunities pipeline

### Housekeeping

- Added `figma-design/` to `.gitignore` and `tsconfig.json` exclude
- Updated `docs/happy-path-mvp-demo.md` with full pipeline walkthrough
- `leverageOffers` table added to `db/schema.ts` and `db-ensure.mjs`

---

## Phase 2 (4–6 weeks) — "Automation + intelligence"

- `[ ]` ML-driven Charidy campaign matching (train on Phase 1 curation outcomes)
- `[ ]` Donor-to-donor collaboration suggestions + facilitation workflow
- `[ ]` Financial backend (DAF, disbursements, tax receipts, paperwork automation)
- `[ ]` Impact reporting portal / shareable footprint site
- `[ ]` Real payment schedule management on pledges page
- `[ ]` Grant agreement / tax receipt document generation

---

## Current codebase reality check (what exists today)

### Implemented (Real)

- Auth + roles: `/api/auth/*` + JWT session cookie + middleware protection
- Invite gating (signup): donor generates one-time invite codes; landing validates; signup redeems
  - Donor UI: `/donor/invites`
- Donor-generated submission links + public intake:
  - Donor UI: `/donor/submission-links`
  - Public intake: `/submit/<token>`
  - APIs: `POST /api/submission-links`, `GET /api/submission-links`, `GET /api/submission-links/public/<token>`, `POST /api/submissions`
- Full opportunity pipeline: discover → info request → meeting → due diligence → decision → funded
  - APIs: `GET /api/opportunities`, `GET /api/opportunities/[key]`, `POST /api/opportunities/[key]/actions`, `PATCH /api/opportunities/[key]`
- Leverage offers: `POST /api/leverage-offers`, `GET /api/leverage-offers`
- Pledges: `GET /api/pledges` (funded opportunities + leverage offers + commitment dates)
- File uploads: `POST /api/uploads` (donor + requestor roles, Vercel Blob or local)

### Implemented (Demo/UI-only)

- Inbox split view interaction — mostly UI (messages are mocked today)
- Vault docs — mostly UI (static docs + "ripple" docs from leverage drafting)
- Past Fulfillment on pledges page — Jewish-themed hardcoded entries
- Grant Agreement / Tax Receipt buttons — stubs (not functional)
- Payment schedule management — stub ("configured by your concierge")

### Open decisions to confirm (from exec notes)

- Thresholds for "more detail required": \$25K / \$50K / \$100K?
- Request floating (Phase 2): donor opt-in? only Charidy campaigns first?
- Donor-to-donor collaboration notifications: opt-in wording + privacy model
- "Completeness" display: labels vs numeric score (recommend labels)
