import { NextResponse } from 'next/server';
import { db } from '@/db';
import { submissionLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Public validation endpoint used by /submit/<token>
export async function GET(_request: Request, { params }: { params: { token: string } }) {
  const token = params.token;
  const link = await db.select().from(submissionLinks).where(eq(submissionLinks.token, token)).get();

  if (!link) {
    return NextResponse.json({ valid: false, reason: 'NOT_FOUND' }, { status: 404 });
  }
  if (link.revokedAt) {
    return NextResponse.json({ valid: false, reason: 'REVOKED' }, { status: 410 });
  }
  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ valid: false, reason: 'EXPIRED' }, { status: 410 });
  }
  if ((link.submissionsCount ?? 0) >= (link.maxSubmissions ?? 50)) {
    return NextResponse.json({ valid: false, reason: 'MAXED' }, { status: 409 });
  }

  // Track "link opened" (best-effort)
  try {
    await db
      .update(submissionLinks)
      .set({
        visitsCount: (link.visitsCount ?? 0) + 1,
        lastVisitedAt: new Date(),
      })
      .where(eq(submissionLinks.id, link.id));
  } catch {
    // ignore
  }

  return NextResponse.json({
    valid: true,
    orgName: link.orgName,
    orgEmail: link.orgEmail,
    note: link.note,
    donorId: link.donorId, // not sensitive in MVP (no donor contact info exposed)
  });
}

