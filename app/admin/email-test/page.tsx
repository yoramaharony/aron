'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Mode = 'template' | 'custom';
type TemplateKey = 'invite_donor' | 'invite_requestor' | 'forgot_password';

export default function AdminEmailTestPage() {
  const [mode, setMode] = useState<Mode>('template');
  const [to, setTo] = useState('');
  const [templateKey, setTemplateKey] = useState<TemplateKey>('invite_donor');
  const [note, setNote] = useState('');

  const [subject, setSubject] = useState('B"H — Test email from Aron');
  const [text, setText] = useState('B"H\n\nThis is a Mailgun test email from Aron.\n');
  const [html, setHtml] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const payload = useMemo(() => {
    if (mode === 'custom') {
      return { mode, to, subject, text, html: html.trim() ? html : null };
    }
    return { mode, to, templateKey, note };
  }, [mode, to, subject, text, html, templateKey, note]);

  const send = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to send');
      setResult(data);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Email Test</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Send a one-off email via Mailgun to confirm env configuration and templates.
        </p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            className={[
              'rounded-2xl border p-4 text-left transition-colors bg-[rgba(255,255,255,0.02)]',
              mode === 'template'
                ? 'border-[rgba(255,43,214,0.65)] shadow-[0_0_0_1px_rgba(255,43,214,0.30),0_18px_60px_-45px_rgba(255,43,214,0.35)]'
                : 'border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.16)]',
            ].join(' ')}
            onClick={() => setMode('template')}
          >
            <div className="text-lg font-semibold">Use template</div>
            <div className="text-sm text-[var(--text-tertiary)]">Renders from DB `email_templates`</div>
          </button>

          <button
            type="button"
            className={[
              'rounded-2xl border p-4 text-left transition-colors bg-[rgba(255,255,255,0.02)]',
              mode === 'custom'
                ? 'border-[rgba(255,43,214,0.65)] shadow-[0_0_0_1px_rgba(255,43,214,0.30),0_18px_60px_-45px_rgba(255,43,214,0.35)]'
                : 'border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.16)]',
            ].join(' ')}
            onClick={() => setMode('custom')}
          >
            <div className="text-lg font-semibold">Custom email</div>
            <div className="text-sm text-[var(--text-tertiary)]">Manual subject/body</div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
              To
            </div>
            <input
              className="input-field"
              placeholder="someone@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          {mode === 'template' ? (
            <div className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
                Template
              </div>
              <select
                className="input-field"
                value={templateKey}
                onChange={(e) => setTemplateKey(e.target.value as TemplateKey)}
              >
                <option value="invite_donor">invite_donor</option>
                <option value="invite_requestor">invite_requestor</option>
                <option value="forgot_password">forgot_password</option>
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
                Subject
              </div>
              <input
                className="input-field"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}
        </div>

        {mode === 'template' ? (
          <div className="space-y-2">
            <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
              Note (optional)
            </div>
            <input
              className="input-field"
              placeholder="Optional note inserted into invite templates"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="text-xs text-[var(--text-tertiary)]">
              Uses demo vars for `invite_url`, `invite_code`, and `reset_url`.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
                Text body
              </div>
              <textarea className="input-field min-h-[140px]" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
                HTML body (optional)
              </div>
              <textarea className="input-field min-h-[140px]" value={html} onChange={(e) => setHtml(e.target.value)} />
            </div>
          </div>
        )}

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-3 text-sm text-red-300 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-3 text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button variant="gold" onClick={send} isLoading={loading}>
            Send test email
          </Button>
        </div>
      </Card>
    </div>
  );
}

