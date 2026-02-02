# Aron Major Donor App — MVP TODO (Exec Standup → Build Plan)
Date: 2026-01-28  
Source: Executive standup notes (Jan 26, 2026)  
Target: **2-week MVP (by Feb 9, 2026)** — *presentable UI + core donor/requester journeys; minimal backend complexity*

Legend:
- `[x]` Done (Real): DB/API-backed
- `[~]` Done (Demo/UI): present but uses mocks/client-only state
- `[ ]` Not started / missing

---

## Phase 1 (2-week MVP) — “Presentable + self-explanatory”

### Access model (invite-only / quality control)
- `[x]` **Invite-only signup gating** (landing validates invite; signup redeems one-time code)
- `[x]` **Donor-generated submission links** (unique donor→org relationship; revocable; expirable; tracked)
  - Donor UI: `/donor/submission-links`
  - Public intake: `/submit/<token>` (brief text + optional video link)
  - Tracking: opens + submissions + last activity; revoke/expiry/max-submissions enforced

### Donor experience (core)
- `[x]` **AI concierge conversation** (help donor articulate “Impact Vision” — not preferences)
- `[~]` **Vision / Impact Board** output (visual, shareable inside app)
- `[~]` **Opportunity dashboard** (email/inbox-style list view + right-pane detail + hover actions)
- `[~]` **Opportunity actions + history** (New → Requested Info → Scheduled → Shortlisted → Passed → Leverage Flagged → Funded)
- `[~]` **Leverage engine UI** (create catalytic offer / leverage terms)
- `[x]` **Donor-to-donor matching (Level 2)** surfaced as opt-in insight (Phase 1: light UI + toggle; no automation)

### Requester/org experience (progressive disclosure)
- `[x]` **Lightweight initial submission** (brief text + optional video link) via donor-generated link
- `[ ]` **LLM auto-extraction** from video/text (cause, geo, amount, urgency, etc.) — Phase 1 can be stubbed with deterministic extraction
- `[ ]` **“Request more info”** path (only after donor signals interest) → unlocks detailed form
- `[ ]` **Dynamic complexity by amount** (small vs medium vs large ask)
- `[ ]` **Scoring/completeness indicator** (use labels like “Basic / Detailed / Comprehensive”, not a % score)

### Trust & verification (MVP-lite)
- `[ ]` **Org KYC onboarding (one-time)** (Phase 1 can be “verified by concierge” toggle + placeholder UI)
- `[ ]` **Promise vs Due Diligence separation** (two tabs/layers in detail view; hide “overhead” from promise layer)

### Charidy integration (Phase 1: manual curation)
- `[ ]` **Curated Charidy campaigns** appear as opportunities (manual list in code is OK for MVP)
- `[ ]` **Context framing** for major gifts (naming opportunity, funding gap, outcomes)

### UX / polish requirements (demo readiness)
- `[~]` Dark mode-first, futuristic magenta accents, premium motion
- `[~]` Landing hero with rotating videos + polished CTA
- `[~]` Donor shell UI polish across core routes
- `[ ]` Terminology sweep: replace “Legacy” language with **Impact Vision / Vision Board** language throughout donor experience

---

## Phase 2 (4–6 weeks) — “Automation + intelligence”
- `[ ]` ML-driven Charidy campaign matching (train on Phase 1 curation outcomes)
- `[ ]` Donor-to-donor collaboration suggestions + facilitation workflow
- `[ ]` Financial backend (DAF, disbursements, tax receipts, paperwork automation)
- `[ ]` Impact reporting portal / shareable footprint site

---

## Current codebase reality check (what exists today)

### ✅ Implemented (Real)
- Auth + roles: `/api/auth/*` + JWT session cookie + middleware protection
- Invite gating (signup): donor generates one-time invite codes; landing validates; signup redeems  
  - Donor UI: `/donor/invites`
- Donor-generated submission links + public intake:
  - Donor UI: `/donor/submission-links`
  - Public intake: `/submit/<token>`
  - APIs: `POST /api/submission-links`, `GET /api/submission-links`, `GET /api/submission-links/public/<token>`, `POST /api/submissions`

### ✅ Implemented (Demo/UI-only)
- “Concierge AI” chat + visual plan canvas (currently in `/donor/legacy`) — mock data
- Donor opportunity feed + detail pages + shortlist/passed + leverage drawer — mock + client state
- Inbox split view interaction — mock + client state

### ❌ Missing vs refined MVP direction
- “Request more info” progressive disclosure (after donor signals interest)
- Opportunity dashboard should be email-list-first (not swipe-first)
- Request lifecycle states persisted in DB (and shown in UI)
- KYC verification model (even a “concierge verified” flag)
- Charidy curated campaigns surfaced in donor dashboard

---

## Open decisions to confirm (from exec notes)
- Thresholds for “more detail required”: \$25K / \$50K / \$100K?
- Request floating (Phase 2): donor opt-in? only Charidy campaigns first?
- Donor-to-donor collaboration notifications: opt-in wording + privacy model
- “Completeness” display: labels vs numeric score (recommend labels)

