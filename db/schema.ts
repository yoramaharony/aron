import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users Table
export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // UUID
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull(), // 'donor' | 'requestor' | 'admin'
    disabledAt: integer('disabled_at', { mode: 'timestamp' }),
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
    coverUrl: text('cover_url'),
    evidenceJson: text('evidence_json'), // JSON: { budget?: UploadedFile, files?: UploadedFile[] }
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
    recipientEmail: text('recipient_email'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    maxUses: integer('max_uses').notNull().default(1),
    uses: integer('uses').notNull().default(0),
    usedBy: text('used_by').references(() => users.id),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    revokedAt: integer('revoked_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Donor invitation requests (public, donor-only)
export const invitationRequests = sqliteTable('invitation_requests', {
    id: text('id').primaryKey(), // UUID
    name: text('name').notNull(),
    email: text('email').notNull(),
    message: text('message'),
    status: text('status').notNull().default('new'), // new | contacted | approved | ignored
    userAgent: text('user_agent'),
    ip: text('ip'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Email templates (DB-backed so admin can edit copy without code changes)
export const emailTemplates = sqliteTable('email_templates', {
    key: text('key').primaryKey(), // e.g. 'invite_donor', 'invite_requestor', 'forgot_password'
    name: text('name').notNull(),
    subject: text('subject').notNull(),
    textBody: text('text_body').notNull(),
    htmlBody: text('html_body'),
    from: text('from'), // optional override
    enabled: integer('enabled').notNull().default(1), // 1/0
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Password reset tokens (forgot-password flow)
export const passwordResets = sqliteTable('password_resets', {
    id: text('id').primaryKey(), // UUID
    userId: text('user_id').notNull().references(() => users.id),
    token: text('token').notNull().unique(), // long random token
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Donor-generated submission links (org uses this link to submit a brief request to a specific donor)
export const submissionLinks = sqliteTable('submission_links', {
    id: text('id').primaryKey(), // UUID
    token: text('token').notNull().unique(), // long unguessable token used in /submit/<token>
    donorId: text('donor_id').notNull().references(() => users.id),
    createdBy: text('created_by').notNull().references(() => users.id), // usually same as donorId

    // "Donor → org" relationship (MVP: soft-identify org via name/email)
    orgName: text('org_name'),
    orgEmail: text('org_email'),
    note: text('note'),

    // Controls
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    revokedAt: integer('revoked_at', { mode: 'timestamp' }),
    maxSubmissions: integer('max_submissions').notNull().default(50),

    // Usage / tracking
    submissionsCount: integer('submissions_count').notNull().default(0),
    visitsCount: integer('visits_count').notNull().default(0),
    lastVisitedAt: integer('last_visited_at', { mode: 'timestamp' }),
    lastSubmittedAt: integer('last_submitted_at', { mode: 'timestamp' }),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Lightweight request submissions created via a donor submission link
export const submissionEntries = sqliteTable('submission_entries', {
    id: text('id').primaryKey(), // UUID
    linkId: text('link_id').notNull().references(() => submissionLinks.id),
    donorId: text('donor_id').notNull().references(() => users.id),

    // Requester identity (MVP: soft)
    contactName: text('contact_name'),
    contactEmail: text('contact_email'),
    orgName: text('org_name'),
    orgEmail: text('org_email'),

    // Lightweight content
    title: text('title'),
    summary: text('summary').notNull(),
    amountRequested: integer('amount_requested'),
    videoUrl: text('video_url'),

    // Deterministic extraction (Phase 1 "LLM auto-extraction" stub)
    extractedJson: text('extracted_json'),
    extractedCause: text('extracted_cause'),
    extractedGeo: text('extracted_geo'), // comma-separated
    extractedUrgency: text('extracted_urgency'),
    extractedAmount: integer('extracted_amount'),

    // Progressive disclosure: request more info (donor → org)
    moreInfoToken: text('more_info_token'),
    moreInfoRequestedAt: integer('more_info_requested_at', { mode: 'timestamp' }),
    moreInfoSubmittedAt: integer('more_info_submitted_at', { mode: 'timestamp' }),
    detailsJson: text('details_json'),

    // Optional linkage to an authenticated requestor user (if they happened to be signed in)
    requestorUserId: text('requestor_user_id').references(() => users.id),

    // Basic workflow (later: request-more-info, pass, etc.)
    status: text('status').notNull().default('new'),

    // Audit metadata
    userAgent: text('user_agent'),
    ip: text('ip'),

    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Org KYC/verification (MVP-lite): keyed by orgEmail when available
export const orgKyc = sqliteTable('org_kyc', {
    id: text('id').primaryKey(), // UUID
    orgEmail: text('org_email').notNull().unique(),
    orgName: text('org_name'),
    verifiedAt: integer('verified_at', { mode: 'timestamp' }),
    verifiedBy: text('verified_by').references(() => users.id),
    note: text('note'),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Donor profile + generated artifacts (Impact Vision / Vision Board)
export const donorProfiles = sqliteTable('donor_profiles', {
    donorId: text('donor_id').primaryKey().references(() => users.id),
    visionJson: text('vision_json'), // serialized JSON string
    boardJson: text('board_json'), // serialized JSON string
    shareToken: text('share_token'),
    donorToDonorOptIn: integer('donor_to_donor_opt_in'), // 1/0 (nullable for backward compatibility)
    collabSettingsJson: text('collab_settings_json'),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Concierge conversation thread (per donor)
export const conciergeMessages = sqliteTable('concierge_messages', {
    id: text('id').primaryKey(), // UUID
    donorId: text('donor_id').notNull().references(() => users.id),
    role: text('role').notNull(), // 'donor' | 'assistant' | 'system'
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Donor-specific opportunity state (shortlist/passed/etc.)
export const donorOpportunityState = sqliteTable('donor_opportunity_state', {
    id: text('id').primaryKey(), // UUID
    donorId: text('donor_id').notNull().references(() => users.id),
    opportunityKey: text('opportunity_key').notNull(), // e.g. 'req_1' or 'sub_<uuid>'
    state: text('state').notNull().default('new'),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Append-only event log for donor decisions/actions
export const donorOpportunityEvents = sqliteTable('donor_opportunity_events', {
    id: text('id').primaryKey(), // UUID
    donorId: text('donor_id').notNull().references(() => users.id),
    opportunityKey: text('opportunity_key').notNull(),
    type: text('type').notNull(), // 'save' | 'pass' | 'request_info' | 'leverage_created' | ...
    metaJson: text('meta_json'), // JSON string
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Leverage offers (persisted)
export const leverageOffers = sqliteTable('leverage_offers', {
    id: text('id').primaryKey(), // UUID
    donorId: text('donor_id').notNull().references(() => users.id),
    opportunityKey: text('opportunity_key').notNull(),
    anchorAmount: integer('anchor_amount').notNull(),
    matchMode: text('match_mode').notNull(), // 'match' | 'remainder'
    challengeGoal: integer('challenge_goal').notNull(),
    topUpCap: integer('top_up_cap').notNull(),
    deadline: text('deadline').notNull(), // ISO date string (YYYY-MM-DD)
    termsJson: text('terms_json'), // JSON string
    status: text('status').notNull().default('created'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
