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
    title: 'Shabbat Dinners in Williamsburg',
    orgName: 'Charidy (curated)',
    category: 'Community',
    location: 'Brooklyn, NY',
    summary: 'Support weekly Shabbat dinners for the entire year with a stable sponsorship pool.',
    fundingGap: 85000,
    outcomes: ['52 dinners funded', '250+ families hosted', 'Quarterly impact update'],
    whyNow: 'Programming commitments are being finalized for the next 12 months.',
  },
  {
    key: 'charidy_2',
    title: 'Community Garden (Berlin)',
    orgName: 'Charidy (curated)',
    category: 'Environment',
    location: 'Berlin, DE',
    summary: 'Build an urban agriculture garden with training and community harvesting days.',
    fundingGap: 120000,
    outcomes: ['Garden built + staffed', 'Monthly volunteer days', 'Measured yield + participation'],
    whyNow: 'Spring build window is approaching; permits are already in motion.',
  },
];

