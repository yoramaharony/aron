# Aron Platform — Master Product Document

> **Purpose:** Living reference for all system processes. Updated after every code change.
> **Last updated:** 2026-02-23

---

## 1. System Overview

Aron is a donor/requestor matching platform for Jewish charitable giving. A **donor** discovers funding opportunities, reviews them via an AI concierge, and commits to funding. An **organization (requestor)** submits funding requests and progresses through a multi-stage pipeline toward approval.

**Architecture:** Next.js 15 App Router, Drizzle ORM, SQLite (remote Turso DB), Mailgun for email.

### Terminology
| Donor calls it | Org calls it | DB table |
|---|---|---|
| Opportunity | Request | `opportunities` |
| Pass | Declined | `donor_opportunity_state.state = 'passed'` |
| Matched (info requested) | Under review | `donor_opportunity_state.state = 'shortlisted'` |
| Commit / Pledge | Funded | `donor_opportunity_state.state = 'funded'` |

---

## 2. Database — Key Tables

### `opportunities`
Unified table for every funding request regardless of source. Key fields:
- `source`: `'submission'` (donor-invited), `'portal'` (org self-service), `'curated'` (demo/Charidy)
- `createdBy`: org user ID (owner — determines visibility on org side)
- `originDonorId`: if submission, the inviting donor (determines visibility on donor side; NULL = visible to all)
- `moreInfoToken`: UUID token for the `/more-info/[token]` page (minted when info is requested)
- `moreInfoRequestedAt` / `moreInfoSubmittedAt`: timestamps for progressive disclosure
- `detailsJson`: the more-info form data submitted by the org
- `evidenceJson`: budget file + supporting docs uploaded during portal submission
- `status`: `'draft'` | `'pending'` | `'active'` | `'more_info_requested'` | `'more_info_submitted'` | `'passed'` | `'funded'`

### `donor_opportunity_state`
Per-donor, per-opportunity state. One row per (donorId, opportunityKey) pair.
- `state`: `'new'` | `'shortlisted'` | `'scheduled'` | `'passed'` | `'funded'`
- `notes`: donor's private notes

### `donor_opportunity_events`
Append-only event log. Each row = one action taken by a donor (or concierge on behalf of donor).
- `type`: `'save'` | `'pass'` | `'request_info'` | `'info_received'` | `'scheduled'` | `'meeting_completed'` | `'diligence_completed'` | `'leverage_created'` | `'funded'` | `'concierge_review'` | `'reset'`
- `metaJson`: structured payload (varies by type)

### `donor_profiles`
Stores the donor's Impact Vision (`visionJson`) and Vision Board (`boardJson`), derived from concierge chat.

### `concierge_messages`
Chat thread between donor and the AI concierge.

---

## 3. Roles & Pages

### Donor (`role: 'donor'`)
| Page | Route | Purpose |
|---|---|---|
| Concierge Chat | `/donor/legacy` | Build Impact Vision via guided Q&A with answer buttons |
| Impact Board | `/donor/impact` | View extracted Impact Vision summary |
| Opportunities | `/donor/opportunities` | Browse/filter/act on opportunities (2 tabs with badge counts: Discover, Passed). Concierge-matched items (both info-requested and kept) stay in Discover with chips. |
| Opportunity Detail | (right panel of above) | Full detail with Pass / See More / Pledge / Structure Leverage actions. Shows concierge match explanation (green) for matched items, auto-pass explanation (gold) for passed items. |
| Pledges | `/donor/pledges` | View committed pledges |

### Organization / Requestor (`role: 'requestor'`)
| Page | Route | Purpose |
|---|---|---|
| Create Request | `/requestor` | 4-step wizard: Basics → Financials → Evidence → Submit |
| My Requests | `/requestor/requests` | List requests in 2 tabs with badge counts: Active, Declined. Mini stepper + status badge per card. |
| Request Detail | `/requestor/requests/[id]` | Tabbed view: Overview, Tasks, Request Details, Documents |

### Admin (`role: 'admin'`)
| Page | Route | Purpose |
|---|---|---|
| Demo Seed | `/api/admin/demo-seed` | Seed demo data (Jewish theme: 7 submissions + 11 curated) |
| Organizations | `/admin/organizations` | Manage org users |
| Users | `/admin/users` | Manage all users |

