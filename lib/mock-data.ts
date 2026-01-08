export interface DonationRequest {
    id: string;
    title: string;
    orgName: string;
    location: string;
    category: string;
    imageUrl: string;
    fundingTotal: number;
    fundingRaised: number;
    fundingGap: number;
    deadline: string;
    kpis: { label: string; value: string }[];
    summary: string;
    riskScore: 'Low' | 'Medium' | 'High';
    riskFactors: string[];
    matchPotential: number; // 0-100
    aiRecommendation: string;
    verified: boolean;

    // Extended Fields for Details Page
    executionConfidence: number; // 0-100
    overhead: number; // percentage
    lastVerified: string; // date
    aiInsights: {
        matchReason: { label: string; detail?: string }[];
        risks: { label: string; severity: "Low" | "Medium" | "High"; mitigation?: string }[];
        leverageRecommendation: {
            anchorAmount: number;
            challengeGoal: number;
            deadline: string;
            matchRatio: number;
            verification: string[];
        };
    };
    diligence: {
        financials: 'Reviewed' | 'Pending';
        governance: 'Reviewed' | 'Pending';
        budget: 'Reviewed' | 'Pending';
        references: 'Reviewed' | 'Pending';
        siteVisit: 'Reviewed' | 'Pending';
    };
}

export const MOCK_REQUESTS: DonationRequest[] = [
    {
        id: 'req_1',
        title: 'Children’s Cancer Support Center Expansion',
        orgName: 'Hope For Life Foundation',
        location: 'New York, NY',
        category: 'Healthcare',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
        fundingTotal: 5000000,
        fundingRaised: 3200000,
        fundingGap: 1800000,
        deadline: '2026-06-30',
        kpis: [
            { label: 'Families Served', value: '200 / yr' },
            { label: 'Sq Ft Added', value: '15,000' },
        ],
        summary: 'Expanding the outpatient facility to double capacity for pediatric oncology patients. High community alignment.',
        riskScore: 'Low',
        riskFactors: [],
        matchPotential: 92,
        aiRecommendation: 'Top recommendation based on your focus on NYC Healthcare.',
        verified: true,
        executionConfidence: 94,
        overhead: 7,
        lastVerified: '2025-12-15',
        aiInsights: {
            matchReason: [
                { label: 'Matches your pillar: Healthcare Innovation' },
                { label: 'Geography: NYC (Core)' },
                { label: 'Time-to-impact: < 18 months' },
                { label: 'Measurable outcomes available' }
            ],
            risks: [
                { label: 'Construction Delays', severity: 'Medium', mitigation: 'Milestone-based release' },
                { label: 'Operational Risk', severity: 'Low' }
            ],
            leverageRecommendation: {
                anchorAmount: 500000,
                challengeGoal: 1000000,
                deadline: '2026-03-30',
                matchRatio: 1,
                verification: ['Construction permit approval', 'Foundation board minutes']
            }
        },
        diligence: {
            financials: 'Reviewed',
            governance: 'Reviewed',
            budget: 'Reviewed',
            references: 'Reviewed',
            siteVisit: 'Pending'
        }
    },
    {
        id: 'req_2',
        title: 'Tech Education for At-Risk Youth',
        orgName: 'Future Coders Israel',
        location: 'Tel Aviv, IL',
        category: 'Education',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000',
        fundingTotal: 1200000,
        fundingRaised: 400000,
        fundingGap: 800000,
        deadline: '2026-04-15',
        kpis: [
            { label: 'Graduates', value: '150' },
            { label: 'Job Placement', value: '85%' },
        ],
        summary: 'A bootcamp program targeting under-privileged youth in periphery cities. Proven curriculum, scaling to 2 new hubs.',
        riskScore: 'Medium',
        riskFactors: ['Regulatory approval pending for new site', 'Currency fluctuation risks'],
        matchPotential: 78,
        aiRecommendation: 'Strong impact per dollar, but higher operational risk.',
        verified: true,
        executionConfidence: 86,
        overhead: 12,
        lastVerified: '2026-01-05',
        aiInsights: {
            matchReason: [
                { label: 'Matches your pillar: Education Mobility' },
                { label: 'Geography: Israel' },
                { label: 'High Leverage Potential' }
            ],
            risks: [
                { label: 'Regulatory Approval', severity: 'High', mitigation: 'Conditional release on permit' },
                { label: 'Currency Volatility', severity: 'Medium' }
            ],
            leverageRecommendation: {
                anchorAmount: 250000,
                challengeGoal: 500000,
                deadline: '2026-03-01',
                matchRatio: 2,
                verification: ['Ministry of Education approval', 'Lease agreement']
            }
        },
        diligence: {
            financials: 'Reviewed',
            governance: 'Reviewed',
            budget: 'Pending',
            references: 'Reviewed',
            siteVisit: 'Reviewed'
        }
    },
    {
        id: 'req_3',
        title: 'Clean Water Initiative - Phase 4',
        orgName: 'Global Water Alliance',
        location: 'Sub-Saharan Africa',
        category: 'Environment',
        imageUrl: 'https://images.unsplash.com/photo-1541976844346-a18bc9088f68?auto=format&fit=crop&q=80&w=1000',
        fundingTotal: 2500000,
        fundingRaised: 2100000,
        fundingGap: 400000,
        deadline: '2026-03-01',
        kpis: [
            { label: 'Wells Built', value: '45' },
            { label: 'People Served', value: '12,000' }
        ],
        summary: 'Final phase of the regional water access project. Requires closing funds to deploy contractors before rainy season.',
        riskScore: 'Low',
        riskFactors: [],
        matchPotential: 65,
        aiRecommendation: 'Good gap-closer opportunity, though slightly outside your core geo.',
        verified: true,
        executionConfidence: 91,
        overhead: 5,
        lastVerified: '2025-11-20',
        aiInsights: {
            matchReason: [
                { label: 'Matches your pillar: Global Health' },
                { label: 'High Urgency / Impact' }
            ],
            risks: [
                { label: 'Weather Dependency', severity: 'Medium', mitigation: 'Deadline enforced' },
                { label: 'Contractor Availability', severity: 'Low' }
            ],
            leverageRecommendation: {
                anchorAmount: 200000,
                challengeGoal: 200000,
                deadline: '2026-02-15',
                matchRatio: 1,
                verification: ['Field report', 'Vendor invoices']
            }
        },
        diligence: {
            financials: 'Reviewed',
            governance: 'Reviewed',
            budget: 'Reviewed',
            references: 'Pending',
            siteVisit: 'Pending'
        }
    },
];
