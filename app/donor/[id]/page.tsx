'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MOCK_REQUESTS } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Zap, Heart, X, CheckCircle, AlertTriangle, ShieldCheck, Clock, Layers } from 'lucide-react';
import { useLeverage } from '@/components/providers/LeverageContext';
import { Card } from '@/components/ui/Card';

export default function OpportunityDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { id } = params;

    // Context Actions
    const { saveOpportunity, passOpportunity, openLeverageDrawer, shortlist, passed } = useLeverage();

    const opportunity = MOCK_REQUESTS.find(r => r.id === id);

    if (!opportunity) {
        return <div className="p-8 text-center text-[var(--text-tertiary)]">Opportunity not found</div>;
    }

    // Determine current status for button states
    const isSaved = shortlist.has(opportunity.id);
    const isPassed = passed.has(opportunity.id);

    const handleBack = () => {
        // Return to previous tab context if known
        // For now, simpler router.back() or straight to feed
        router.back();
    };

    const handleSave = () => {
        saveOpportunity(opportunity.id);
        // Optional: Provide feedback or auto-back? Spec says:
        // "If in Discover and user saves from details: add to shortlist, on back return to Discover"
        // "If in Passed and user saves: move to shortlist"

        // For now just save.
    };

    const handlePass = () => {
        passOpportunity(opportunity.id);
        router.back(); // Pass usually implies "next", so going back to feed makes sense
    };

    return (
        <div className="max-w-5xl mx-auto pb-24 pt-8 animate-in fade-in duration-300">
            {/* HEADER */}
            <header className="flex justify-between items-start mb-6 px-4 md:px-0 sticky top-4 z-40">
                <Button variant="outline" size="sm" onClick={handleBack} className="gap-2 bg-[rgba(255,255,255,0.06)] backdrop-blur">
                    <ChevronLeft size={16} />
                    Back
                </Button>

                <div className="flex gap-3">
                    {!isSaved && (
                        <Button variant="outline" size="sm" onClick={handleSave} className="bg-[rgba(255,255,255,0.06)] backdrop-blur">
                            <Heart size={16} className="mr-2" />
                            Save
                        </Button>
                    )}
                    <Button variant="gold" size="sm" onClick={() => openLeverageDrawer(opportunity)} className="shadow-lg">
                        <Zap size={16} className="mr-2" />
                        Leverage
                    </Button>
                    {!isPassed && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePass}
                            className="text-[var(--text-tertiary)] hover:text-[rgba(248,113,113,1)] hover:bg-[rgba(248,113,113,0.10)]"
                        >
                            <X size={16} className="mr-2" />
                            Pass
                        </Button>
                    )}
                </div>
            </header>

            {/* HERO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mb-12">
                {/* LEFT: Image & Summary */}
                <div className="md:col-span-2 space-y-6">
                    <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-sm">
                        <img src={opportunity.imageUrl} alt={opportunity.title} className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-[rgba(255,255,255,0.08)] border border-[var(--border-subtle)] backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--color-gold)]">
                                {opportunity.matchPotential}% Match
                            </span>
                            <span className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                                {opportunity.category}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-2">{opportunity.title}</h1>
                                <p className="text-[var(--text-secondary)] text-lg">{opportunity.orgName} • {opportunity.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-[var(--text-secondary)] text-lg leading-relaxed">
                        <p>{opportunity.summary}</p>
                    </div>

                    {/* KEY METRICS CARD */}
                    <Card className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
                        <div className="p-4 text-center">
                            <div className="text-xs text-secondary uppercase tracking-wider mb-1">Funding Gap</div>
                            <div className="text-xl font-bold text-[var(--text-primary)]">${(opportunity.fundingGap / 1000).toFixed(0)}k</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-xs text-secondary uppercase tracking-wider mb-1">Timeline</div>
                            <div className="text-xl font-bold text-[var(--text-primary)]">6 mo</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-xs text-secondary uppercase tracking-wider mb-1">Confidence</div>
                            <div className="text-xl font-bold text-[var(--color-green)]">{opportunity.executionConfidence}%</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-xs text-secondary uppercase tracking-wider mb-1">Overhead</div>
                            <div className="text-xl font-bold text-[var(--text-primary)]">{opportunity.overhead}%</div>
                        </div>
                    </Card>
                </div>

                {/* RIGHT: AI Insights & Diligence */}
                <div className="space-y-6">

                    {/* AI INSIGHTS */}
                    <Card className="overflow-hidden relative border-[rgba(var(--accent-rgb), 0.20)] bg-[rgba(var(--accent-rgb), 0.06)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={80} />
                        </div>
                        <div className="p-6 relative">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={16} className="text-[var(--color-gold)]" fill="currentColor" />
                                AI Insights
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Why It Matches</h4>
                                    <div className="space-y-2">
                                        {opportunity.aiInsights?.matchReason.map((reason, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                                                <CheckCircle size={14} className="mt-0.5 text-[var(--color-gold)] shrink-0" />
                                                <span>{reason.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-[var(--border-subtle)]" />

                                <div>
                                    <h4 className="text-xs font-bold text-[rgba(248,113,113,1)] uppercase mb-2">Risks & Mitigations</h4>
                                    <div className="space-y-3">
                                        {opportunity.aiInsights?.risks.map((risk, i) => (
                                            <div key={i} className="bg-[rgba(255,255,255,0.03)] p-2 rounded border border-[var(--border-subtle)]">
                                                <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                                                    <AlertTriangle size={14} className={risk.severity === 'High' ? 'text-red-500' : 'text-amber-500'} />
                                                    {risk.label}
                                                </div>
                                                {risk.mitigation && (
                                                    <div className="text-xs text-[var(--text-tertiary)] ml-6 mt-1">Mitigation: {risk.mitigation}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        variant="gold"
                                        className="w-full"
                                        onClick={() => openLeverageDrawer(opportunity)}
                                    >
                                        Review Leverage Structure
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* DILIGENCE PACK */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ShieldCheck size={16} />
                                Diligence Pack
                            </h3>

                            <div className="space-y-3">
                                {opportunity.diligence && Object.entries(opportunity.diligence).map(([key, status]) => (
                                    <div key={key} className="flex justify-between items-center text-sm py-1 border-b border-[var(--border-subtle)] last:border-0">
                                        <span className="capitalize text-[var(--text-secondary)]">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${status === 'Reviewed'
                                                ? 'bg-[rgba(34,197,94,0.14)] text-[var(--color-green)] border-[rgba(34,197,94,0.22)]'
                                                : 'bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)] border-[var(--border-subtle)]'
                                                }`}
                                        >
                                            {status}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 text-center">
                                <button className="text-xs font-bold text-[var(--color-gold)] hover:underline uppercase tracking-wider">
                                    View Documents in Vault
                                </button>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>

        </div>
    );
}
