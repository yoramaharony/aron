import fs from 'fs';
import path from 'path';

/**
 * Returns a stable libsql URL for local file DBs even when the process CWD is
 * accidentally the parent workspace (multiple lockfiles / monorepo).
 *
 * Priority:
 * - TURSO_DATABASE_URL (explicit)
 * - file:<abs path to yesod.db> in the current project (yesod-platform)
 * - file:<abs path to yesod-platform/yesod.db> if running from parent workspace
 */
export function getTursoDatabaseUrl(): string {
  const explicit = process.env.TURSO_DATABASE_URL?.trim();
  if (explicit) return explicit;

  const cwd = process.cwd();
  const here = path.resolve(cwd, 'yesod.db');
  if (fs.existsSync(here)) return `file:${here}`;

  const nested = path.resolve(cwd, 'yesod-platform', 'yesod.db');
  if (fs.existsSync(nested)) return `file:${nested}`;

  // Default to "project-local" path (even if it doesn't exist yet).
  return `file:${here}`;
}

export function getTursoAuthToken(): string | undefined {
  const t = process.env.TURSO_AUTH_TOKEN?.trim();
  return t ? t : undefined;
}

