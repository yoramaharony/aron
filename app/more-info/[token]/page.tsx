'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type State =
  | { status: 'loading' }
  | { status: 'invalid'; message: string }
  | { status: 'valid'; orgName?: string | null; orgEmail?: string | null; title?: string | null; amountRequested?: number | null; existing?: any; submittedAt?: any };

export default function MoreInfoPage() {
  const params = useParams();
  const token = String((params as any)?.token ?? '');

  const [state, setState] = useState<State>({ status: 'loading' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [form, setForm] = useState({
    orgWebsite: '',
    mission: '',
    program: '',
    geo: '',
    beneficiaries: '',
    budget: '',
    amountRequested: '',
    timeline: '',
    governance: '',
    leadership: '',
    proofLinks: '',
  });

  const complexity = (() => {
    if (state.status !== 'valid') return 'basic' as const;
    const amt = typeof state.amountRequested === 'number' ? state.amountRequested : null;
    if (!amt) return 'basic' as const;
    if (amt <= 25000) return 'basic' as const;
    if (amt <= 100000) return 'detailed' as const;
    return 'comprehensive' as const;
  })();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/more-info/${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.valid) throw new Error(data?.error || 'Invalid link');
        if (cancelled) return;

        const existing = data?.existing ?? null;
        if (existing) {
          setForm((p) => ({
            ...p,
            orgWebsite: existing.orgWebsite ?? '',
            mission: existing.mission ?? '',
            program: existing.program ?? '',
            geo: existing.geo ?? '',
            beneficiaries: existing.beneficiaries ?? '',
            budget: existing.budget ?? '',
            amountRequested: existing.amountRequested ?? '',
            timeline: existing.timeline ?? '',
            governance: existing.governance ?? '',
            leadership: existing.leadership ?? '',
            proofLinks: existing.proofLinks ?? '',
          }));
        }

        setState({
          status: 'valid',
          orgName: data.orgName ?? null,
          orgEmail: data.orgEmail ?? null,
          title: data.title ?? null,
          amountRequested: typeof data.amountRequested === 'number' ? data.amountRequested : null,
          existing,
          submittedAt: data.submittedAt ?? null,
        });
      } catch (e: any) {
        if (cancelled) return;
        setState({ status: 'invalid', message: String(e?.message || 'Invalid link') });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`/api/more-info/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to submit');
      setSubmitSuccess(true);
    } catch (e: any) {
      setSubmitError(String(e?.message || 'Failed to submit'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Aron • Requested info</div>
          <h1 className="text-3xl md:text-4xl font-semibold mt-3">Provide more detail</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            A donor requested additional information. Keep it concise—this is Phase 1 MVP.
          </p>
        </div>

        <Card className="p-6 md:p-8 space-y-5">
          {state.status === 'loading' ? (
            <div className="text-[var(--text-secondary)]">Loading…</div>
          ) : state.status === 'invalid' ? (
            <div className="space-y-2">
              <div className="text-red-300 font-semibold">This link is not valid.</div>
              <div className="text-sm text-[var(--text-tertiary)]">{state.message}</div>
            </div>
          ) : submitSuccess ? (
            <div className="space-y-2">
              <div className="text-[var(--color-gold)] font-semibold">Submitted.</div>
              <div className="text-sm text-[var(--text-secondary)]">
                Thanks—your additional information is now visible to the donor.
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">Context</div>
                <div className="mt-2 text-sm text-[var(--text-secondary)]">
                  <div><span className="text-[var(--text-tertiary)]">Organization:</span> {state.orgName ?? '—'}</div>
                  <div><span className="text-[var(--text-tertiary)]">Email:</span> {state.orgEmail ?? '—'}</div>
                  <div><span className="text-[var(--text-tertiary)]">Submission:</span> {state.title ?? '—'}</div>
                  <div><span className="text-[var(--text-tertiary)]">Complexity:</span> {complexity === 'basic' ? 'Basic' : complexity === 'detailed' ? 'Detailed' : 'Comprehensive'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Org website</label>
                  <input className="input-field" value={form.orgWebsite} onChange={(e) => setForm((p) => ({ ...p, orgWebsite: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Geo (where you operate)</label>
                  <input className="input-field" value={form.geo} onChange={(e) => setForm((p) => ({ ...p, geo: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Budget (high level)</label>
                  <input className="input-field" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} placeholder="e.g. $2.1M annual" />
                </div>
                <div>
                  <label className="label">Amount requested</label>
                  <input className="input-field" value={form.amountRequested} onChange={(e) => setForm((p) => ({ ...p, amountRequested: e.target.value }))} placeholder="e.g. $250k" />
                </div>
              </div>

              <div>
                <label className="label">Mission (2–3 sentences)</label>
                <textarea className="input-field min-h-[90px] resize-y" value={form.mission} onChange={(e) => setForm((p) => ({ ...p, mission: e.target.value }))} />
              </div>

              <div>
                <label className="label">Program detail (what you’ll do with the funds)</label>
                <textarea className="input-field min-h-[110px] resize-y" value={form.program} onChange={(e) => setForm((p) => ({ ...p, program: e.target.value }))} />
              </div>

              {complexity !== 'basic' ? (
                <div>
                  <label className="label">Beneficiaries + outcomes (how you’ll measure)</label>
                  <textarea className="input-field min-h-[100px] resize-y" value={form.beneficiaries} onChange={(e) => setForm((p) => ({ ...p, beneficiaries: e.target.value }))} />
                </div>
              ) : null}

              {complexity !== 'basic' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Timeline</label>
                    <textarea className="input-field min-h-[90px] resize-y" value={form.timeline} onChange={(e) => setForm((p) => ({ ...p, timeline: e.target.value }))} placeholder="e.g. start in 14 days, complete in 6 months" />
                  </div>
                  <div>
                    <label className="label">Governance (board / oversight)</label>
                    <textarea className="input-field min-h-[90px] resize-y" value={form.governance} onChange={(e) => setForm((p) => ({ ...p, governance: e.target.value }))} />
                  </div>
                </div>
              ) : null}

              {complexity === 'comprehensive' ? (
                <div>
                  <label className="label">Leadership (key people)</label>
                  <textarea className="input-field min-h-[90px] resize-y" value={form.leadership} onChange={(e) => setForm((p) => ({ ...p, leadership: e.target.value }))} />
                </div>
              ) : null}

              <div>
                <label className="label">Proof links (optional)</label>
                <textarea className="input-field min-h-[70px] resize-y" value={form.proofLinks} onChange={(e) => setForm((p) => ({ ...p, proofLinks: e.target.value }))} placeholder="Paste links to docs, audited statements, reports, references…" />
              </div>

              {submitError ? <div className="text-sm text-red-300">{submitError}</div> : null}

              <div className="pt-2 flex items-center justify-end">
                <Button variant="gold" onClick={submit} isLoading={submitting}>
                  Submit more info
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

