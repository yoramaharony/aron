'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChevronRight, Upload, Lock, ShieldCheck, Check } from 'lucide-react';

export default function DonorOnboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: 'John Doe',
        email: 'john@office.com',
        range: 1000000,
        interests: [] as string[],
        privacy: 'anonymous'
    });

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
        else router.push('/donor'); // Finish
    };

    return (
        <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-6">
            <Card className="w-full max-w-lg space-y-8 p-8 border-[var(--border-subtle)]">

                {/* Progress */}
                <div className="flex justify-between items-center mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${step >= s ? 'bg-[var(--accent-gold)] text-black' : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)]'
                                }`}>
                                {step > s ? <Check className="w-4 h-4" /> : s}
                            </div>
                            <span className="text-[10px] mt-2 text-[var(--text-tertiary)] uppercase tracking-wide">
                                {s === 1 ? 'Identity' : s === 2 ? 'Verify' : s === 3 ? 'Profile' : 'Privacy'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-serif">Confirm Identity</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded p-3 text-[var(--text-primary)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded p-3 text-[var(--text-primary)]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-serif">Verification</h2>
                            <p className="text-[var(--text-secondary)]">To ensure the integrity of the Verified Network, we require identity verification.</p>

                            <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-8 flex flex-col items-center justify-center space-y-4 hover:border-[var(--accent-gold)] transition-colors cursor-pointer group">
                                <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center group-hover:bg-[var(--accent-gold-dim)]">
                                    <Upload className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)]" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-sm font-medium">Upload Passport or ID</span>
                                    <span className="text-xs text-[var(--text-tertiary)]">Encrypted & Stored in Vital Vault</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-[var(--accent-gold)]">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Concierge verification available</span>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-serif">Giving Profile</h2>

                            <div className="space-y-4">
                                <label className="block text-sm text-[var(--text-secondary)]">Annual Giving Target</label>
                                <div className="text-3xl font-serif text-[var(--accent-gold)]">
                                    ${(formData.range).toLocaleString()}
                                </div>
                                <input
                                    type="range"
                                    min="100000"
                                    max="10000000"
                                    step="100000"
                                    value={formData.range}
                                    onChange={e => setFormData({ ...formData, range: Number(e.target.value) })}
                                    className="w-full h-1 bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-gold)]"
                                />
                                <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
                                    <span>$100k</span>
                                    <span>$10M+</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--text-secondary)] mb-2">Primary Interests</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Education', 'Healthcare', 'Jewish Causes', 'Israel', 'Environment', 'Arts'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => {
                                                const newInterests = formData.interests.includes(tag)
                                                    ? formData.interests.filter(i => i !== tag)
                                                    : [...formData.interests, tag];
                                                setFormData({ ...formData, interests: newInterests });
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${formData.interests.includes(tag)
                                                    ? 'bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]'
                                                    : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-serif">Privacy Control</h2>

                            <div className="space-y-4">
                                {[
                                    { id: 'anonymous', label: 'Totally Anonymous', desc: 'No one sees your name.' },
                                    { id: 'disclosed', label: 'Disclosed to Charity', desc: 'Only the recipient organization sees your details.' },
                                    { id: 'network', label: 'Network Visible', desc: 'Visible to other verified donors for matching.' }
                                ].map((opt) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => setFormData({ ...formData, privacy: opt.id })}
                                        className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between ${formData.privacy === opt.id
                                                ? 'border-[var(--accent-gold)] bg-[var(--accent-gold-dim)]'
                                                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-medium text-sm">{opt.label}</div>
                                            <div className="text-xs text-[var(--text-tertiary)]">{opt.desc}</div>
                                        </div>
                                        {formData.privacy === opt.id && <Lock className="w-4 h-4 text-[var(--accent-gold)]" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end">
                    <Button
                        onClick={nextStep}
                        variant="gold"
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                        {step === 4 ? 'Enter Vault' : 'Continue'}
                    </Button>
                </div>

            </Card>
        </div>
    );
}
