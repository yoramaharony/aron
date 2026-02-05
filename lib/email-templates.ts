import { db } from '@/db';
import { emailTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderTemplate(str: string, vars: Record<string, string>) {
  return str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => vars[k] ?? '');
}

export async function getEmailTemplate(key: string) {
  return await db.select().from(emailTemplates).where(eq(emailTemplates.key, key)).get();
}

export async function renderEmailFromTemplate(opts: {
  key: 'invite_donor' | 'invite_requestor' | 'forgot_password';
  vars: Record<string, string>;
}) {
  const tpl = await getEmailTemplate(opts.key);
  if (!tpl || tpl.enabled === 0) {
    throw new Error(`Email template not found or disabled: ${opts.key}`);
  }

  const vars = { ...opts.vars };
  // Convenience blocks for optional note.
  const note = (vars.note || '').trim();
  vars.note_block = note ? `\n\nNote:\n${note}` : '';
  vars.note_block_html = note ? `<p><strong>Note:</strong><br/>${escapeHtml(note)}</p>` : '';

  const subject = renderTemplate(tpl.subject, vars);
  const text = renderTemplate(tpl.textBody, vars);
  const html = tpl.htmlBody ? renderTemplate(tpl.htmlBody, { ...vars, note_block_html: vars.note_block_html }) : null;

  return { subject, text, html, from: tpl.from ?? null };
}

