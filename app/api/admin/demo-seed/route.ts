import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  conciergeMessages,
  donorOpportunityEvents,
  donorOpportunityState,
  donorProfiles,
  leverageOffers,
  opportunities,
  submissionLinks,
  users,
} from '@/db/schema';
import { getSession, hashPassword } from '@/lib/auth';
import { desc, eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateSubmissionToken } from '@/lib/submission-links';
import { extractSubmissionSignals } from '@/lib/extract-submission';
import { buildBoard, extractVision } from '@/lib/vision-extract';
import { CHARIDY_CURATED } from '@/lib/charidy-curated';

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
          orgName: 'Bikur Cholim & Chesed Fund',
          orgEmail: 'demo-org@aron.local',
          contactName: 'Demo Contact',
          contactEmail: 'demo-org@aron.local',
          title: 'Hatzolah: new ambulance + cardiac response equipment',
          summary:
            'Hatzolah is adding a new ambulance and upgrading AED units and response kits. Need $1.2M for vehicle + equipment + readiness. Serving Monsey and Boro Park.',
          amountRequested: 1200000,
          linkNote: 'Happy path demo link (Hatzolah)',
          includeMoreInfo: false,
        },
        {
          orgName: 'Bikur Cholim & Chesed Fund',
          orgEmail: 'demo-org@aron.local',
          contactName: 'Demo Contact',
          contactEmail: 'demo-org@aron.local',
          title: "Kimcha d'Pischa: Pesach packages for families",
          summary:
            "We distribute kimcha d'Pischa / maos chitim to families before Pesach. Need $120k to cover 800 packages. Target delivery within 10 days. Serving Yerushalayim and Bnei Brak.",
          amountRequested: 120000,
          linkNote: "Happy path demo link (Kimcha d'Pischa)",
          includeMoreInfo: false,
        },
        {
          orgName: 'Bikur Cholim & Chesed Fund',
          orgEmail: 'demo-org@aron.local',
          contactName: 'Demo Contact',
          contactEmail: 'demo-org@aron.local',
          title: 'Chinuch: tuition relief for 200 families',
          summary:
            'Chinuch tuition relief (scholarships) for 200 families for the coming zman. Need $500k to prevent mid-year dropouts. Serving Lakewood and Boro Park.',
          amountRequested: 500000,
          linkNote: 'Happy path demo link (Chinuch)',
          includeMoreInfo: false,
        },
        {
          orgName: 'Bikur Cholim & Chesed Fund',
          orgEmail: 'demo-org@aron.local',
          contactName: 'Demo Contact',
          contactEmail: 'demo-org@aron.local',
          title: 'Mikveh: expansion + renovation (capital project)',
          summary:
            'Mikveh expansion and renovation: new preparation rooms, plumbing, and ADA access. Need $950k to complete the buildout this year. Serving Monsey.',
          amountRequested: 950000,
          linkNote: 'Happy path demo link (Mikveh)',
          includeMoreInfo: false,
        },
        {
          orgName: 'Bikur Cholim & Chesed Fund',
          orgEmail: 'demo-org@aron.local',
          contactName: 'Demo Contact',
          contactEmail: 'demo-org@aron.local',
          title: 'Yeshiva: new wing + beis medrash expansion',
          summary:
            'Yeshiva capital campaign: new classrooms + beis medrash expansion. Need $2.5M to complete the next phase. Serving Yerushalayim.',
          amountRequested: 2500000,
          linkNote: 'Happy path demo link (Yeshiva / Beis Medrash)',
          includeMoreInfo: false,
        },
        {
          orgName: 'Bikur Cholim & Chesed Fund',
          orgEmail: 'demo-org@aron.local',
          contactName: 'Demo Contact',
          contactEmail: 'demo-org@aron.local',
          title: "Gemach: interest-free loan pool (G'mach)",
          summary:
            "G'mach seed pool for short-term emergency loans. Need $25k to start a revolving fund and cover basic operations. Serving Bnei Brak.",
          amountRequested: 25000,
          linkNote: "Happy path demo link (G'mach)",
          includeMoreInfo: false,
        },
      ],
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
  };
}

/**
 * Light reset: clears concierge opportunity states/events and re-extracts the
 * vision from existing chat history (with the fixed donor-only extraction).
 * Opportunities are preserved.
 */
