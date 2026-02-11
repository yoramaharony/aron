'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Check, ChevronRight, Upload, FileText, Globe, DollarSign } from 'lucide-react';
import { JEWISH_DEMO_CATEGORIES, type JewishDemoCategory } from '@/lib/categories';

export default function RequestWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submittedId, setSubmittedId] = useState<string | null>(null);

    const defaultCategory = JEWISH_DEMO_CATEGORIES[0] ?? 'Chesed / Community support';
    const [formData, setFormData] = useState<{
        title: string;
        category: JewishDemoCategory | string;
        location: string;
        target: number;
        summary: string;
    }>({
        title: '',
        category: defaultCategory,
        location: '',
        target: 500000,
        summary: '',
    });
    const [fieldErr, setFieldErr] = useState<{
        title?: string;
        location?: string;
        summary?: string;
        target?: string;
        budget?: string;
    }>({});
    const [stepErr, setStepErr] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [dragOver, setDragOver] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const [coverUrl, setCoverUrl] = useState<string>('/assets/default-request-cover.svg');
    const [coverErr, setCoverErr] = useState<string>('');
    const [coverOk, setCoverOk] = useState<string>('');
    const [coverLocalPreview, setCoverLocalPreview] = useState<string | null>(null);

    type UploadedFile = { name: string; url: string; size: number; type: string };
    const [budgetFile, setBudgetFile] = useState<UploadedFile | null>(null);
    const [additionalFiles, setAdditionalFiles] = useState<UploadedFile[]>([]);
    const [uploadError, setUploadError] = useState('');
    const budgetInputRef = useRef<HTMLInputElement | null>(null);
    const additionalInputRef = useRef<HTMLInputElement | null>(null);
    const coverInputRef = useRef<HTMLInputElement | null>(null);

    const uploadToServer = async (files: FileList) => {
        setUploadError('');
        setUploadStatus('');
        setUploading(true);
        setUploadProgress(10);

        const interval = window.setInterval(() => {
            setUploadProgress((p) => (p >= 90 ? 90 : p + 10));
        }, 180);

        try {
            const fd = new FormData();
            fd.append('folder', 'evidence');
            Array.from(files).forEach((f) => fd.append('files', f));
            const res = await fetch('/api/uploads', { method: 'POST', body: fd });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Upload failed');
            setUploadProgress(100);
            const storage = data?.storage ? String(data.storage) : '';
            if (storage) setUploadStatus(`Uploaded (${storage}).`);
            const out = (data?.files ?? []) as UploadedFile[];
            if (!out.length) throw new Error('Upload returned no files');
            return out;
        } catch (e: any) {
            const msg = String(e?.message || 'Upload failed');
            setUploadStatus(`Upload failed: ${msg}`);
            throw e;
        } finally {
            window.clearInterval(interval);
            window.setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
            }, 250);
        }
    };

    const uploadCover = async (file: File) => {
        setUploadError('');
        setCoverErr('');
        setCoverOk('');
        setCoverUploading(true);
        try {
            const fd = new FormData();
            fd.append('folder', 'covers');
            fd.append('files', file);
            const res = await fetch('/api/uploads', { method: 'POST', body: fd });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Cover upload failed');
            const f = data?.file ?? (data?.files?.[0] ?? null);
            if (!f?.url) throw new Error('Cover upload returned no URL');
            const storage = data?.storage ? String(data.storage) : '';
            // Cache-bust so the preview updates immediately even if the URL is reused by the browser cache.
            const u = String(f.url);
            const withBust = u.includes('?') ? `${u}&v=${Date.now()}` : `${u}?v=${Date.now()}`;
            setCoverUrl(withBust);
            setCoverOk(`Cover uploaded${storage ? ` (${storage})` : ''}.`);
            window.setTimeout(() => setCoverOk(''), 1400);
            return u;
        } catch (e: any) {
            const msg = String(e?.message || 'Cover upload failed');
            setCoverErr(msg);
            throw e;
        } finally {
            setCoverUploading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Final validation guard
            const ok = validateStep(4);
            if (!ok) {
                setLoading(false);
                return;
            }
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    location: formData.location || 'Remote',
                    summary: formData.summary,
                    targetAmount: Number(formData.target),
                    coverUrl,
                    evidence: {
                        budget: budgetFile,
                        files: additionalFiles,
                    },
                }),
            });

            const data = await res.json().catch(() => ({} as any));
            if (!res.ok) throw new Error(data?.error || 'Failed to create request');

            setSubmittedId(data.id);
            setStep(5); // Success state
        } catch (e) {
            alert(String((e as any)?.message || 'Error submitting request. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const validateStep = (s: number) => {
        const nextErr: typeof fieldErr = {};
        const title = String(formData.title || '').trim();
        const location = String(formData.location || '').trim();
        const summary = String(formData.summary || '').trim();
        const target = Number(formData.target);

        if (s === 1) {
            if (!title) nextErr.title = 'Project title is required.';
            if (!location) nextErr.location = 'Location is required.';
            if (!summary) nextErr.summary = 'Summary is required.';
        }
        if (s === 2) {
            if (!Number.isFinite(target) || target <= 0) nextErr.target = 'Funding target must be greater than 0.';
        }
        if (s === 3 || s === 4) {
            if (!budgetFile) nextErr.budget = 'Project budget file is required.';
        }

        setFieldErr(nextErr);
        const hasAny = Object.keys(nextErr).length > 0;
        setStepErr(hasAny ? 'Please fill out the required fields before continuing.' : '');
        return !hasAny;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">New Funding Request</h1>
                    <p className="text-secondary">Draft your opportunity for the Aron Private Network.</p>
                </div>
                <div className="text-sm font-mono text-tertiary">Step {step} of 4</div>
            </div>

            <div className="grid grid-cols-2 gap-8" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
                {/* Left: Wizard Form */}
                <div>
                    <Card className="p-8">

                        {step === 1 && (
                            <div className="fade-in">
                                <h2 className="text-xl flex items-center mb-6"><Globe size={20} className="text-gold" style={{ marginRight: 8 }} /> Basics</h2>
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label className="label">Project Title <span className="text-red-300">*</span></label>
                                        <input
                                            className={`input-field ${fieldErr.title ? 'border-red-500' : ''}`}
                                            placeholder="e.g. Community Center Expansion"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        {fieldErr.title ? <div className="mt-1 text-xs text-red-300">{fieldErr.title}</div> : null}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Category</label>
                                            <select
                                                className="input-field"
                                                value={formData.category}
                                                onChange={(e) => {
                                                    const v = String(e.target.value || '');
                                                    const next = (JEWISH_DEMO_CATEGORIES as readonly string[]).includes(v)
                                                        ? (v as JewishDemoCategory)
                                                        : defaultCategory;
                                                    setFormData({ ...formData, category: next });
                                                }}
                                            >
                                                {JEWISH_DEMO_CATEGORIES.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Location <span className="text-red-300">*</span></label>
                                            <input
                                                className={`input-field ${fieldErr.location ? 'border-red-500' : ''}`}
                                                placeholder="City, Country"
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            />
                                            {fieldErr.location ? <div className="mt-1 text-xs text-red-300">{fieldErr.location}</div> : null}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Short Summary (The "Why") <span className="text-red-300">*</span></label>
                                        <textarea
                                            className={`input-field ${fieldErr.summary ? 'border-red-500' : ''}`}
                                            style={{ height: '100px', resize: 'none' }}
                                            placeholder="Describe the impact in 2-3 sentences..."
                                            value={formData.summary}
                                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                        />
                                        {fieldErr.summary ? <div className="mt-1 text-xs text-red-300">{fieldErr.summary}</div> : null}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="fade-in">
                                <h2 className="text-xl flex items-center mb-6"><DollarSign size={20} className="text-gold" style={{ marginRight: 8 }} /> Financials</h2>
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label className="label">Funding Target <span className="text-red-300">*</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }}>$</span>
                                            <input
                                                type="number"
                                                className={`input-field ${fieldErr.target ? 'border-red-500' : ''}`}
                                                style={{ paddingLeft: '32px', fontSize: '1.25rem' }}
                                                value={formData.target}
                                                onChange={e => setFormData({ ...formData, target: Number(e.target.value) })}
                                            />
                                        </div>
                                        {fieldErr.target ? <div className="mt-1 text-xs text-red-300">{fieldErr.target}</div> : null}
                                    </div>
                                    <div className="p-4 rounded bg-[var(--bg-surface)] text-sm text-secondary">
                                        <p><strong>Note:</strong> Aron verifies all budgets. Please ensure your attached budget file matches this figure.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="fade-in">
                                <h2 className="text-xl flex items-center mb-6"><FileText size={20} className="text-gold" style={{ marginRight: 8 }} /> Evidence & Documents</h2>

                                <div
                                    className={[
                                        'p-8 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 mb-3 transition-all',
                                        dragOver ? 'bg-[rgba(var(--accent-rgb),0.10)]' : 'hover:bg-[var(--bg-surface)]',
                                    ].join(' ')}
                                    style={{ border: '2px dashed var(--border-subtle)', cursor: 'pointer' }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Upload Project Budget"
                                    onClick={() => {
                                        setUploadStatus('Opening file picker…');
                                        budgetInputRef.current?.click();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setUploadStatus('Opening file picker…');
                                            budgetInputRef.current?.click();
                                        }
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={async (e) => {
                                        e.preventDefault();
                                        setDragOver(false);
                                        const files = e.dataTransfer?.files;
                                        if (!files || files.length === 0) return;
                                        try {
                                            setUploadStatus(`Dropped: ${files[0]?.name || 'file'} (${Math.round((files[0]?.size || 0) / 1024)} KB)`);
                                            const uploaded = await uploadToServer(files);
                                            if (uploaded[0]) setBudgetFile(uploaded[0]);
                                        } catch (err: any) {
                                            setUploadError(err?.message || 'Upload failed');
                                        }
                                    }}
                                >
                                    {uploading ? (
                                        <div className="w-full max-w-[200px]">
                                            <div className="flex justify-between text-xs text-secondary mb-2">
                                                <span>Uploading...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--color-gold)] transition-all duration-200"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : budgetFile ? (
                                        <div className="flex flex-col items-center text-[rgba(34,197,94,0.92)]">
                                            <div className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.12)] flex items-center justify-center mb-2 border border-[rgba(34,197,94,0.22)]">
                                                <Check size={20} />
                                            </div>
                                            <div className="font-medium text-[var(--text-primary)]">{budgetFile.name}</div>
                                            <div className="text-xs text-secondary">Click to replace</div>
                                            <a
                                                className="mt-2 text-xs text-[var(--color-gold)] hover:underline"
                                                href={budgetFile.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Open uploaded file
                                            </a>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-tertiary group-hover:text-[var(--color-gold)] transition-colors">
                                                <Upload size={24} />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-medium">Upload Project Budget</div>
                                                <div className="text-xs text-secondary mt-1">PDF or Excel (Max 10MB)</div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUploadStatus('Opening file picker…');
                                                    budgetInputRef.current?.click();
                                                }}
                                                disabled={uploading}
                                            >
                                                Choose file
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {uploadStatus ? (
                                    <div className="mb-4 text-xs text-[var(--text-tertiary)] whitespace-pre-wrap">
                                        {uploadStatus}
                                    </div>
                                ) : null}
                                {fieldErr.budget && !budgetFile ? (
                                    <div className="mb-4 text-xs text-red-300">{fieldErr.budget}</div>
                                ) : null}
                                <div>
                                    <label className="label">Additional Files</label>
                                    <div className="space-y-2">
                                        {additionalFiles.length === 0 ? (
                                            <div className="text-xs text-[var(--text-tertiary)]">
                                                Optional: add 501(c)(3) letter, audit, or supporting documents.
                                            </div>
                                        ) : null}

                                        {additionalFiles.map((f) => (
                                            <div
                                                key={f.url}
                                                className="flex justify-between items-center p-3 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText size={16} className="text-secondary shrink-0" />
                                                    <a className="text-sm truncate text-[var(--text-primary)] hover:underline" href={f.url} target="_blank" rel="noreferrer">
                                                        {f.name}
                                                    </a>
                                                </div>
                                                <Check size={16} className="text-[rgba(34,197,94,0.92)] shrink-0" />
                                            </div>
                                        ))}

                                        <div className="flex items-center justify-between gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => additionalInputRef.current?.click()}
                                                disabled={uploading}
                                            >
                                                Add files
                                            </Button>
                                            <div className="text-[10px] text-[var(--text-tertiary)]">
                                                PDF / Excel • max 10MB each
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {uploadError ? (
                                    <div className="mt-4 text-sm text-red-400">{uploadError}</div>
                                ) : null}

                                {/* Hidden file inputs */}
                                <input
                                    ref={budgetInputRef}
                                    type="file"
                                    accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    className="sr-only"
                                    onChange={async (e) => {
                                        const files = e.target.files;
                                        e.target.value = '';
                                        if (!files || files.length === 0) return;
                                        try {
                                            setUploadStatus(`Picked: ${files[0]?.name || 'file'} (${Math.round((files[0]?.size || 0) / 1024)} KB)`);
                                            const uploaded = await uploadToServer(files);
                                            if (uploaded[0]) setBudgetFile(uploaded[0]);
                                        } catch (err: any) {
                                            setUploadError(err?.message || 'Upload failed');
                                        }
                                    }}
                                />
                                <input
                                    ref={additionalInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    className="sr-only"
                                    onChange={async (e) => {
                                        const files = e.target.files;
                                        e.target.value = '';
                                        if (!files || files.length === 0) return;
                                        try {
                                            setUploadStatus(`Picked: ${files[0]?.name || 'file'} (${files.length} file(s))`);
                                            const uploaded = await uploadToServer(files);
                                            setAdditionalFiles((prev) => [...uploaded, ...prev]);
                                        } catch (err: any) {
                                            setUploadError(err?.message || 'Upload failed');
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {step === 4 && (
                            <div className="text-center py-8">
                                <h2 className="text-2xl mb-4">Ready to Submit?</h2>
                                <p className="text-secondary mb-6">Your request will be reviewed by the Aron Concierge team before going live to the network.</p>

                                <Button
                                    onClick={handleSubmit}
                                    variant="gold"
                                    size="lg"
                                    className="w-full"
                                    isLoading={loading}
                                >
                                    Submit Request
                                </Button>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid var(--color-success)' }}>
                                    <Check size={32} style={{ color: 'var(--color-success)' }} />
                                </div>
                                <h2 className="text-2xl mb-2">Request Submitted</h2>
                                <p className="text-secondary mb-6">Reference ID: {submittedId || 'PENDING'}</p>
                                <Button variant="outline" onClick={() => router.push('/requestor/requests')}>View My Requests</Button>
                            </div>
                        )}

                        {/* Navigation */}
                        {stepErr ? (
                            <div className="mt-4 text-sm text-red-300">
                                {stepErr}
                            </div>
                        ) : null}
                        {step < 4 && (
                            <div className="flex justify-end pt-6 mt-6 border-t border-[var(--border-subtle)]">
                                <Button
                                    onClick={() => {
                                        if (!validateStep(step)) return;
                                        setStep(step + 1);
                                    }}
                                    rightIcon={<ChevronRight size={16} />}
                                >
                                    Next Step
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right: Preview */}
                <div className="hidden-mobile">
                    <div className="text-xs uppercase tracking-widest text-secondary mb-4 font-bold">Donor Card Preview</div>
                    <Card noPadding className="opacity-90">
                        <div style={{ height: '160px', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
                            <img
                                src={coverLocalPreview || coverUrl || '/assets/default-request-cover.svg'}
                                alt="Request cover"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.55))' }} />
                            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.62)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', color: 'white', border: '1px solid rgba(255,255,255,0.10)' }}>
                                {formData.category || 'Category'}
                            </div>
                            <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                disabled={coverUploading}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    top: 12,
                                    background: 'rgba(0,0,0,0.62)',
                                    border: '1px solid rgba(255,255,255,0.10)',
                                    color: 'rgba(255,255,255,0.92)',
                                    borderRadius: 10,
                                    padding: '6px 10px',
                                    fontSize: 10,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                }}
                                title="Upload cover"
                            >
                                {coverUploading ? 'Uploading…' : 'Edit cover'}
                            </button>
                            {coverUploading ? (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        height: 4,
                                        background: 'rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <div
                                        style={{
                                            height: '100%',
                                            width: '45%',
                                            background: 'rgba(212,175,55,0.85)',
                                            boxShadow: '0 0 20px rgba(212,175,55,0.55)',
                                        }}
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2" style={{ lineHeight: 1.2 }}>
                                {formData.title || 'Untitled Project'}
                            </h3>
                            <div className="text-xs text-secondary mb-2">{formData.location || 'Location'}</div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-gold font-bold">${(formData.target || 0).toLocaleString()}</span>
                                <span className="text-xs text-tertiary">target</span>
                            </div>
                            <div style={{ height: '4px', background: 'var(--bg-surface)', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: 'var(--text-tertiary)', width: '10%' }} />
                            </div>
                        </div>
                    </Card>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        onChange={async (e) => {
                            const files = e.target.files;
                            e.target.value = '';
                            if (!files || files.length === 0) return;
                            try {
                                const file = files[0];
                                const prev = coverUrl;
                                const local = URL.createObjectURL(file);
                                setCoverLocalPreview(local);
                                await uploadCover(file);
                                // Once uploaded, switch from local blob preview to the persisted URL.
                                try {
                                    URL.revokeObjectURL(local);
                                } catch {
                                    // ignore
                                }
                                setCoverLocalPreview(null);
                            } catch (err: any) {
                                // Roll back preview if upload failed.
                                setCoverLocalPreview(null);
                                setCoverUrl((v) => v || prev);
                                setCoverErr(err?.message || 'Cover upload failed');
                            }
                        }}
                    />
                    <div className="mt-3 text-xs text-[var(--text-tertiary)]">
                        Tip: add a cover image to make your request stand out. (If you don’t, Aron uses a default cover.)
                    </div>
                    {coverErr ? (
                        <div className="mt-2 text-xs text-red-300">
                            Cover upload failed: {coverErr}
                        </div>
                    ) : null}
                    {coverOk ? (
                        <div className="mt-2 text-xs text-green-200">
                            {coverOk}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
