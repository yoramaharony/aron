// Centralized category lists so seeded/demo theme matches UI dropdowns.

export const JEWISH_DEMO_CATEGORIES = [
  'Tzedakah / Family assistance',
  'Chesed / Community support',
  'Refuah / Bikur Cholim',
  'Hatzolah / Pikuach Nefesh',
  'Torah & Chinuch',
  'Hachnasas Kallah',
  'Mikveh & Taharas Hamishpacha',
  "Gemach (G'mach) / Free loans",
] as const;

export type JewishDemoCategory = (typeof JEWISH_DEMO_CATEGORIES)[number];

