'use client';

import { useState } from 'react';
import { WizardStepper } from '@/components/requester/wizard/WizardStepper';
import { StepOverview } from '@/components/requester/wizard/StepOverview';
import { StepFunding } from '@/components/requester/wizard/StepFunding';
import { StepOutcomes } from '@/components/requester/wizard/StepOutcomes';
import { StepGovernance } from '@/components/requester/wizard/StepGovernance';
import { StepDocuments } from '@/components/requester/wizard/StepDocuments';
import { StepReview } from '@/components/requester/wizard/StepReview';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronLeft, Save, Eye } from 'lucide-react';
import { ProjectSubmission, EMPTY_PROJECT } from '@/lib/types/requester';

// Steps definition
const STEPS = [
    'Overview',
    'Funding',
    'Outcomes',
    'Governance',
    'Documents',
    'Review'
];

export default function NewProjectWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<ProjectSubmission>(EMPTY_PROJECT);
    const [isSaving, setIsSaving] = useState(false);

    // Generic update handler
    const updateData = (updates: Partial<ProjectSubmission>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSaveDraft = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
    };

    // Render step content
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <StepOverview data={formData} updateData={updateData} />;
            case 1:
                return <StepFunding data={formData} updateData={updateData} />;
            case 2:
                return <StepOutcomes data={formData} updateData={updateData} />;
            case 3:
                return <StepGovernance data={formData} updateData={updateData} />;
            case 4:
                return <StepDocuments data={formData} updateData={updateData} />;
            case 5:
                return <StepReview data={formData} updateData={updateData} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-ivory)] pb-20">
            {/* Top Bar */}
            <header className="bg-white border-b border-[var(--border-subtle)] sticky top-0 z-40 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="font-serif font-medium text-[var(--text-primary)]">New Funding Request</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text-tertiary)] hidden sm:inline">Last saved: Just now</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="bg-transparent border border-[var(--border-subtle)]"
                        >
                            <Save size={14} className="mr-2" />
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[var(--color-sage)] hover:bg-[var(--bg-surface)]">
                            <Eye size={14} className="mr-2" />
                            Preview
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 mt-8">
                {/* Stepper */}
                <WizardStepper steps={STEPS} currentStep={currentStep} />

                {/* Form Content */}
                <div className="bg-[var(--bg-paper)] rounded-sm shadow-sm border border-[var(--border-subtle)] p-8 min-h-[400px] mt-6 relative">
                    {renderStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="w-32 bg-white border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    >
                        <ChevronLeft size={16} className="mr-1" /> Back
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleNext}
                        className="w-32 bg-[var(--text-primary)] hover:bg-black text-white rounded-sm"
                    >
                        {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} className="ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
