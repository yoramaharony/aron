/**
 * Jewish-themed demo data for quick form auto-fill during demos.
 * Each call returns a randomly selected preset so consecutive fills feel varied.
 */

export interface MoreInfoDemoData {
  orgWebsite: string;
  mission: string;
  program: string;
  geo: string;
  beneficiaries: string;
  budget: string;
  amountRequested: string;
  timeline: string;
  governance: string;
  leadership: string;
  proofLinks: string;
}

const MORE_INFO_PRESETS: MoreInfoDemoData[] = [
  {
    orgWebsite: 'https://www.torahacademy.org',
    mission:
      'Torah Academy of Jerusalem provides world-class Torah education combining Talmudic scholarship with modern pedagogy, serving over 500 students from diverse backgrounds across Israel.',
    program:
      'Expanding our Beit Midrash program to include evening kollel for working professionals, with chavrusa-matching technology and livestreamed shiurim for remote learners.',
    geo: 'Jerusalem, Israel',
    beneficiaries:
      '350+ kollel participants in Year 1, measured by attendance, learning milestones (masechta completion), and community surveys. We track retention and pair completion rates quarterly.',
    budget: '$1.8M annual operating budget',
    amountRequested: '$500,000',
    timeline: 'Launch in 30 days, full enrollment by Elul zman, program review after first full year.',
    governance:
      'Board of 9 members including 3 Rabbinic advisors, annual financial audit by Deloitte Israel, quarterly board meetings with published minutes.',
    leadership:
      'Rabbi Moshe Goldstein (Rosh Yeshiva, 25 years), Dr. Sarah Levy (Executive Director, former McKinsey), Rav David Katz (Program Director).',
    proofLinks:
      'https://torahacademy.org/annual-report-2025\nhttps://torahacademy.org/501c3-letter\nhttps://guidestar.org/torah-academy',
  },
  {
    orgWebsite: 'https://www.chesedhouse.org',
    mission:
      'Chesed House provides emergency housing, meals, and family stabilization services for Jewish families in crisis across the NY tri-state area, serving 1,200+ families annually.',
    program:
      'Building a new 40-bed family shelter with wraparound services including job training, mental health counseling, and children\'s tutoring — all within a warm, kosher, Shabbat-observant environment.',
    geo: 'Brooklyn, NY',
    beneficiaries:
      '200 families in Year 1 (approx 800 individuals). Outcomes tracked: housing placement within 90 days (target 85%), employment rate at 6 months (target 70%), children\'s school stability.',
    budget: '$4.2M annual operating budget',
    amountRequested: '$750,000',
    timeline: 'Construction begins Adar, occupancy by Rosh Hashana, full programming by Chanukah.',
    governance:
      'Board of 12 including 2 social workers, 1 Rav, and community lay leaders. Annual audit by KPMG, monthly financial committee meetings.',
    leadership:
      'Mrs. Rivka Bernstein (Founder & CEO, 18 years), Rabbi Yosef Adler (Spiritual Director), Miriam Schwartz LCSW (Clinical Director).',
    proofLinks:
      'https://chesedhouse.org/impact-2025\nhttps://chesedhouse.org/financials\nhttps://charitynavigator.org/chesed-house',
  },
  {
    orgWebsite: 'https://www.mikvehinnovation.org',
    mission:
      'Mikveh Innovation Project modernizes and builds community mikvaot across underserved Jewish communities, ensuring every Jewish family has dignified access to taharas hamishpacha.',
    program:
      'Constructing a state-of-the-art community mikveh in Austin, TX — the fastest-growing Jewish community without adequate facilities. Design includes accessibility features, rainwater collection, and a welcoming preparation area.',
    geo: 'Austin, TX',
    beneficiaries:
      '2,500+ Jewish women and families in greater Austin. Success metrics: monthly usage rates, community satisfaction surveys, and new families joining the community.',
    budget: '$2.5M project budget (construction + first year operations)',
    amountRequested: '$400,000',
    timeline: 'Groundbreaking in 6 weeks, construction 8 months, grand opening before Tishrei.',
    governance:
      'Joint oversight by local Orthodox Rabbinate and lay board of 7. Construction managed by licensed contractor with weekly site reviews.',
    leadership:
      'Rabbi Ari Levine (Mara D\'Asra, Austin), Shoshana Gold (Project Manager, 3 mikveh builds), David Chen (Architect, specializing in religious facilities).',
    proofLinks:
      'https://mikvehinnovation.org/austin-project\nhttps://mikvehinnovation.org/past-builds\nhttps://forward.com/mikveh-innovation-feature',
  },
];

export function getMoreInfoDemoData(): MoreInfoDemoData {
  return MORE_INFO_PRESETS[Math.floor(Math.random() * MORE_INFO_PRESETS.length)];
}

export interface RequestWizardDemoData {
  title: string;
  category: string;
  location: string;
  target: number;
  summary: string;
}

const REQUEST_PRESETS: RequestWizardDemoData[] = [
  {
    title: 'Beit Midrash Evening Kollel Expansion',
    category: 'Torah & Chinuch',
    location: 'Jerusalem, Israel',
    target: 500000,
    summary:
      'Expanding Torah study access for working professionals in Jerusalem through an innovative evening kollel program combining traditional chavrusa learning with modern technology, reaching 350+ participants in Year 1.',
  },
  {
    title: 'Emergency Family Shelter — Chesed House Brooklyn',
    category: 'Chesed / Community support',
    location: 'Brooklyn, NY',
    target: 750000,
    summary:
      'Building a 40-bed kosher family shelter with wraparound services for Jewish families in crisis, providing emergency housing, job training, and children\'s educational support in a Shabbat-observant environment.',
  },
  {
    title: 'Community Mikveh Construction — Austin',
    category: 'Mikveh & Taharas Hamishpacha',
    location: 'Austin, TX',
    target: 400000,
    summary:
      'Constructing Austin\'s first purpose-built community mikveh to serve the rapidly growing Jewish population of 2,500+ families, with full accessibility and modern amenities.',
  },
  {
    title: 'Hachnasas Kallah Fund — Los Angeles',
    category: 'Hachnasas Kallah',
    location: 'Los Angeles, CA',
    target: 180000,
    summary:
      'Providing dignified wedding assistance for 60+ couples annually in the LA Jewish community, covering essential expenses from hall rental to sheitel and apartment setup.',
  },
  {
    title: 'Bikur Cholim Hospital Support Network',
    category: 'Refuah / Bikur Cholim',
    location: 'Lakewood, NJ',
    target: 320000,
    summary:
      'Expanding our hospital visitation and patient support program across 12 NJ hospitals, providing kosher meals, Shabbos accommodations, and emotional support to 800+ patients and families annually.',
  },
];

export function getRequestWizardDemoData(): RequestWizardDemoData {
  return REQUEST_PRESETS[Math.floor(Math.random() * REQUEST_PRESETS.length)];
}
