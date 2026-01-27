import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users Table
export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // UUID
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull(), // 'donor' | 'requestor'
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Requests Table
export const requests = sqliteTable('requests', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    location: text('location').notNull(),
    summary: text('summary').notNull(),
    targetAmount: integer('target_amount').notNull(),
    currentAmount: integer('current_amount').default(0),
    status: text('status').default('draft'), // draft, pending, active
    createdBy: text('created_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Campaigns Table
export const campaigns = sqliteTable('campaigns', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    goal: integer('goal').notNull(),
    status: text('status').default('active'),
    createdBy: text('created_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Invite Codes (invite-gated signup)
export const inviteCodes = sqliteTable('invite_codes', {
    id: text('id').primaryKey(), // UUID
    code: text('code').notNull().unique(), // e.g. XXXX-XXXX-XXXX
    intendedRole: text('intended_role').notNull(), // 'donor' | 'requestor'
    createdBy: text('created_by').notNull().references(() => users.id),
    note: text('note'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    maxUses: integer('max_uses').notNull().default(1),
    uses: integer('uses').notNull().default(0),
    usedBy: text('used_by').references(() => users.id),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    revokedAt: integer('revoked_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
