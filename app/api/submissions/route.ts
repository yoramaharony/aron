import { NextResponse } from 'next/server';
import { db } from '@/db';
import { donorOpportunityEvents, donorOpportunityState, donorProfiles, submissionEntries, submissionLinks } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { extractSubmissionSignals } from '@/lib/extract-submission';
import { matchOpportunity, determineInfoTier } from '@/lib/concierge-match';
import type { ImpactVision } from '@/lib/vision-extract';

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
  const extracted = extractSubmissionSignals({
    title: title || null,
    summary,
    orgName: orgName || link.orgName || null,
    orgEmail: orgEmail || link.orgEmail || null,
    videoUrl: videoUrl || null,
    amountRequested,
  });

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
      extractedJson: JSON.stringify(extracted),
      extractedCause: extracted.cause ?? null,
      extractedGeo: extracted.geo?.length ? extracted.geo.join(', ') : null,
      extractedUrgency: extracted.urgency ?? null,
      extractedAmount: typeof extracted.amount === 'number' ? extracted.amount : null,
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

  // ── Auto-trigger concierge review if donor has an Impact Vision ──
  let conciergeAction: string | null = null;
  try {
    const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, link.donorId)).get();
    const vision: ImpactVision | null = profile?.visionJson ? JSON.parse(profile.visionJson) : null;

    if (vision && !(vision.pillars.length === 1 && vision.pillars[0] === 'Impact Discovery')) {
      const oppKey = `sub_${submissionId}`;
      const result = matchOpportunity(
        {
          key: oppKey,
          category: extracted.cause ?? null,
          location: extracted.geo?.join(', ') ?? null,
          title: title || null,
          summary,
          amount: amountRequested,
        },
        vision,
      );

      const now = new Date();

      if (!result.matched) {
        // Auto-pass: doesn't match donor's vision
        await db.insert(donorOpportunityState).values({
          id: uuidv4(), donorId: link.donorId, opportunityKey: oppKey, state: 'passed', updatedAt: now,
        }).onConflictDoUpdate({
          target: [donorOpportunityState.donorId, donorOpportunityState.opportunityKey],
          set: { state: 'passed', updatedAt: now },
        });
        await db.insert(donorOpportunityEvents).values({
          id: uuidv4(), donorId: link.donorId, opportunityKey: oppKey,
          type: 'pass', metaJson: JSON.stringify({ source: 'concierge', reason: result.reason }), createdAt: now,
        });
        conciergeAction = 'pass';
      } else if (result.infoTier !== 'none') {
        // Matches + needs more info → mint token and request info
        await db.update(submissionEntries)
          .set({ moreInfoToken: uuidv4(), moreInfoRequestedAt: now, status: 'more_info_requested' })
          .where(eq(submissionEntries.id, submissionId));
        await db.insert(donorOpportunityEvents).values({
          id: uuidv4(), donorId: link.donorId, opportunityKey: oppKey,
          type: 'request_info', metaJson: JSON.stringify({ source: 'concierge', infoTier: result.infoTier, reason: result.reason }), createdAt: now,
        });
        conciergeAction = 'request_info';
      } else {
        // Matches, no extra info needed — annotate
        await db.insert(donorOpportunityEvents).values({
          id: uuidv4(), donorId: link.donorId, opportunityKey: oppKey,
          type: 'concierge_review', metaJson: JSON.stringify({ source: 'concierge', matched: true, reason: result.reason }), createdAt: now,
        });
        conciergeAction = 'keep';
      }
    }
  } catch (err) {
    // Non-fatal: submission succeeded even if concierge fails
    console.error('Concierge auto-review failed for submission', submissionId, err);
  }

  return NextResponse.json({ success: true, id: submissionId, conciergeAction });
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

