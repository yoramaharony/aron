type MailgunConfig = {
  apiKey: string;
  domain: string;
  from: string;
};

function getMailgunConfig(): MailgunConfig {
  const apiKey = process.env.MAILGUN_API_KEY || '';
  const domain = process.env.MAILGUN_DOMAIN || '';
  const from = process.env.MAILGUN_FROM || '';

  const missing: string[] = [];
  if (!apiKey) missing.push('MAILGUN_API_KEY');
  if (!domain) missing.push('MAILGUN_DOMAIN');
  if (!from) missing.push('MAILGUN_FROM');

  if (missing.length) {
    const msg = `Mailgun is not configured. Missing: ${missing.join(', ')}.`;
    const hint =
      'Add these env vars to yesod-platform/.env and restart `npm run dev`.\n' +
      'Example:\n' +
      'MAILGUN_API_KEY=key-...\n' +
      'MAILGUN_DOMAIN=mg.yourdomain.com\n' +
      'MAILGUN_FROM="Aron <no-reply@mg.yourdomain.com>"';
    const err = new Error(`${msg}\n${hint}`);
    // @ts-expect-error attach hint for callers
    err.hint = hint;
    throw err;
  }

  return { apiKey, domain, from };
}

export async function sendMailgunEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string | null;
  from?: string | null;
}): Promise<{ id?: string; message?: string }> {
  const cfg = getMailgunConfig();

  const url = `https://api.mailgun.net/v3/${encodeURIComponent(cfg.domain)}/messages`;
  const auth = Buffer.from(`api:${cfg.apiKey}`).toString('base64');

  const params = new URLSearchParams();
  params.set('from', (input.from || cfg.from).trim());
  params.set('to', input.to.trim());
  params.set('subject', input.subject);
  params.set('text', input.text);
  if (input.html) params.set('html', input.html);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const raw = await res.text();
  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(`Mailgun send failed (${res.status}). ${json?.message || raw || 'Unknown error'}`);
  }

  return { id: json?.id, message: json?.message };
}

