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
import { desc, eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateSubmissionToken } from '@/lib/submission-links';
import { extractSubmissionSignals } from '@/lib/extract-submission';
import { buildBoard, extractVision } from '@/lib/vision-extract';

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
      submissions: [
        {
          orgName: 'Bikur Cholim & Chesed Fund',
          orgEmail: 'demo-org@aron.local',
          contactName: 'Demo Contact',
          contactEmail: 'demo-org@aron.local',
          title: 'Refuah / Bikur Cholim: rides + meals for families',
          summary:
            'We support families during refuah with bikur cholim visits, hospital rides, and Shabbos meals. Need bridge funding for 600 rides + 300 meal packages within 14 days. Serving Boro Park and Lakewood.',
          amountRequested: 180000,
          linkNote: 'Happy path demo link (Refuah / Bikur Cholim)',
          includeMoreInfo: true,
        },
        {
          orgName: 'Hatzolah Support Committee',
          orgEmail: 'hatzolah-demo@aron.local',
          contactName: 'Demo Dispatcher',
          contactEmail: 'hatzolah-demo@aron.local',
          title: 'Hatzolah: new ambulance + cardiac response equipment',
          summary:
            'Hatzolah is adding a new ambulance and upgrading AED units and response kits. Need $1.2M for vehicle + equipment + readiness. Serving Monsey and Boro Park.',
          amountRequested: 1200000,
          linkNote: 'Happy path demo link (Hatzolah)',
          includeMoreInfo: false,
        },
        {
          orgName: "Kimcha d'Pischa / Maos Chitim",
          orgEmail: 'kimcha-demo@aron.local',
          contactName: 'Demo Coordinator',
          contactEmail: 'kimcha-demo@aron.local',
          title: "Kimcha d'Pischa: Pesach packages for families",
          summary:
            "We distribute kimcha d'Pischa / maos chitim to families before Pesach. Need $120k to cover 800 packages. Target delivery within 10 days. Serving Yerushalayim and Bnei Brak.",
          amountRequested: 120000,
          linkNote: "Happy path demo link (Kimcha d'Pischa)",
          includeMoreInfo: false,
        },
        {
          orgName: 'Chinuch Crisis Fund',
          orgEmail: 'chinuch-demo@aron.local',
          contactName: 'Demo Director',
          contactEmail: 'chinuch-demo@aron.local',
          title: 'Chinuch: tuition relief for 200 families',
          summary:
            'Chinuch tuition relief (scholarships) for 200 families for the coming zman. Need $500k to prevent mid-year dropouts. Serving Lakewood and Boro Park.',
          amountRequested: 500000,
          linkNote: 'Happy path demo link (Chinuch)',
          includeMoreInfo: false,
        },
        {
          orgName: 'Mikveh Expansion Committee',
          orgEmail: 'mikveh-demo@aron.local',
          contactName: 'Demo Coordinator',
          contactEmail: 'mikveh-demo@aron.local',
          title: 'Mikveh: expansion + renovation (capital project)',
          summary:
            'Mikveh expansion and renovation: new preparation rooms, plumbing, and ADA access. Need $950k to complete the buildout this year. Serving Monsey.',
          amountRequested: 950000,
          linkNote: 'Happy path demo link (Mikveh)',
          includeMoreInfo: false,
        },
        {
          orgName: 'Yeshiva Building Fund',
          orgEmail: 'yeshiva-demo@aron.local',
          contactName: 'Demo Administrator',
          contactEmail: 'yeshiva-demo@aron.local',
          title: 'Yeshiva: new wing + beis medrash expansion',
          summary:
            'Yeshiva capital campaign: new classrooms + beis medrash expansion. Need $2.5M to complete the next phase. Serving Yerushalayim.',
          amountRequested: 2500000,
          linkNote: 'Happy path demo link (Yeshiva / Beis Medrash)',
          includeMoreInfo: false,
        },
        {
          orgName: 'Gemach (Free-Loan) Fund',
          orgEmail: 'gemach-demo@aron.local',
          contactName: 'Demo Treasurer',
          contactEmail: 'gemach-demo@aron.local',
          title: "Gemach: interest-free loan pool (G'mach)",
          summary:
            "G'mach seed pool for short-term emergency loans. Need $25k to start a revolving fund and cover basic operations. Serving Bnei Brak.",
          amountRequested: 25000,
          linkNote: "Happy path demo link (G'mach)",
          includeMoreInfo: false,
        },
      ],
      curatedRequest: {
        id: 'req_demo',
        title: 'Curated: Hachnasas Kallah matching campaign',
        category: 'Hachnasas Kallah (Chesed)',
        location: 'Jerusalem, Israel',
        summary:
          'Curated opportunity for demo purposes: discreet matching for hachnasas kallah with concierge-reviewed verification.',
        targetAmount: 2000000,
        currentAmount: 650000,
      },
    };
  }

  return {
    donorName: 'Demo Donor',
    orgName: 'Demo Organization',
    orgEmail: 'demo-org@aron.local',
    demoVideoUrl:
      'https://us06web.zoom.us/rec/component-page?eagerLoadZvaPages=sidemenu.billing.plan_management&accessLevel=meeting&action=viewdetailpage&sharelevel=meeting&useWhichPasswd=meeting&requestFrom=pwdCheck&clusterId=us06&componentName=need-password&meetingId=QRH1BktKpBgg_-v7eX2drb4YTzcMXQxSqfPFwG9H0mXBfaclalI6K566Khun711V.1kwuhLrFEMJhpZWl&originRequestUrl=https%3A%2F%2Fus06web.zoom.us%2Frec%2Fshare%2FUdhC9IEPLBhGMOJmya1goqGu7-UgsUuVwy2BFDBBQWzFDRqKwQ92byW4j_9R2LgL.2M8jQlvIh5L_XavM%3FstartTime%3D1768907539000%2520Passcode%3A%2520R*%26z6gdU',
    submissions: [
      {
        orgName: 'Demo Organization',
        orgEmail: 'demo-org@aron.local',
        contactName: 'Demo Contact',
        contactEmail: 'demo-org@aron.local',
        title: 'Bridge funding for emergency kits',
        summary: 'We need bridge funding for 5,000 emergency kits. We can start distribution within 14 days. Short video available.',
        amountRequested: 150000,
        linkNote: 'Happy path demo link',
        includeMoreInfo: true,
      },
    ],
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

/**
 * Light reset: clears concierge opportunity states/events and re-extracts the
 * vision from existing chat history (with the fixed donor-only extraction).
 * Chat messages and submissions are preserved.
 */
async function resetConciergeOnly(donorId: string) {
  // 1. Delete all opportunity states (reset to 'new')
  await db.delete(donorOpportunityState).where(eq(donorOpportunityState.donorId, donorId));

  // 2. Delete concierge-sourced events only (preserve manual donor actions)
  const allEvents = await db
    .select()
    .from(donorOpportunityEvents)
    .where(eq(donorOpportunityEvents.donorId, donorId))
    .limit(5000);

  let deletedEvents = 0;
  for (const evt of allEvents) {
    if (!evt.metaJson) continue;
    try {
      const meta = JSON.parse(evt.metaJson);
      if (meta?.source === 'concierge') {
        await db.delete(donorOpportunityEvents).where(eq(donorOpportunityEvents.id, evt.id));
        deletedEvents++;
      }
    } catch { /* ignore bad JSON */ }
  }

  // 3. Re-extract vision from existing chat messages (donor-only extraction)
  const msgs = await db
    .select({ role: conciergeMessages.role, content: conciergeMessages.content })
    .from(conciergeMessages)
    .where(eq(conciergeMessages.donorId, donorId))
    .orderBy(desc(conciergeMessages.createdAt))
    .limit(50);

  let vision = null;
  if (msgs.length > 0) {
    vision = extractVision(msgs.slice().reverse().map((m) => ({ role: m.role, content: m.content })));
    const board = buildBoard(vision);
    const now = new Date();
    const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.donorId, donorId)).get();
    if (profile) {
      await db.update(donorProfiles)
        .set({ visionJson: JSON.stringify(vision), boardJson: JSON.stringify(board), updatedAt: now })
        .where(eq(donorProfiles.donorId, donorId));
    }
  }

  return { deletedEvents, vision };
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
    // Delete ALL requests created by the demo org user (not just req_demo)
    await db.delete(requests).where(eq(requests.createdBy, orgId));
    // In case any submission entry got linked to the authenticated org user.
    await db.delete(submissionEntries).where(eq(submissionEntries.requestorUserId, orgId));
  }

  // Also clean up requests created by ALL demo org users (@aron.local requestors)
  const demoOrgs = await db.select({ id: users.id })
    .from(users)
    .where(sql`${users.role} = 'requestor' AND ${users.email} LIKE '%@aron.local'`)
    .limit(50);

  for (const org of demoOrgs) {
    await db.delete(requests).where(eq(requests.createdBy, org.id));
  }

  // Curated request is stable ID, safe to delete as well.
  await db.delete(requests).where(eq(requests.id, 'req_demo'));
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return forbidden();

    const { searchParams } = new URL(req.url);
    const conciergeOnly = searchParams.get('concierge_only') === '1';

    // Light reset: only clear concierge states + re-extract vision
    if (conciergeOnly) {
      const donor = await db.select().from(users).where(eq(users.email, 'demo-donor@aron.local')).get();
      if (!donor) return NextResponse.json({ error: 'Demo donor not found — run full seed first' }, { status: 404 });
      const result = await resetConciergeOnly(donor.id);
      return NextResponse.json({ success: true, conciergeOnly: true, ...result });
    }

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
  const demoVideoUrl = preset.demoVideoUrl;
  const seededSubmissions: Array<{
    key: string;
    title: string;
    orgName: string | null;
    moreInfoUrl: string | null;
  }> = [];

  let primarySubmitUrl: string | null = null;
  let primaryMoreInfoUrl: string | null = null;

  for (let i = 0; i < preset.submissions.length; i++) {
    const s = preset.submissions[i];
    const token = generateSubmissionToken();
    const linkId = uuidv4();

    await db.insert(submissionLinks).values({
      id: linkId,
      token,
      donorId,
      createdBy: donorId,
      orgName: s.orgName,
      orgEmail: s.orgEmail,
      note: s.linkNote,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      maxSubmissions: 50,
      submissionsCount: 0,
      visitsCount: 0,
    });

    const entryId = uuidv4();
    const moreInfoToken = uuidv4();
    const extracted = extractSubmissionSignals({
      title: s.title,
      summary: s.summary,
      orgName: s.orgName,
      orgEmail: s.orgEmail,
      videoUrl: demoVideoUrl,
      amountRequested: s.amountRequested,
    });

    await db.insert(submissionEntries).values({
      id: entryId,
      linkId,
      donorId,
      contactName: s.contactName ?? null,
      contactEmail: s.contactEmail ?? null,
      orgName: s.orgName,
      orgEmail: s.orgEmail,
      title: s.title,
      summary: s.summary,
      amountRequested: s.amountRequested,
      videoUrl: demoVideoUrl,
      extractedJson: JSON.stringify(extracted),
      extractedCause: extracted.cause ?? null,
      extractedGeo: extracted.geo?.length ? extracted.geo.join(', ') : null,
      extractedUrgency: extracted.urgency ?? null,
      extractedAmount: typeof extracted.amount === 'number' ? extracted.amount : null,
      moreInfoToken: s.includeMoreInfo ? moreInfoToken : null,
      moreInfoRequestedAt: s.includeMoreInfo ? new Date() : null,
      requestorUserId: i === 0 ? orgId : null,
    });

    const key = `sub_${entryId}`;
    const moreInfoUrl = s.includeMoreInfo ? `/more-info/${moreInfoToken}` : null;
    seededSubmissions.push({ key, title: s.title, orgName: s.orgName ?? null, moreInfoUrl });

    if (i === 0) {
      primarySubmitUrl = `/submit/${token}`;
      primaryMoreInfoUrl = moreInfoUrl;
    }
  }

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
      // Use the seeded donor as createdBy to avoid foreign-key issues if the admin session user isn't present in this DB.
      createdBy: donorId,
      createdAt: new Date(),
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
      submitUrl: primarySubmitUrl,
      donorDashboard: `/donor`,
      concierge: `/donor/legacy`,
      visionBoard: `/donor/impact`,
      moreInfoUrl: primaryMoreInfoUrl,
      submissions: seededSubmissions,
    });
  } catch (e: any) {
    const msg = String(e?.message ?? e ?? '');
    console.error('❌ demo-seed failed', e);
    const hint =
      msg.toLowerCase().includes('no such column') || msg.toLowerCase().includes('no such table')
        ? 'Your local DB schema is out of date. Run `npm run db:ensure` (from yesod-platform/) and restart `npm run dev`.'
        : null;
    return NextResponse.json(
      {
        error: 'Demo seed failed',
        detail: msg,
        hint,
      },
      { status: 500 }
    );
  }
}

