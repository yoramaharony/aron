// Local-dev friendly defaults (works without any env file):
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL ?? 'file:./yesod.db';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || undefined;

export default {
    schema: './db/schema.ts',
    out: './drizzle',
    dialect: 'turso',
    dbCredentials: {
        url: TURSO_DATABASE_URL,
        authToken: TURSO_AUTH_TOKEN,
    },
};
