import { NextResponse } from 'next/server';
import { db } from '@/db';
import { requests, submissionEntries, submissionLinks, users } from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateSubmissionToken } from '@/lib/submission-links';

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
  const entryId = uuidv4();
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
    videoUrl: 'https://example.com/demo-video',
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
  });
}

