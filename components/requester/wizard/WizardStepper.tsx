'use client';

import { Check } from 'lucide-react';

interface WizardStepperProps {
    steps: string[];
    currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={index} className="flex-1 relative flex flex-col items-center">
                            {/* Connector Line */}
                            {index !== 0 && (
                                <div className={`absolute top-4 right-1/2 w-full h-[1px] -z-10 ${index <= currentStep ? 'bg-[var(--color-gold)]' : 'bg-[var(--border-subtle)]'
                                    }`} />
                            )}

                            {/* Circle */}
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isCompleted
                                        ? 'bg-[var(--color-gold)] text-black shadow-sm scale-100'
                                        : isCurrent
                                            ? 'bg-[var(--bg-ivory)] border border-[var(--color-gold)] text-[var(--text-primary)] shadow-md scale-110'
                                            : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]'
                                    }`}
                            >
                                {isCompleted ? <Check size={14} /> : index + 1}
                            </div>

                            {/* Label */}
                            <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                                }`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
