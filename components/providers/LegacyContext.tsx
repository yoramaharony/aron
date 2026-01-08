'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Structure of a Legacy Plan
export interface LegacyPlan {
    pillars: string[];
    budget: {
        total: string; // e.g. "$2M"
        period: string; // e.g. "per year"
        allocation: { category: string; percent: number }[];
    };
    forecast: {
        livesImpacted: number;
        confidence: number;
    };
    isActive: boolean;
}

interface LegacyContextType {
    plan: LegacyPlan;
    setPlan: (plan: LegacyPlan) => void;
    activatePlan: () => void;
    generateMockPlan: (keywords: string) => void;
}

// Default/Empty State
const DEFAULT_PLAN: LegacyPlan = {
    pillars: [],
    budget: { total: '$0', period: 'year', allocation: [] },
    forecast: { livesImpacted: 0, confidence: 0 },
    isActive: false,
};

const LegacyContext = createContext<LegacyContextType | undefined>(undefined);

export function LegacyProvider({ children }: { children: ReactNode }) {
    const [plan, setPlanState] = useState<LegacyPlan>(DEFAULT_PLAN);

    const activatePlan = () => {
        setPlanState(prev => ({ ...prev, isActive: true }));
        // In a real app, this would trigger API calls to persist the plan
    };

    // The "AI" Logic (Mocked for the Demo)
    const generateMockPlan = (text: string) => {
        const lower = text.toLowerCase();

        let newPlan = { ...DEFAULT_PLAN };

        // Scenario A: "Children, Medical, Israel"
        if (lower.includes('children') || lower.includes('pediatric') || lower.includes('health')) {
            newPlan = {
                pillars: ['Pediatric Oncology', 'Medical R&D', 'Family Support'],
                budget: {
                    total: '$3M',
                    period: '3 years',
                    allocation: [
                        { category: 'Pediatric Oncology', percent: 60 },
                        { category: 'Medical R&D', percent: 25 },
                        { category: 'Family Support', percent: 15 },
                    ]
                },
                forecast: {
                    livesImpacted: 68000,
                    confidence: 94
                },
                isActive: false
            };
        }
        // Scenario B: "Water, Africa, Environment"
        else if (lower.includes('water') || lower.includes('environment')) {
            newPlan = {
                pillars: ['Clean Water Infrastructure', 'Sustainable Agriculture', 'Education'],
                budget: {
                    total: '$1.5M',
                    period: '2 years',
                    allocation: [
                        { category: 'Infrastructure', percent: 50 },
                        { category: 'Agriculture', percent: 30 },
                        { category: 'Education', percent: 20 },
                    ]
                },
                forecast: {
                    livesImpacted: 12500,
                    confidence: 88
                },
                isActive: false
            };
        }
        // Scenario C: Default Fallback (Education)
        else {
            newPlan = {
                pillars: ['STEM Education', 'Digital Literacy', 'Career Mobility'],
                budget: {
                    total: '$1M',
                    period: 'year',
                    allocation: [
                        { category: 'STEM', percent: 40 },
                        { category: 'Equipment', percent: 40 },
                        { category: 'Scholarships', percent: 20 },
                    ]
                },
                forecast: {
                    livesImpacted: 2400,
                    confidence: 91
                },
                isActive: false
            };
        }

        setPlanState(newPlan);
    };

    return (
        <LegacyContext.Provider value={{ plan, setPlan: setPlanState, activatePlan, generateMockPlan }}>
            {children}
        </LegacyContext.Provider>
    );
}

export function useLegacy() {
    const context = useContext(LegacyContext);
    if (!context) {
        throw new Error('useLegacy must be used within a LegacyProvider');
    }
    return context;
}
