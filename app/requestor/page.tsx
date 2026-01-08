'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Check, ChevronRight, Upload, FileText, Globe, DollarSign } from 'lucide-react';

export default function RequestWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submittedId, setSubmittedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Education',
        location: '',
        target: 500000,
        summary: '',
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileAttached, setFileAttached] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    location: formData.location || 'Remote',
                    summary: formData.summary,
                    targetAmount: Number(formData.target)
                }),
            });

            if (!res.ok) throw new Error('Failed to create request');

            const data = await res.json();
            setSubmittedId(data.id);
            setStep(5); // Success state
        } catch (e) {
            alert('Error submitting request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '2rem' }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl">New Funding Request</h1>
                    <p className="text-secondary">Draft your opportunity for the Yesod Private Network.</p>
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
                                        <label className="label">Project Title</label>
                                        <input
                                            className="input-field"
                                            placeholder="e.g. Community Center Expansion"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Category</label>
                                            <select
                                                className="input-field"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                <option>Education</option>
                                                <option>Healthcare</option>
                                                <option>Environment</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Location</label>
                                            <input
                                                className="input-field"
                                                placeholder="City, Country"
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Short Summary (The "Why")</label>
                                        <textarea
                                            className="input-field"
                                            style={{ height: '100px', resize: 'none' }}
                                            placeholder="Describe the impact in 2-3 sentences..."
                                            value={formData.summary}
                                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="fade-in">
                                <h2 className="text-xl flex items-center mb-6"><DollarSign size={20} className="text-gold" style={{ marginRight: 8 }} /> Financials</h2>
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label className="label">Funding Target</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }}>$</span>
                                            <input
                                                type="number"
                                                className="input-field"
                                                style={{ paddingLeft: '32px', fontSize: '1.25rem' }}
                                                value={formData.target}
                                                onChange={e => setFormData({ ...formData, target: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded bg-[var(--bg-surface)] text-sm text-secondary">
                                        <p><strong>Note:</strong> Yesod verifies all budgets. Please ensure your attached budget file matches this figure.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="fade-in">
                                <h2 className="text-xl flex items-center mb-6"><FileText size={20} className="text-gold" style={{ marginRight: 8 }} /> Evidence & Documents</h2>

                                <div
                                    className="p-8 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 mb-6 transition-all hover:bg-[var(--bg-surface)]"
                                    style={{ border: '2px dashed var(--border-subtle)', cursor: 'pointer' }}
                                    onClick={() => {
                                        setUploading(true);
                                        let progress = 0;
                                        const interval = setInterval(() => {
                                            progress += 10;
                                            setUploadProgress(progress);
                                            if (progress >= 100) {
                                                clearInterval(interval);
                                                setUploading(false);
                                                setFileAttached(true);
                                            }
                                        }, 200);
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
                                    ) : fileAttached ? (
                                        <div className="flex flex-col items-center text-green-600">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2">
                                                <Check size={20} />
                                            </div>
                                            <div className="font-medium">Budget_2026.pdf</div>
                                            <div className="text-xs text-secondary">Click to replace</div>
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
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="label">Additional Files</label>
                                    <div className="flex justify-between items-center p-3 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-secondary" />
                                            <span className="text-sm">501(c)(3) Determination.pdf</span>
                                        </div>
                                        <Check size={16} className="text-green-500" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="text-center py-8">
                                <h2 className="text-2xl mb-4">Ready to Submit?</h2>
                                <p className="text-secondary mb-6">Your request will be reviewed by the Yesod Concierge team before going live to the network.</p>

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
                        {step < 4 && (
                            <div className="flex justify-end pt-6 mt-6 border-t border-[var(--border-subtle)]">
                                <Button onClick={() => setStep(step + 1)} rightIcon={<ChevronRight size={16} />}>
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
                        <div style={{ height: '160px', background: 'var(--bg-surface)', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                                cover-image.jpg
                            </div>
                            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', color: 'white' }}>
                                {formData.category || 'Category'}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-serif mb-2" style={{ lineHeight: 1.2 }}>{formData.title || 'Untitled Project'}</h3>
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
                </div>
            </div>
        </div>
    );
}
