# Weekly Plan (Demoable Milestones)

Weeks start on **Sunday**. Start date was **one week before Sun Jan 25, 2026**, so:
- **Week 1 (DONE)**: Sun Jan 18 → Sat Jan 24, 2026
- **Week 2 (CURRENT)**: Sun Jan 25 → Sat Jan 31, 2026

---

## Week 1 (DONE) — Sun Jan 18 → Sat Jan 24, 2026
**Theme:** Architecture + Foundations  
**Demo:** Repo boots locally + core docs exist

**Definition of Done**
- Local dev runbook exists (`docs/02-local-dev-runbook.md`)
- MVP done/pending matrix exists (`docs/01-mvp-done-vs-pending.md`)
- Repo has minimal CI and no Azure deploy workflow
- DB connection has local-safe defaults
- Dark mode/token system direction agreed (single source of truth: CSS vars)

---

## Week 2 (CURRENT) — Sun Jan 25 → Sat Jan 31, 2026
**Theme:** UX system + Auth + Invite  
**Demo:** Invite-gated login + consistent dark UI shell

**Definition of Done**
- Invite codes: data model + create/validate flow
- Landing “Continue” validates invite code and routes appropriately (happy + failure paths)
- Optional: basic admin-only invite creation endpoint (can be hardcoded admin for now)
- Remove remaining typography inconsistencies + remaining light-mode hardcoded grays on core donor routes
- CI passes (build-only for now)

---

## Week 3 — Sun Feb 1 → Sat Feb 7, 2026
**Theme:** Donor Giving Thesis  
**Demo:** Thesis saved + used to filter/sort feed

**Definition of Done**
- Thesis schema + persistence
- UI wizard/page for thesis
- Feed uses thesis (even if naive rules)
- Seed donor example thesis or create via UI

---

## Week 4 — Sun Feb 8 → Sat Feb 14, 2026
**Theme:** Requestor Portal Submission v1  
**Demo:** Submit request + docs checklist

**Definition of Done**
- One canonical requestor wizard (resolve `/requester` vs `/requestor` confusion)
- DB fields match SOW essentials
- Status lifecycle: draft → pending
- Basic required-docs checklist stored (uploads can be stubbed)

---

## Week 5 — Sun Feb 15 → Sat Feb 21, 2026
**Theme:** Vault + Permissioning  
**Demo:** Upload/view/download docs with correct access

**Definition of Done**
- Storage provider decided + integrated (local filesystem OK for MVP)
- Document tables + metadata
- Permission checks enforced server-side
- Vault UI reads from DB (not mock)

---

## Week 6 — Sun Feb 22 → Sat Feb 28, 2026
**Theme:** Diligence Engine v1  
**Demo:** Concierge requests info + requestor completes

**Definition of Done**
- Diligence tasks model + endpoints
- Requestor UI to see/complete tasks
- Admin UI (minimal) to create/close tasks
- Audit log entry for task/status changes

---

## Week 7 — Sun Mar 1 → Sat Mar 7, 2026
**Theme:** Decision Brief + Donor Actions  
**Demo:** Donor decides in <30s (Approve/Pass/Save/Leverage) with persistence

**Definition of Done**
- Decision Brief screen is DB-backed
- Feed is DB-backed (replace mocks for core flow)
- Donor actions persisted (tables + API)
- Swipe + list both supported

---

## Week 8 — Sun Mar 8 → Sat Mar 14, 2026
**Theme:** Reporting Commitments + Calendar  
**Demo:** KPI/cadence set + appears on calendar

**Definition of Done**
- KPI schema + cadence schema
- Submission captures commitments
- Donor calendar view wired
- Reminder scaffolding (manual trigger OK)

---

## Week 9 — Sun Mar 15 → Sat Mar 21, 2026
**Theme:** Leverage Engine v1  
**Demo:** Create leverage offer + status tracking

**Definition of Done**
- Leverage offer tables + APIs
- Conditional rules stored (deadline, target gap, milestones)
- UI uses real data (not just context)
- “Challenge packet” object generated and stored

---

## Week 10 — Sun Mar 22 → Sat Mar 28, 2026
**Theme:** Charidy Integration Contract + Sandbox  
**Demo:** Trigger sandbox campaign + status sync

**Definition of Done**
- API contract documented + implemented
- Idempotency + retry behavior
- Status sync path (webhook preferred)
- UI shows campaign status

---

## Week 11 — Sun Mar 29 → Sat Apr 4, 2026
**Theme:** AI Layer v1 (assistive)  
**Demo:** Auto summary + missing info suggestions (auditable)

**Definition of Done**
- Pluggable AI provider + secrets
- Prompt/output stored for audit
- Human override supported
- Classification + matching baseline

---

## Week 12 — Sun Apr 5 → Sat Apr 11, 2026
**Theme:** Hardening + Launch Readiness  
**Demo:** End-to-end pilot flow

**Definition of Done**
- Security pass + audit logs
- Performance pass on feed
- Monitoring/logging baseline
- UAT script + bug bash checklist

---

## Ongoing (as-needed, demoable slices)
- Accessibility + responsive polish
- Replace remaining mocks
- Testing strategy: unit/integration now; Playwright E2E closer to launch
- Cost visibility + provider decisions (DB, storage, email/SMS)

