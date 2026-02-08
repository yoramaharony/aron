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
export const CHARIDY_CURATED: CuratedOpportunity[] = [
  {
    key: 'charidy_1',
    title: 'Shabbos meals sponsorship pool (Williamsburg)',
    orgName: 'Charidy (curated)',
    category: 'Chesed',
    location: 'Brooklyn, NY',
    summary: 'Sponsor weekly Shabbos meals for families in need via a stable underwriting pool and verified distribution partners.',
    fundingGap: 85000,
    outcomes: ['52 Shabbos cycles covered', '250+ families supported', 'Quarterly impact update'],
    whyNow: 'Partners are locking in commitments for the next 12 months and need an anchor sponsor to proceed.',
  },
  {
    key: 'charidy_2',
    title: 'Hachnasas Kallah essentials fund (discreet matching)',
    orgName: 'Charidy (curated)',
    category: 'Chesed',
    location: 'Jerusalem, Israel',
    summary: 'Discreet matching + essentials for kallah needs, with concierge-reviewed verification and audit-ready reporting.',
    fundingGap: 120000,
    outcomes: ['40–60 families supported', 'Discreet verification completed', 'Post-disbursement outcome report'],
    whyNow: 'Backlog of urgent cases is rising; funding is needed to unlock matching and avoid delays.',
  },
];

