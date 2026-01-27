# Local Dev Runbook

## Requirements

- Node.js: repo declares `22.x` in `package.json`

## Install & run

```bash
npm ci
npm run dev
```

App runs at `http://localhost:3000`.

## Environment variables (minimum)

The DB layer expects a libSQL connection URL.

- `TURSO_DATABASE_URL`
  - **Hosted Turso** example: `libsql://<db>-<org>.turso.io`
  - **Local file** example: `file:./yesod.db`
- `TURSO_AUTH_TOKEN`
  - Required for hosted Turso; not needed for local `file:` URLs
- `JWT_SECRET`
  - Used to sign the session cookie JWT (set a dev value for local)

## Current repo behavior

This repo includes `yesod.db` in the root.
If you do not have Turso credentials yet, you can use a local DB file URL.

## “Access checklist” for takeover

If you’re leading and the prior lead is busy, ask (async) for:

- Turso project access OR a dev DB URL + token
- Hosting access (Vercel/Cloudflare/etc) and environment variables used in staging/prod
- Any design files / brand assets source
- Any roadmap/MVP notes (even a bullet list) and the intended user flows

