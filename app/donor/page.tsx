'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LayoutGrid, Layers, Zap, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

import { MOCK_REQUESTS } from '@/lib/mock-data';
import { SwipeStack } from '@/components/ui/SwipeStack';
import { useLeverage } from '@/components/providers/LeverageContext';

export default function DonorFeed() {
    const [viewMode, setViewMode] = useState<'list' | 'swipe'>('swipe'); // Default to swipe
    const [activeTab, setActiveTab] = useState<'discover' | 'shortlist' | 'passed'>('discover');
    const { shortlist, passed, saveOpportunity, passOpportunity } = useLeverage();

    // Filter Items
    const discoverItems = MOCK_REQUESTS.filter(item => !shortlist.has(item.id) && !passed.has(item.id));
    const shortlistItems = MOCK_REQUESTS.filter(item => shortlist.has(item.id));
    const passedItems = MOCK_REQUESTS.filter(item => passed.has(item.id));

    return (
        <div style={{ paddingTop: '2rem' }}>
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Today's Opportunities</h1>
                    <p className="text-secondary">Curated for your Giving Profile</p>
                </div>

                {activeTab === 'discover' && (
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <LayoutGrid size={16} />
                        </Button>
                        <Button
                            variant={viewMode === 'swipe' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('swipe')}
                            title="Immersive View"
                        >
                            <Layers size={16} />
                        </Button>
                    </div>
                )}
            </header>

            {/* TABS */}
            <div className="flex gap-8 border-b border-[var(--border-subtle)] mb-8">
                <button
                    onClick={() => setActiveTab('discover')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'discover'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Discover
                    <span className="ml-2 text-xs bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded-full text-[var(--text-tertiary)]">
                        {discoverItems.length}
                    </span>
                    {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('shortlist')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'shortlist'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Shortlist
                    <span className="ml-2 text-xs bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded-full text-[var(--text-tertiary)]">
                        {shortlistItems.length}
                    </span>
                    {activeTab === 'shortlist' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('passed')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'passed'
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                >
                    Passed
                    <span className="ml-2 text-xs bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded-full text-[var(--text-tertiary)]">
                        {passedItems.length}
                    </span>
                    {activeTab === 'passed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
            </div>

            {/* DISCOVER VIEW */}
            {activeTab === 'discover' && (
                <>
                    {discoverItems.length === 0 ? (
                        <div className="text-center py-20 bg-[rgba(255,255,255,0.02)] rounded-lg border border-dashed border-[var(--border-subtle)]">
                            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">You're all caught up!</h3>
                            <p className="text-[var(--text-tertiary)] text-sm">Check back later for new opportunities.</p>
                        </div>
                    ) : (
                        viewMode === 'list' ? (
                            <div className="grid grid-cols-2 gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
                                {discoverItems.map((opp) => (
                                    <Link key={opp.id} href={`/donor/${opp.id}`}>
                                        <Card className="hover:scale-[1.01] transition-transform duration-200 cursor-pointer h-full flex flex-col" noPadding>
                                            {/* Image Placeholder */}
                                            <div style={{ height: '240px', background: 'var(--bg-surface)', position: 'relative' }}>
                                                <img src={opp.imageUrl} alt={opp.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.55)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', color: 'white', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)' }}>
                                                    {opp.category}
                                                </div>
                                            </div>

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-gold text-xs font-bold uppercase tracking-wider">{opp.matchPotential}% Match</span>
                                                    <span className="text-tertiary text-xs flex items-center gap-1"><Clock size={12} />{opp.deadline}</span>
                                                </div>

                                                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{opp.title}</h3>
                                                <p className="text-secondary text-sm mb-4 line-clamp-2 flex-1">{opp.summary}</p>

                                                <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center mt-auto">
                                                    <div>
                                                        <span className="text-xl font-medium">${(opp.fundingGap / 1000).toFixed(0)}k</span>
                                                        <span className="text-xs text-secondary ml-1">gap</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-gold">
                                                        <Zap size={16} />
                                                        Leverage
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <SwipeStack
                                items={discoverItems}
                            />
                        )
                    )}
                </>
            )}

            {/* SHORTLIST VIEW */}
            {activeTab === 'shortlist' && (
                <div className="grid grid-cols-2 gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
                    {shortlistItems.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-[rgba(255,255,255,0.02)] rounded-lg text-[var(--text-tertiary)] border border-dashed border-[var(--border-subtle)]">
                            No saved opportunities yet.
                        </div>
                    ) : shortlistItems.map((opp) => (
                        <Link key={opp.id} href={`/donor/${opp.id}`}>
                            <Card className="hover:scale-[1.01] transition-transform duration-200 cursor-pointer h-full flex flex-col border-[rgba(34,197,94,0.18)]" noPadding>
                                <div style={{ height: '180px', position: 'relative' }}>
                                    <img src={opp.imageUrl} alt={opp.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 right-4 bg-[rgba(34,197,94,0.16)] border border-[rgba(34,197,94,0.24)] rounded-full p-2 shadow-sm text-[var(--color-green)] backdrop-blur">
                                        <Layers size={16} />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{opp.title}</h3>
                                    <p className="text-sm text-[var(--text-tertiary)]">{opp.orgName}</p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* PASSED VIEW */}
            {activeTab === 'passed' && (
                <div className="flex flex-col gap-4">
                    {passedItems.length === 0 ? (
                        <div className="text-center py-20 bg-[rgba(255,255,255,0.02)] rounded-lg text-[var(--text-tertiary)] border border-dashed border-[var(--border-subtle)]">
                            No passed opportunities.
                        </div>
                    ) : passedItems.map((opp) => (
                        <div key={opp.id} className="flex items-center gap-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] rounded-lg opacity-70 hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)] rounded overflow-hidden shrink-0">
                                <img src={opp.imageUrl} alt="" className="w-full h-full object-cover grayscale" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-[var(--text-primary)]">{opp.title}</h4>
                                <p className="text-sm text-[var(--text-tertiary)]">{opp.orgName}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => saveOpportunity(opp.id)} // Allow moving back to shortlist
                            >
                                Move to Shortlist
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
