# MVP “Done vs Pending” (based on current code)

Legend:
- **Done (Real)**: implemented end-to-end with DB/API
- **Done (Mock/UI)**: present in UI but uses mock data or client-only state
- **Pending**: not implemented or only placeholder

## Authentication & roles

- **Done (Real)**: Signup/Login/Logout APIs (`/api/auth/*`)
- **Done (Real)**: Session cookie (JWT) + role-based route protection for `/donor/*` and `/requestor/*`
- **Pending**: Password reset / email verification
- **Done (Real)**: Invite code gating (landing validates via `/api/invites/validate`; signup redeems; donor UI at `/donor/invites`)

## Requestor (nonprofit) experience

- **Done (Real)**: Create funding request (wizard at `/requestor` → `POST /api/requests`)
- **Done (Real)**: View my requests list (`/requestor/requests` → `GET /api/requests`)
- **Pending**: Edit request / draft saving / attachments
- **Pending**: “Manage” button actions (currently no behavior)
- **Pending**: Request review workflow (concierge/admin), status transitions beyond `pending`

## Donor experience

- **Done (Mock/UI)**: Donor feed UI, detail pages, shortlist/passed interactions
- **Done (Mock/UI)**: “Leverage” drawer + offer drafting (client context)
- **Done (Mock/UI)**: Inbox + Vault docs generated as “ripple effect” (client context only)
- **Done (Mock/UI)**: Legacy plan “AI” generator (client context only)
- **Pending**: Donor feed backed by real requests from DB (and filtering)
- **Pending**: Persist leverage offers, inbox messages, vault docs, legacy plan to DB
- **Pending**: Any real pledge/payment workflow

## Campaigns

- **Done (Real-ish)**: Campaigns table exists + `GET /api/campaigns` returns rows
- **Pending**: Create/update campaigns; donor/requestor campaign views; analytics

## Requester portal (“grant seekers”)

- **Done (Mock/UI)**: Requester dashboard + multi-step project wizard UI (`/requester/projects/new`)
- **Pending**: Connect requester wizard to real API/DB (save draft + submit)
- **Pending**: Decide relationship between “requester portal” vs “requestor portal” (they are distinct in code today)

## Platform/ops

- **Pending**: Admin panel / concierge tooling
- **Pending**: Audit log, permissions beyond 2 roles
- **Pending**: Observability (logging/metrics), production config docs

