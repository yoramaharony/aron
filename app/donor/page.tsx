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
                    <h1 className="text-3xl font-serif">Today's Opportunities</h1>
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
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'discover' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Discover
                    <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">{discoverItems.length}</span>
                    {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('shortlist')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'shortlist' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Shortlist
                    <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">{shortlistItems.length}</span>
                    {activeTab === 'shortlist' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('passed')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'passed' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Passed
                    <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">{passedItems.length}</span>
                    {activeTab === 'passed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-gold)]" />}
                </button>
            </div>

            {/* DISCOVER VIEW */}
            {activeTab === 'discover' && (
                <>
                    {discoverItems.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">You're all caught up!</h3>
                            <p className="text-gray-500 text-sm">Check back later for new opportunities.</p>
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

                                                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', color: 'black' }}>
                                                    {opp.category}
                                                </div>
                                            </div>

                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-gold text-xs font-bold uppercase tracking-wider">{opp.matchPotential}% Match</span>
                                                    <span className="text-tertiary text-xs flex items-center gap-1"><Clock size={12} />{opp.deadline}</span>
                                                </div>

                                                <h3 className="text-xl font-serif mb-2">{opp.title}</h3>
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
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg text-gray-500">
                            No saved opportunities yet.
                        </div>
                    ) : shortlistItems.map((opp) => (
                        <Link key={opp.id} href={`/donor/${opp.id}`}>
                            <Card className="hover:scale-[1.01] transition-transform duration-200 cursor-pointer h-full flex flex-col !border-green-100" noPadding>
                                <div style={{ height: '180px', position: 'relative' }}>
                                    <img src={opp.imageUrl} alt={opp.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-sm text-green-500">
                                        <Layers size={16} />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-serif mb-2">{opp.title}</h3>
                                    <p className="text-sm text-gray-500">{opp.orgName}</p>
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
                        <div className="text-center py-20 bg-gray-50 rounded-lg text-gray-500">
                            No passed opportunities.
                        </div>
                    ) : passedItems.map((opp) => (
                        <div key={opp.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden shrink-0">
                                <img src={opp.imageUrl} alt="" className="w-full h-full object-cover grayscale" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{opp.title}</h4>
                                <p className="text-sm text-gray-500">{opp.orgName}</p>
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