---

## 4. Core Processes

### 4.1 Opportunity Creation

**Portal submission** (org self-service):
- Route: `POST /api/requests`
- Fields set: title, category, location, summary, targetAmount, coverUrl, evidenceJson, createdBy, source='portal', status='pending'
- **Auto-concierge:** immediately after insert, runs `matchOpportunity()` for every donor with a vision. Results: auto-pass (status='passed'), request_info (mints token, status='more_info_requested'), or concierge_review (no change).
- **Email on auto-concierge request_info:** YES — sends `request_more_info` email to orgEmail.
- File: `app/api/requests/route.ts`

**Donor-invited submission:**
- Route: `POST /api/submissions/route.ts` (via `/submit/[token]` link)
- Fields set: same as portal + originDonorId, linkId, orgName, orgEmail from submission link
- Source: `'submission'`

**Demo seed (curated):**
- Route: `POST /api/admin/demo-seed`
- Seeds 7 Jewish submissions (source='submission') + 11 Charidy curated items (source='curated')
- All owned by demo org (`createdBy: orgId`, `orgEmail: demo-org@aron.local`)
- File: `app/api/admin/demo-seed/route.ts`

### 4.2 Concierge — Impact Vision

**Chat flow** (`/donor/legacy`):
1. Donor opens concierge chat
2. Answer buttons guide through: Pillar → Budget → Geo → Horizon → Outcome12m → Constraints → Update Cadence → Verification → Confirm
3. Each message is processed by `extractVision()` which parses keywords from DONOR messages only
4. Vision is saved to `donor_profiles.visionJson`
5. On "confirm", vision stage = 'activated'

**Demo happy paths** (answer buttons in `lib/vision-extract.ts`):
- **Path A — Chesed & Hachnasas Kallah:** Pillars: Hachnasas Kallah + Chesed + Tzedakah. Geo: Jerusalem + Bnei Brak + NYC. Budget: $1M/yr. Expected ~6 surviving opportunities.
- **Path B — Torah & Chinuch:** Pillars: Torah & Chinuch. Geo: Lakewood + Monsey + Jerusalem. Budget: $3M/yr. Expected ~5 surviving opportunities.

**Key files:** `lib/vision-extract.ts` (extraction + answer buttons), `lib/concierge-match.ts` (matching logic)

### 4.3 Concierge Auto-Review (Bulk)

**Trigger:** Automatically runs when donor opens `/donor/opportunities` page.
**Route:** `POST /api/opportunities/concierge-review`
**Logic:** For every opportunity in state 'new' not yet concierge-processed:
1. Run `matchOpportunity(opp, vision)`
2. **Not matched → auto-pass:** set `opportunities.status = 'passed'`, upsert state to 'passed', insert 'pass' event → item moves to **Passed** tab
3. **Matched + needs info (amount ≥ $25K) → request_info:** mint `moreInfoToken`, set `status = 'more_info_requested'`, upsert state to 'shortlisted', insert 'request_info' event, **send email to org** → item stays in **Discover** tab with "info requested" chip
4. **Matched + no info needed (amount < $25K) → keep:** insert 'concierge_review' event, no state/status change → item stays in **Discover** tab with "matched" chip and "Concierge reviewed" status

**UX after concierge review:**

- Two tabs only: **Discover** (all matched items) and **Passed** (auto-passed + manual pass)
- Tab badge counts update to show how many items are in each tab
- Banner shows summary: "X auto-passed, Y matched (info requested), Z matched"
- List cards show chips: "info requested" (gold) on info-requested items, "matched" (green) on kept items
- Detail panel shows green concierge match explanation with the match reason

**Info tier thresholds** (`determineInfoTier` in `lib/concierge-match.ts`):
- < $25K → 'none' (no info needed)
- $25K–$250K → 'basic'
- > $250K → 'detailed'

**File:** `app/api/opportunities/concierge-review/route.ts`

### 4.4 Donor Manual Actions

