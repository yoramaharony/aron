# MVP “Done vs Pending” (based on current code)

Legend:
- **Done (Real)**: implemented end-to-end with DB/API
- **Done (Demo/UI)**: present and demo-able, but uses mock/client-only state for some parts
- **Pending**: not implemented or only placeholder

## Authentication & roles

- **Done (Real)**: Signup/Login/Logout APIs (`/api/auth/*`)
- **Done (Real)**: Session cookie (JWT) + role-based route protection for `/donor/*`, `/requestor/*`, `/admin/*`
- **Done (Real)**: Invite code gating (landing validates via `/api/invites/validate`; signup redeems; donor UI at `/donor/invites`)
- **Done (Real)**: Forgot password + reset password (Mailgun-backed; templates in DB)
- **Pending**: Email verification (not required for MVP demo)

## Admin tooling

- **Done (Real)**: Happy Path demo seeding (`/admin/happy-path` → `POST /api/admin/demo-seed?theme=jewish`)
- **Done (Real)**: Admin invites (`/admin/invites`) with **Email Invite** (Mailgun) or Copy Link
- **Done (Real)**: Users tables + “Invited by” indicator (read-only)
- **Done (Real)**: Organizations page + Org KYC “verified by concierge” toggle (`/api/admin/org-kyc`)
- **Done (Real)**: Email templates editor (`/admin/email-templates`)

## Donor experience

- **Done (Real)**: Opportunities feed backed by DB/API (`/donor` → `/api/opportunities`)
  - Sources: submissions + curated requests + curated Charidy list (manual list in code)
- **Done (Real)**: Opportunity detail, actions, and History are persisted (`/api/opportunities/[key]` + `/api/opportunities/[key]/actions`)
- **Done (Real)**: Deterministic “LLM stub” extraction for submissions (cause/geo/amount/urgency stored on submission rows)
- **Done (Real)**: “Request more info” → creates a public `/more-info/<token>` form and persists details back onto the submission
- **Done (Real)**: Leverage offer creation persists to DB (`POST /api/leverage-offers`) and writes a History event
- **Done (Real)**: Concierge conversation + Impact Vision board persisted (board is derived from `/api/concierge`)
- **Done (Real)**: Impact Vision Board share actions (copy summary / share link / print/PDF)
- **Done (Real)**: Donor-to-donor matching insights toggle (opt-in, anonymized)
- **Done (Demo/UI)**: Inbox + Vault “ripple” items from leverage drafting (currently client-context only; useful for demo visuals)
- **Pending**: Real pledge/payment workflow

## Requestor (nonprofit) experience

- **Done (Real)**: Requestor portal shell (collapse + top bar + sign-out)
- **Done (Real)**: Create request wizard (`/requestor` → `POST /api/requests`)
- **Done (Real)**: View my requests list (`/requestor/requests` → `GET /api/requests`)
- **Done (Real)**: Evidence/docs upload endpoint (`POST /api/uploads`) storing files under `public/uploads/tmp/` (MVP-local)
- **Pending**: Edit request / draft saving
- **Pending**: Attach uploads to a specific request record in DB (Phase 2)

## “Requester” portal (“grant seekers”) — separate, not part of MVP demo

- **Done (Demo/UI)**: Requester dashboard + multi-step wizard UI (`/requester/projects/new`)
- **Pending**: Connect requester wizard to real API/DB
- **Pending**: Decide relationship between “requester portal” vs “requestor portal” (distinct in code today)

## Platform/ops

- **Done (Real)**: DB schema ensure (`npm run db:ensure`) + stable local DB path
- **Pending**: Observability (metrics, structured logs)

