import { useState } from "react";
import { 
  Eye, 
  Target, 
  Gift, 
  TrendingUp, 
  Vault, 
  Mail, 
  UserPlus, 
  Link2, 
  Send,
  Sparkles,
  Crown,
  ChevronRight,
  Gem,
  Award,
  Star,
  Zap,
  RotateCcw
} from "lucide-react";
import { AronLogo } from "@/app/components/AronLogo";
import { OpportunitiesPage } from "@/app/components/OpportunitiesPage";

// Black Card Theme - Ultimate Exclusivity & Understated Luxury
const theme = {
  black: "#0A0A0A",
  charcoal: "#1A1A1A",
  darkGray: "#2A2A2A",
  mediumGray: "#404040",
  gold: "#D4AF37",
  goldLight: "#E5C158",
  goldDark: "#B8941F",
  platinum: "#C0C0C0",
  silver: "#A8A8A8",
  lightSilver: "#D8D8D8",
  shimmer: "#E8E8E8",
  accent: "#F5F5F5",
  white: "#FFFFFF",
  textPrimary: "#E8E8E8",
  textSecondary: "#A8A8A8",
  textMuted: "#707070",
  border: "rgba(192, 192, 192, 0.15)",
  borderStrong: "rgba(192, 192, 192, 0.3)",
  borderGold: "rgba(212, 175, 55, 0.3)",
  shadow: "rgba(0, 0, 0, 0.5)",
  shadowLight: "rgba(0, 0, 0, 0.3)",
  glow: "rgba(192, 192, 192, 0.2)",
  glowStrong: "rgba(192, 192, 192, 0.4)",
  glowGold: "rgba(212, 175, 55, 0.3)",
};

