import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inviteCodes } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { generateInviteCode, normalizeInviteCode } from '@/lib/invites';
import { desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const rows = await db
    .select()
    .from(inviteCodes)
    .orderBy(desc(inviteCodes.createdAt))
    .limit(50);

  return NextResponse.json({
    invites: rows.map((r) => ({
      code: r.code,
      intendedRole: r.intendedRole,
      uses: r.uses,
      maxUses: r.maxUses,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
      usedAt: r.usedAt,
      usedBy: r.usedBy,
      revokedAt: r.revokedAt,
      createdBy: r.createdBy,
      note: r.note,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const body = await request.json().catch(() => ({}));
  const intendedRole = body?.intendedRole ?? 'requestor';
  const expiresInDays = typeof body?.expiresInDays === 'number' ? body.expiresInDays : 14;
  const note = typeof body?.note === 'string' ? body.note : null;
  const maxUses = typeof body?.maxUses === 'number' ? body.maxUses : 1;

  if (intendedRole !== 'requestor' && intendedRole !== 'donor') {
    return NextResponse.json({ error: 'Invalid intendedRole' }, { status: 400 });
  }
  if (!Number.isFinite(expiresInDays) || expiresInDays < 0 || expiresInDays > 3650) {
    return NextResponse.json({ error: 'Invalid expiresInDays' }, { status: 400 });
  }
  if (!Number.isFinite(maxUses) || maxUses < 1 || maxUses > 1000) {
    return NextResponse.json({ error: 'Invalid maxUses' }, { status: 400 });
  }

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = normalizeInviteCode(generateInviteCode());
    try {
      await db.insert(inviteCodes).values({
        id: uuidv4(),
        code,
        intendedRole,
        createdBy: session.userId,
        note,
        expiresAt,
        maxUses,
        uses: 0,
      });

      return NextResponse.json({
        code,
        intendedRole,
        expiresAt,
        maxUses,
      });
    } catch (e: any) {
      if (String(e?.message ?? '').toLowerCase().includes('unique')) continue;
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
}

