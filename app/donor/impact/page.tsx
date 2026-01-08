'use client';

import { Card } from '@/components/ui/Card';
import { TrendingUp, Users, Globe, ArrowUpRight } from 'lucide-react';

export default function ImpactPage() {
    return (
        <div className="fade-in" style={{ paddingTop: '2rem' }}>
            <header className="mb-8">
                <h1 className="text-3xl font-serif">Impact Report</h1>
                <p className="text-secondary">Aggregate metrics across your philanthropic portfolio.</p>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <Card className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-4">
                        <Users className="text-gold" size={24} />
                    </div>
                    <div className="text-4xl font-serif mb-2">12.5k</div>
                    <div className="text-sm text-secondary uppercase tracking-widest">Lives Impacted</div>
                </Card>
                <Card className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-4">
                        <Globe className="text-gold" size={24} />
                    </div>
                    <div className="text-4xl font-serif mb-2">8</div>
                    <div className="text-sm text-secondary uppercase tracking-widest">Countries</div>
                </Card>
                <Card className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="text-gold" size={24} />
                    </div>
                    <div className="text-4xl font-serif mb-2">$3.2M</div>
                    <div className="text-sm text-secondary uppercase tracking-widest">Capital Deployed</div>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <Card>
                    <h3 className="text-lg font-medium mb-6">Capital Allocation by Sector</h3>

                    {/* Fake Chart Visualization */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Healthcare</span>
                                <span className="font-bold">55%</span>
                            </div>
                            <div className="w-full bg-[var(--bg-surface)] h-3 rounded-full overflow-hidden">
                                <div className="bg-gold h-full" style={{ width: '55%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Education</span>
                                <span className="font-bold">30%</span>
                            </div>
                            <div className="w-full bg-[var(--bg-surface)] h-3 rounded-full overflow-hidden">
                                <div className="bg-gold h-full" style={{ width: '30%', opacity: 0.7 }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Environment</span>
                                <span className="font-bold">15%</span>
                            </div>
                            <div className="w-full bg-[var(--bg-surface)] h-3 rounded-full overflow-hidden">
                                <div className="bg-gold h-full" style={{ width: '15%', opacity: 0.5 }}></div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-[var(--bg-sidebar)] border-none">
                    <h3 className="text-lg font-medium mb-4">Latest Updates</h3>
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="text-xs text-secondary mb-1">2 Days Ago</div>
                            <div className="font-medium mb-1">Water Initiative Phase 4</div>
                            <p className="text-sm text-secondary">Construction completed on 3 new wells in Northern District.</p>
                            <a href="#" className="text-xs text-gold flex items-center gap-1 mt-2">View Report <ArrowUpRight size={10} /></a>
                        </div>
                        <div className="border-t border-[var(--border-subtle)] pt-4">
                            <div className="text-xs text-secondary mb-1">1 Week Ago</div>
                            <div className="font-medium mb-1">Children's Center</div>
                            <p className="text-sm text-secondary">Annual audit report released showing 98% efficiency.</p>
                            <a href="#" className="text-xs text-gold flex items-center gap-1 mt-2">View Report <ArrowUpRight size={10} /></a>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
