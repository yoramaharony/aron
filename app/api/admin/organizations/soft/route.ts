import { NextResponse } from 'next/server';
import { db } from '@/db';
import { submissionEntries, submissionLinks, users } from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function normEmail(v: string) {
  return v.trim().toLowerCase();
}

function normName(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  try {
    // Fetch recent submissions and links and aggregate into "soft orgs"
    const entries = await db.select().from(submissionEntries).limit(500);
    const links = await db.select().from(submissionLinks).limit(500);

    type Agg = {
      key: string;
      orgName: string;
      orgEmail: string | null;
      submissionsCount: number;
      linksCount: number;
      lastSubmittedAt: string | null;
      donorsTouched: Set<string>;
    };

    const byKey = new Map<string, Agg>();

    const upsert = (orgNameRaw: string | null, orgEmailRaw: string | null) => {
      const orgEmail = orgEmailRaw ? normEmail(orgEmailRaw) : null;
      const orgName = (orgNameRaw || '').trim();
      const key = orgEmail ? `email:${orgEmail}` : `name:${normName(orgName || 'unknown')}`;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          orgName: orgName || (orgEmail ? orgEmail : 'Unknown'),
          orgEmail,
          submissionsCount: 0,
          linksCount: 0,
          lastSubmittedAt: null,
          donorsTouched: new Set(),
        });
      }
      const agg = byKey.get(key)!;
      if (!agg.orgName && orgName) agg.orgName = orgName;
      return agg;
    };

    for (const e of entries) {
      const agg = upsert(e.orgName, e.orgEmail);
      agg.submissionsCount += 1;
      if (e.createdAt) {
        const ts = new Date(e.createdAt).toISOString();
        if (!agg.lastSubmittedAt || ts > agg.lastSubmittedAt) agg.lastSubmittedAt = ts;
      }
      if (e.donorId) agg.donorsTouched.add(String(e.donorId));
    }

    for (const l of links) {
      const agg = upsert(l.orgName, l.orgEmail);
      agg.linksCount += 1;
      if (l.donorId) agg.donorsTouched.add(String(l.donorId));
    }

    const rows = Array.from(byKey.values())
      .map((a) => ({
        key: a.key,
        orgName: a.orgName,
        orgEmail: a.orgEmail,
        submissionsCount: a.submissionsCount,
        linksCount: a.linksCount,
        donorsCount: a.donorsTouched.size,
        lastSubmittedAt: a.lastSubmittedAt,
      }))
      .sort((a, b) => (b.submissionsCount - a.submissionsCount) || (b.linksCount - a.linksCount));

    return NextResponse.json({ orgs: rows });
  } catch (e: any) {
    const msg = String(e?.message ?? e ?? '');
    const isSchema =
      msg.toLowerCase().includes('no such column') || msg.toLowerCase().includes('no such table');
    const hint = isSchema
      ? 'DB schema is out of date (or you are pointing at the wrong DB). Run `npm run db:ensure` from yesod-platform/, then restart `npm run dev`. Also verify `TURSO_DATABASE_URL` (unset = uses local file:./yesod.db).'
      : null;
    return NextResponse.json({ error: 'Failed to load soft orgs', detail: msg, hint }, { status: 500 });
  }
}

// Convert soft org to a requestor account (admin sets password)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const id = uuidv4();

  try {
    await db.insert(users).values({
      id,
      name,
      email,
      password: hashed,
      role: 'requestor',
    });
  } catch (e: any) {
    const msg = String(e?.message ?? '').toLowerCase();
    if (msg.includes('unique')) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: { id, name, email, role: 'requestor' } });
}

