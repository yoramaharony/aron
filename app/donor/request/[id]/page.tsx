import { MOCK_REQUESTS } from '@/lib/mock-data';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DecisionBrief } from '@/components/ui/DecisionBrief';
import { ChevronLeft, Share2, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RequestDetail({ params }: { params: { id: string } }) {
    // In real app, fetch data. For MVP, find mock.
    const req = MOCK_REQUESTS.find(r => r.id === params.id) || MOCK_REQUESTS[0];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Back & Actions */}
            <div className="flex items-center justify-between">
                <Link href="/donor" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center text-sm">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Link>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>Share</Button>
                    <Button variant="outline" size="sm">Save</Button>
                </div>
            </div>

            {/* Hero */}
            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-[var(--accent-gold)] text-sm font-bold uppercase tracking-wide">{req.category}</span>
                            <span className="text-[var(--border-subtle)]">|</span>
                            <span className="text-[var(--text-secondary)] text-sm">{req.location}</span>
                        </div>
                        <h1 className="text-4xl font-serif mb-2">{req.title}</h1>
                        <div className="flex items-center space-x-2 text-[var(--text-secondary)]">
                            <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                            <span>Verified • {req.orgName}</span>
                        </div>
                    </div>

                    <img src={req.imageUrl} className="w-full h-80 object-cover rounded-xl border border-[var(--border-subtle)] grayscale-[20%]" />

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {req.kpis.map((kpi, idx) => (
                            <Card key={idx} className="bg-[var(--bg-surface)] border-0">
                                <div className="text-sm text-[var(--text-secondary)]">{kpi.label}</div>
                                <div className="text-2xl font-serif text-[var(--text-primary)]">{kpi.value}</div>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-serif">Why this matters</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed">{req.summary} {req.summary}</p>
                    </div>
                </div>

                {/* Sidebar: Brief & Action */}
                <div className="space-y-6">
                    <DecisionBrief
                        data={{
                            summary: req.aiRecommendation,
                            fundingGap: `$${(req.fundingGap / 1000000).toFixed(1)}M`,
                            riskScore: req.riskScore,
                            riskFactors: req.riskFactors,
                            recommendation: 'Recommended',
                            confidence: 94
                        }}
                    />

                    <Card className="sticky top-4">
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span>Raised</span>
                                <span className="text-[var(--text-secondary)]">${(req.fundingRaised / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--color-success)]" style={{ width: `${(req.fundingRaised / req.fundingTotal) * 100}%` }} />
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span>Goal</span>
                                <span className="text-[var(--text-primary)]">${(req.fundingTotal / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button className="w-full justify-between" size="lg">
                                <span>Pledge Support</span>
                                <span>${Math.min(100000, req.fundingGap).toLocaleString()}+</span>
                            </Button>

                            <Link href={`/donor/leverage/${req.id}`}>
                                <Button variant="gold" className="w-full justify-between group" size="lg">
                                    <div className="flex items-center">
                                        <Zap className="w-5 h-5 mr-2 text-black" />
                                        <span>Activate Leverage</span>
                                    </div>
                                </Button>
                            </Link>
                            <p className="text-xs text-[var(--text-tertiary)] text-center">
                                Trigger a 2x match or challenge grant
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
