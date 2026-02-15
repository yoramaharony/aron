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
  Shield
} from "lucide-react";
import { AronLogo } from "@/app/components/AronLogo";

// Trust Azure Theme - Clean, Professional, Trustworthy
const theme = {
  azure: "#2E5C8A",
  azureLight: "#4A7BA7",
  azureBright: "#5A93C7",
  azureGlow: "rgba(46, 92, 138, 0.15)",
  trustBlue: "#3B82F6",
  trustGreen: "#10B981",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  lightGray: "#F1F5F9",
  mediumGray: "#E2E8F0",
  darkGray: "#64748B",
  textPrimary: "#1E293B",
  textSecondary: "#475569",
  border: "rgba(46, 92, 138, 0.12)",
  shadow: "rgba(46, 92, 138, 0.08)",
};

export function DonorDashboardRose() {
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
    <div className="flex h-screen" style={{ backgroundColor: theme.offWhite }}>
      {/* Sidebar */}
      <div 
        className="w-64 border-r flex flex-col relative"
        style={{ 
          backgroundColor: theme.white,
          borderColor: theme.border,
          boxShadow: `4px 0 30px ${theme.shadow}`
        }}
      >
        {/* Decorative top accent */}
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background: `linear-gradient(90deg, ${theme.azure} 0%, ${theme.azureBright} 50%, ${theme.azure} 100%)`
          }}
        />
        
        {/* Logo */}
        <div className="p-6 border-b relative" style={{ borderColor: theme.border }}>
          <div className="flex flex-col gap-3">
            <AronLogo 
              width={200} 
              height={50} 
              primaryColor={theme.azure}
              accentColor={theme.azureGlow}
            />
            <div 
              className="text-xs tracking-widest text-center font-medium" 
              style={{ color: theme.azureLight }}
            >
              TRUSTED IMPACT
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
                    ? `linear-gradient(90deg, ${theme.azure}08 0%, transparent 100%)`
                    : "transparent",
                  color: isActive ? theme.azure : theme.textSecondary,
                }}
              >
                {/* Left accent bar for active state */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ 
                      background: `linear-gradient(180deg, ${theme.azureBright}, ${theme.azure}, ${theme.azureBright})`,
                      boxShadow: `0 0 8px ${theme.azureGlow}`
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
                      background: `linear-gradient(90deg, ${theme.azure}05 0%, transparent 100%)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom badge */}
        <div className="p-4 border-t" style={{ borderColor: theme.border }}>
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: theme.lightGray }}
          >
            <Shield size={16} style={{ color: theme.azure }} />
            <div>
              <div className="text-xs font-medium" style={{ color: theme.azure }}>Verified Donor</div>
              <div className="text-xs" style={{ color: theme.textSecondary }}>Trusted Partner</div>
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
            className="px-6 py-5 border-b flex items-center justify-between"
            style={{ 
              backgroundColor: theme.white,
              borderColor: theme.border,
              boxShadow: `0 2px 20px ${theme.shadow}`
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center relative"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.azure} 0%, ${theme.azureBright} 100%)`,
                  boxShadow: `0 4px 15px ${theme.azureGlow}`
                }}
              >
                <Sparkles size={20} style={{ color: theme.white }} />
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 bg-green-500"
                  style={{ borderColor: theme.white }}
                />
              </div>
              <div>
                <div className="text-lg font-semibold" style={{ color: theme.textPrimary }}>Concierge AI</div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span style={{ color: theme.textSecondary }}>Available 24/7</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Award size={20} style={{ color: theme.azure }} />
              <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>Premium Service</span>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-6"
            style={{
              background: `radial-gradient(circle at top right, ${theme.lightGray} 0%, ${theme.offWhite} 50%)`
            }}
          >
            {conversations.map((conv) => (
              <div key={conv.id} className="flex gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.azure} 0%, ${theme.azureBright} 100%)`,
                    boxShadow: `0 4px 15px ${theme.shadow}`
                  }}
                >
                  <Sparkles size={20} style={{ color: theme.white }} />
                </div>
                <div className="flex-1 space-y-3">
                  <div 
                    className="p-5 rounded-xl relative overflow-hidden"
                    style={{ 
                      backgroundColor: theme.white,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `0 2px 8px ${theme.shadow}`
                    }}
                  >
                    {/* Decorative corner */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-5"
                      style={{
                        background: `radial-gradient(circle at top right, ${theme.azure} 0%, transparent 70%)`
                      }}
                    />
                    {conv.title}
                  </div>
                  
                  {conv.badge && (
                    <div 
                      className="inline-block px-5 py-3 rounded-lg text-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.azure}10 0%, ${theme.azure}20 100%)`,
                        color: theme.azure,
                        border: `1px solid ${theme.azure}40`,
                        boxShadow: `0 2px 8px ${theme.azureGlow}`
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Star size={14} style={{ color: theme.azure }} />
                        {conv.badge}
                      </div>
                    </div>
                  )}

                  {conv.button && (
                    <button
                      className="px-8 py-3 rounded-lg transition-all font-medium hover:scale-105 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${theme.azure} 0%, ${theme.azureBright} 100%)`,
                        color: theme.white,
                        boxShadow: `0 4px 15px ${theme.azureGlow}`,
                        border: `1px solid ${theme.azure}`,
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
                            backgroundColor: theme.lightGray,
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
            className="p-6 border-t"
            style={{ 
              backgroundColor: theme.white,
              borderColor: theme.border,
              boxShadow: `0 -2px 20px ${theme.shadow}`
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
                  backgroundColor: theme.offWhite,
                  color: theme.textPrimary,
                  border: `2px solid ${theme.border}`,
                }}
              />
              <button
                className="px-6 py-4 rounded-lg transition-all hover:scale-105 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.azure} 0%, ${theme.azureBright} 100%)`,
                  color: theme.white,
                  boxShadow: `0 4px 15px ${theme.azureGlow}`,
                  border: `1px solid ${theme.azure}`,
                }}
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Impact Vision */}
        <div 
          className="w-96 border-l overflow-y-auto"
          style={{ 
            backgroundColor: theme.white,
            borderColor: theme.border,
            boxShadow: `-4px 0 30px ${theme.shadow}`
          }}
        >
          <div className="p-6 space-y-6">
            {/* Header */}
            <div 
              className="p-5 rounded-xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.azure}08 0%, ${theme.azure}15 100%)`,
                border: `1px solid ${theme.azure}30`,
                boxShadow: `0 4px 15px ${theme.azureGlow}`
              }}
            >
              {/* Decorative pattern */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-5"
                style={{
                  background: `radial-gradient(circle, ${theme.azure} 0%, transparent 70%)`
                }}
              />
              
              <div className="flex items-start justify-between mb-3 relative">
                <div className="flex items-center gap-2">
                  <h2 
                    className="text-2xl tracking-wide font-semibold whitespace-nowrap" 
                    style={{ 
                      color: theme.azure
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
                    className="px-3 py-1.5 rounded-full text-xs tracking-wide font-medium"
                    style={{
                      background: `linear-gradient(135deg, ${theme.azure}15 0%, ${theme.azure}25 100%)`,
                      color: theme.azure,
                      border: `1px solid ${theme.azure}50`,
                      boxShadow: `0 2px 8px ${theme.azureGlow}`
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
                backgroundColor: theme.white,
                border: `1px solid ${theme.border}`,
                boxShadow: `0 2px 12px ${theme.shadow}`
              }}
            >
              <div className="flex items-center gap-2 mb-5 relative">
                <div 
                  className="p-1.5 rounded"
                  style={{ backgroundColor: theme.azure }}
                >
                  <TrendingUp size={16} style={{ color: theme.white }} />
                </div>
                <div 
                  className="text-xs tracking-widest font-bold" 
                  style={{ color: theme.azure }}
                >
                  IMPACT FORECAST
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div 
                  className="p-4 rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.azure}08 0%, ${theme.azure}15 100%)`,
                    border: `1px solid ${theme.azure}30`
                  }}
                >
                  <div 
                    className="text-4xl mb-2 font-bold" 
                    style={{ 
                      color: theme.azure
                    }}
                  >
                    4,800
                  </div>
                  <div className="text-xs tracking-wide font-medium" style={{ color: theme.textSecondary }}>
                    EST. LIVES IMPACTED
                  </div>
                </div>
                <div 
                  className="p-4 rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)`,
                    border: `1px solid rgba(16, 185, 129, 0.3)`
                  }}
                >
                  <div 
                    className="text-4xl mb-2 font-bold" 
                    style={{ 
                      color: theme.trustGreen
                    }}
                  >
                    88%
                  </div>
                  <div className="text-xs tracking-wide font-medium" style={{ color: theme.textSecondary }}>
                    EXECUTION CONFIDENCE
                  </div>
                </div>
              </div>

              <div className="space-y-3 relative">
                <div className="flex justify-between text-xs font-medium" style={{ color: theme.textSecondary }}>
                  <span className="tracking-wide">Overhead Exposure</span>
                  <span style={{ color: theme.azure }}>Low (4.2%)</span>
                </div>
                <div 
                  className="w-full h-2 rounded-full relative overflow-hidden" 
                  style={{ backgroundColor: theme.lightGray }}
                >
                  <div 
                    className="h-full rounded-full relative" 
                    style={{ 
                      width: "15%", 
                      background: `linear-gradient(90deg, ${theme.azure} 0%, ${theme.azureBright} 100%)`,
                      boxShadow: `0 0 8px ${theme.azureGlow}`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Focus */}
            <div 
              className="p-6 rounded-xl relative overflow-hidden"
              style={{ 
                backgroundColor: theme.white,
                border: `1px solid ${theme.border}`,
                boxShadow: `0 2px 12px ${theme.shadow}`
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div 
                  className="p-1.5 rounded"
                  style={{ backgroundColor: theme.azure }}
                >
                  <Target size={16} style={{ color: theme.white }} />
                </div>
                <div 
                  className="text-xs tracking-widest font-bold" 
                  style={{ color: theme.azure }}
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
                    style={{ borderColor: theme.border }}
                  >
                    <div 
                      className="text-xs mb-2 tracking-widest font-medium" 
                      style={{ color: theme.textSecondary }}
                    >
                      {item.label}
                    </div>
                    <div className="text-lg font-semibold" style={{ color: theme.azure }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div 
              className="p-6 rounded-xl relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${theme.azure}08 0%, ${theme.azure}15 100%)`,
                border: `2px solid ${theme.azure}50`,
                boxShadow: `0 8px 25px ${theme.azureGlow}`
              }}
            >
              <div className="flex items-center gap-2 mb-3 relative">
                <Shield size={20} style={{ color: theme.azure }} />
                <h3 
                  className="text-xl font-semibold" 
                  style={{ 
                    color: theme.azure
                  }}
                >
                  Ready to Activate?
                </h3>
              </div>
              <p className="text-sm mb-5 relative" style={{ color: theme.textSecondary }}>
                Your vision is now saved. Next, shortlist or pass opportunities, and create leverage offers when you're ready.
              </p>
              <button
                className="w-full px-6 py-4 rounded-lg flex items-center justify-between transition-all relative overflow-hidden hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${theme.azure} 0%, ${theme.azureBright} 100%)`,
                  color: theme.white,
                  boxShadow: `0 6px 20px ${theme.azureGlow}`,
                  border: `1px solid ${theme.azure}`,
                  fontSize: "16px",
                }}
              >
                <span className="font-semibold tracking-wide">Go to Opportunities</span>
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}