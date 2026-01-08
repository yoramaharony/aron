'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DonationRequest } from '@/lib/mock-data';

// --- Data Models ---

export type Opportunity = DonationRequest; // Re-use existing type for now

export type LeverageOfferStatus =
    | "draft" | "created" | "sent" | "accepted" | "in_campaign" | "goal_reached" | "released" | "expired" | "canceled";

export interface LeverageOffer {
    id: string;
    opportunityId: string;
    opportunityTitle?: string; // Denormalized for easy display
    opportunityOrg?: string;

    askAmount: number;
    anchorAmount: number;
    challengeGoal: number;
    topUpCap: number;
    matchRatio: number;      // 1 or 2
    deadline: string;        // ISO date

    terms: {
        proofRequired: boolean;
        milestoneRelease: boolean;
        quarterlyUpdates: boolean;
        namingRights: boolean;
        revokeOnMisrep: boolean;
    };

    noteToConcierge?: string;

    status: LeverageOfferStatus;
    createdAt: string;
    updatedAt: string;
}

export interface InboxMessage {
    id: string;
    from: "Concierge" | "System" | "Donor";
    subject: string;
    body: string;
    createdAt: string; // ISO
    isRead: boolean;
    type: 'leverage' | 'general';
}

export interface VaultDoc {
    id: string;
    name: string;
    category: "Legal & Compliance" | "Tax Documents" | "Offers";
    createdAt: string;
    status: "draft" | "final";
}

// --- Context ---

interface LeverageContextType {
    offers: LeverageOffer[];
    shortlist: Set<string>; // IDs
    passed: Set<string>; // IDs
    inbox: InboxMessage[];
    vaultDocs: VaultDoc[];

    createOffer: (offer: LeverageOffer) => void;
    saveOpportunity: (id: string) => void;
    passOpportunity: (id: string) => void;

    // For Demo:
    isDrawerOpen: boolean;
    activeOpportunity: Opportunity | null;
    openLeverageDrawer: (opp: Opportunity) => void;
    closeLeverageDrawer: () => void;
}

const LeverageContext = createContext<LeverageContextType | undefined>(undefined);

export function LeverageProvider({ children }: { children: ReactNode }) {
    const [offers, setOffers] = useState<LeverageOffer[]>([]);
    const [shortlist, setShortlist] = useState<Set<string>>(new Set());
    const [passed, setPassed] = useState<Set<string>>(new Set());
    const [inbox, setInbox] = useState<InboxMessage[]>([]);
    const [vaultDocs, setVaultDocs] = useState<VaultDoc[]>([]);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);

    const openLeverageDrawer = (opp: Opportunity) => {
        setActiveOpportunity(opp);
        setIsDrawerOpen(true);
    };

    const closeLeverageDrawer = () => {
        setIsDrawerOpen(false);
        setActiveOpportunity(null);
    };

    const createOffer = (offer: LeverageOffer) => {
        setOffers(prev => [offer, ...prev]);

        // Ripple Effect 1: Inbox Message
        const newMessage: InboxMessage = {
            id: `msg_${Date.now()}`,
            from: 'Concierge',
            subject: `Leverage offer drafted: ${offer.opportunityOrg}`,
            body: `We have received your leverage offer instruction. I am drafting the term sheet now.\n\nSummary:\nCommit: $${offer.anchorAmount.toLocaleString()}\nTarget: $${offer.challengeGoal.toLocaleString()}\nDeadline: ${new Date(offer.deadline).toLocaleDateString()}\n\nI will notify you once the grant agreement is ready for review.`,
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'leverage'
        };
        setInbox(prev => [newMessage, ...prev]);

        // Ripple Effect 2: Vault Doc
        const newDoc: VaultDoc = {
            id: `doc_${Date.now()}`,
            name: `Leverage_TermSheet_Draft_${offer.id.slice(0, 4)}.pdf`,
            category: 'Offers',
            createdAt: new Date().toISOString(),
            status: 'draft'
        };
        setVaultDocs(prev => [newDoc, ...prev]);
    };

    const saveOpportunity = (id: string) => {
        setShortlist(prev => new Set(prev).add(id));
        setPassed(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const passOpportunity = (id: string) => {
        setPassed(prev => new Set(prev).add(id));
        setShortlist(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    return (
        <LeverageContext.Provider value={{
            offers,
            shortlist,
            passed,
            inbox,
            vaultDocs,
            createOffer,
            saveOpportunity,
            passOpportunity,
            isDrawerOpen,
            activeOpportunity,
            openLeverageDrawer,
            closeLeverageDrawer
        }}>
            {children}
        </LeverageContext.Provider>
    );
}

export function useLeverage() {
    const context = useContext(LeverageContext);
    if (!context) {
        throw new Error('useLeverage must be used within a LeverageProvider');
    }
    return context;
}
