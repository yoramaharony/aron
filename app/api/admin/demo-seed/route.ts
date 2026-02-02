import { NextResponse } from 'next/server';
import { db } from '@/db';
import { requests, submissionEntries, submissionLinks, users } from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateSubmissionToken } from '@/lib/submission-links';
import { extractSubmissionSignals } from '@/lib/extract-submission';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  // Create or reuse demo donor + requestor users (stable emails)
  const donorEmail = 'demo-donor@aron.local';
  const orgEmail = 'demo-org@aron.local';

  const donor = await db.select().from(users).where(eq(users.email, donorEmail)).get();
  const org = await db.select().from(users).where(eq(users.email, orgEmail)).get();

  const donorId = donor?.id ?? uuidv4();
  const orgId = org?.id ?? uuidv4();
  const donorPassword = 'AronDemo1!';
  const orgPassword = 'AronDemo1!';

  if (!donor) {
    await db.insert(users).values({
      id: donorId,
      name: 'Demo Donor',
      email: donorEmail,
      password: await hashPassword(donorPassword),
      role: 'donor',
    });
  }

  if (!org) {
    await db.insert(users).values({
      id: orgId,
      name: 'Demo Organization',
      email: orgEmail,
      password: await hashPassword(orgPassword),
      role: 'requestor',
    });
  }

  // Create a demo submission link for the donor (one per run, keep latest)
  const token = generateSubmissionToken();
  const linkId = uuidv4();
  await db.insert(submissionLinks).values({
    id: linkId,
    token,
    donorId,
    createdBy: donorId,
    orgName: 'Demo Organization',
    orgEmail,
    note: 'Happy path demo link',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxSubmissions: 50,
    submissionsCount: 0,
    visitsCount: 0,
  });

  // Create a demo submission entry (so donor sees a real inbound request)
  const demoVideoUrl =
    'https://us06web.zoom.us/rec/component-page?eagerLoadZvaPages=sidemenu.billing.plan_management&accessLevel=meeting&action=viewdetailpage&sharelevel=meeting&useWhichPasswd=meeting&requestFrom=pwdCheck&clusterId=us06&componentName=need-password&meetingId=QRH1BktKpBgg_-v7eX2drb4YTzcMXQxSqfPFwG9H0mXBfaclalI6K566Khun711V.1kwuhLrFEMJhpZWl&originRequestUrl=https%3A%2F%2Fus06web.zoom.us%2Frec%2Fshare%2FUdhC9IEPLBhGMOJmya1goqGu7-UgsUuVwy2BFDBBQWzFDRqKwQ92byW4j_9R2LgL.2M8jQlvIh5L_XavM%3FstartTime%3D1768907539000%2520Passcode%3A%2520R*%26z6gdU';

  // Best-effort update: if a prior demo submission exists, update its video url.
  const existingDemoSubmission = await db
    .select()
    .from(submissionEntries)
    .where(eq(submissionEntries.donorId, donorId))
    .limit(50);
  const existingMatch = existingDemoSubmission.find(
    (s) => s.title === 'Bridge funding for emergency kits' && (s.orgEmail ?? '') === orgEmail
  );
  if (existingMatch) {
    await db.update(submissionEntries).set({ videoUrl: demoVideoUrl }).where(eq(submissionEntries.id, existingMatch.id));
  }

  const entryId = uuidv4();
  const moreInfoToken = uuidv4();
  const extracted = extractSubmissionSignals({
    title: 'Bridge funding for emergency kits',
    summary: 'We need bridge funding for 5,000 emergency kits. We can start distribution within 14 days. Short video available.',
    orgName: 'Demo Organization',
    orgEmail,
    videoUrl: demoVideoUrl,
    amountRequested: 150000,
  });
  await db.insert(submissionEntries).values({
    id: entryId,
    linkId,
    donorId,
    contactName: 'Demo Contact',
    contactEmail: orgEmail,
    orgName: 'Demo Organization',
    orgEmail,
    title: 'Bridge funding for emergency kits',
    summary: 'We need bridge funding for 5,000 emergency kits. We can start distribution within 14 days. Short video available.',
    amountRequested: 150000,
    videoUrl: demoVideoUrl,
    extractedJson: JSON.stringify(extracted),
    extractedCause: extracted.cause ?? null,
    extractedGeo: extracted.geo?.length ? extracted.geo.join(', ') : null,
    extractedUrgency: extracted.urgency ?? null,
    extractedAmount: typeof extracted.amount === 'number' ? extracted.amount : null,
    moreInfoToken,
    moreInfoRequestedAt: new Date(),
    requestorUserId: orgId,
  });

  // Create one curated request (optional)
  const reqId = 'req_demo';
  const existingReq = await db.select().from(requests).where(eq(requests.id, reqId)).get();
  if (!existingReq) {
    await db.insert(requests).values({
      id: reqId,
      title: 'Curated: Pediatric oncology expansion',
      category: 'Healthcare',
      location: 'New York, NY',
      summary: 'Curated opportunity for demo purposes (DB-backed).',
      targetAmount: 500000,
      currentAmount: 200000,
      status: 'active',
      createdBy: session.userId,
    });
  }

  return NextResponse.json({
    success: true,
    donor: { email: donorEmail, password: donorPassword },
    organization: { email: orgEmail, password: orgPassword },
    submitUrl: `/submit/${token}`,
    donorDashboard: `/donor`,
    concierge: `/donor/legacy`,
    visionBoard: `/donor/impact`,
    moreInfoUrl: `/more-info/${moreInfoToken}`,
  });
}

