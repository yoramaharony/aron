import { useState } from "react";
import { 
  MessageSquare, 
  Calendar, 
  FileCheck, 
  Check, 
  X,
  MapPin,
  DollarSign,
  Heart,
  Clock,
  Play,
  History,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  Paperclip,
  StickyNote,
  Eye,
  AlertCircle
} from "lucide-react";
import { ProgressStepper, OpportunityStage } from "./ProgressStepper";
import { Timeline, TimelineEventType } from "./Timeline";
import { StatusStrip } from "./StatusStrip";

type ViewMode = "overview" | "decision";

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  cause: string;
  amount: string;
  geography: string;
  urgency: string;
  stage: OpportunityStage;
  isPassed?: boolean;
  isCommitted?: boolean;
  moreInfo?: string;
  videoUrl?: string;
  history?: string;
  
  // Extended details for overview mode
  fullOverview?: string;
  financialDetails?: {
    totalBudget: string;
    fundingGap: string;
    timeline: string;
    allocation: string;
  };
  organizationDetails?: {
    founded: string;
    leadership: string;
    track_record: string;
    current_programs: string;
  };
  materials?: {
    pitch_deck?: string;
    financial_statements?: string;
    impact_report?: string;
  };
  notes?: string;
}

interface OpportunitiesPageProps {
  theme: any;
}