export function DonorDashboardBlack() {
  const [activeTab, setActiveTab] = useState("Impact Vision");
  const [messageInput, setMessageInput] = useState("");

  const navItems = [
    { icon: Eye, label: "Impact Vision", active: true },
    { icon: Target, label: "Opportunities", active: false },
    { icon: Gift, label: "Pledges", active: false },
    { icon: TrendingUp, label: "Impact", active: false },
    { icon: Vault, label: "Vault", active: false },
    { icon: Mail, label: "Inbox", active: false },
    { icon: UserPlus, label: "Invites", active: false },
    { icon: Link2, label: "Submission Links", active: false },
  ];

  const conversations = [
    {
      id: 1,
      title: "I'm nearing a draft Impact Vision around: Children & Families, Israel, Geo focus: Israel, Emerging markets. Budget signal: $3M. Horizon: 3 year. One question: what is the single outcome you'd be proud to see in 12 months?",
      badge: "Saving children, quiet giving, Israel + emerging markets, $3M over 3 years.",
      status: "active"
    },
    {
      id: 2,
      title: "I'm nearing a draft Impact Vision around: Children & Families, Israel, Geo focus: Israel, Emerging markets. Budget signal: $3M. Horizon: 3 year. One question: what is the single outcome you'd be proud to see in 12 months?",
      button: "Full Impact",
      status: "completed"
    },
    {
      id: 3,
      title: "I'm nearing a draft Impact Vision around: Children & Families, Clean Water, Israel, Environment, Geo focus: Africa, Israel, Emerging markets. Budget signal: $3M. Horizon: 3 year. One question: what is the single outcome...",
      demos: ["Demo Script: \"Saving children...\"", "Demo Script: \"Clean Water...\""],
      status: "active"
    }
  ];

  return (
    <div className="flex h-screen" style={{ backgroundColor: theme.black }}>
      {/* Sidebar */}
      <div 
        className="w-64 border-r flex flex-col relative"
        style={{ 
          background: `linear-gradient(180deg, ${theme.charcoal} 0%, ${theme.black} 100%)`,
          borderColor: theme.border,
          boxShadow: `4px 0 40px ${theme.shadow}`,
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 1px,
              rgba(255, 255, 255, 0.06) 1px,
              rgba(255, 255, 255, 0.06) 2px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(255, 255, 255, 0.03) 1px,
              rgba(255, 255, 255, 0.03) 2px
            )
          `
        }}
      >
        {/* Subtle platinum shimmer top */}
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background: `linear-gradient(90deg, ${theme.gold} 0%, ${theme.platinum} 50%, ${theme.gold} 100%)`,
            opacity: 0.4
          }}
        />
        
        {/* Logo */}
        <div className="p-6 border-b relative" style={{ borderColor: theme.border }}>
          <div className="flex flex-col gap-3">
            <AronLogo 
              width={200} 
              height={50} 
              primaryColor={theme.platinum}
              accentColor={theme.glow}
            />
            <div 
              className="text-xs tracking-[0.3em] text-center font-light" 
              style={{ color: theme.platinum }}
            >
              CENTURION
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.label === activeTab;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(item.label)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg mb-2 transition-all relative overflow-hidden group"
                style={{
                  background: isActive 
                    ? `linear-gradient(90deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`
                    : "transparent",
                  color: isActive ? theme.platinum : theme.textSecondary,
                  border: isActive ? `1px solid ${theme.border}` : "1px solid transparent",
                }}
              >
                {/* Left platinum accent for active state */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                    style={{ 
                      background: `linear-gradient(180deg, ${theme.gold}, ${theme.goldLight}, ${theme.gold})`,
                      boxShadow: `0 0 10px ${theme.glowGold}`
                    }}
                  />
                )}
                
                {/* Icon */}
                <div 
                  className="relative z-10 flex items-center justify-center transition-all"
                  style={{
                    width: "24px",
                    height: "24px",
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                </div>
                
                <span className="font-light relative z-10 tracking-wide">{item.label}</span>
                
                {/* Hover effect for non-active items */}
                {!isActive && (
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, ${theme.darkGray}50 0%, transparent 100%)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom badge */}
        <div className="p-4 border-t relative" style={{ borderColor: theme.borderGold }}>
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg relative"
            style={{ 
              background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
              border: `1px solid ${theme.borderGold}`,
              boxShadow: `0 2px 8px ${theme.shadowLight}, inset 0 1px 0 rgba(212, 175, 55, 0.2)`
            }}
          >
            <Zap size={16} style={{ color: theme.gold }} />
            <div>
              <div className="text-xs font-light tracking-wide" style={{ color: theme.gold }}>Centurion</div>
              <div className="text-xs font-light" style={{ color: theme.platinum }}>Limitless</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {activeTab === "Opportunities" ? (
          <OpportunitiesPage theme={theme} />
        ) : (
          <>
            {/* Chat/Conversation Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div 
                className="px-6 py-5 border-b flex items-center justify-between relative"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.black} 100%)`,
                  borderColor: theme.border,
                  boxShadow: `0 2px 20px ${theme.shadow}`,
                  backgroundImage: `
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 2px,
                      rgba(255, 255, 255, 0.05) 2px,
                      rgba(255, 255, 255, 0.05) 3px
                    )
                  `
                }}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`,
                      border: `1px solid ${theme.borderGold}`,
                      boxShadow: `0 4px 20px ${theme.glowGold}, inset 0 1px 0 rgba(212, 175, 55, 0.2)`
                    }}
                  >
                    <Sparkles size={20} style={{ color: theme.gold }} strokeWidth={1.5} />
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                      style={{ 
                        borderColor: theme.charcoal,
                        background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                        boxShadow: `0 0 6px ${theme.glowGold}`
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-lg font-light tracking-wide" style={{ color: theme.textPrimary }}>Concierge AI</div>
                    <div className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                          boxShadow: `0 0 6px ${theme.glowGold}`
                        }}
                      />
                      <span className="font-light" style={{ color: theme.textSecondary }}>Available 24/7</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                  <Award size={20} style={{ color: theme.gold }} strokeWidth={1.5} />
                  <span className="text-sm font-light tracking-wide" style={{ color: theme.gold }}>Elite Access</span>
                </div>
              </div>

              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto p-6 space-y-6"
                style={{
                  background: `radial-gradient(ellipse at top right, ${theme.charcoal} 0%, ${theme.black} 50%)`,
                  backgroundImage: `
                    radial-gradient(ellipse at top right, ${theme.charcoal} 0%, ${theme.black} 50%),
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 2px,
                      rgba(255, 255, 255, 0.04) 2px,
                      rgba(255, 255, 255, 0.04) 4px
                    )
                  `
                }}
              >
                {conversations.map((conv) => (
                  <div key={conv.id} className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`,
                        border: `1px solid ${theme.borderStrong}`,
                        boxShadow: `0 4px 20px ${theme.shadowLight}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                      }}
                    >
                      <Sparkles size={20} style={{ color: theme.platinum }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div 
                        className="p-5 rounded-xl relative overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.border}`,
                          boxShadow: `0 4px 16px ${theme.shadowLight}`,
                          backgroundImage: `
                            linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%),
                            repeating-linear-gradient(
                              -45deg,
                              transparent,
                              transparent 2px,
                              rgba(255, 255, 255, 0.04) 2px,
                              rgba(255, 255, 255, 0.04) 3px
                            )
                          `,
                          backgroundBlendMode: 'normal'
                        }}
                      >
                        {/* Subtle platinum shimmer */}
                        <div 
                          className="absolute top-0 right-0 w-32 h-32 opacity-5"
                          style={{
                            background: `radial-gradient(circle at top right, ${theme.platinum} 0%, transparent 70%)`
                          }}
                        />
                        <div className="font-light leading-relaxed">{conv.title}</div>
                      </div>
                      
                      {conv.badge && (
                        <div 
                          className="inline-block px-5 py-3 rounded-lg text-sm"
                          style={{ 
                            background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`,
                            color: theme.platinum,
                            border: `1px solid ${theme.borderStrong}`,
                            boxShadow: `0 4px 12px ${theme.shadowLight}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Star size={14} style={{ color: theme.platinum }} strokeWidth={1.5} />
                            <span className="font-light">{conv.badge}</span>
                          </div>
                        </div>
                      )}

                      {conv.button && (
                        <button
                          className="px-8 py-3 rounded-lg transition-all font-light hover:scale-105 relative overflow-hidden tracking-wide"
                          style={{
                            background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`,
                            color: theme.gold,
                            border: `1px solid ${theme.borderGold}`,
                            boxShadow: `0 6px 20px ${theme.glowGold}, inset 0 1px 0 rgba(212, 175, 55, 0.2)`,
                            fontSize: "16px",
                          }}
                        >
                          {conv.button}
                        </button>
                      )}

                      {conv.demos && (
                        <div className="flex gap-2">
                          {conv.demos.map((demo, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 rounded-lg text-xs font-light"
                              style={{
                                background: theme.darkGray,
                                color: theme.textSecondary,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              {demo}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div 
                className="p-6 border-t relative"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.black} 100%)`,
                  borderColor: theme.border,
                  boxShadow: `0 -2px 20px ${theme.shadow}`,
                  backgroundImage: `
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 2px,
                      rgba(255, 255, 255, 0.05) 2px,
                      rgba(255, 255, 255, 0.05) 3px
                    )
                  `
                }}
              >
                <div className="flex gap-3 relative z-10">
                  {/* Reset Vision Button */}
                  <button
                    onClick={() => {
                      if (confirm("Reset your Impact Vision? This will start a new vision from scratch.")) {
                        console.log("Resetting vision...");
                      }
                    }}
                    className="group p-4 rounded-lg transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
                      border: `1px solid ${theme.borderGold}`,
                      boxShadow: `0 4px 12px ${theme.shadowLight}, inset 0 1px 0 rgba(212, 175, 55, 0.15)`,
                    }}
                    title="Reset Vision"
                  >
                    <RotateCcw 
                      size={20} 
                      style={{ color: theme.gold }} 
                      strokeWidth={1.5}
                      className="group-hover:rotate-180 transition-transform duration-500"
                    />
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Describe your impact vision..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-5 py-4 rounded-lg outline-none transition-all font-light"
                    style={{
                      background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `inset 0 2px 4px ${theme.shadowLight}`
                    }}
                  />
                  <button
                    className="px-6 py-4 rounded-lg transition-all hover:scale-105 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`,
                      color: theme.platinum,
                      border: `1px solid ${theme.borderStrong}`,
                      boxShadow: `0 6px 20px ${theme.shadowLight}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                    }}
                  >
                    <Send size={24} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Impact Vision */}
            <div 
              className="w-96 border-l overflow-y-auto relative"
              style={{ 
                background: `linear-gradient(180deg, ${theme.charcoal} 0%, ${theme.black} 100%)`,
                borderColor: theme.border,
                boxShadow: `-4px 0 40px ${theme.shadow}`,
                backgroundImage: `
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 1px,
                    rgba(255, 255, 255, 0.05) 1px,
                    rgba(255, 255, 255, 0.05) 2px
                  ),
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 1px,
                    rgba(255, 255, 255, 0.025) 1px,
                    rgba(255, 255, 255, 0.025) 2px
                  )
                `
              }}
            >
              <div className="p-6 space-y-6 relative">
                {/* Header */}
                <div 
                  className="p-5 rounded-xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
                    border: `1px solid ${theme.borderGold}`,
                    boxShadow: `0 6px 20px ${theme.glowGold}, inset 0 1px 0 rgba(212, 175, 55, 0.15)`,
                    backgroundImage: `
                      linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%),
                      repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 1.5px,
                        rgba(212, 175, 55, 0.02) 1.5px,
                        rgba(212, 175, 55, 0.02) 3px
                      )
                    `,
                    backgroundBlendMode: 'normal'
                  }}
                >
                  {/* Gold shimmer */}
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 opacity-5"
                    style={{
                      background: `radial-gradient(circle, ${theme.gold} 0%, transparent 70%)`
                    }}
                  />
                  
                  <div className="flex items-start justify-between mb-3 relative">
                    <div className="flex items-center gap-2">
                      <h2 
                        className="text-2xl tracking-wide font-light whitespace-nowrap" 
                        style={{ 
                          color: theme.gold
                        }}
                      >
                        Impact Vision
                      </h2>
                    </div>
                    <div className="text-xs text-right font-light" style={{ color: theme.textSecondary }}>
                      <div className="tracking-wider">LAST UPDATED</div>
                      <div>2/2/2025, 2:07:33 PM</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {["CHILDREN & FAMILIES", "CLEAN WATER", "ISRAEL", "ENVIRONMENT"].map((tag, idx) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-xs tracking-wider font-light"
                        style={{
                          background: `linear-gradient(135deg, ${theme.mediumGray} 0%, ${theme.darkGray} 100%)`,
                          color: idx % 2 === 0 ? theme.gold : theme.platinum,
                          border: `1px solid ${idx % 2 === 0 ? theme.borderGold : theme.border}`,
                          boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Impact Forecast */}
                <div 
                  className="p-6 rounded-xl relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                    border: `1px solid ${theme.border}`,
                    boxShadow: `0 4px 16px ${theme.shadowLight}`,
                    backgroundImage: `
                      linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%),
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 1.5px,
                        rgba(255, 255, 255, 0.05) 1.5px,
                        rgba(255, 255, 255, 0.05) 2.5px
                      )
                    `,
                    backgroundBlendMode: 'normal'
                  }}
                >
                  <div className="flex items-center gap-2 mb-5 relative">
                    <div 
                      className="p-1.5 rounded"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                        boxShadow: `0 2px 8px ${theme.glowGold}`
                      }}
                    >
                      <TrendingUp size={16} style={{ color: theme.black }} strokeWidth={2} />
                    </div>
                    <div 
                      className="text-xs tracking-[0.2em] font-light" 
                      style={{ color: theme.gold }}
                    >
                      IMPACT FORECAST
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div 
                      className="p-4 rounded-lg relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`,
                        border: `1px solid ${theme.borderGold}`,
                        boxShadow: `inset 0 1px 0 rgba(212, 175, 55, 0.15)`
                      }}
                    >
                      <div 
                        className="absolute top-0 right-0 w-16 h-16 opacity-5"
                        style={{
                          background: `radial-gradient(circle, ${theme.gold} 0%, transparent 70%)`
                        }}
                      />
                      <div 
                        className="text-4xl mb-2 font-light relative" 
                        style={{ 
                          color: theme.gold
                        }}
                      >
                        4,800
                      </div>
                      <div className="text-xs tracking-wide font-light" style={{ color: theme.textSecondary }}>
                        EST. LIVES IMPACTED
                      </div>
                    </div>
                    <div 
                      className="p-4 rounded-lg relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.mediumGray} 100%)`,
                        border: `1px solid ${theme.border}`,
                        boxShadow: `inset 0 1px 0 rgba(192, 192, 192, 0.15)`
                      }}
                    >
                      <div 
                        className="absolute top-0 right-0 w-16 h-16 opacity-5"
                        style={{
                          background: `radial-gradient(circle, ${theme.platinum} 0%, transparent 70%)`
                        }}
                      />
                      <div 
                        className="text-4xl mb-2 font-light relative" 
                        style={{ 
                          color: theme.platinum
                        }}
                      >
                        88%
                      </div>
                      <div className="text-xs tracking-wide font-light" style={{ color: theme.textSecondary }}>
                        EXECUTION CONFIDENCE
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative">
                    <div className="flex justify-between text-xs font-light" style={{ color: theme.textSecondary }}>
                      <span className="tracking-wide">Overhead Exposure</span>
                      <span style={{ color: theme.gold }}>Low (4.2%)</span>
                    </div>
                    <div 
                      className="w-full h-2.5 rounded-full relative overflow-hidden" 
                      style={{ 
                        backgroundColor: theme.charcoal,
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      <div 
                        className="h-full rounded-full relative" 
                        style={{ 
                          width: "15%", 
                          background: `linear-gradient(90deg, ${theme.goldDark} 0%, ${theme.gold} 50%, ${theme.goldLight} 100%)`,
                          boxShadow: `0 0 12px ${theme.glowGold}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Focus */}
                <div 
                  className="p-6 rounded-xl relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.charcoal} 0%, ${theme.darkGray} 100%)`,
                    border: `1px solid ${theme.border}`,
                    boxShadow: `0 4px 16px ${theme.shadowLight}`
                  }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div 
                      className="p-1.5 rounded"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.platinum} 0%, ${theme.lightSilver} 100%)`,
                        boxShadow: `0 2px 8px ${theme.glow}`
                      }}
                    >
                      <Target size={16} style={{ color: theme.black }} strokeWidth={2} />
                    </div>
                    <div 
                      className="text-xs tracking-[0.2em] font-light" 
                      style={{ color: theme.platinum }}
                    >
                      FOCUS
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: "STATUS", value: "Confirmed", color: "gold" },
                      { label: "GEO FOCUS", value: "Africa • Israel • Emerging markets", color: "platinum" },
                      { label: "TIME HORIZON", value: "3 year", color: "gold" },
                      { label: "GIVING BUDGET", value: "$3M", color: "platinum" },
                      { label: "12-MONTH OUTCOME", value: "Captured", color: "gold" }
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="pb-4 border-b last:border-b-0"
                        style={{ borderColor: theme.border }}
                      >
                        <div 
                          className="text-xs mb-2 tracking-wider font-light" 
                          style={{ color: theme.textSecondary }}
                        >
                          {item.label}
                        </div>
                        <div 
                          className="text-lg font-light" 
                          style={{ color: item.color === "gold" ? theme.gold : theme.platinum }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div 
                  className="p-6 rounded-xl relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%)`,
                    border: `1px solid ${theme.borderGold}`,
                    boxShadow: `0 8px 30px ${theme.glowGold}, inset 0 1px 0 rgba(212, 175, 55, 0.2)`,
                    backgroundImage: `
                      linear-gradient(135deg, ${theme.darkGray} 0%, ${theme.charcoal} 100%),
                      repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 1.5px,
                        rgba(212, 175, 55, 0.06) 1.5px,
                        rgba(212, 175, 55, 0.06) 2.5px
                      )
                    `,
                    backgroundBlendMode: 'normal'
                  }}
                >
                  {/* Gold shimmer effect */}
                  <div 
                    className="absolute top-0 left-0 w-full h-full opacity-5"
                    style={{
                      background: `radial-gradient(circle at center, ${theme.gold} 0%, transparent 70%)`
                    }}
                  />
                  
                  <div className="flex items-center gap-2 mb-3 relative">
                    <Gem size={20} style={{ color: theme.gold }} strokeWidth={1.5} />
                    <h3 
                      className="text-xl font-light tracking-wide" 
                      style={{ 
                        color: theme.gold
                      }}
                    >
                      Ready to Activate?
                    </h3>
                  </div>
                  <p className="text-sm mb-5 relative font-light leading-relaxed" style={{ color: theme.platinum }}>
                    Your vision is now saved. Next, shortlist or pass opportunities, and create leverage offers when you're ready.
                  </p>
                  <button
                    className="w-full px-6 py-4 rounded-lg flex items-center justify-between transition-all relative overflow-hidden hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                      color: theme.black,
                      border: `1px solid ${theme.gold}`,
                      boxShadow: `0 6px 25px ${theme.glowGold}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                      fontSize: "16px",
                    }}
                  >
                    <span className="font-medium tracking-wide">Go to Opportunities</span>
                    <ChevronRight size={22} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}