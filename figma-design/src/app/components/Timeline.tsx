import { 
  Eye, 
  Star, 
  MessageSquare, 
  Calendar, 
  Video, 
  FileCheck, 
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

export type TimelineEventType = 
  | "viewed" 
  | "shortlisted" 
  | "info_requested" 
  | "meeting_scheduled" 
  | "meeting_completed" 
  | "due_diligence_started"
  | "committed"
  | "passed";

interface TimelineEvent {
  type: TimelineEventType;
  label: string;
  timestamp: string;
  status: "completed" | "current" | "future";
}

interface TimelineProps {
  events: TimelineEvent[];
  theme: any;
}

const eventIcons: Record<TimelineEventType, any> = {
  viewed: Eye,
  shortlisted: Star,
  info_requested: MessageSquare,
  meeting_scheduled: Calendar,
  meeting_completed: Video,
  due_diligence_started: FileCheck,
  committed: CheckCircle2,
  passed: XCircle,
};

export function Timeline({ events, theme }: TimelineProps) {
  return (
    <div 
      className="p-6 rounded-xl relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 4px 16px ${theme.shadowLight}`,
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <Clock size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
        <h3 
          className="text-lg font-light tracking-wide" 
          style={{ color: theme.platinum }}
        >
          Engagement Timeline
        </h3>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div 
          className="absolute left-[23px] top-2 bottom-2 w-[1px]"
          style={{ 
            background: `linear-gradient(180deg, ${theme.gold} 0%, ${theme.border} 100%)`
          }}
        />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const Icon = eventIcons[event.type];
            const isCompleted = event.status === "completed";
            const isCurrent = event.status === "current";
            const isFuture = event.status === "future";
            const isPassed = event.type === "passed";
            const isCommitted = event.type === "committed";

            return (
              <div key={index} className="flex gap-4 relative">
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10"
                  style={{
                    background: isCurrent
                      ? `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`
                      : isCompleted || isCommitted
                      ? `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`
                      : isFuture
                      ? theme.darkGray
                      : isPassed
                      ? `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`
                      : theme.darkGray,
                    border: isCurrent
                      ? `2px solid ${theme.gold}`
                      : isCompleted || isCommitted
                      ? `2px solid ${theme.gold}`
                      : isFuture
                      ? `2px solid ${theme.border}`
                      : isPassed
                      ? "2px solid rgba(220, 38, 38, 0.5)"
                      : `2px solid ${theme.border}`,
                    boxShadow: isCurrent
                      ? `0 0 15px ${theme.glowGold}`
                      : isCompleted || isCommitted
                      ? `0 4px 12px ${theme.glowGold}`
                      : "none"
                  }}
                >
                  <Icon 
                    size={20} 
                    style={{ 
                      color: isCompleted || isCommitted
                        ? theme.black
                        : isCurrent
                        ? theme.gold
                        : isPassed
                        ? "rgba(220, 38, 38, 0.8)"
                        : theme.textMuted
                    }} 
                    strokeWidth={1.5} 
                  />
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div 
                    className="font-light mb-1 tracking-wide"
                    style={{ 
                      color: isCompleted || isCurrent || isCommitted
                        ? theme.platinum
                        : isPassed
                        ? "rgba(220, 38, 38, 0.7)"
                        : theme.textMuted
                    }}
                  >
                    {event.label}
                  </div>
                  <div 
                    className="text-xs font-light"
                    style={{ color: theme.textSecondary }}
                  >
                    {event.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
