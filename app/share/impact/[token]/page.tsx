import { redirect } from 'next/navigation';
import { db } from '@/db';
import { donorProfiles } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

function fmtDate(v: any) {
  try {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString();
  } catch {
    return null;
  }
}

export default async function ShareImpactPage({ params, searchParams }: { params: { token: string }; searchParams?: { print?: string } }) {
  const session = await getSession();
  if (!session) redirect('/auth/login');
  if (session.role !== 'donor' && session.role !== 'admin') redirect('/auth/login?role=admin');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolvedParams: any = await (params as any);
  const token = String(resolvedParams?.token || '');
  if (!token) redirect('/donor/impact');

  const profile = await db.select().from(donorProfiles).where(eq(donorProfiles.shareToken, token)).get();
  if (!profile) {
    return (
      <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center p-8">
        <div className="max-w-xl w-full rounded-2xl border border-[var(--border-subtle)] bg-[rgba(10,10,14,0.70)] backdrop-blur p-8">
          <div className="text-xl font-semibold">Impact Vision not found</div>
          <div className="text-sm text-[var(--text-secondary)] mt-2">This share link is invalid or has been rotated.</div>
        </div>
      </div>
    );
  }

  const board = profile.boardJson ? JSON.parse(profile.boardJson) : null;
  const vision = profile.visionJson ? JSON.parse(profile.visionJson) : null;
  const isPrint = searchParams?.print === '1';

  const summaryLines = [
    `Impact Vision`,
    vision?.pillars?.length ? `Pillars: ${vision.pillars.join(', ')}` : null,
    vision?.geoFocus?.length ? `Geo: ${vision.geoFocus.join(', ')}` : null,
    vision?.givingBudget ? `Budget: ${vision.givingBudget}` : null,
    vision?.timeHorizon ? `Horizon: ${vision.timeHorizon}` : null,
    vision?.outcome12m ? `12-month outcome: ${vision.outcome12m}` : null,
    vision?.updateCadence ? `Update cadence: ${vision.updateCadence}` : null,
    vision?.verificationLevel ? `Verification: ${vision.verificationLevel}` : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-6 no-print">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Read-only</div>
            <h1 className="text-3xl font-semibold mt-2">Impact Vision Board</h1>
            <div className="text-sm text-[var(--text-secondary)] mt-2">
              Last updated: {fmtDate(profile.updatedAt) ?? '—'}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              className="btn btn-outline btn-sm"
              href={`/donor/impact`}
            >
              Back to dashboard
            </a>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (typeof window === 'undefined') return;
                window.print();
              }}
            >
              Print / PDF
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(10,10,14,0.70)] backdrop-blur p-6">
            <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Impact Vision</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {(board?.pillars ?? []).map((p: any) => (
                <div key={p.title} className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-5">
                  <div className="text-lg font-semibold">{p.title}</div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">{p.description}</div>
                </div>
              ))}
              {(!board?.pillars || board.pillars.length === 0) ? (
                <div className="text-sm text-[var(--text-tertiary)]">No board data yet.</div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(10,10,14,0.70)] backdrop-blur p-6">
              <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Summary</div>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--text-primary)] font-mono">{summaryLines.join('\n')}</pre>
            </div>

            {!isPrint ? (
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(10,10,14,0.70)] backdrop-blur p-6 no-print">
                <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Share link</div>
                <div className="mt-2 text-sm text-[var(--text-secondary)] font-mono break-all">{`/share/impact/${token}`}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

