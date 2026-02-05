import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  conciergeMessages,
  donorOpportunityEvents,
  donorOpportunityState,
  donorProfiles,
  leverageOffers,
  requests,
  submissionEntries,
  submissionLinks,
  users,
} from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateSubmissionToken } from '@/lib/submission-links';
import { extractSubmissionSignals } from '@/lib/extract-submission';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

type SeedTheme = 'general' | 'jewish';

function getTheme(req: Request): SeedTheme {
  const { searchParams } = new URL(req.url);
  const t = (searchParams.get('theme') || 'general').toLowerCase();
  return t === 'jewish' ? 'jewish' : 'general';
}

function getReset(req: Request): boolean {
  const { searchParams } = new URL(req.url);
  const v = (searchParams.get('reset') || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function seedPreset(theme: SeedTheme) {
  if (theme === 'jewish') {
    return {
      donorName: 'Demo Donor (Jewish Causes)',
      orgName: 'Bikur Cholim & Chesed Fund',
      orgEmail: 'demo-org@aron.local',
      // Keep the same Zoom URL used previously (demo expects it), but content is now themed.
      demoVideoUrl:
        'https://us06web.zoom.us/rec/component-page?eagerLoadZvaPages=sidemenu.billing.plan_management&accessLevel=meeting&action=viewdetailpage&sharelevel=meeting&useWhichPasswd=meeting&requestFrom=pwdCheck&clusterId=us06&componentName=need-password&meetingId=QRH1BktKpBgg_-v7eX2drb4YTzcMXQxSqfPFwG9H0mXBfaclalI6K566Khun711V.1kwuhLrFEMJhpZWl&originRequestUrl=https%3A%2F%2Fus06web.zoom.us%2Frec%2Fshare%2FUdhC9IEPLBhGMOJmya1goqGu7-UgsUuVwy2BFDBBQWzFDRqKwQ92byW4j_9R2LgL.2M8jQlvIh5L_XavM%3FstartTime%3D1768907539000%2520Passcode%3A%2520R*%26z6gdU',
      submission: {
        title: 'Bikur Cholim: rides + meals for families (Refuah)',
        summary:
          'We support families during refuah with bikur cholim visits, hospital rides, and Shabbos meals. Need bridge funding for 600 rides + 300 meal packages within 14 days. Serving Brooklyn (Boro Park) and Lakewood.',
        amountRequested: 180000,
        geoHint: 'Brooklyn / Lakewood',
      },
      curatedRequest: {
        id: 'req_demo',
        title: 'Curated: Hachnasas Kallah matching campaign',
        category: 'Hachnasas Kallah (Chesed)',
        location: 'Jerusalem, Israel',
        summary:
          'Curated opportunity for demo purposes: discreet matching for hachnasas kallah with concierge-reviewed verification.',
        targetAmount: 750000,
        currentAmount: 280000,
      },
    };
  }

  return {
    donorName: 'Demo Donor',
    orgName: 'Demo Organization',
    orgEmail: 'demo-org@aron.local',
    demoVideoUrl:
      'https://us06web.zoom.us/rec/component-page?eagerLoadZvaPages=sidemenu.billing.plan_management&accessLevel=meeting&action=viewdetailpage&sharelevel=meeting&useWhichPasswd=meeting&requestFrom=pwdCheck&clusterId=us06&componentName=need-password&meetingId=QRH1BktKpBgg_-v7eX2drb4YTzcMXQxSqfPFwG9H0mXBfaclalI6K566Khun711V.1kwuhLrFEMJhpZWl&originRequestUrl=https%3A%2F%2Fus06web.zoom.us%2Frec%2Fshare%2FUdhC9IEPLBhGMOJmya1goqGu7-UgsUuVwy2BFDBBQWzFDRqKwQ92byW4j_9R2LgL.2M8jQlvIh5L_XavM%3FstartTime%3D1768907539000%2520Passcode%3A%2520R*%26z6gdU',
    submission: {
      title: 'Bridge funding for emergency kits',
      summary: 'We need bridge funding for 5,000 emergency kits. We can start distribution within 14 days. Short video available.',
      amountRequested: 150000,
      geoHint: 'New York, NY',
    },
    curatedRequest: {
      id: 'req_demo',
      title: 'Curated: Pediatric oncology expansion',
      category: 'Healthcare',
      location: 'New York, NY',
      summary: 'Curated opportunity for demo purposes (DB-backed).',
      targetAmount: 500000,
      currentAmount: 200000,
    },
  };
}

async function resetDemoData(opts: { donorId?: string | null; orgId?: string | null }) {
  const donorId = opts.donorId ?? null;
  const orgId = opts.orgId ?? null;

  // Delete leaf tables first.
  if (donorId) {
    await db.delete(leverageOffers).where(eq(leverageOffers.donorId, donorId));
    await db.delete(donorOpportunityEvents).where(eq(donorOpportunityEvents.donorId, donorId));
    await db.delete(donorOpportunityState).where(eq(donorOpportunityState.donorId, donorId));
    await db.delete(conciergeMessages).where(eq(conciergeMessages.donorId, donorId));
    await db.delete(donorProfiles).where(eq(donorProfiles.donorId, donorId));
    await db.delete(submissionEntries).where(eq(submissionEntries.donorId, donorId));
    await db.delete(submissionLinks).where(eq(submissionLinks.donorId, donorId));
  }

  if (orgId) {
    // In case any submission entry got linked to the authenticated org user.
    await db.delete(submissionEntries).where(eq(submissionEntries.requestorUserId, orgId));
  }

  // Curated request is stable ID, safe to delete.
  await db.delete(requests).where(eq(requests.id, 'req_demo'));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return forbidden();

  const theme = getTheme(req);
  const doReset = getReset(req);
  const preset = seedPreset(theme);

  // Create or reuse demo donor + requestor users (stable emails)
  const donorEmail = 'demo-donor@aron.local';
  const orgEmail = preset.orgEmail;

  const donor = await db.select().from(users).where(eq(users.email, donorEmail)).get();
  const org = await db.select().from(users).where(eq(users.email, orgEmail)).get();

  const donorId = donor?.id ?? uuidv4();
  const orgId = org?.id ?? uuidv4();
  const donorPassword = 'AronDemo1!';
  const orgPassword = 'AronDemo1!';

  if (doReset) {
    await resetDemoData({ donorId: donor?.id ?? null, orgId: org?.id ?? null });
    // If user rows exist, keep them (stable credentials), but make sure names are up to date per theme.
    if (donor) await db.update(users).set({ name: preset.donorName }).where(eq(users.id, donorId));
    if (org) await db.update(users).set({ name: preset.orgName }).where(eq(users.id, orgId));
  } else {
    // Even without full reset, keep the demo tidy by removing prior submission links/entries for this donor.
    if (donor?.id) {
      await db.delete(submissionEntries).where(eq(submissionEntries.donorId, donor.id));
      await db.delete(submissionLinks).where(eq(submissionLinks.donorId, donor.id));
    }
  }

  if (!donor) {
    await db.insert(users).values({
      id: donorId,
      name: preset.donorName,
      email: donorEmail,
      password: await hashPassword(donorPassword),
      role: 'donor',
    });
  }

  if (!org) {
    await db.insert(users).values({
      id: orgId,
      name: preset.orgName,
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
    orgName: preset.orgName,
    orgEmail,
    note: 'Happy path demo link',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxSubmissions: 50,
    submissionsCount: 0,
    visitsCount: 0,
  });

  // Create a demo submission entry (so donor sees a real inbound request)
  const demoVideoUrl = preset.demoVideoUrl;

  const entryId = uuidv4();
  const moreInfoToken = uuidv4();
  const extracted = extractSubmissionSignals({
    title: preset.submission.title,
    summary: preset.submission.summary,
    orgName: preset.orgName,
    orgEmail,
    videoUrl: demoVideoUrl,
    amountRequested: preset.submission.amountRequested,
  });
  await db.insert(submissionEntries).values({
    id: entryId,
    linkId,
    donorId,
    contactName: 'Demo Contact',
    contactEmail: orgEmail,
    orgName: preset.orgName,
    orgEmail,
    title: preset.submission.title,
    summary: preset.submission.summary,
    amountRequested: preset.submission.amountRequested,
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
  const reqId = preset.curatedRequest.id;
  const existingReq = await db.select().from(requests).where(eq(requests.id, reqId)).get();
  if (!existingReq) {
    await db.insert(requests).values({
      id: reqId,
      title: preset.curatedRequest.title,
      category: preset.curatedRequest.category,
      location: preset.curatedRequest.location,
      summary: preset.curatedRequest.summary,
      targetAmount: preset.curatedRequest.targetAmount,
      currentAmount: preset.curatedRequest.currentAmount,
      status: 'active',
      createdBy: session.userId,
    });
  } else {
    // Keep the curated request aligned to the chosen theme.
    await db
      .update(requests)
      .set({
        title: preset.curatedRequest.title,
        category: preset.curatedRequest.category,
        location: preset.curatedRequest.location,
        summary: preset.curatedRequest.summary,
        targetAmount: preset.curatedRequest.targetAmount,
        currentAmount: preset.curatedRequest.currentAmount,
        status: 'active',
      })
      .where(eq(requests.id, reqId));
  }

  return NextResponse.json({
    success: true,
    theme,
    reset: doReset,
    donor: { email: donorEmail, password: donorPassword },
    organization: { email: orgEmail, password: orgPassword },
    submitUrl: `/submit/${token}`,
    donorDashboard: `/donor`,
    concierge: `/donor/legacy`,
    visionBoard: `/donor/impact`,
    moreInfoUrl: `/more-info/${moreInfoToken}`,
  });
}

