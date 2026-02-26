export const DAF_SPONSORS = [
  'Fidelity Charitable',
  'Schwab Charitable',
  'Vanguard Charitable Endowment Program',
  'National Philanthropic Trust',
  'Silicon Valley Community Foundation',
  'National Christian Foundation',
  'Jewish Communal Fund',
  'Goldman Sachs Philanthropy Fund',
  'Morgan Stanley Global Impact Funding Trust',
  'JPMorgan Chase Charitable Giving Fund',
  'Bank of America Charitable Gift Fund',
  'American Endowment Foundation',
] as const;

export type DafSponsorName = (typeof DAF_SPONSORS)[number];

