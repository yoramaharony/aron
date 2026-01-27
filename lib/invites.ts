import crypto from 'crypto';

export type IntendedRole = 'donor' | 'requestor';

export function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase();
}

export function generateInviteCode() {
  // 12 hex chars => 6 random bytes. Human-friendly with dashes.
  const raw = crypto.randomBytes(6).toString('hex').toUpperCase(); // e.g. A1B2C3D4E5F6
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

