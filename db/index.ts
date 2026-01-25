import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
/**
 * Local-dev friendly defaults:
 * - If TURSO_DATABASE_URL isn't set, we fall back to the checked-in local DB file.
 * - TURSO_AUTH_TOKEN is optional (not needed for local `file:` URLs).
 *
 * Next.js will load env vars automatically if you provide them via your shell or
 * `.env*` files (not required for local dev with this fallback).
 */
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL ?? 'file:./yesod.db';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || undefined;

const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
