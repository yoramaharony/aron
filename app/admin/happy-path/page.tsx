'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminHappyPathPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState<'general' | 'jewish'>('jewish');
  const [resetFirst, setResetFirst] = useState(true);

  const seed = async () => {
    setLoading(true);
    setError('');
    try {
      const qp = new URLSearchParams();
      qp.set('theme', theme);
      if (resetFirst) qp.set('reset', '1');
      const res = await fetch(`/api/admin/demo-seed?${qp.toString()}`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Seed failed');
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Seed failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Happy Path Demo</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            One-click seed + guided links to verify donor core flows are DB/API-backed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="opacity-80">Theme</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="h-10 rounded-md bg-white/5 border border-white/10 px-3 text-[var(--text-primary)]"
            >
              <option value="jewish">Jewish causes</option>
              <option value="general">General</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] select-none">
            <input
              type="checkbox"
              checked={resetFirst}
              onChange={(e) => setResetFirst(e.target.checked)}
              className="accent-[var(--color-gold)]"
            />
            Reset first
          </label>
          <Button variant="gold" onClick={seed} isLoading={loading}>
            Seed Demo Data
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}

      <Card className="p-6 space-y-4">
        <div className="text-sm font-semibold text-[var(--text-primary)]">Steps</div>
        <ol className="list-decimal pl-5 text-sm text-[var(--text-secondary)] space-y-2">
          <li>Click “Seed Demo Data”.</li>
          <li>Login as the demo donor and open Concierge AI.</li>
          <li>Send 1–2 messages and then open Impact Vision Board (it should update).</li>
          <li>Open Donor Opportunities → click the seeded submission → Shortlist / Pass / Leverage.</li>
        </ol>
      </Card>

      {data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Demo credentials</div>
            <div className="text-sm text-[var(--text-secondary)]">
              Donor: <span className="font-mono">{data.donor.email}</span> / <span className="font-mono">{data.donor.password}</span>
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              Organization: <span className="font-mono">{data.organization.email}</span> /{' '}
              <span className="font-mono">{data.organization.password}</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] opacity-80">
              Seed: <span className="font-mono">{data.theme}</span> {data.reset ? '(reset)' : ''}
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Quick links</div>
            <div className="flex flex-col gap-2 text-sm">
              <a className="text-[var(--color-gold)] underline" href={data.submitUrl}>
                Public submission link (seeded)
              </a>
              <a className="text-[var(--color-gold)] underline" href={data.donorDashboard}>
                Donor dashboard
              </a>
              <a className="text-[var(--color-gold)] underline" href={data.concierge}>
                Concierge AI
              </a>
              <a className="text-[var(--color-gold)] underline" href={data.visionBoard}>
                Impact Vision Board
              </a>
              <a className="text-[var(--color-gold)] underline" href={data.moreInfoUrl}>
                More-info form (public)
              </a>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

