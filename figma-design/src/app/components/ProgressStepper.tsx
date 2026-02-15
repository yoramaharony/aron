import { Check, X } from "lucide-react";

export type StepStatus = "completed" | "current" | "upcoming" | "passed";
export type OpportunityStage = "discover" | "info_requested" | "meeting" | "due_diligence" | "decision";

interface Step {
  label: string;
  status: StepStatus;
}

interface ProgressStepperProps {
  currentStage: OpportunityStage;
  isPassed?: boolean;
  isCommitted?: boolean;
  theme: any;
}

const stageOrder: OpportunityStage[] = ["discover", "info_requested", "meeting", "due_diligence", "decision"];

export function ProgressStepper({ currentStage, isPassed, isCommitted, theme }: ProgressStepperProps) {
  const currentIndex = stageOrder.indexOf(currentStage);
  
  const steps: Step[] = [
    { label: "Discover", status: "completed" },
    { label: "Info Requested", status: currentIndex >= 1 ? "completed" : "upcoming" },
    { label: "Meeting", status: currentIndex >= 2 ? "completed" : "upcoming" },
    { label: "Due Diligence", status: currentIndex >= 3 ? "completed" : "upcoming" },
    { label: "Decision", status: currentIndex >= 4 ? "completed" : "upcoming" },
  ];

  // Update statuses based on current stage and outcomes
  if (currentIndex >= 0 && currentIndex < steps.length) {
    steps[currentIndex].status = "current";
  }

  if (isPassed) {
    // If passed, mark all steps with passed styling
    steps.forEach(step => {
      if (step.status === "current") {
        step.status = "passed" as StepStatus;
      }
    });
  }

  if (isCommitted && currentIndex === 4) {
    steps[4].status = "completed";
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div 
          className="absolute top-6 left-0 right-0 h-[1px]"
          style={{ 
            background: isPassed 
              ? `linear-gradient(90deg, ${theme.border} 0%, rgba(220, 38, 38, 0.3) 100%)`
              : `linear-gradient(90deg, ${theme.gold} 0%, ${theme.border} ${(currentIndex + 1) * 25}%, ${theme.border} 100%)`,
            opacity: isPassed ? 0.5 : 1
          }}
        />
        
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const showCheck = step.status === "completed" || (isLast && isCommitted);
          const showX = step.status === "passed";
          
          return (
            <div key={index} className="flex flex-col items-center z-10" style={{ flex: 1 }}>
              {/* Node */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all relative"
                style={{
                  background: step.status === "current" 
                    ? `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`
                    : step.status === "completed" || showCheck
                    ? `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`
                    : step.status === "passed"
                    ? `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`
                    : theme.darkGray,
                  border: step.status === "current" 
                    ? `2px solid ${theme.gold}`
                    : step.status === "passed"
                    ? `2px solid rgba(220, 38, 38, 0.5)`
                    : `2px solid ${theme.border}`,
                  boxShadow: step.status === "current" 
                    ? `0 0 20px ${theme.glowGold}, 0 0 40px ${theme.glowGold}`
                    : step.status === "completed" || showCheck
                    ? `0 4px 16px ${theme.glowGold}`
                    : "none"
                }}
              >
                {showCheck ? (
                  <Check size={20} style={{ color: theme.black }} strokeWidth={2.5} />
                ) : showX ? (
                  <X size={20} style={{ color: "rgba(220, 38, 38, 0.8)" }} strokeWidth={2} />
                ) : step.status === "current" ? (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                      boxShadow: `0 0 10px ${theme.glowGold}`
                    }}
                  />
                ) : null}
              </div>
              
              {/* Label */}
              <div 
                className="mt-3 text-xs text-center font-light tracking-wide"
                style={{ 
                  color: step.status === "current" || step.status === "completed" || showCheck
                    ? theme.platinum
                    : step.status === "passed"
                    ? "rgba(220, 38, 38, 0.6)"
                    : theme.textMuted,
                  maxWidth: "80px"
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
