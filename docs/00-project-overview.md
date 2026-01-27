# Aron Platform — Project Overview (Code-Derived)

This repo is a **Next.js App Router** app with a small server/API layer (Next route handlers) backed by **SQLite/libSQL** via **Drizzle ORM**.

## Product surfaces (routes)

- **Landing / marketing**: `/`
  - Invite code input is currently **UI-only** (no validation / gating logic).
  - “Member Login” routes to `/auth/login`.
  - “Grant Seekers” CTA routes to `/requester`.

- **Auth**: `/auth/login`, `/auth/signup`
  - Cookie-based session (JWT) is created on login/signup.

- **Donor app** (protected by middleware): `/donor/*`
  - Uses **mock opportunity data** (`lib/mock-data.ts`) and **client-only state** for leverage/offers/inbox/vault.

- **Requestor app** (protected by middleware): `/requestor/*`
  - Request wizard at `/requestor` submits to `/api/requests` and writes to DB.
  - Requests list at `/requestor/requests` reads from `/api/requests` and shows DB rows.
  - Campaigns page is placeholder UI.

- **Requester portal** (unprotected): `/requester/*`
  - Contains a richer multi-step “project submission” wizard UI.
  - Currently **no real persistence** (save is simulated client-side).

## Backend/API (Next route handlers)

- `POST /api/auth/signup`: creates user (bcrypt password), sets session cookie
- `POST /api/auth/login`: validates password, sets session cookie
- `POST /api/auth/logout`: clears session cookie
- `GET /api/requests`: requestor gets own requests; donor gets all (MVP logic)
- `POST /api/requests`: requestor-only; creates request row (status defaults to `pending`)
- `GET /api/campaigns`: authenticated-only; returns all campaigns

## Data model (Drizzle schema)

- `users`: id, name, email (unique), password hash, role (`donor` | `requestor`), createdAt
- `requests`: title, category, location, summary, targetAmount, currentAmount, status (`draft`/`pending`/`active`), createdBy
- `campaigns`: name, goal, status, createdBy

## Session & access control

- A `session` cookie stores a JWT `{ userId, role }`.
- Middleware protects:
  - `/donor/*` (requires role `donor`)
  - `/requestor/*` (requires role `requestor`)

