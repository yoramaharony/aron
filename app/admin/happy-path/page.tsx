'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminHappyPathPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const seed = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/demo-seed', { method: 'POST' });
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
        <Button variant="gold" onClick={seed} isLoading={loading}>
          Seed Demo Data
        </Button>
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
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

