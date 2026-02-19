export type CuratedOpportunity = {
  key: string; // used as opportunity key
  title: string;
  orgName: string;
  category: string;
  location: string;
  summary: string;
  fundingGap: number;
  outcomes: string[];
  whyNow: string;
};

// Phase 1: manual curation list in code is OK.
// Balanced across demo happy-path combos:
//   Path A (Hachnasas Kallah / Chesed, Jerusalem + Bnei Brak)
//   Path B (Yeshiva / Torah & Chinuch, Lakewood + Monsey)
//   Plus cross-pillar and non-matching items for variety
export const CHARIDY_CURATED: CuratedOpportunity[] = [
  // ── Chesed · Brooklyn (Path A pillar match) ──
  {
    key: 'charidy_1',
    title: 'Shabbos meals sponsorship pool (Williamsburg)',
    orgName: 'Charidy (curated)',
    category: 'Chesed / Community support',
    location: 'Brooklyn, NY',
    summary: 'Sponsor weekly Shabbos meals for families in need via a stable underwriting pool and verified distribution partners.',
    fundingGap: 85000,
    outcomes: ['52 Shabbos cycles covered', '250+ families supported', 'Quarterly impact update'],
    whyNow: 'Partners are locking in commitments for the next 12 months and need an anchor sponsor to proceed.',
  },
  // ── Hachnasas Kallah · Jerusalem (Path A full match) ──
  {
    key: 'charidy_2',
    title: 'Hachnasas Kallah essentials fund (discreet matching)',
    orgName: 'Charidy (curated)',
    category: 'Hachnasas Kallah',
    location: 'Jerusalem, Israel',
    summary: 'Discreet matching + essentials for kallah needs, with concierge-reviewed verification and audit-ready reporting.',
    fundingGap: 120000,
    outcomes: ['40–60 families supported', 'Discreet verification completed', 'Post-disbursement outcome report'],
    whyNow: 'Backlog of urgent cases is rising; funding is needed to unlock matching and avoid delays.',
  },
  // ── Torah & Chinuch · Lakewood (Path B full match) ──
  {
    key: 'charidy_3',
    title: 'Yeshiva Ketana dormitory expansion (Lakewood)',
    orgName: 'Charidy (curated)',
    category: 'Torah & Chinuch',
    location: 'Lakewood, NJ',
    summary: 'Expand dormitory capacity for 80 additional bochurim with beds, meals, and rebbeim stipends for the coming zman.',
    fundingGap: 310000,
    outcomes: ['80 new beds operational', 'Full meal program funded', 'Annual audit provided'],
    whyNow: 'Construction permits approved; building contractor ready to begin — need anchor commitment within 60 days.',
  },
  // ── Torah & Chinuch · Monsey (Path B full match) ──
  {
    key: 'charidy_4',
    title: 'Kollel stipend stabilization (Monsey)',
    orgName: 'Charidy (curated)',
    category: 'Torah & Chinuch',
    location: 'Monsey, NY',
    summary: 'Stabilize monthly stipends for 45 kollel yungeleit so families can focus on learning without financial disruption.',
    fundingGap: 175000,
    outcomes: ['45 families supported for 12 months', 'Quarterly financial reporting', 'Retention rate > 90%'],
    whyNow: 'Two major donors stepped back; gap must be filled before Elul zman to prevent closures.',
  },
  // ── Gemach · Bnei Brak (Path A full match) ──
  {
    key: 'charidy_5',
    title: 'Gemach network coordination (Bnei Brak)',
    orgName: 'Charidy (curated)',
    category: "Gemach (G'mach) / Free loans",
    location: 'Bnei Brak, Israel',
    summary: 'Fund a centralized gemach coordination platform serving 12 neighborhood gemachim with inventory tracking and discreet disbursement.',
    fundingGap: 65000,
    outcomes: ['12 gemachim connected', '1,500+ families served annually', 'Digital tracking dashboard'],
    whyNow: 'Pilot phase complete with 4 gemachim; ready to scale but needs operational funding.',
  },
  // ── Torah & Chinuch · Jerusalem (Path A geo + Path B pillar → both partial) ──
  {
    key: 'charidy_6',
    title: 'Talmud Torah building renovation (Jerusalem)',
    orgName: 'Charidy (curated)',
    category: 'Torah & Chinuch',
    location: 'Jerusalem, Israel',
    summary: 'Renovate classrooms and add safety features for a 200-student Talmud Torah in the Geula neighborhood.',
    fundingGap: 240000,
    outcomes: ['8 classrooms renovated', 'Safety code compliance', 'Capacity for 40 additional students'],
    whyNow: 'Municipality safety deadline in 4 months; partial closure risk if renovations are not funded.',
  },
  // ── Refuah / Bikur Cholim · Jerusalem (Path A geo match only) ──
  {
    key: 'charidy_7',
    title: 'Bikur Cholim overnight hospitality (Jerusalem)',
    orgName: 'Charidy (curated)',
    category: 'Refuah / Bikur Cholim',
    location: 'Jerusalem, Israel',
    summary: 'Provide overnight housing and meals for families of hospitalized patients near major medical centers.',
    fundingGap: 95000,
    outcomes: ['300+ family-nights per year', 'Hot meals and transportation', 'Social worker support'],
    whyNow: 'New hospital wing opening doubles patient volume; current capacity is insufficient.',
  },
  // ── Hatzolah · Brooklyn (neither path pillar match; geo partial for broader NYC searches) ──
  {
    key: 'charidy_8',
    title: 'Hatzalah ambulance retrofit (Flatbush)',
    orgName: 'Charidy (curated)',
    category: 'Hatzolah / Pikuach Nefesh',
    location: 'Brooklyn, NY',
    summary: 'Retrofit two aging ambulances with modern life-saving equipment and train 15 new volunteer EMTs.',
    fundingGap: 180000,
    outcomes: ['2 ambulances upgraded', '15 EMTs certified', 'Response time improved by 20%'],
    whyNow: 'Current vehicles approaching end-of-life; replacement parts are no longer available.',
  },
  // ── Tzedakah · Lakewood (Path A pillar + Path B geo → both partial) ──
  {
    key: 'charidy_9',
    title: 'Kimcha D\'Pischa distribution (Lakewood)',
    orgName: 'Charidy (curated)',
    category: 'Tzedakah / Family assistance',
    location: 'Lakewood, NJ',
    summary: 'Discreet Yom Tov food distribution for 400 families verified by local rabbonim with dignity-preserving voucher system.',
    fundingGap: 55000,
    outcomes: ['400 families receive Yom Tov essentials', 'Rabbinic verification for every family', 'Zero-waste distribution'],
    whyNow: 'Pesach is 10 weeks away; procurement commitments need to be locked in now.',
  },
  // ── Chesed · Brooklyn (low-budget $5K item) ──
  {
    key: 'charidy_11',
    title: 'After-school snack program (Crown Heights)',
    orgName: 'Charidy (curated)',
    category: 'Chesed / Community support',
    location: 'Brooklyn, NY',
    summary: 'Provide daily after-school snacks and drinks for 60 children at a community learning center run by local volunteers.',
    fundingGap: 5000,
    outcomes: ['60 children served daily', '180 school days covered', 'Volunteer coordination support'],
    whyNow: 'Program starts next month; grocery supplier needs a purchase commitment by end of week.',
  },
  // ── Mikveh · Monsey (covers the Mikveh category) ──
  {
    key: 'charidy_10',
    title: 'Community mikveh renovation + expansion (Monsey)',
    orgName: 'Charidy (curated)',
    category: 'Mikveh & Taharas Hamishpacha',
    location: 'Monsey, NY',
    summary: 'Renovate and expand the community mikveh with new preparation rooms, ADA access, and modern plumbing to serve 800+ families annually.',
    fundingGap: 95000,
    outcomes: ['Full ADA compliance', '800+ families served annually', 'Completion before Tishrei'],
    whyNow: 'Current facility failing inspections; municipality deadline in 3 months for code compliance.',
  },
];
