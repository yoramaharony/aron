'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Tpl = {
  key: string;
  name: string;
  subject: string;
  textBody: string;
  htmlBody?: string | null;
  from?: string | null;
  enabled: number;
};

export default function AdminEmailTemplatesPage() {
  const [rows, setRows] = useState<Tpl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('invite_donor');
  const [draft, setDraft] = useState<Partial<Tpl>>({});
  const selected = useMemo(() => rows.find((r) => r.key === selectedKey) || null, [rows, selectedKey]);

  const refresh = async () => {
    const res = await fetch('/api/admin/email-templates');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Failed to load templates');
    setRows(data.templates ?? []);
  };

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDraft({
      key: selected.key,
      name: selected.name,
      subject: selected.subject,
      textBody: selected.textBody,
      htmlBody: selected.htmlBody ?? '',
      from: selected.from ?? '',
      enabled: selected.enabled ?? 1,
    });
  }, [selected?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!draft.key) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      await refresh();
    } catch (e: any) {
      setError(String(e?.message || 'Save failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Email templates</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Admin-only. Edit copy without code changes. Defaults are seeded by <span className="font-mono">db:ensure</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refresh().catch(() => {})}>
            Refresh
          </Button>
          <Button variant="gold" onClick={save} isLoading={loading} disabled={!draft.key}>
            Save
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-300 whitespace-pre-wrap">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="text-sm font-semibold text-[var(--text-primary)]">Templates</div>
          <div className="space-y-2">
            {rows.map((t) => (
              <button
                key={t.key}
                className={[
                  'w-full text-left rounded-lg border px-3 py-2 transition',
                  selectedKey === t.key
                    ? 'border-[rgba(var(--accent-rgb), 0.25)] bg-[rgba(var(--accent-rgb), 0.10)] text-[var(--text-primary)]'
                    : 'border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ].join(' ')}
                onClick={() => setSelectedKey(t.key)}
              >
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-[var(--text-tertiary)] font-mono">{t.key}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4 lg:col-span-2">
          {!selected ? (
            <div className="text-sm text-[var(--text-tertiary)]">Select a template.</div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{selected.name}</div>
                  <div className="text-xs text-[var(--text-tertiary)] font-mono">{selected.key}</div>
                </div>
                <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.enabled)}
                    onChange={(e) => setDraft((p) => ({ ...p, enabled: e.target.checked ? 1 : 0 }))}
                    className="accent-[var(--color-gold)]"
                  />
                  Enabled
                </label>
              </div>

              <div className="space-y-2">
                <div className="label">From (optional override)</div>
                <input
                  className="input-field"
                  value={String(draft.from ?? '')}
                  onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))}
                  placeholder='e.g. "Aron <no-reply@mg.example.com>"'
                />
              </div>

              <div className="space-y-2">
                <div className="label">Subject</div>
                <input
                  className="input-field"
                  value={String(draft.subject ?? '')}
                  onChange={(e) => setDraft((p) => ({ ...p, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <div className="label">Text body</div>
                <textarea
                  className="input-field font-mono text-xs min-h-[200px]"
                  value={String(draft.textBody ?? '')}
                  onChange={(e) => setDraft((p) => ({ ...p, textBody: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <div className="label">HTML body (optional)</div>
                <textarea
                  className="input-field font-mono text-xs min-h-[200px]"
                  value={String(draft.htmlBody ?? '')}
                  onChange={(e) => setDraft((p) => ({ ...p, htmlBody: e.target.value }))}
                />
              </div>

              <div className="text-xs text-[var(--text-tertiary)] whitespace-pre-wrap">
                Placeholders: {'{{inviter_name}}'} {'{{invite_url}}'} {'{{invite_code}}'} {'{{note}}'} {'{{expires_minutes}}'} {'{{reset_url}}'}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