**Route:** `POST /api/opportunities/[key]/actions`
**Actions:**
| Action | New State | Effect |
|---|---|---|
| `save` / `shortlist` | shortlisted | — |
| `pass` | passed | sets `opportunities.status = 'passed'` |
| `reset` | new | — |
| `request_info` | shortlisted | mints token, sets status='more_info_requested', optionally sends email (if `meta.sendEmail`) |
| `info_received` | shortlisted | persists detailsJson, sets status='more_info_submitted' |
| `scheduled` | scheduled | — |
| `meeting_completed` | scheduled | — |
| `diligence_completed` | shortlisted | — |
| `funded` | funded | sets `opportunities.status = 'funded'` |

**File:** `app/api/opportunities/[key]/actions/route.ts`

### 4.5 Opportunity Pipeline (Org View — 5 Stages)

The org sees their request progress through 5 stages, visualized by `OpportunityStepper`:

```
Submitted → Info Requested → Meeting → Review → Decision
```

**Workflow derivation** (`deriveWorkflow` in `lib/workflow.ts`):
- Computed from `donorOpportunityState.state` + `donorOpportunityEvents[].type`
- Events drive stage forward: `request_info` → info_requested, `info_received`/`scheduled` → meeting, `meeting_completed` → due_diligence, `diligence_completed` → decision
- `state = 'passed'` → shows decline marker at the stage AFTER the last completed stage
- `state = 'funded'` → all stages complete with checkmarks

**Org request detail page** (`/requestor/requests/[id]`):
- 4 tabs: Overview, Tasks (N), Request Details, Documents
- Tasks tab shows pending actions (e.g., "Provide additional information" if moreInfoToken exists and not yet submitted)
- Demo advance dots on stepper allow simulating stage progression

**Key files:** `lib/workflow.ts`, `components/shared/OpportunityStepper.tsx`, `app/requestor/requests/[id]/page.tsx`

### 4.6 More-Info Flow (Progressive Disclosure)

1. **Trigger:** Donor (or concierge) requests more info → `moreInfoToken` is minted on the opportunity
2. **Email sent** to org with link: `/more-info/[token]`
3. **Org fills form** at `/more-info/[token]` (public, no auth required) or inline on `/requestor/requests/[id]`
4. **Form fields** vary by amount tier (basic/detailed/comprehensive)
5. **On submit:** `detailsJson` saved, `moreInfoSubmittedAt` set, `status = 'more_info_submitted'`, `info_received` event created
6. **Auto-schedule:** Concierge immediately inserts a `scheduled` event (Zoom meeting, 3 days out, 14:00) and updates state to `'scheduled'`
7. **Stepper advances** to "Meeting" stage (from `scheduled` event)
8. **Donor sees:** Scheduled Meeting card with date/time/type/location/agenda + Reschedule button

**Key files:** `app/more-info/[token]/page.tsx`, `app/api/more-info/[token]/route.ts`

### 4.7 Email Notifications

| Template Key | When Sent | Variables |
|---|---|---|
| `request_more_info` | Concierge or donor requests more info | inviter_name, opportunity_title, more_info_url, note |
| `invite_donor` | Admin invites a donor | invite link |
| `invite_requestor` | Admin invites an org | invite link |
| `forgot_password` | Password reset | reset link |

**Email system:** Templates stored in `email_templates` DB table. Rendered via `lib/email-templates.ts`. Sent via Mailgun (`lib/mailgun.ts`).

### 4.8 Matching Logic

**File:** `lib/concierge-match.ts`

**Dimensions (AND logic — all set dimensions must match):**
1. **Pillar matching:** opportunity category → mapped via `CATEGORY_TO_PILLARS` → checked against vision pillars. Fallback: keyword search in title+summary via `PILLAR_KEYWORDS`.
2. **Geo matching:** opportunity location → resolved via `GEO_ALIASES` → checked against vision geoFocus. Global = always matches.
3. **Budget filter:** `opp.amount > annualBudget` → auto-reject.

---

## 5. Pillar & Category Reference

### Vision Pillars (extracted from donor messages)

These are the pillars stored in `visionJson.pillars[]`. Extracted by `extractVision()` from donor message keywords.

