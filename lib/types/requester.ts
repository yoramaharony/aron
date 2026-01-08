export type ProjectStatus =
    | 'draft'
    | 'submitted'
    | 'in_review'
    | 'changes_requested'
    | 'verified'
    | 'published'
    | 'active'
    | 'reporting'
    | 'completed'
    | 'archived';

export interface UseOfFundsItem {
    id: string;
    category: 'staff' | 'equipment' | 'facilities' | 'services' | 'transport' | 'grants' | 'marketing' | 'other';
    description: string;
    amount: number;
}

export interface OutcomeMetric {
    id: string;
    title: string;
    metricDefinition: string;
    targetValue: string;
    measurementMethod: string;
    evidenceType: string;
}

export interface KPIMetric {
    id: string;
    name: string;
    unit: string;
    target: string;
    frequency: 'monthly' | 'quarterly' | 'annual';
}

export interface RiskItem {
    id: string;
    type: 'operational' | 'regulatory' | 'staffing' | 'finance' | 'reputational';
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
}

export interface Milestone {
    id: string;
    name: string;
    date: string;
    deliverable: string;
    owner: 'program' | 'finance';
}

export interface ProjectDocument {
    id: string;
    type: 'budget' | 'financials' | 'registration' | 'project_plan' | 'other';
    name: string;
    url: string; // Mock URL
    dateUploaded: string;
    confidentiality: 'private' | 'concierge' | 'donor';
}

export interface ProjectSubmission {
    id: string;
    status: ProjectStatus;
    lastSaved: string;
    completionScore: number;

    // Step A: Overview
    title: string;
    oneLineSummary: string;
    category: string;
    location: {
        country: string;
        city?: string;
    };
    beneficiaries: string[]; // e.g. ["Youth", "Refugees"]
    problemStatement: string;
    solutionApproach: string;
    trackRecord: {
        hasHistory: boolean;
        yearsActive?: number;
        summary?: string;
    };
    contacts: {
        programLead: { name: string; email: string };
        financeLead: { name: string; email: string };
    };
    privacy: {
        visibility: 'private' | 'limited' | 'public';
        allowDonorContact: boolean;
    };

    // Step B: Funding
    funding: {
        totalBudget: number;
        currency: string;
        amountRequested: number;
        amountSecured: number;
        window: {
            start: string;
            end: string;
        };
        useOfFunds: UseOfFundsItem[];
        overheadPercent: number;
        overheadExplanation?: string;
        disbursementPref: 'one-time' | 'monthly' | 'milestone';
        campaignReadiness: {
            canAcceptChallenge: boolean;
            canRunCampaign: boolean;
            preferredMatching: '1:1' | 'milestone' | 'pooled';
        };
    };

    // Step C: Outcomes
    outcomes: {
        primary: OutcomeMetric[];
        kpis: KPIMetric[];
        risks: RiskItem[];
        milestones: Milestone[];
    };

    // Step D: Governance
    governance: {
        orgName: string;
        registrationNumber: string;
        reportingCommitment: boolean;
    };

    // Step E: Documents
    documents: ProjectDocument[];
}

export const EMPTY_PROJECT: ProjectSubmission = {
    id: '',
    status: 'draft',
    lastSaved: new Date().toISOString(),
    completionScore: 0,
    title: '',
    oneLineSummary: '',
    category: '',
    location: { country: '' },
    beneficiaries: [],
    problemStatement: '',
    solutionApproach: '',
    trackRecord: { hasHistory: false },
    contacts: { programLead: { name: '', email: '' }, financeLead: { name: '', email: '' } },
    privacy: { visibility: 'private', allowDonorContact: false },
    funding: {
        totalBudget: 0,
        currency: 'USD',
        amountRequested: 0,
        amountSecured: 0,
        window: { start: '', end: '' },
        useOfFunds: [],
        overheadPercent: 0,
        disbursementPref: 'one-time',
        campaignReadiness: { canAcceptChallenge: false, canRunCampaign: false, preferredMatching: '1:1' }
    },
    outcomes: { primary: [], kpis: [], risks: [], milestones: [] },
    governance: { orgName: '', registrationNumber: '', reportingCommitment: false },
    documents: []
};
