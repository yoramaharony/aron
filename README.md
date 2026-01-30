Aron (Major Donor App) — Next.js App Router project.

## Getting Started

### Run dev server

First, run the development server (any port is fine):

```bash
npm run dev -- --port 3000
# or
npm run dev -- --port 3001
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open `http://localhost:3000` (or your chosen port) with your browser.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Environment variables (local)

This repo ignores `.env*` by default. Put secrets in **`yesod-platform/.env`** (or `.env.local`) and restart the dev server.

Minimum recommended variables:

```bash
JWT_SECRET=...          # required (session cookie signing)
ADMIN_SEED_SECRET=...   # required only if you want to seed the first admin via API
# TURSO_DATABASE_URL=file:./yesod.db   # optional (defaults to local file DB)
# TURSO_AUTH_TOKEN=...                # only if using a Turso libsql URL
```

### Seed the first admin (Concierge Console)

Admin users cannot be created via public signup. In local dev, you seed the first admin once using a guarded endpoint.

1) Set `ADMIN_SEED_SECRET` in `yesod-platform/.env` and restart dev.

2) Run the seed request (adjust port if needed):

```bash
curl -s -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{
    "secret":"YOUR_ADMIN_SEED_SECRET_FROM_.env",
    "name":"Aron Admin",
    "email":"admin@aron.local",
    "password":"change-me-now"
  }'
```

3) Login:
- `http://localhost:3000/admin/login` → login with the email/password you seeded
- Admin landing: `http://localhost:3000/admin/invites` (generate donor/requestor invite codes)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