| Vision Pillar | Extraction Keywords (donor says...) | Jewish-specific? |
|---|---|---|
| Hachnasas Kallah | hachnasas kallah, hachnasat kallah, kallah | Yes |
| Chesed / Community support | chesed, chessed, gemach, g'mach | Yes |
| Tzedakah / Family assistance | tzedakah, tzedaka, kimcha, maos chitim | Yes |
| Torah & Chinuch | yeshiva, yeshivah, kollel, chinuch, talmud torah | Yes |
| Refuah / Bikur Cholim | bikur cholim, bikkur cholim, refuah, refua | Yes |
| Hatzalah / Emergency response | hatzalah, hatzolah, hatzoloh | Yes |
| Community infrastructure | mikvah, mikveh, eruv, erub | Yes |
| Kiruv / Outreach | kiruv | Yes |
| Children & Families | children, pediatric | Generic |
| Health & Healing | cancer, oncology, medical, health | Generic |
| Clean Water | water | Generic |
| Education & Mobility | education, school, stem | Generic |
| Environment | environment, climate, sustainab | Generic |

### Opportunity Categories (org-side)

These are the categories orgs assign to requests. Used in matching via `CATEGORY_TO_PILLARS`.

| Opportunity Category | Maps to Vision Pillar(s) |
|---|---|
| Hachnasas Kallah | Hachnasas Kallah |
| Chesed / Community support | Chesed / Community support |
| Tzedakah / Family assistance | Tzedakah / Family assistance |
| Torah & Chinuch | Torah & Chinuch |
| Refuah / Bikur Cholim | Refuah / Bikur Cholim, Health & Healing |
| Hatzolah / Pikuach Nefesh | Hatzalah / Emergency response |
| Mikveh & Taharas Hamishpacha | Community infrastructure |
| Gemach (G'mach) / Free loans | Chesed / Community support, Tzedakah / Family assistance |

**Note:** Gemach maps to TWO pillars — a donor focused on either Chesed or Tzedakah will match gemach opportunities.

### Geo Keywords (extracted from donor messages)

| Donor says... | Extracted Geo |
|---|---|
| jerusalem, yerushalayim | Jerusalem |
| bnei brak, bene braq | Bnei Brak |
| lakewood | Lakewood |
| monsey | Monsey |
| boro park, borough park, boropark | Boro Park |
| new york, nyc | New York |
| israel | Israel |
| africa | Africa |

### Geo Aliases (matching opp location → vision geo)

| Location keyword in opp | Resolves to vision geo(s) |
|---|---|
| brooklyn | New York, Boro Park |
| boro park, borough park | New York, Boro Park |
| williamsburg, flatbush | New York |
| jerusalem, yerushalayim | Jerusalem, Israel |
| bnei brak, bene braq | Bnei Brak, Israel |
| lakewood | Lakewood |
| monsey | Monsey |
| israel | Israel |

### Demo Button → Extraction Mapping

The demo pillar buttons are **shortcut bundles** — one click sets pillar + geo + budget simultaneously. The button label now reflects this.

| Button Label | Extracted Pillars | Extracted Geo | Extracted Budget |
|---|---|---|---|
| Demo: Chesed path (Israel + NYC, $1M/yr) | Hachnasas Kallah, Chesed / Community support, Tzedakah / Family assistance | Jerusalem, Bnei Brak, New York | $1M / year |
| Demo: Torah path (Lakewood + Israel, $3M/yr) | Torah & Chinuch | Lakewood, Monsey, Jerusalem | $3M / year |

**Why pillars expand:** The Chesed button content says "Hachnasas Kallah, chesed, tzedakah, and gemach" — `extractVision` picks up each keyword separately, resulting in 3 distinct pillars (Hachnasas Kallah + Chesed + Tzedakah). The Torah button mentions only "yeshiva, kollel, chinuch, talmud torah" which all map to the single "Torah & Chinuch" pillar.

### Expected Survivors per Demo Path

| Path | Discover (matched) | Passed | Info Requested (of matched) | Kept without info (of matched) |
|---|---|---|---|---|
| **Chesed (Path A)** | 7 | 11 | 6 (amt ≥ $25K, "info requested" chip) | 1 (charidy_11 $5K, "matched" chip) |
| **Torah (Path B)** | 5 | 13 | 5 (all ≥ $25K, "info requested" chip) | 0 |

---

## 6. Demo Seed Data (Jewish Theme)

### 7 Submissions (source='submission')
| Title | Category | Location | Amount |
|---|---|---|---|
| Refuah / Bikur Cholim: rides + meals | Refuah / Bikur Cholim | Boro Park, Lakewood | $180K |
| Hatzolah: ambulance + equipment | Hatzolah / Pikuach Nefesh | Monsey, Boro Park | $1.2M |
| Kimcha d'Pischa: Pesach packages | Tzedakah / Family assistance | Yerushalayim, Bnei Brak | $120K |
| Chinuch: tuition relief | Torah & Chinuch | Lakewood, Boro Park | $500K |
| Mikveh: expansion + renovation | Mikveh & Taharas Hamishpacha | Monsey | $950K |
| Yeshiva: new wing + beis medrash | Torah & Chinuch | Yerushalayim | $2.5M |
| Gemach: interest-free loan pool | Gemach (G'mach) / Free loans | Bnei Brak | $25K |

### 11 Curated (source='curated', from `lib/charidy-curated.ts`)
| Key | Title | Category | Location | Amount |
|---|---|---|---|---|
| charidy_1 | Shabbos meals (Williamsburg) | Chesed / Community support | Brooklyn, NY | $85K |
| charidy_2 | Hachnasas Kallah essentials | Hachnasas Kallah | Jerusalem, Israel | $120K |
| charidy_3 | Yeshiva Ketana dormitory | Torah & Chinuch | Lakewood, NJ | $310K |
| charidy_4 | Kollel stipend stabilization | Torah & Chinuch | Monsey, NY | $175K |
| charidy_5 | Gemach network coordination | Gemach / Free loans | Bnei Brak, Israel | $65K |
| charidy_6 | Talmud Torah renovation | Torah & Chinuch | Jerusalem, Israel | $240K |
| charidy_7 | Bikur Cholim overnight | Refuah / Bikur Cholim | Jerusalem, Israel | $95K |
| charidy_8 | Hatzalah ambulance retrofit | Hatzolah / Pikuach Nefesh | Brooklyn, NY | $180K |
| charidy_9 | Kimcha D'Pischa distribution | Tzedakah / Family assistance | Lakewood, NJ | $55K |
| charidy_10 | Community mikveh renovation | Mikveh & Taharas Hamishpacha | Monsey, NY | $95K |
| charidy_11 | After-school snack program | Chesed / Community support | Brooklyn, NY | $5K |

### Demo Credentials
- **Donor:** demo-donor@aron.local / AronDemo1!
- **Org:** demo-org@aron.local / AronDemo1!

---

## 7. Stakeholder Decisions (Feb 16, 2026)

Key decisions from the stakeholder review (Yehuda Gurwitz, Mendel, Shay Chervinsky, Yoram):

1. **Donor UI simplified** — removed stepper/progress bars from donor view, focus on Pass / See More / Pledge
2. **Steppers moved to org side** — organizations track submission progress, not donors
3. **AI-first approach** — meeting notes, due diligence, and status updates should be automated (AI bot captures, not donor typing)
4. **Phase 1 = CRM + streamline** — impact features (pooling, matching, collaborative giving) come in Phase 2
5. **Donor does minimum work** — no manual meeting notes, no manual due diligence checkboxes
6. **Meeting scheduling is collaborative** — concierge proposes → org Accept / Reschedule / Propose alternative
7. **Each stage advancement adds concierge-generated detail** — demo-advance injects realistic data (meeting summary, diligence findings, etc.)

**Source:** `docs/meetings/2026-02-16-stakeholder-review.md`

---

## 8. Week of Feb 16–23 — Completed Work

### Phase A: Org-side detail views (Mon–Wed)
- [x] Created `/requestor/requests/[id]` tabbed detail page (Overview, Tasks, Request Details, Documents)
- [x] Reused `OpportunityStepper` with org-friendly labels (Submitted → Info Requested → Meeting → Review → Decision)
- [x] Stepper dot "concierge advance" hack — clicking dots simulates stage progression with injected data
- [x] Org request list with mini stepper + status badges

### Phase B: Simplified donor UX (Wed–Thu)
- [x] Replaced multi-button workflow with Pass / See More / Pledge
- [x] Removed stepper, meeting forms, due diligence checkboxes from donor view
- [x] Added next/prev navigation with caching + prefetching for instant transitions
- [x] Pass auto-advances to next opportunity

### Phase C: Demo data & polish (Thu–Fri)
- [x] 18 varied demo opportunities (7 submissions + 11 curated) across budgets and categories
- [x] All demo items owned by demo org
- [x] Concierge auto-review: auto-pass + request_info + keep with email notifications
- [x] Tab badge counts, concierge banner (Shortlist tab removed — matched items stay in Discover)
- [x] Concierge match chips (green "matched", gold "info requested") on list cards
- [x] PRODUCT.md master document created and maintained

**Source:** `docs/2026-02-16_to_2026-02-23-weekly-plan.md`

---

## 9. Known Gaps & Status

| Area | Status | Notes |
|---|---|---|
| Portal submission → auto-concierge | Working | Sets status, sends email on request_info |
| Concierge bulk review → auto-pass | Working | Sets status='passed', upserts state |
| Concierge bulk review → request_info | Working | Mints token, upserts state, sends email to org |
| Concierge bulk review → keep | Working | Event only, no state change (correct) |
| Org stepper for passed items | Working | Shows decline marker at correct stage |
| Org stepper for request_info items | Working | Shows "Info Requested" highlighted |
| More-info form submission | Working | Saves details, auto-schedules meeting, advances stepper |
| Auto-schedule after info submission | Working | Concierge inserts `scheduled` event (Zoom, 3 days out) after org submits info |
| Scheduled meeting card (donor) | Working | Shows meeting details + reschedule inline form |
| Donor reschedule capability | Working | Creates new `scheduled` event; old schedule preserved in timeline |
| Opportunity ID on org detail | Working | Monospace ID with copy-to-clipboard, matching donor pattern |
| AI demo fill for forms | Working | Purple "AI Fill" button on more-info + request creation forms |
| Demo advance (stepper dots) | Working | Simulates concierge stage progression |
| Curated items org ownership | Working | All 18 items owned by demo org |
| Donor prev/next navigation | Working | Cached + prefetched for instant transitions |
| Opportunity detail default expanded | Working | "See More" open by default |
| Email on manual donor request_info | Working | Sends if meta.sendEmail=true |
| Multiple donors per opportunity | Limited | Org sees first donor's progress only |
| Org name on portal submissions | Gap | `orgName` not set on portal-submitted requests |

---

## 10. File Index (Key Files)

| File | Purpose |
|---|---|
| `db/schema.ts` | All Drizzle table definitions |
| `lib/workflow.ts` | `deriveWorkflow()`, stage labels, event humanization |
| `lib/vision-extract.ts` | `extractVision()`, `demoSuggestionsForVision()`, answer buttons |
| `lib/concierge-match.ts` | `matchOpportunity()`, `reviewOpportunities()`, info tier logic |
| `lib/email-templates.ts` | Email template rendering |
| `lib/mailgun.ts` | Email sending via Mailgun |
| `lib/charidy-curated.ts` | 11 curated demo opportunities |
| `components/shared/OpportunityStepper.tsx` | 5-stage stepper component |
| `app/api/requests/route.ts` | GET (list) + POST (create) requests |
| `app/api/opportunities/[key]/route.ts` | GET (donor detail) + PATCH (notes) |
| `app/api/opportunities/[key]/actions/route.ts` | POST donor actions (pass, shortlist, request_info, funded, etc.) |
| `app/api/opportunities/concierge-review/route.ts` | Bulk auto-review against Impact Vision |
| `app/api/requestor/requests/[id]/route.ts` | GET org request detail (anonymized donor progress) |
| `app/api/requestor/requests/[id]/demo-advance/route.ts` | Demo-only: simulate concierge stage advancement |
| `app/api/more-info/[token]/route.ts` | GET/POST more-info form data + auto-schedule meeting after submission |
| `app/api/admin/demo-seed/route.ts` | Seed demo data |
| `app/donor/opportunities/page.tsx` | Donor feed (Discover/Passed + detail panel) |
| `app/requestor/requests/page.tsx` | Org request list (Active/Declined tabs with badge counts) |
| `app/requestor/requests/[id]/page.tsx` | Org request detail (tabbed) |
| `app/requestor/page.tsx` | Org create request wizard |
| `app/donor/legacy/page.tsx` | Concierge chat UI |
| `app/more-info/[token]/page.tsx` | Public more-info form |
| `next.config.ts` | Next.js config (devIndicators disabled) |
