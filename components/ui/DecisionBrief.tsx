import { Card } from './Card';
import { AlertTriangle, CheckCircle2, Bot } from 'lucide-react';

interface DecisionData {
    summary: string;
    fundingGap: string;
    riskScore: 'Low' | 'Medium' | 'High';
    riskFactors: string[];
    recommendation: string;
    confidence: number;
}

export function DecisionBrief({ data }: { data: DecisionData }) {
    const riskColor =
        data.riskScore === 'Low' ? 'text-[var(--color-success)]' :
            data.riskScore === 'Medium' ? 'text-[var(--accent-gold)]' : 'text-[var(--color-error)]';

    return (
        <Card className="border border-[var(--accent-gold-dim)] bg-[linear-gradient(180deg,rgba(212,175,55,0.05)_0%,rgba(0,0,0,0)_100%)]">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-[var(--accent-gold)]" />
                    <h3 className="font-medium text-[var(--accent-gold)] uppercase tracking-wider text-xs">Aron Decision Intelligence™</h3>
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">
                    Confidence: <span className="text-[var(--text-primary)]">{data.confidence}%</span>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h4 className="text-sm text-[var(--text-secondary)] mb-1">Impact Thesis</h4>
                    <p className="text-sm leading-relaxed">{data.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm text-[var(--text-secondary)] mb-1">Funding Gap</h4>
                        <div className="text-lg font-medium">{data.fundingGap}</div>
                    </div>
                    <div>
                        <h4 className="text-sm text-[var(--text-secondary)] mb-1">Risk Profile</h4>
                        <div className={`flex items-center space-x-2 ${riskColor}`}>
                            {data.riskScore === 'Low' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            <span className="text-lg font-medium">{data.riskScore}</span>
                        </div>
                    </div>
                </div>

                {data.riskFactors.length > 0 && (
                    <div>
                        <h4 className="text-sm text-[var(--text-secondary)] mb-2">Key Considerations</h4>
                        <ul className="space-y-1">
                            {data.riskFactors.map((factor, idx) => (
                                <li key={idx} className="text-xs text-[var(--text-tertiary)] flex items-start">
                                    <span className="mr-2">•</span> {factor}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
}
