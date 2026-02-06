'use client';

import { useState } from 'react';
import { MOCK_REQUESTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Zap, Users, Trophy, Milestone, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LeverageFlow({ params }: { params: { id: string } }) {
    const req = MOCK_REQUESTS.find(r => r.id === params.id) || MOCK_REQUESTS[0];
    const [step, setStep] = useState(1);
    const [leverageType, setLeverageType] = useState<string | null>(null);
    const [amount, setAmount] = useState(100000);

    const LEVERAGE_TYPES = [
        { id: 'match', title: 'Donor Match', icon: Users, desc: 'I match other donors 1:1 up to $X' },
        { id: 'challenge', title: 'Performance Challenge', icon: Trophy, desc: 'If they raise Y, I give X' },
        { id: 'milestone', title: 'Milestone Unlock', icon: Milestone, desc: 'Release funds upon completion of specific goals' },
    ];

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8">

            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-[var(--accent-gold-dim)] rounded-full mb-4">
                    <Zap className="w-8 h-8 text-[var(--accent-gold)] fill-current" />
                </div>
                <h1 className="text-4xl font-serif mb-2">Amplify Impact</h1>
                <p className="text-[var(--text-secondary)]">Create a leverage structure for "{req.title}"</p>
            </div>

            <Card className="p-8 border-[var(--active-border)] shadow-[var(--glow-gold)]">

                {/* Step 1: Type */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-serif">Select Leverage Strategy</h2>
                        <div className="grid gap-4">
                            {LEVERAGE_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setLeverageType(type.id)}
                                    className={`flex items-center p-4 rounded-lg border text-left transition-all hover:scale-[1.02] ${leverageType === type.id
                                            ? 'border-[var(--accent-gold)] bg-[var(--accent-gold-dim)]'
                                            : 'border-[var(--border-subtle)] hover:border-[var(--text-secondary)]'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full mr-4 ${leverageType === type.id ? 'bg-[var(--accent-gold)] text-black' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>
                                        <type.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{type.title}</div>
                                        <div className="text-sm text-[var(--text-secondary)]">{type.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setStep(2)} disabled={!leverageType} variant="gold">
                                Next: Define Terms
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Terms */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-serif">Define Commitment</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-[var(--text-secondary)] mb-2">My Pledge Amount</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">$</div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(Number(e.target.value))}
                                        className="pl-8 w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded p-3 text-2xl font-serif text-[var(--text-primary)] focus:border-[var(--accent-gold)] outline-none"
                                    />
                                </div>
                            </div>

                            {leverageType === 'match' && (
                                <div className="p-4 bg-[var(--bg-surface)] rounded text-sm text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                                    <p className="mb-2"><strong className="text-[var(--text-primary)]">Strategy:</strong> 1:1 Match</p>
                                    <p>Your ${amount.toLocaleString()} will incentivize others to give ${amount.toLocaleString()}, creating <span className="text-[var(--accent-gold)] font-bold">${(amount * 2).toLocaleString()} total impact</span>.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button onClick={() => setStep(1)} variant="ghost">Back</Button>
                            <Button onClick={() => setStep(3)} variant="gold">Generate Brief</Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Brief / Confirmation */}
                {step === 3 && (
                    <div className="space-y-8 text-center animate-in zoom-in duration-300">
                        <div className="flex justify-center">
                            <CheckCircle className="w-16 h-16 text-[var(--color-success)]" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif">Leverage Active</h2>
                            <p className="text-[var(--text-secondary)]">Your challenge has been generated and sent to the Aron Concierge for verification.</p>
                        </div>

                        <div className="bg-[var(--bg-surface)] p-6 rounded border border-[var(--border-subtle)] text-left space-y-2 font-mono text-sm opacity-80">
                            <div><strong>ID:</strong> LEV-{Math.floor(Math.random() * 10000)}</div>
                            <div><strong>Type:</strong> {LEVERAGE_TYPES.find(t => t.id === leverageType)?.title}</div>
                            <div><strong>Amount:</strong> ${amount.toLocaleString()}</div>
                            <div><strong>Status:</strong> <span className="text-[var(--accent-gold)]">PENDING APPROVAL</span></div>
                        </div>

                        <Button asChild variant="outline" className="w-full">
                            <Link href="/donor">Return to Opportunities</Link>
                        </Button>
                    </div>
                )}
            </Card>

            {step < 3 && (
                <div className="text-center mt-8 space-y-2">
                    <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest">Powered by Gemini 1.5 Pro</div>
                    <p className="text-xs text-[var(--text-tertiary)] max-w-xs mx-auto">
                        AI analyzes your network to suggest optimal match ratios.
                    </p>
                </div>
            )}

        </div>
    );
}
