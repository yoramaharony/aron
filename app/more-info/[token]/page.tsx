'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, FileText, Sparkles, Upload, X as XIcon } from 'lucide-react';
import { getMoreInfoDemoData } from '@/lib/demo-autofill';
import { AronLogo } from '@/components/layout/AronLogo';

type UploadedFile = { name: string; url: string; size: number; type: string };

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
  const [supportingDocs, setSupportingDocs] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          if (Array.isArray(existing.supportingDocs)) {
            setSupportingDocs(existing.supportingDocs);
          }
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

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const res = await fetch(`/api/more-info/${encodeURIComponent(token)}/upload`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      const uploaded = (data?.files ?? []) as UploadedFile[];
      setSupportingDocs((prev) => [...prev, ...uploaded]);
    } catch (e: any) {
      setUploadError(String(e?.message || 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = (url: string) => {
    setSupportingDocs((prev) => prev.filter((d) => d.url !== url));
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`/api/more-info/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, supportingDocs }),
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
          <a href="/" className="inline-block mb-4">
            <AronLogo imgClassName="aron-logo aron-logo-animated-soft h-8 w-auto object-contain" />
          </a>
          <h1 className="text-3xl md:text-4xl font-semibold mt-1">Provide more detail</h1>
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

              {/* Supporting documents upload */}
              <div>
                <label className="label">Supporting documents (optional)</label>
                <div
                  className={[
                    'p-6 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 transition-all cursor-pointer',
                    dragOver ? 'bg-[rgba(var(--accent-rgb),0.10)]' : 'hover:bg-[var(--bg-surface)]',
                  ].join(' ')}
                  style={{ border: '2px dashed var(--border-subtle)' }}
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer?.files?.length) await uploadFiles(e.dataTransfer.files);
                  }}
                >
                  {uploading ? (
                    <div className="text-sm text-[var(--text-secondary)]">Uploading…</div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-tertiary)]">
                        <Upload size={20} />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">Drop files here or click to browse</div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-1">PDF, Excel, or images — max 10MB each</div>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
                  className="sr-only"
                  onChange={async (e) => {
                    const picked = Array.from(e.currentTarget.files ?? []);
                    e.currentTarget.value = '';
                    if (picked.length) await uploadFiles(picked);
                  }}
                />
                {uploadError && <div className="mt-2 text-xs text-red-300">{uploadError}</div>}
                {supportingDocs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {supportingDocs.map((doc) => (
                      <div key={doc.url} className="flex items-center justify-between p-3 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-[var(--text-tertiary)] shrink-0" />
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm truncate text-[var(--text-primary)] hover:underline">{doc.name}</a>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Check size={14} className="text-[rgba(34,197,94,0.92)]" />
                          <button type="button" onClick={() => removeDoc(doc.url)} className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors" title="Remove">
                            <XIcon size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitError ? <div className="text-sm text-red-300">{submitError}</div> : null}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setForm(getMoreInfoDemoData())}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-purple-400 border border-purple-400/25 bg-purple-400/8 hover:bg-purple-400/15 transition-colors"
                  title="Auto-fill with demo data"
                >
                  <Sparkles size={14} />
                  AI Fill
                </button>
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

