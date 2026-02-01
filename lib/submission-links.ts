import crypto from 'crypto';

export function generateSubmissionToken() {
  // 24 bytes -> 32 chars in base64url-ish after stripping; safe in URLs.
  // Using hex is also fine; base64url yields shorter token.
  return crypto.randomBytes(24).toString('base64url');
}