export function OpportunitiesPage({ theme }: OpportunitiesPageProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>("1");
  const [viewedOpportunities, setViewedOpportunities] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [showCommitSafety, setShowCommitSafety] = useState(false);

  // Handle opportunity selection
  const handleSelectOpportunity = (id: string) => {
    setSelectedOpportunity(id);
    
    // If this opportunity has been viewed before, go to decision mode
    if (viewedOpportunities.has(id)) {
      setViewMode("decision");
      setDetailsExpanded(false);
    } else {
      // First time viewing, start in overview mode
      setViewMode("overview");
      setDetailsExpanded(true);
      setViewedOpportunities(prev => new Set(prev).add(id));
    }
  };

  // Continue to decision mode
  const handleContinueToDecision = () => {
    setViewMode("decision");
    setDetailsExpanded(false);
  };

  // Review details
  const handleReviewDetails = () => {
    setViewMode("overview");
    setDetailsExpanded(true);
  };

  const opportunities: Opportunity[] = [
    {
      id: "1",
      title: "Refuah / Bikur Cholim: rides + meals for families",
      organization: "Refuah / Bikur Cholim",
      description: "We support families during difficult times with bikur cholim visits, hospital rides, and nutritious meals.",
      cause: "Children & families",
      amount: "$160,000",
      geography: "Lakewood, Bnei Brak",
      urgency: "within 14 days",
      stage: "meeting",
      moreInfo: "Waiting for the organization to submit the detailed form.",
      videoUrl: "https://video.link",
      history: "No donors yet",
      fullOverview: "Refuah / Bikur Cholim provides essential support services to families experiencing medical crises. Our comprehensive program includes hospital visitation, transportation coordination, and nutritious meal delivery. We operate 24/7 with a dedicated team of volunteers and staff coordinators. This bridge funding will enable us to sustain operations during a critical growth period as we expand to serve additional communities in the region.",
      financialDetails: {
        totalBudget: "$160,000",
        fundingGap: "$160,000 (100%)",
        timeline: "14 days urgent need",
        allocation: "65% transportation, 35% meal programs"
      },
      organizationDetails: {
        founded: "2018",
        leadership: "Rabbi Moshe Cohen, Executive Director (12 years healthcare nonprofit experience)",
        track_record: "Served 3,200+ families, 98% satisfaction rating, recognized by community leaders",
        current_programs: "Hospital rides, meal delivery, bedside visits, family support coordination"
      },
      materials: {
        pitch_deck: "Available upon request",
        financial_statements: "2024 audited financials available",
        impact_report: "Q4 2025 impact summary attached"
      },
      notes: "Organization has strong community reputation. Previous donors include established family foundations. Executive team responsive and transparent."
    },
    {
      id: "2",
      title: "Hatzolah: new ambulance + cardiac response equipment",
      organization: "Hatzolah",
      description: "Hatzolah is rolling out a new ambulance and expanding AED units and response units. Need $1.1M for ambulance, parking and team deck. Serving Yerushalayim and Beit Shemesh.",
      cause: "Emergency",
      amount: "$1.1M",
      geography: "Yerushalayim, Beit Shemesh",
      urgency: "Immediate",
      stage: "discover",
    },
    {
      id: "3",
      title: "Kimcha d'Pischa: Pesach packages for families",
      organization: "Kimcha d'Pischa",
      description: "We distribute kimcha d'Pischa / Pesach food packages for families before Pesach. Need $120K to cover 600 packages. Target 5K families. Serving Yerushalayim and Beit Bruk.",
      cause: "Children & families",
      amount: "$120K",
      geography: "Yerushalayim, Beit Bruk",
      urgency: "within 14 days",
      stage: "discover",
    },
    {
      id: "4",
      title: "Mikvah: expansion + renovation (capital project)",
      organization: "Mikvah",
      description: "Mikvah expansion and renovation more than rooms, paint, renovate 6 of our prep rooms. Need $63K to complete this winter. Serving Monsey.",
      cause: "Community",
      amount: "$63K",
      geography: "Monsey",
      urgency: "Immediate",
      stage: "discover",
    },
    {
      id: "5",
      title: "Yeshiva: new wing + beit midrash expansion",
      organization: "Yeshiva",
      description: "Capital campaign: new classroom building for 150 guys and 5000sf beit midrash expansion. Need $2.5M for brick, mortar, and basic finish. Serving Yerushalayim and Beit Bruk.",
      cause: "Education",
      amount: "$2.5M",
      geography: "Yerushalayim, Beit Bruk",
      urgency: "within 30 days",
      stage: "discover",
    },
    {
      id: "6",
      title: "Chesed tuition relief for 200 families",
      organization: "Chesed",
      description: "Chilukah tuition relief scholarships 200 families for next year. Scholarship. Need $60K to prevent mid-year drops. Serving Lakewood and Beit Bruk.",
      cause: "Education",
      amount: "$60K",
      geography: "Lakewood, Beit Bruk",
      urgency: "within 21 days",
      stage: "discover",
    },
  ];

  const selected = opportunities.find(o => o.id === selectedOpportunity);

  // Generate timeline events based on stage
  const getTimelineEvents = (opp: Opportunity) => {
    const events: Array<{ type: TimelineEventType; label: string; timestamp: string; status: "completed" | "current" | "future" }> = [];
    
    const stageOrder = ["discover", "info_requested", "meeting", "due_diligence", "decision"];
    const currentIndex = stageOrder.indexOf(opp.stage);

    events.push({
      type: "viewed",
      label: "Opportunity viewed",
      timestamp: "Feb 10, 2026 at 2:30 PM",
      status: "completed"
    });

    if (currentIndex >= 0) {
      events.push({
        type: "shortlisted",
        label: "Added to shortlist",
        timestamp: "Feb 10, 2026 at 2:35 PM",
        status: "completed"
      });
    }

    if (currentIndex >= 1) {
      events.push({
        type: "info_requested",
        label: "Information requested",
        timestamp: "Feb 10, 2026 at 3:00 PM",
        status: currentIndex === 1 ? "current" : "completed"
      });
    } else if (currentIndex === 0) {
      events.push({
        type: "info_requested",
        label: "Request information",
        timestamp: "Pending",
        status: "future"
      });
    }

    if (currentIndex >= 2) {
      events.push({
        type: "meeting_scheduled",
        label: "Meeting scheduled",
        timestamp: "Feb 11, 2026 at 10:00 AM",
        status: "completed"
      });
      events.push({
        type: "meeting_completed",
        label: "Meeting completed",
        timestamp: "Feb 11, 2026 at 11:30 AM",
        status: currentIndex === 2 ? "current" : "completed"
      });
    }

    if (currentIndex >= 3) {
      events.push({
        type: "due_diligence_started",
        label: "Due diligence started",
        timestamp: "Feb 12, 2026 at 9:00 AM",
        status: currentIndex === 3 ? "current" : "completed"
      });
    }

    if (opp.isCommitted) {
      events.push({
        type: "committed",
        label: "Commitment made",
        timestamp: "Feb 12, 2026 at 4:00 PM",
        status: "completed"
      });
    } else if (opp.isPassed) {
      events.push({
        type: "passed",
        label: "Opportunity passed",
        timestamp: "Feb 12, 2026 at 4:00 PM",
        status: "completed"
      });
    }

    return events;
  };

  const getStatusMessage = (opp: Opportunity) => {
    if (opp.isPassed) {
      return { status: "completed" as const, message: "Decision: Passed on this opportunity" };
    }
    if (opp.isCommitted) {
      return { status: "completed" as const, message: "Decision: Commitment confirmed" };
    }

    switch (opp.stage) {
      case "discover":
        return { status: "next_step" as const, message: "Next step: Request additional information or schedule a meeting" };
      case "info_requested":
        return { status: "waiting" as const, message: "Waiting on: Organization response to information request" };
      case "meeting":
        return { status: "next_step" as const, message: "Next step: Begin due diligence process" };
      case "due_diligence":
        return { status: "action_required" as const, message: "Action required: Complete diligence review and make decision" };
      case "decision":
        return { status: "action_required" as const, message: "Decision point: Ready to commit or pass" };
      default:
        return { status: "next_step" as const, message: "Review opportunity details" };
    }
  };

  const getAvailableActions = (opp: Opportunity) => {
    if (opp.isPassed || opp.isCommitted) {
      return {
        canRequestInfo: false,
        canScheduleMeeting: false,
        canStartDiligence: false,
        canCommit: false,
        canPass: false
      };
    }

    const stageOrder = ["discover", "info_requested", "meeting", "due_diligence", "decision"];
    const currentIndex = stageOrder.indexOf(opp.stage);

    return {
      canRequestInfo: currentIndex === 0,
      canScheduleMeeting: currentIndex <= 1,
      canStartDiligence: currentIndex === 2,
      canCommit: currentIndex >= 3,
      canPass: true
    };
  };

  // Check if in late stage (due diligence or later)
  const isLateStage = (opp: Opportunity) => {
    const stageOrder = ["discover", "info_requested", "meeting", "due_diligence", "decision"];
    const currentIndex = stageOrder.indexOf(opp.stage);
    return currentIndex >= 3;
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Opportunities List */}
      <div 
        className="w-96 border-r overflow-y-auto"
        style={{
          background: `linear-gradient(180deg, ${theme.charcoal} 0%, ${theme.black} 100%)`,
          borderColor: theme.border,
          boxShadow: `4px 0 30px ${theme.shadow}`
        }}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 
              className="text-2xl font-light tracking-wide mb-2"
              style={{ color: theme.platinum }}
            >
              Opportunities
            </h2>
            <p 
              className="text-sm font-light"
              style={{ color: theme.textSecondary }}
            >
              Curated for your Impact Vision
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            {["Discover", "Shortlist", "Passed"].map((filter, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-lg text-xs font-light tracking-wide transition-all"
                style={{
                  background: index === 0 
                    ? `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`
                    : theme.charcoal,
                  color: index === 0 ? theme.gold : theme.textSecondary,
                  border: `1px solid ${index === 0 ? theme.borderGold : theme.border}`,
                  boxShadow: index === 0 ? `0 2px 8px ${theme.shadowLight}` : "none"
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {opportunities.map((opp) => {
              const isSelected = opp.id === selectedOpportunity;
              
              return (
                <button
                  key={opp.id}
                  onClick={() => handleSelectOpportunity(opp.id)}
                  className="w-full text-left p-4 rounded-lg transition-all relative overflow-hidden"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`
                      : theme.charcoal,
                    border: `1px solid ${isSelected ? theme.borderGold : theme.border}`,
                    boxShadow: isSelected 
                      ? `0 4px 16px ${theme.shadowLight}, inset 0 1px 0 rgba(212, 175, 55, 0.1)`
                      : "none"
                  }}
                >
                  {isSelected && (
                    <div 
                      className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full"
                      style={{ 
                        background: `linear-gradient(180deg, ${theme.gold}, ${theme.goldLight}, ${theme.gold})`,
                        boxShadow: `0 0 10px ${theme.glowGold}`
                      }}
                    />
                  )}
                  
                  <div className="relative z-10">
                    <div 
                      className="text-sm font-light mb-2 leading-snug"
                      style={{ 
                        color: isSelected ? theme.platinum : theme.textPrimary
                      }}
                    >
                      {opp.title}
                    </div>
                    <div 
                      className="text-xs font-light mb-2"
                      style={{ color: theme.textSecondary }}
                    >
                      {opp.organization}
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: theme.darkGray,
                          color: theme.textSecondary,
                          border: `1px solid ${theme.border}`
                        }}
                      >
                        {opp.cause}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Opportunity Details */}
      {selected && (
        <div 
          className="flex-1 overflow-y-auto"
          style={{
            background: `linear-gradient(180deg, ${theme.black} 0%, ${theme.charcoal} 100%)`,
            backgroundImage: `
              radial-gradient(ellipse at top right, ${theme.charcoal} 0%, ${theme.black} 50%),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.03) 2px,
                rgba(255, 255, 255, 0.03) 4px
              )
            `
          }}
        >
          <div className="p-8 space-y-6" style={{
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            {/* Header with Mode Badge and Review Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 
                    className="text-3xl font-light tracking-wide"
                    style={{ color: theme.platinum }}
                  >
                    {selected.title}
                  </h1>
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-light tracking-wide"
                    style={{
                      background: viewMode === "overview" 
                        ? `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`
                        : `linear-gradient(135deg, ${theme.gold}20 0%, ${theme.gold}10 100%)`,
                      color: viewMode === "overview" ? theme.textSecondary : theme.gold,
                      border: `1px solid ${viewMode === "overview" ? theme.border : theme.borderGold}`,
                    }}
                  >
                    {viewMode === "overview" ? "Overview Mode" : "Review Mode"}
                  </div>
                </div>
                <div 
                  className="text-lg font-light mb-4"
                  style={{ color: theme.gold }}
                >
                  {selected.organization}
                </div>
                <p 
                  className="text-sm font-light leading-relaxed"
                  style={{ color: theme.textSecondary }}
                >
                  {selected.description}
                </p>
              </div>

              {/* Review Details Button */}
              {viewMode === "decision" && (
                <button
                  onClick={handleReviewDetails}
                  className="px-4 py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-light tracking-wide text-sm"
                  style={{
                    background: isLateStage(selected)
                      ? `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`
                      : theme.charcoal,
                    color: isLateStage(selected) ? theme.gold : theme.textSecondary,
                    border: `1px solid ${isLateStage(selected) ? theme.borderGold : theme.border}`,
                    boxShadow: isLateStage(selected) 
                      ? `0 4px 12px ${theme.shadowLight}, inset 0 1px 0 rgba(212, 175, 55, 0.1)`
                      : "none"
                  }}
                >
                  <Eye size={16} strokeWidth={1.5} />
                  Review Details
                </button>
              )}
            </div>

            {/* OVERVIEW MODE LAYOUT */}
            {viewMode === "overview" ? (
              <>
                {/* Summary Card */}
                <div 
                  className="p-6 rounded-xl grid grid-cols-2 gap-6"
                  style={{
                    background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                    border: `1px solid ${theme.border}`,
                    boxShadow: `0 4px 16px ${theme.shadowLight}`,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <div>
                    <div 
                      className="text-xs mb-2 tracking-wider font-light uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Cause
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: theme.platinum }}
                    >
                      <Heart size={16} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light">{selected.cause}</span>
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-xs mb-2 tracking-wider font-light uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Amount
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: theme.gold }}
                    >
                      <DollarSign size={16} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light">{selected.amount}</span>
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-xs mb-2 tracking-wider font-light uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Geography
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: theme.platinum }}
                    >
                      <MapPin size={16} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light">{selected.geography}</span>
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-xs mb-2 tracking-wider font-light uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Urgency
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: theme.platinum }}
                    >
                      <Clock size={16} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light">{selected.urgency}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {selected.fullOverview && (
                  <div 
                    className="space-y-4"
                    style={{
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    {/* Overview */}
                    <div 
                      className="p-6 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                        border: `1px solid ${theme.border}`,
                        boxShadow: `0 4px 16px ${theme.shadowLight}`
                      }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <FileText size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                        <h3 
                          className="text-lg font-light tracking-wide"
                          style={{ color: theme.platinum }}
                        >
                          Overview
                        </h3>
                      </div>
                      <p 
                        className="text-sm font-light leading-relaxed"
                        style={{ color: theme.textSecondary }}
                      >
                        {selected.fullOverview}
                      </p>
                    </div>

                    {/* Financials */}
                    {selected.financialDetails && (
                      <div 
                        className="p-6 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                          border: `1px solid ${theme.border}`,
                          boxShadow: `0 4px 16px ${theme.shadowLight}`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                          <h3 
                            className="text-lg font-light tracking-wide"
                            style={{ color: theme.platinum }}
                          >
                            Financials
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(selected.financialDetails).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center pb-3 border-b last:border-b-0" style={{ borderColor: theme.border }}>
                              <span className="text-xs font-light tracking-wide uppercase" style={{ color: theme.textSecondary }}>
                                {key.replace(/_/g, " ")}
                              </span>
                              <span className="text-sm font-light" style={{ color: theme.platinum }}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Organization */}
                    {selected.organizationDetails && (
                      <div 
                        className="p-6 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                          border: `1px solid ${theme.border}`,
                          boxShadow: `0 4px 16px ${theme.shadowLight}`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Building2 size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                          <h3 
                            className="text-lg font-light tracking-wide"
                            style={{ color: theme.platinum }}
                          >
                            Organization
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(selected.organizationDetails).map(([key, value]) => (
                            <div key={key} className="pb-3 border-b last:border-b-0" style={{ borderColor: theme.border }}>
                              <div className="text-xs font-light tracking-wide uppercase mb-1" style={{ color: theme.textSecondary }}>
                                {key.replace(/_/g, " ")}
                              </div>
                              <div className="text-sm font-light leading-relaxed" style={{ color: theme.platinum }}>
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Materials */}
                    {selected.materials && (
                      <div 
                        className="p-6 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                          border: `1px solid ${theme.border}`,
                          boxShadow: `0 4px 16px ${theme.shadowLight}`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Paperclip size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                          <h3 
                            className="text-lg font-light tracking-wide"
                            style={{ color: theme.platinum }}
                          >
                            Materials
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(selected.materials).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm font-light" style={{ color: theme.textSecondary }}>
                                {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <span className="text-sm font-light" style={{ color: theme.platinum }}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selected.notes && (
                      <div 
                        className="p-6 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                          border: `1px solid ${theme.border}`,
                          boxShadow: `0 4px 16px ${theme.shadowLight}`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <StickyNote size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                          <h3 
                            className="text-lg font-light tracking-wide"
                            style={{ color: theme.platinum }}
                          >
                            Notes
                          </h3>
                        </div>
                        <p 
                          className="text-sm font-light leading-relaxed"
                          style={{ color: theme.textSecondary }}
                        >
                          {selected.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Continue to Review Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleContinueToDecision}
                    className="px-12 py-4 rounded-lg transition-all hover:scale-105 flex items-center gap-3 font-light tracking-wide"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                      color: theme.black,
                      border: `1px solid ${theme.gold}`,
                      boxShadow: `0 6px 25px ${theme.glowGold}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                    }}
                  >
                    Continue to Review
                    <ChevronRight size={20} strokeWidth={2} />
                  </button>
                </div>

                {/* Supporting Content - Minimized in Overview Mode */}
                {selected.moreInfo && (
                  <div 
                    className="p-4 rounded-lg"
                    style={{
                      background: theme.charcoal,
                      border: `1px solid ${theme.border}`,
                      opacity: 0.6,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} style={{ color: theme.textMuted }} strokeWidth={1.5} />
                      <span className="text-xs font-light" style={{ color: theme.textMuted }}>
                        Additional info available
                      </span>
                    </div>
                  </div>
                )}

                {/* Stepper - Muted in Overview Mode */}
                <div style={{ opacity: 0.3, transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                  <ProgressStepper 
                    currentStage={selected.stage}
                    isPassed={selected.isPassed}
                    isCommitted={selected.isCommitted}
                    theme={theme}
                  />
                </div>

                {/* Timeline - Collapsed in Overview Mode */}
                <div 
                  className="p-4 rounded-lg cursor-pointer"
                  style={{
                    background: theme.charcoal,
                    border: `1px solid ${theme.border}`,
                    opacity: 0.5,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: theme.textMuted }} strokeWidth={1.5} />
                    <span className="text-xs font-light" style={{ color: theme.textMuted }}>
                      Timeline available in review mode
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* DECISION MODE LAYOUT */
              <>
                {/* Progress Stepper - Active */}
                <div style={{ 
                  opacity: 1,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                }}>
                  <ProgressStepper 
                    currentStage={selected.stage}
                    isPassed={selected.isPassed}
                    isCommitted={selected.isCommitted}
                    theme={theme}
                  />
                </div>

                {/* Status Strip */}
                <div style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                  <StatusStrip 
                    {...getStatusMessage(selected)}
                    theme={theme}
                  />
                </div>

                {/* Action Buttons - Prominent */}
                <div 
                  className="flex flex-wrap gap-3"
                  style={{
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                  onMouseEnter={() => {
                    if (getAvailableActions(selected).canCommit && isLateStage(selected)) {
                      setShowCommitSafety(true);
                    }
                  }}
                  onMouseLeave={() => setShowCommitSafety(false)}
                >
                  {(() => {
                    const actions = getAvailableActions(selected);
                    return (
                      <>
                        {actions.canCommit && (
                          <div className="relative">
                            <button
                              className="px-8 py-4 rounded-lg transition-all hover:scale-105 relative overflow-hidden font-light tracking-wide"
                              style={{
                                background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                                color: theme.black,
                                border: `1px solid ${theme.gold}`,
                                boxShadow: `0 6px 25px ${theme.glowGold}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                              }}
                            >
                              <Check size={18} className="inline mr-2" strokeWidth={2} />
                              Commit
                            </button>
                            
                            {/* Safety Hint */}
                            {showCommitSafety && (
                              <div 
                                className="absolute -top-12 left-0 right-0 px-3 py-2 rounded-lg text-xs font-light whitespace-nowrap flex items-center gap-2"
                                style={{
                                  background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
                                  border: `1px solid ${theme.borderGold}`,
                                  boxShadow: `0 4px 16px ${theme.shadowLight}`,
                                  color: theme.gold,
                                  animation: "fadeIn 0.3s ease-out"
                                }}
                              >
                                <AlertCircle size={14} />
                                Final review available
                              </div>
                            )}
                          </div>
                        )}
                        
                        {actions.canRequestInfo && (
                          <button
                            className="px-6 py-4 rounded-lg transition-all hover:scale-105 font-light tracking-wide"
                            style={{
                              background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
                              color: theme.platinum,
                              border: `1px solid ${theme.borderGold}`,
                              boxShadow: `0 4px 16px ${theme.shadowLight}, inset 0 1px 0 rgba(212, 175, 55, 0.1)`
                            }}
                          >
                            <MessageSquare size={18} className="inline mr-2" strokeWidth={1.5} />
                            Request Info
                          </button>
                        )}

                        {actions.canScheduleMeeting && (
                          <button
                            className="px-6 py-4 rounded-lg transition-all hover:scale-105 font-light tracking-wide"
                            style={{
                              background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
                              color: theme.platinum,
                              border: `1px solid ${theme.borderGold}`,
                              boxShadow: `0 4px 16px ${theme.shadowLight}, inset 0 1px 0 rgba(212, 175, 55, 0.1)`
                            }}
                          >
                            <Calendar size={18} className="inline mr-2" strokeWidth={1.5} />
                            Schedule Meeting
                          </button>
                        )}

                        {actions.canStartDiligence && (
                          <button
                            className="px-6 py-4 rounded-lg transition-all hover:scale-105 font-light tracking-wide"
                            style={{
                              background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
                              color: theme.platinum,
                              border: `1px solid ${theme.borderGold}`,
                              boxShadow: `0 4px 16px ${theme.shadowLight}, inset 0 1px 0 rgba(212, 175, 55, 0.1)`
                            }}
                          >
                            <FileCheck size={18} className="inline mr-2" strokeWidth={1.5} />
                            Start Diligence
                          </button>
                        )}

                        {actions.canPass && (
                          <button
                            className="px-6 py-4 rounded-lg transition-all hover:scale-105 font-light tracking-wide"
                            style={{
                              background: theme.charcoal,
                              color: theme.textSecondary,
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            <X size={18} className="inline mr-2" strokeWidth={1.5} />
                            Pass
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Summary Card */}
                <div 
                  className="p-6 rounded-xl grid grid-cols-2 gap-6"
                  style={{
                    background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                    border: `1px solid ${theme.border}`,
                    boxShadow: `0 4px 16px ${theme.shadowLight}`,
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <div>
                    <div 
                      className="text-xs mb-2 tracking-wider font-light uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Cause
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: theme.platinum }}
                    >
                      <Heart size={16} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light">{selected.cause}</span>
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-xs mb-2 tracking-wider font-light uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Amount
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: theme.gold }}
                    >
                      <DollarSign size={16} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light">{selected.amount}</span>
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-xs mb-2 tracking-wider font-light uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Geography
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: theme.platinum }}
                    >
                      <MapPin size={16} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light">{selected.geography}</span>
                    </div>
                  </div>

                  <div>
                    <div 
                      className="text-xs mb-2 tracking-wider font-light uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Urgency
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      style={{ color: theme.platinum }}
                    >
                      <Clock size={16} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light">{selected.urgency}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline - Expanded */}
                <div style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                  <Timeline events={getTimelineEvents(selected)} theme={theme} />
                </div>

                {/* Details - Collapsed with Toggle */}
                <div style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                  <button
                    onClick={() => setDetailsExpanded(!detailsExpanded)}
                    className="w-full p-4 rounded-lg flex items-center justify-between transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                      border: `1px solid ${theme.border}`,
                      color: theme.platinum
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <span className="font-light tracking-wide">Full Details</span>
                    </div>
                    {detailsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {detailsExpanded && selected.fullOverview && (
                    <div className="mt-4 space-y-4">
                      {/* All detail sections from overview mode */}
                      <div 
                        className="p-6 rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                          border: `1px solid ${theme.border}`,
                          boxShadow: `0 4px 16px ${theme.shadowLight}`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <FileText size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                          <h3 
                            className="text-lg font-light tracking-wide"
                            style={{ color: theme.platinum }}
                          >
                            Overview
                          </h3>
                        </div>
                        <p 
                          className="text-sm font-light leading-relaxed"
                          style={{ color: theme.textSecondary }}
                        >
                          {selected.fullOverview}
                        </p>
                      </div>

                      {selected.financialDetails && (
                        <div 
                          className="p-6 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                            border: `1px solid ${theme.border}`,
                            boxShadow: `0 4px 16px ${theme.shadowLight}`
                          }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <DollarSign size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                            <h3 
                              className="text-lg font-light tracking-wide"
                              style={{ color: theme.platinum }}
                            >
                              Financials
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(selected.financialDetails).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center pb-3 border-b last:border-b-0" style={{ borderColor: theme.border }}>
                                <span className="text-xs font-light tracking-wide uppercase" style={{ color: theme.textSecondary }}>
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm font-light" style={{ color: theme.platinum }}>
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selected.organizationDetails && (
                        <div 
                          className="p-6 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                            border: `1px solid ${theme.border}`,
                            boxShadow: `0 4px 16px ${theme.shadowLight}`
                          }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Building2 size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                            <h3 
                              className="text-lg font-light tracking-wide"
                              style={{ color: theme.platinum }}
                            >
                              Organization
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(selected.organizationDetails).map(([key, value]) => (
                              <div key={key} className="pb-3 border-b last:border-b-0" style={{ borderColor: theme.border }}>
                                <div className="text-xs font-light tracking-wide uppercase mb-1" style={{ color: theme.textSecondary }}>
                                  {key.replace(/_/g, " ")}
                                </div>
                                <div className="text-sm font-light leading-relaxed" style={{ color: theme.platinum }}>
                                  {value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Supporting Content */}
                {selected.moreInfo && (
                  <div 
                    className="p-6 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `0 4px 16px ${theme.shadowLight}`,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <h3 
                        className="text-lg font-light tracking-wide"
                        style={{ color: theme.platinum }}
                      >
                        More Info Requested
                      </h3>
                    </div>
                    <p 
                      className="text-sm font-light leading-relaxed"
                      style={{ color: theme.textSecondary }}
                    >
                      {selected.moreInfo}
                    </p>
                  </div>
                )}

                {selected.videoUrl && (
                  <div 
                    className="p-6 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `0 4px 16px ${theme.shadowLight}`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Play size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <h3 
                        className="text-lg font-light tracking-wide"
                        style={{ color: theme.platinum }}
                      >
                        Video
                      </h3>
                    </div>
                    <a 
                      href={selected.videoUrl}
                      className="text-sm font-light underline"
                      style={{ color: theme.gold }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open video link
                    </a>
                  </div>
                )}

                {selected.history && (
                  <div 
                    className="p-6 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `0 4px 16px ${theme.shadowLight}`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <History size={18} style={{ color: theme.gold }} strokeWidth={1.5} />
                      <h3 
                        className="text-lg font-light tracking-wide"
                        style={{ color: theme.platinum }}
                      >
                        History
                      </h3>
                    </div>
                    <p 
                      className="text-sm font-light leading-relaxed"
                      style={{ color: theme.textSecondary }}
                    >
                      {selected.history}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
