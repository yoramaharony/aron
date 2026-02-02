import { NextResponse } from 'next/server';
import { db } from '@/db';
import { orgKyc } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function normEmail(v: string) {
  return v.trim().toLowerCase();
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const url = new URL(request.url);
  const emailsParam = (url.searchParams.get('emails') || '').trim();
  const emails = emailsParam
    ? emailsParam
        .split(',')
        .map((e) => normEmail(e))
        .filter(Boolean)
        .slice(0, 200)
    : [];

  if (emails.length === 0) {
    return NextResponse.json({ byEmail: {} });
  }

  const rows = await db.select().from(orgKyc).where(inArray(orgKyc.orgEmail, emails)).limit(500);
  const byEmail: Record<string, { verified: boolean; verifiedAt?: any; note?: string | null }> = {};
  for (const r of rows) {
    byEmail[String(r.orgEmail)] = { verified: Boolean(r.verifiedAt), verifiedAt: r.verifiedAt, note: r.note ?? null };
  }

  return NextResponse.json({ byEmail });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const body = await request.json().catch(() => ({}));
  const orgEmail = typeof body?.orgEmail === 'string' ? normEmail(body.orgEmail) : '';
  const orgName = typeof body?.orgName === 'string' ? body.orgName.trim() : null;
  const verified = Boolean(body?.verified);
  const note = typeof body?.note === 'string' ? body.note.trim() : null;

  if (!orgEmail) return NextResponse.json({ error: 'Missing orgEmail' }, { status: 400 });

  const existing = await db.select().from(orgKyc).where(eq(orgKyc.orgEmail, orgEmail)).get();
  const now = new Date();

  if (!existing) {
    await db.insert(orgKyc).values({
      id: uuidv4(),
      orgEmail,
      orgName,
      verifiedAt: verified ? now : null,
      verifiedBy: verified ? session.userId : null,
      note,
      updatedAt: now,
    });
  } else {
    await db
      .update(orgKyc)
      .set({
        orgName: orgName ?? existing.orgName,
        verifiedAt: verified ? now : null,
        verifiedBy: verified ? session.userId : null,
        note: note ?? existing.note,
        updatedAt: now,
      })
      .where(eq(orgKyc.orgEmail, orgEmail));
  }

  return NextResponse.json({ success: true });
}

