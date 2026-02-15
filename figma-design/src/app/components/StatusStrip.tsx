import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface StatusStripProps {
  status: "next_step" | "waiting" | "completed" | "action_required";
  message: string;
  theme: any;
}

export function StatusStrip({ status, message, theme }: StatusStripProps) {
  const getIcon = () => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "action_required":
        return AlertCircle;
      case "waiting":
        return Clock;
      default:
        return CheckCircle2;
    }
  };

  const getColors = () => {
    switch (status) {
      case "completed":
        return {
          bg: `linear-gradient(90deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
          border: theme.borderGold,
          icon: theme.gold,
          text: theme.platinum
        };
      case "action_required":
        return {
          bg: `linear-gradient(90deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
          border: theme.borderGold,
          icon: theme.goldLight,
          text: theme.platinum
        };
      case "waiting":
        return {
          bg: `linear-gradient(90deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
          border: theme.border,
          icon: theme.textSecondary,
          text: theme.textSecondary
        };
      default:
        return {
          bg: `linear-gradient(90deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
          border: theme.border,
          icon: theme.platinum,
          text: theme.platinum
        };
    }
  };

  const Icon = getIcon();
  const colors = getColors();

  return (
    <div 
      className="px-5 py-4 rounded-lg flex items-center gap-3 relative overflow-hidden"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: status === "action_required" || status === "completed"
          ? `0 2px 12px ${theme.shadowLight}, inset 0 1px 0 rgba(212, 175, 55, 0.1)`
          : `0 2px 8px ${theme.shadowLight}`
      }}
    >
      {/* Subtle shimmer for important statuses */}
      {(status === "action_required" || status === "completed") && (
        <div 
          className="absolute top-0 left-0 w-32 h-full opacity-5"
          style={{
            background: `radial-gradient(ellipse at left, ${theme.gold} 0%, transparent 70%)`
          }}
        />
      )}
      
      <Icon size={18} style={{ color: colors.icon }} strokeWidth={1.5} />
      <span 
        className="text-sm font-light tracking-wide relative z-10"
        style={{ color: colors.text }}
      >
        {message}
      </span>
    </div>
  );
}
