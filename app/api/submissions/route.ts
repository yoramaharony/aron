import { NextResponse } from 'next/server';
import { db } from '@/db';
import { submissionEntries, submissionLinks } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body?.token === 'string' ? body.token : '';

  const summary = typeof body?.summary === 'string' ? body.summary.trim() : '';
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const videoUrl = typeof body?.videoUrl === 'string' ? body.videoUrl.trim() : '';
  const contactName = typeof body?.contactName === 'string' ? body.contactName.trim() : '';
  const contactEmail = typeof body?.contactEmail === 'string' ? body.contactEmail.trim() : '';
  const orgName = typeof body?.orgName === 'string' ? body.orgName.trim() : '';
  const orgEmail = typeof body?.orgEmail === 'string' ? body.orgEmail.trim() : '';
  const amountRequestedRaw = body?.amountRequested;
  const amountRequested =
    typeof amountRequestedRaw === 'number' && Number.isFinite(amountRequestedRaw) ? Math.round(amountRequestedRaw) : null;

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  if (!summary) return NextResponse.json({ error: 'Summary is required' }, { status: 400 });

  const link = await db.select().from(submissionLinks).where(eq(submissionLinks.token, token)).get();
  if (!link) return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
  if (link.revokedAt) return NextResponse.json({ error: 'Link revoked' }, { status: 410 });
  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Link expired' }, { status: 410 });
  }
  if ((link.submissionsCount ?? 0) >= (link.maxSubmissions ?? 50)) {
    return NextResponse.json({ error: 'Submission limit reached' }, { status: 409 });
  }

  const session = await getSession(); // optional
  const requestorUserId = session?.role === 'requestor' ? session.userId : null;

  // Capture basic request metadata
  const ua = request.headers.get('user-agent') || null;
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null;

  const submissionId = uuidv4();

  // Best-effort "atomic" update in sqlite/libsql
  await db.batch([
    db.insert(submissionEntries).values({
      id: submissionId,
      linkId: link.id,
      donorId: link.donorId,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      orgName: orgName || link.orgName || null,
      orgEmail: orgEmail || link.orgEmail || null,
      title: title || null,
      summary,
      amountRequested,
      videoUrl: videoUrl || null,
      requestorUserId,
      status: 'new',
      userAgent: ua,
      ip,
    }),
    db
      .update(submissionLinks)
      .set({
        submissionsCount: (link.submissionsCount ?? 0) + 1,
        lastSubmittedAt: new Date(),
      })
      .where(eq(submissionLinks.id, link.id)),
  ]);

  return NextResponse.json({ success: true, id: submissionId });
}

// Donor-only: list submissions for this donor (for UI/visibility)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rows = await db
    .select()
    .from(submissionEntries)
    .where(eq(submissionEntries.donorId, session.userId))
    .limit(100);

  return NextResponse.json({ submissions: rows });
}

