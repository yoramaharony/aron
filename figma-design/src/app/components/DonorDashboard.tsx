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
  ChevronRight,
  Gem,
  Award,
  Star,
  Heart
} from "lucide-react";
import { AronLogo } from "@/app/components/AronLogo";

// Royal Gold & Navy Theme - Enhanced
const theme = {
  gold: "#D4AF37",
  goldLight: "#E5C158",
  goldDark: "#B8941F",
  goldGlow: "rgba(212, 175, 55, 0.3)",
  navy: "#0A1628",
  navyLight: "#1B2B44",
  navyLighter: "#2C3E5A",
  background: "#050A14",
  cardBg: "#0F1419",
  cardBorder: "rgba(212, 175, 55, 0.2)",
  textSecondary: "#8898AA",
  navyDark: "#0A1628",
  navyMedium: "#1B2B44",
  border: "#0A1628",
  shadow: "rgba(212, 175, 55, 0.3)",
  goldRing: "rgba(212, 175, 55, 0.5)"
};

export function DonorDashboard() {
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
    <div className="flex h-screen" style={{ backgroundColor: theme.navyDark }}>
      {/* Sidebar */}
      <div 
        className="w-64 border-r flex flex-col relative"
        style={{ 
          background: `linear-gradient(180deg, ${theme.navyMedium} 0%, ${theme.navyDark} 100%)`,
          borderColor: theme.border,
          boxShadow: `4px 0 40px ${theme.shadow}`,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 3px,
              rgba(212, 175, 55, 0.03) 3px,
              rgba(212, 175, 55, 0.03) 6px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 3px,
              rgba(10, 22, 40, 0.5) 3px,
              rgba(10, 22, 40, 0.5) 6px
            )
          `
        }}
      >
        {/* Decorative gold accent top */}
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${theme.gold} 50%, transparent 100%)`,
            boxShadow: `0 0 10px ${theme.goldGlow}`
          }}
        />
        
        {/* Logo */}
        <div className="p-6 border-b relative" style={{ borderColor: theme.cardBorder }}>
          <div className="flex flex-col gap-3">
            <AronLogo 
              width={200} 
              height={50} 
              primaryColor={theme.gold}
              accentColor={theme.goldGlow}
            />
            <div 
              className="text-xs tracking-widest text-center opacity-90" 
              style={{ color: theme.goldLight }}
            >
              CHANNEL YOUR IMPACT
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
                    ? `linear-gradient(90deg, ${theme.gold}08 0%, transparent 100%)`
                    : "transparent",
                  color: isActive ? theme.gold : theme.goldLight,
                }}
              >
                {/* Left accent bar for active state */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ 
                      background: `linear-gradient(180deg, ${theme.goldLight}, ${theme.gold}, ${theme.goldLight})`,
                      boxShadow: `0 0 8px ${theme.goldGlow}`
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
                  <Icon size={18} />
                </div>
                
                <span className="font-medium relative z-10">{item.label}</span>
                
                {/* Hover effect for non-active items */}
                {!isActive && (
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, ${theme.gold}05 0%, transparent 100%)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom decorative accent */}
        <div className="p-4 border-t" style={{ borderColor: theme.cardBorder }}>
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: theme.navyLighter }}
          >
            <Gem size={16} style={{ color: theme.gold }} />
            <div>
              <div className="text-xs" style={{ color: theme.gold }}>Elite Member</div>
              <div className="text-xs opacity-70" style={{ color: theme.goldLight }}>Premium Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat/Conversation Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div 
            className="px-6 py-5 border-b flex items-center justify-between relative"
            style={{ 
              background: `linear-gradient(135deg, ${theme.navyMedium} 0%, ${theme.navyDark} 100%)`,
              borderColor: theme.border,
              boxShadow: `0 2px 20px ${theme.shadow}`,
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(212, 175, 55, 0.04) 2px,
                  rgba(212, 175, 55, 0.04) 4px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(10, 22, 40, 0.6) 2px,
                  rgba(10, 22, 40, 0.6) 4px
                )
              `
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center relative"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                  boxShadow: `0 4px 20px ${theme.goldGlow}`
                }}
              >
                <Sparkles size={20} style={{ color: theme.navy }} />
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 bg-green-500"
                  style={{ borderColor: theme.navyLight }}
                />
              </div>
              <div>
                <div className="text-lg" style={{ color: theme.gold }}>Concierge AI</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span style={{ color: theme.goldLight }}>Available 24/7</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Award size={20} style={{ color: theme.gold }} />
              <span className="text-sm" style={{ color: theme.goldLight }}>Platinum Service</span>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-6"
            style={{
              background: `radial-gradient(circle at top right, ${theme.navyLight} 0%, ${theme.background} 50%)`
            }}
          >
            {conversations.map((conv) => (
              <div key={conv.id} className="flex gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.navyLighter} 0%, ${theme.navyLight} 100%)`,
                    border: `1px solid ${theme.cardBorder}`,
                    boxShadow: `0 4px 15px rgba(0,0,0,0.3)`
                  }}
                >
                  <Sparkles size={20} style={{ color: theme.gold }} />
                </div>
                <div className="flex-1 space-y-3">
                  <div 
                    className="p-5 rounded-xl relative overflow-hidden"
                    style={{ 
                      backgroundColor: theme.cardBg,
                      color: theme.goldLight,
                      border: `1px solid ${theme.cardBorder}`,
                      boxShadow: `0 4px 20px rgba(0,0,0,0.4)`
                    }}
                  >
                    {/* Decorative corner */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-10"
                      style={{
                        background: `radial-gradient(circle at top right, ${theme.gold} 0%, transparent 70%)`
                      }}
                    />
                    {conv.title}
                  </div>
                  
                  {conv.badge && (
                    <div 
                      className="inline-block px-5 py-3 rounded-lg text-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.navyLighter} 0%, ${theme.navyLight} 100%)`,
                        color: theme.gold,
                        border: `1px solid ${theme.cardBorder}`,
                        boxShadow: `0 4px 15px ${theme.goldGlow}`
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Star size={14} style={{ color: theme.gold }} />
                        {conv.badge}
                      </div>
                    </div>
                  )}

                  {conv.button && (
                    <button
                      className="px-8 py-3 rounded-lg transition-all font-medium hover:scale-105 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${theme.navyLighter} 0%, ${theme.navyLight} 100%)`,
                        color: theme.gold,
                        boxShadow: `0 4px 20px ${theme.goldGlow}`,
                        border: `2px solid ${theme.cardBorder}`,
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
                          className="px-4 py-2 rounded-lg text-xs"
                          style={{
                            backgroundColor: theme.navyLighter,
                            color: theme.goldLight,
                            border: `1px solid ${theme.cardBorder}`,
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
              background: `linear-gradient(135deg, ${theme.navyMedium} 0%, ${theme.navyDark} 100%)`,
              borderColor: theme.border,
              boxShadow: `0 -2px 20px ${theme.shadow}`,
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(212, 175, 55, 0.04) 2px,
                  rgba(212, 175, 55, 0.04) 4px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(10, 22, 40, 0.6) 2px,
                  rgba(10, 22, 40, 0.6) 4px
                )
              `
            }}
          >
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Describe your impact vision..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-5 py-4 rounded-lg outline-none transition-all"
                style={{
                  backgroundColor: theme.cardBg,
                  color: theme.goldLight,
                  border: `1px solid ${theme.cardBorder}`,
                }}
              />
              <button
                className="px-6 py-4 rounded-lg transition-all hover:scale-105 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.navyLighter} 0%, ${theme.navyLight} 100%)`,
                  color: theme.gold,
                  boxShadow: `0 4px 20px ${theme.goldGlow}`,
                  border: `2px solid ${theme.cardBorder}`,
                }}
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Impact Vision */}
        <div 
          className="w-96 border-l overflow-y-auto relative"
          style={{ 
            background: `linear-gradient(180deg, ${theme.navyMedium} 0%, ${theme.navyDark} 100%)`,
            borderColor: theme.border,
            boxShadow: `-4px 0 40px ${theme.shadow}`,
            backgroundImage: `
              repeating-linear-gradient(
                120deg,
                transparent,
                transparent 2px,
                rgba(212, 175, 55, 0.04) 2px,
                rgba(212, 175, 55, 0.04) 4px
              ),
              repeating-linear-gradient(
                60deg,
                transparent,
                transparent 2px,
                rgba(10, 22, 40, 0.5) 2px,
                rgba(10, 22, 40, 0.5) 4px
              )
            `
          }}
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div 
              className="p-5 rounded-xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.navyLighter} 0%, ${theme.navyLight} 100%)`,
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: `0 4px 20px ${theme.goldGlow}`
              }}
            >
              {/* Decorative pattern */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-5"
                style={{
                  background: `radial-gradient(circle, ${theme.gold} 0%, transparent 70%)`
                }}
              />
              
              <div className="flex items-start justify-between mb-3 relative">
                <div className="flex items-center gap-2">
                  <h2 
                    className="text-2xl tracking-wide font-semibold whitespace-nowrap" 
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    Impact Vision
                  </h2>
                </div>
                <div className="text-xs text-right" style={{ color: theme.textSecondary }}>
                  <div className="tracking-wider font-medium">LAST UPDATED</div>
                  <div>2/2/2025, 2:07:33 PM</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {["CHILDREN & FAMILIES", "CLEAN WATER", "ISRAEL", "ENVIRONMENT"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-xs tracking-wide"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gold}15 0%, ${theme.gold}25 100%)`,
                      color: theme.gold,
                      border: `1px solid ${theme.gold}`,
                      boxShadow: `0 2px 10px ${theme.goldGlow}`
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
                background: `linear-gradient(135deg, ${theme.navyLight} 0%, ${theme.navyMedium} 100%)`,
                border: `2px solid ${theme.goldRing}`,
                boxShadow: `0 6px 20px ${theme.goldGlow}, inset 0 1px 0 rgba(212, 175, 55, 0.2)`,
                backgroundImage: `
                  linear-gradient(135deg, ${theme.navyLight} 0%, ${theme.navyMedium} 100%),
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(212, 175, 55, 0.08) 2px,
                    rgba(212, 175, 55, 0.08) 4px
                  ),
                  repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 2px,
                    rgba(212, 175, 55, 0.05) 2px,
                    rgba(212, 175, 55, 0.05) 4px
                  )
                `,
                backgroundBlendMode: 'normal'
              }}
            >
              {/* Decorative glow */}
              <div 
                className="absolute top-0 left-0 w-full h-full opacity-5"
                style={{
                  background: `radial-gradient(circle at center, ${theme.gold} 0%, transparent 70%)`
                }}
              />
              
              <div className="flex items-center gap-2 mb-5 relative">
                <div 
                  className="p-1.5 rounded"
                  style={{ backgroundColor: theme.gold }}
                >
                  <TrendingUp size={16} style={{ color: theme.navy }} />
                </div>
                <div 
                  className="text-xs tracking-widest font-medium" 
                  style={{ color: theme.gold }}
                >
                  IMPACT FORECAST
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div 
                  className="p-4 rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.navyLighter} 0%, ${theme.navyLight} 100%)`,
                    border: `1px solid ${theme.cardBorder}`
                  }}
                >
                  <div 
                    className="text-4xl mb-2 font-medium" 
                    style={{ 
                      color: theme.gold,
                      textShadow: `0 2px 15px ${theme.goldGlow}`
                    }}
                  >
                    4,800
                  </div>
                  <div className="text-xs tracking-wide" style={{ color: theme.goldLight, opacity: 0.8 }}>
                    EST. LIVES IMPACTED
                  </div>
                </div>
                <div 
                  className="p-4 rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.05) 100%)`,
                    border: `1px solid rgba(74, 222, 128, 0.3)`
                  }}
                >
                  <div 
                    className="text-4xl mb-2 font-medium" 
                    style={{ 
                      color: "#4ADE80",
                      textShadow: "0 2px 15px rgba(74, 222, 128, 0.3)"
                    }}
                  >
                    88%
                  </div>
                  <div className="text-xs tracking-wide" style={{ color: theme.goldLight, opacity: 0.8 }}>
                    EXECUTION CONFIDENCE
                  </div>
                </div>
              </div>

              <div className="space-y-3 relative">
                <div className="flex justify-between text-xs" style={{ color: theme.goldLight }}>
                  <span className="tracking-wide">Overhead Exposure</span>
                  <span style={{ color: theme.gold }}>Low (4.2%)</span>
                </div>
                <div 
                  className="w-full h-2 rounded-full relative overflow-hidden" 
                  style={{ backgroundColor: theme.navyLighter }}
                >
                  <div 
                    className="h-full rounded-full relative" 
                    style={{ 
                      width: "15%", 
                      background: `linear-gradient(90deg, ${theme.gold} 0%, ${theme.goldLight} 100%)`,
                      boxShadow: `0 0 10px ${theme.goldGlow}`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Focus */}
            <div 
              className="p-6 rounded-xl relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${theme.navyLight} 0%, ${theme.navyMedium} 100%)`,
                border: `2px solid ${theme.goldRing}`,
                boxShadow: `0 6px 20px ${theme.goldGlow}, inset 0 1px 0 rgba(212, 175, 55, 0.2)`,
                backgroundImage: `
                  linear-gradient(135deg, ${theme.navyLight} 0%, ${theme.navyMedium} 100%),
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(212, 175, 55, 0.08) 2px,
                    rgba(212, 175, 55, 0.08) 4px
                  ),
                  repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 2px,
                    rgba(212, 175, 55, 0.05) 2px,
                    rgba(212, 175, 55, 0.05) 4px
                  )
                `,
                backgroundBlendMode: 'normal'
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div 
                  className="p-1.5 rounded"
                  style={{ backgroundColor: theme.gold }}
                >
                  <Target size={16} style={{ color: theme.navy }} />
                </div>
                <div 
                  className="text-xs tracking-widest font-medium" 
                  style={{ color: theme.gold }}
                >
                  FOCUS
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { label: "STATUS", value: "Confirmed" },
                  { label: "GEO FOCUS", value: "Africa • Israel • Emerging markets" },
                  { label: "TIME HORIZON", value: "3 year" },
                  { label: "GIVING BUDGET", value: "$3M" },
                  { label: "12-MONTH OUTCOME", value: "Captured" }
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="pb-4 border-b last:border-b-0"
                    style={{ borderColor: theme.cardBorder }}
                  >
                    <div 
                      className="text-xs mb-2 tracking-widest" 
                      style={{ color: theme.goldLight, opacity: 0.7 }}
                    >
                      {item.label}
                    </div>
                    <div className="text-lg" style={{ color: theme.gold }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div 
              className="p-6 rounded-xl relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${theme.navyLighter} 0%, ${theme.navyLight} 100%)`,
                border: `2px solid ${theme.gold}`,
                boxShadow: `0 8px 30px ${theme.goldGlow}`
              }}
            >
              {/* Decorative shine effect */}
              <div 
                className="absolute top-0 left-0 w-full h-full opacity-10"
                style={{
                  background: `linear-gradient(135deg, transparent 0%, ${theme.gold} 50%, transparent 100%)`
                }}
              />
              
              <div className="flex items-center gap-2 mb-3 relative">
                <Gem size={20} style={{ color: theme.gold }} />
                <h3 
                  className="text-xl" 
                  style={{ 
                    color: theme.gold,
                    textShadow: `0 2px 10px ${theme.goldGlow}`
                  }}
                >
                  Ready to Activate?
                </h3>
              </div>
              <p className="text-sm mb-5 relative" style={{ color: theme.goldLight }}>
                Your vision is now saved. Next, shortlist or pass opportunities, and create leverage offers when you're ready.
              </p>
              <button
                className="w-full px-6 py-4 rounded-lg flex items-center justify-between transition-all relative overflow-hidden hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${theme.navyLighter} 0%, ${theme.navyLight} 100%)`,
                  color: theme.gold,
                  boxShadow: `0 6px 25px ${theme.goldGlow}`,
                  border: `2px solid ${theme.cardBorder}`,
                  fontSize: "16px",
                }}
              >
                <span className="font-medium tracking-wide">Go to Opportunities</span>
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}