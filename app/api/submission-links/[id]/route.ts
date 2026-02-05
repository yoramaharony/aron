import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submissionLinks } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  const { id } = await context.params;
  const row = await db
    .select()
    .from(submissionLinks)
    .where(and(eq(submissionLinks.id, id), eq(submissionLinks.donorId, session.userId)))
    .get();

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === 'string' ? body.action : '';

  if (action === 'revoke') {
    await db
      .update(submissionLinks)
      .set({ revokedAt: new Date() })
      .where(eq(submissionLinks.id, id));
    return NextResponse.json({ success: true });
  }

  if (action === 'set_expiry') {
    const expiresInDays = typeof body?.expiresInDays === 'number' ? body.expiresInDays : null;
    if (expiresInDays === null || !Number.isFinite(expiresInDays) || expiresInDays < 0 || expiresInDays > 3650) {
      return NextResponse.json({ error: 'Invalid expiresInDays' }, { status: 400 });
    }
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    await db
      .update(submissionLinks)
      .set({ expiresAt })
      .where(eq(submissionLinks.id, id));
    return NextResponse.json({ success: true, expiresAt });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

