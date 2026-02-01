import { NextResponse } from 'next/server';
import { db } from '@/db';
import { submissionLinks } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { generateSubmissionToken } from '@/lib/submission-links';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  const rows = await db
    .select()
    .from(submissionLinks)
    .where(eq(submissionLinks.donorId, session.userId))
    .orderBy(desc(submissionLinks.createdAt))
    .limit(50);

  return NextResponse.json({
    links: rows.map((r) => ({
      id: r.id,
      token: r.token,
      orgName: r.orgName,
      orgEmail: r.orgEmail,
      note: r.note,
      expiresAt: r.expiresAt,
      revokedAt: r.revokedAt,
      maxSubmissions: r.maxSubmissions,
      submissionsCount: r.submissionsCount,
      visitsCount: r.visitsCount,
      lastVisitedAt: r.lastVisitedAt,
      lastSubmittedAt: r.lastSubmittedAt,
      createdAt: r.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return forbidden();

  const body = await request.json().catch(() => ({}));
  const orgName = typeof body?.orgName === 'string' ? body.orgName.trim() : '';
  const orgEmail = typeof body?.orgEmail === 'string' ? body.orgEmail.trim() : '';
  const note = typeof body?.note === 'string' ? body.note.trim() : null;
  const expiresInDays = typeof body?.expiresInDays === 'number' ? body.expiresInDays : 30;
  const maxSubmissions = typeof body?.maxSubmissions === 'number' ? body.maxSubmissions : 50;

  if (!orgName) {
    return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
  }

  if (!Number.isFinite(expiresInDays) || expiresInDays < 0 || expiresInDays > 3650) {
    return NextResponse.json({ error: 'Invalid expiresInDays' }, { status: 400 });
  }
  if (!Number.isFinite(maxSubmissions) || maxSubmissions < 1 || maxSubmissions > 1000) {
    return NextResponse.json({ error: 'Invalid maxSubmissions' }, { status: 400 });
  }

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  // Retry a few times to avoid rare unique token collisions
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateSubmissionToken();
    try {
      const id = uuidv4();
      await db.insert(submissionLinks).values({
        id,
        token,
        donorId: session.userId,
        createdBy: session.userId,
        orgName,
        orgEmail: orgEmail || null,
        note,
        expiresAt,
        maxSubmissions,
        submissionsCount: 0,
        visitsCount: 0,
      });

      return NextResponse.json({
        id,
        token,
        orgName,
        orgEmail: orgEmail || null,
        expiresAt,
        maxSubmissions,
      });
    } catch (e: any) {
      // Unique constraint collision; retry.
      if (String(e?.message ?? '').toLowerCase().includes('unique')) continue;
      return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Failed to generate unique token' }, { status: 500 });
}

