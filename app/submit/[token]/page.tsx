'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type ValidateState =
  | { status: 'loading' }
  | { status: 'invalid'; message: string }
  | { status: 'valid'; orgName?: string | null; orgEmail?: string | null };

export default function SubmitToDonorPage() {
  const params = useParams();
  const token = String((params as any)?.token ?? '');

  const [validateState, setValidateState] = useState<ValidateState>({ status: 'loading' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [form, setForm] = useState({
    orgName: '',
    orgEmail: '',
    contactName: '',
    contactEmail: '',
    title: '',
    amountRequested: '',
    summary: '',
    videoUrl: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/submission-links/public/${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.valid) {
          throw new Error(data?.reason || 'Invalid link');
        }
        if (cancelled) return;
        setValidateState({ status: 'valid', orgName: data.orgName ?? null, orgEmail: data.orgEmail ?? null });
        setForm((prev) => ({
          ...prev,
          orgName: data.orgName ?? prev.orgName,
          orgEmail: data.orgEmail ?? prev.orgEmail,
        }));
      } catch (e: any) {
        if (cancelled) return;
        const msg = String(e?.message || 'Invalid link');
        setValidateState({ status: 'invalid', message: msg });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const canSubmit = useMemo(() => {
    if (validateState.status !== 'valid') return false;
    if (!form.summary.trim()) return false;
    return true;
  }, [validateState.status, form.summary]);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          orgName: form.orgName,
          orgEmail: form.orgEmail,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          title: form.title,
          amountRequested: form.amountRequested ? Number(form.amountRequested) : null,
          summary: form.summary,
          videoUrl: form.videoUrl,
        }),
      });
      const data = await res.json();
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
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
            Aron • Private Link
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold mt-3">Submit a brief request</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Keep this lightweight. Share what you need and why in a few sentences (or include a short video link).
          </p>
        </div>

        <Card className="p-6 md:p-8">
          {validateState.status === 'loading' ? (
            <div className="text-[var(--text-secondary)]">Validating link…</div>
          ) : validateState.status === 'invalid' ? (
            <div className="space-y-3">
              <div className="text-red-300 font-semibold">This submission link is not valid.</div>
              <div className="text-[var(--text-tertiary)] text-sm">
                Reason: <span className="font-mono">{validateState.message}</span>
              </div>
            </div>
          ) : submitSuccess ? (
            <div className="space-y-3">
              <div className="text-[var(--color-gold)] font-semibold">Submitted.</div>
              <div className="text-[var(--text-secondary)]">
                Your message has been received. If the donor wants more detail, they’ll follow up through the next step.
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Organization</label>
                  <input
                    className="input-field"
                    value={form.orgName}
                    onChange={(e) => setForm((p) => ({ ...p, orgName: e.target.value }))}
                    placeholder="Organization name"
                  />
                </div>
                <div>
                  <label className="label">Organization email (optional)</label>
                  <input
                    className="input-field"
                    value={form.orgEmail}
                    onChange={(e) => setForm((p) => ({ ...p, orgEmail: e.target.value }))}
                    placeholder="name@org.org"
                  />
                </div>
                <div>
                  <label className="label">Your name (optional)</label>
                  <input
                    className="input-field"
                    value={form.contactName}
                    onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <label className="label">Your email (optional)</label>
                  <input
                    className="input-field"
                    value={form.contactEmail}
                    onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="label whitespace-nowrap">Title (optional)</label>
                  <input
                    className="input-field"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Expansion of pediatric oncology unit"
                  />
                </div>
                <div>
                  <label className="label whitespace-nowrap">Amount (optional)</label>
                  <input
                    className="input-field"
                    value={form.amountRequested}
                    onChange={(e) => setForm((p) => ({ ...p, amountRequested: e.target.value }))}
                    placeholder="e.g. 50000"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className="label">Brief summary (required)</label>
                <textarea
                  className="input-field min-h-[120px] resize-y"
                  value={form.summary}
                  onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="In a few sentences: what problem, what you’re asking for, and why now."
                />
              </div>

              <div>
                <label className="label">Video link (optional)</label>
                <input
                  className="input-field"
                  value={form.videoUrl}
                  onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="Paste a Loom/Drive/YouTube link (private/unlisted)"
                />
                <div className="text-xs text-[var(--text-tertiary)] mt-2">
                  MVP: link-only. Upload handling can come later.
                </div>
              </div>

              {submitError ? (
                <div className="text-sm text-red-300">{submitError}</div>
              ) : null}

              <div className="pt-2 flex items-center justify-end">
                <Button variant="gold" onClick={submit} disabled={!canSubmit} isLoading={submitting}>
                  Submit
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

