import { useState } from "react";
import { Crown, TrendingUp, Users, DollarSign, Award, Heart } from "lucide-react";

// Design System 1: Gold + Deep Navy
const navyTheme = {
  name: "Royal Gold & Navy",
  description: "Timeless sophistication with deep midnight blue",
  colors: {
    primary: "#D4AF37", // Rich gold
    primaryLight: "#E5C158",
    primaryDark: "#B8941F",
    accent: "#0A1628", // Deep navy
    accentLight: "#1B2B44",
    accentLighter: "#2C3E5A",
    background: "#FAFAF9",
    text: "#1A1A1A",
    textLight: "#6B6B6B",
  }
};

// Design System 2: Gold + Deep Burgundy
const burgundyTheme = {
  name: "Royal Gold & Burgundy",
  description: "Regal elegance with deep wine tones",
  colors: {
    primary: "#D4AF37", // Rich gold
    primaryLight: "#E5C158",
    primaryDark: "#B8941F",
    accent: "#4A1C2F", // Deep burgundy
    accentLight: "#6B2737",
    accentLighter: "#8A3544",
    background: "#FAFAF9",
    text: "#1A1A1A",
    textLight: "#6B6B6B",
  }
};

interface DesignSystemProps {
  theme: typeof navyTheme;
}