async function resetConciergeOnly(donorId: string) {
  await db.delete(donorOpportunityState).where(eq(donorOpportunityState.donorId, donorId));

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

  if (donorId) {
    await db.delete(leverageOffers).where(eq(leverageOffers.donorId, donorId));
    await db.delete(donorOpportunityEvents).where(eq(donorOpportunityEvents.donorId, donorId));
    await db.delete(donorOpportunityState).where(eq(donorOpportunityState.donorId, donorId));
    await db.delete(conciergeMessages).where(eq(conciergeMessages.donorId, donorId));
    await db.delete(donorProfiles).where(eq(donorProfiles.donorId, donorId));
    // Delete opportunities owned by this donor (submissions)
    await db.delete(opportunities).where(eq(opportunities.originDonorId, donorId));
    // Clean up legacy submission_entries (FK blocks submission_links delete)
    await db.run(sql`DELETE FROM submission_entries WHERE donor_id = ${donorId}`).catch(() => {});
    await db.delete(submissionLinks).where(eq(submissionLinks.donorId, donorId));
  }

  if (orgId) {
    await db.delete(opportunities).where(eq(opportunities.createdBy, orgId));
    await db.run(sql`DELETE FROM requests WHERE created_by = ${orgId}`).catch(() => {});
  }

  // Clean up opportunities created by ALL demo org users
  const demoOrgs = await db.select({ id: users.id })
    .from(users)
    .where(sql`${users.role} = 'requestor' AND ${users.email} LIKE '%@aron.local'`)
    .limit(50);

  for (const org of demoOrgs) {
    await db.delete(opportunities).where(eq(opportunities.createdBy, org.id));
    await db.run(sql`DELETE FROM requests WHERE created_by = ${org.id}`).catch(() => {});
  }

  // Delete curated seed opportunities
  await db.delete(opportunities).where(eq(opportunities.source, 'curated'));
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role !== 'admin') return forbidden();

    const { searchParams } = new URL(req.url);
    const conciergeOnly = searchParams.get('concierge_only') === '1';

    if (conciergeOnly) {
      const donor = await db.select().from(users).where(eq(users.email, 'demo-donor@aron.local')).get();
      if (!donor) return NextResponse.json({ error: 'Demo donor not found — run full seed first' }, { status: 404 });
      const result = await resetConciergeOnly(donor.id);
      return NextResponse.json({ success: true, conciergeOnly: true, ...result });
    }

    const theme = getTheme(req);
    const doReset = getReset(req);
    const preset = seedPreset(theme);

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
      if (donor) await db.update(users).set({ name: preset.donorName }).where(eq(users.id, donorId));
      if (org) await db.update(users).set({ name: preset.orgName }).where(eq(users.id, orgId));
    } else {
      if (donor?.id) {
        await db.delete(opportunities).where(eq(opportunities.originDonorId, donor.id));
        await db.run(sql`DELETE FROM submission_entries WHERE donor_id = ${donor.id}`).catch(() => {});
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

    const demoVideoUrl = preset.demoVideoUrl;
    const seededOpportunities: Array<{
      key: string;
      title: string;
      orgName: string | null;
      moreInfoUrl: string | null;
    }> = [];

    let primarySubmitUrl: string | null = null;
    let primaryMoreInfoUrl: string | null = null;

    // Seed org submissions as opportunities
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

      const oppId = uuidv4();
      const moreInfoToken = uuidv4();
      const extracted = extractSubmissionSignals({
        title: s.title,
        summary: s.summary,
        orgName: s.orgName,
        orgEmail: s.orgEmail,
        videoUrl: demoVideoUrl,
        amountRequested: s.amountRequested,
      });

      await db.insert(opportunities).values({
        id: oppId,
        title: s.title,
        category: extracted.cause || 'Uncategorized',
        location: extracted.geo?.length ? extracted.geo.join(', ') : '',
        summary: s.summary,
        targetAmount: s.amountRequested,
        source: 'submission',
        originDonorId: donorId,
        linkId,
        createdBy: orgId,
        orgName: s.orgName,
        orgEmail: s.orgEmail,
        contactName: s.contactName ?? null,
        contactEmail: s.contactEmail ?? null,
        videoUrl: demoVideoUrl,
        extractedJson: JSON.stringify(extracted),
        moreInfoToken: s.includeMoreInfo ? moreInfoToken : null,
        moreInfoRequestedAt: s.includeMoreInfo ? new Date() : null,
        status: 'active',
        createdAt: new Date(),
      });

      const moreInfoUrl = s.includeMoreInfo ? `/more-info/${moreInfoToken}` : null;
      seededOpportunities.push({ key: oppId, title: s.title, orgName: s.orgName ?? null, moreInfoUrl });

      if (i === 0) {
        primarySubmitUrl = `/submit/${token}`;
        primaryMoreInfoUrl = moreInfoUrl;
      }
    }

    // Seed charidy curated items as real DB rows (owned by demo org)
    for (const c of CHARIDY_CURATED) {
      await db.insert(opportunities).values({
        id: c.key,
        title: c.title,
        category: c.category,
        location: c.location,
        summary: c.summary,
        targetAmount: c.fundingGap,
        source: 'curated',
        createdBy: orgId,
        orgName: c.orgName,
        orgEmail: preset.orgEmail,
        contactName: 'Demo Contact',
        contactEmail: preset.orgEmail,
        status: 'active',
        createdAt: new Date(),
      });
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
      opportunities: seededOpportunities,
    });
  } catch (e: any) {
    const msg = String(e?.message ?? e ?? '');
    console.error('demo-seed failed', e);
    const hint =
      msg.toLowerCase().includes('no such column') || msg.toLowerCase().includes('no such table')
        ? 'Your local DB schema is out of date. Run `npm run db:ensure` (from yesod-platform/) and restart `npm run dev`.'
        : null;
    return NextResponse.json(
      { error: 'Demo seed failed', detail: msg, hint },
      { status: 500 },
    );
  }
}