function DesignSystem({ theme }: DesignSystemProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="w-full max-w-6xl mx-auto p-8" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Crown style={{ color: theme.colors.primary }} size={32} />
          <h1 className="text-4xl" style={{ color: theme.colors.accent }}>{theme.name}</h1>
        </div>
        <p className="text-lg" style={{ color: theme.colors.textLight }}>{theme.description}</p>
      </div>

      {/* Color Palette */}
      <section className="mb-12">
        <h2 className="text-2xl mb-6" style={{ color: theme.colors.text }}>Color Palette</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div 
              className="h-32 rounded-lg mb-3 shadow-md border-2" 
              style={{ 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primaryDark 
              }}
            />
            <p style={{ color: theme.colors.text }}>Primary Gold</p>
            <p className="text-sm" style={{ color: theme.colors.textLight }}>{theme.colors.primary}</p>
          </div>
          <div>
            <div 
              className="h-32 rounded-lg mb-3 shadow-md" 
              style={{ backgroundColor: theme.colors.accent }}
            />
            <p style={{ color: theme.colors.text }}>Accent</p>
            <p className="text-sm" style={{ color: theme.colors.textLight }}>{theme.colors.accent}</p>
          </div>
          <div>
            <div 
              className="h-32 rounded-lg mb-3 shadow-md" 
              style={{ backgroundColor: theme.colors.accentLight }}
            />
            <p style={{ color: theme.colors.text }}>Accent Light</p>
            <p className="text-sm" style={{ color: theme.colors.textLight }}>{theme.colors.accentLight}</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-2xl mb-6" style={{ color: theme.colors.text }}>Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button
            className="px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.accent,
            }}
          >
            Primary Button
          </button>
          <button
            className="px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.primary,
            }}
          >
            Secondary Button
          </button>
          <button
            className="px-6 py-3 rounded-lg transition-all border-2"
            style={{
              backgroundColor: "transparent",
              borderColor: theme.colors.primary,
              color: theme.colors.primary,
            }}
          >
            Outlined Button
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-2xl mb-6" style={{ color: theme.colors.text }}>Cards & Metrics</h2>
        <div className="grid grid-cols-3 gap-6">
          <div 
            className="p-6 rounded-lg shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.accentLight} 100%)`,
              color: theme.colors.primary 
            }}
          >
            <DollarSign className="mb-3" size={32} style={{ color: theme.colors.primary }} />
            <div className="text-3xl mb-1" style={{ color: theme.colors.primary }}>$2.4M</div>
            <div className="text-sm opacity-90">Total Donations</div>
          </div>
          
          <div 
            className="p-6 rounded-lg shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%)`,
              color: theme.colors.accent 
            }}
          >
            <Users className="mb-3" size={32} />
            <div className="text-3xl mb-1">1,247</div>
            <div className="text-sm opacity-90">Active Donors</div>
          </div>

          <div 
            className="p-6 rounded-lg shadow-lg border-2"
            style={{ 
              backgroundColor: "white",
              borderColor: theme.colors.primary,
              color: theme.colors.accent 
            }}
          >
            <Award className="mb-3" size={32} style={{ color: theme.colors.primary }} />
            <div className="text-3xl mb-1" style={{ color: theme.colors.accent }}>156</div>
            <div className="text-sm" style={{ color: theme.colors.textLight }}>Platinum Members</div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="mb-12">
        <h2 className="text-2xl mb-6" style={{ color: theme.colors.text }}>Navigation Tabs</h2>
        <div className="flex gap-2 border-b-2" style={{ borderColor: theme.colors.accentLighter }}>
          {["overview", "donors", "campaigns"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-3 capitalize transition-all"
              style={{
                color: activeTab === tab ? theme.colors.primary : theme.colors.textLight,
                borderBottom: activeTab === tab ? `3px solid ${theme.colors.primary}` : "3px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* List Items */}
      <section className="mb-12">
        <h2 className="text-2xl mb-6" style={{ color: theme.colors.text }}>List Items</h2>
        <div className="space-y-3">
          {[
            { name: "John Vanderbilt", amount: "$50,000", tier: "Platinum" },
            { name: "Sarah Wellington", amount: "$35,000", tier: "Gold" },
            { name: "Michael Sterling", amount: "$25,000", tier: "Gold" },
          ].map((donor, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-5 rounded-lg shadow-sm hover:shadow-md transition-all"
              style={{ 
                backgroundColor: "white",
                borderLeft: `4px solid ${theme.colors.primary}` 
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.accent }}
                >
                  <Crown size={20} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <div style={{ color: theme.colors.text }}>{donor.name}</div>
                  <div className="text-sm" style={{ color: theme.colors.textLight }}>{donor.tier} Member</div>
                </div>
              </div>
              <div style={{ color: theme.colors.primary }}>{donor.amount}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Sample */}
      <section className="mb-12">
        <h2 className="text-2xl mb-6" style={{ color: theme.colors.text }}>Dashboard Preview</h2>
        <div 
          className="p-8 rounded-lg shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.accentLighter} 100%)`
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl mb-2" style={{ color: theme.colors.primary }}>Welcome Back, Administrator</h3>
              <p style={{ color: theme.colors.primaryLight, opacity: 0.9 }}>Your impact dashboard</p>
            </div>
            <Heart size={40} style={{ color: theme.colors.primary }} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} style={{ color: theme.colors.primary }} />
                <span style={{ color: theme.colors.primaryLight }}>Monthly Growth</span>
              </div>
              <div className="text-2xl" style={{ color: theme.colors.primary }}>+18.5%</div>
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Award size={20} style={{ color: theme.colors.primary }} />
                <span style={{ color: theme.colors.primaryLight }}>New Members</span>
              </div>
              <div className="text-2xl" style={{ color: theme.colors.primary }}>23</div>
            </div>
          </div>
        </div>
      </section>

      {/* Badge Samples */}
      <section>
        <h2 className="text-2xl mb-6" style={{ color: theme.colors.text }}>Badges & Tags</h2>
        <div className="flex flex-wrap gap-3">
          <span 
            className="px-4 py-2 rounded-full text-sm"
            style={{ 
              backgroundColor: theme.colors.primary,
              color: theme.colors.accent 
            }}
          >
            Platinum Tier
          </span>
          <span 
            className="px-4 py-2 rounded-full text-sm"
            style={{ 
              backgroundColor: theme.colors.accent,
              color: theme.colors.primary 
            }}
          >
            Active Campaign
          </span>
          <span 
            className="px-4 py-2 rounded-full text-sm border-2"
            style={{ 
              borderColor: theme.colors.primary,
              color: theme.colors.primary 
            }}
          >
            Recurring Donor
          </span>
          <span 
            className="px-4 py-2 rounded-full text-sm"
            style={{ 
              backgroundColor: theme.colors.accentLight,
              color: theme.colors.primary 
            }}
          >
            VIP Access
          </span>
        </div>
      </section>
    </div>
  );
}

export function DesignSystemShowcase() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-8 mb-12">
        <h1 className="text-5xl text-center mb-4 text-gray-900">Exclusive Design Systems</h1>
        <p className="text-center text-xl text-gray-600">Choose the color theme that best represents your luxury brand</p>
      </div>
      
      <div className="space-y-16">
        <div className="border-4 border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-8 py-4 border-b-4 border-gray-200">
            <h2 className="text-2xl text-gray-800">Option 1: Royal Gold & Navy</h2>
          </div>
          <DesignSystem theme={navyTheme} />
        </div>

        <div className="border-4 border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-8 py-4 border-b-4 border-gray-200">
            <h2 className="text-2xl text-gray-800">Option 2: Royal Gold & Burgundy</h2>
          </div>
          <DesignSystem theme={burgundyTheme} />
        </div>
      </div>
    </div>
  );
}
