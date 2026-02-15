import { useState } from "react";
import { Mail, Link2, ChevronDown, ChevronUp, Sparkles, Send, Copy } from "lucide-react";

// Black Card Theme
const theme = {
  blackPrimary: "#1A1A1A",
  blackDark: "#0A0A0A",
  blackMedium: "#2A2A2A",
  blackLight: "#3A3A3A",
  gold: "#D4AF37",
  goldLight: "#E5C158",
  goldDark: "#B8941F",
  goldGlow: "rgba(212, 175, 55, 0.3)",
  silver: "#C0C0C0",
  silverLight: "#E0E0E0",
  silverDark: "#8C8C8C",
  silverGlow: "rgba(192, 192, 192, 0.2)",
  textPrimary: "#E5E5E5",
  textSecondary: "#A0A0A0",
  textMuted: "#707070",
  border: "rgba(192, 192, 192, 0.15)",
  borderGold: "rgba(212, 175, 55, 0.3)",
  shadow: "rgba(0, 0, 0, 0.5)",
  shadowStrong: "rgba(0, 0, 0, 0.7)",
};

export function InviteForm() {
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "link">("email");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [note, setNote] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  return (
    <div 
      className="min-h-screen p-8"
      style={{ 
        backgroundColor: theme.blackDark,
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 1px,
            rgba(192, 192, 192, 0.03) 1px,
            rgba(192, 192, 192, 0.03) 2px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(0, 0, 0, 0.4) 1px,
            rgba(0, 0, 0, 0.4) 2px
          )
        `
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 
              className="text-4xl font-bold mb-2 tracking-tight"
              style={{ color: theme.textPrimary }}
            >
              Invites
            </h1>
            <p 
              className="text-sm"
              style={{ color: theme.textSecondary }}
            >
              Generate invite codes for donors. Nonprofits must be invited by donors they will submit to.
            </p>
          </div>
          <div className="text-right">
            <div 
              className="text-xs tracking-wider mb-1"
              style={{ color: theme.textMuted }}
            >
              Admin login
            </div>
            <div 
              className="text-sm font-mono"
              style={{ color: theme.silver }}
            >
              /admin/login
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div 
          className="rounded-xl p-8 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.blackMedium} 0%, ${theme.blackPrimary} 100%)`,
            backgroundImage: `
              linear-gradient(135deg, ${theme.blackMedium} 0%, ${theme.blackPrimary} 100%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(192, 192, 192, 0.04) 2px,
                rgba(192, 192, 192, 0.04) 4px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.5) 2px,
                rgba(0, 0, 0, 0.5) 4px
              )
            `,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 8px 32px ${theme.shadowStrong}`
          }}
        >
          {/* Gold accent line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${theme.gold} 50%, transparent 100%)`,
              boxShadow: `0 0 15px ${theme.goldGlow}`
            }}
          />

          {/* Form Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 
                className="text-2xl font-bold mb-1"
                style={{ color: theme.textPrimary }}
              >
                Create Invite
              </h2>
              <p 
                className="text-xs tracking-wide font-mono"
                style={{ color: theme.textMuted }}
              >
                Admin-only endpoint: /api/admin/invites
              </p>
            </div>
            <button
              className="px-6 py-3 rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-semibold"
              style={{
                background: `linear-gradient(135deg, ${theme.goldDark} 0%, ${theme.gold} 50%, ${theme.goldLight} 100%)`,
                color: theme.blackDark,
                border: `1px solid ${theme.borderGold}`,
                boxShadow: `0 6px 20px ${theme.goldGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                letterSpacing: '0.05em'
              }}
            >
              <Send size={18} />
              Generate Code
            </button>
          </div>

          {/* Invite Type */}
          <div className="mb-8">
            <label 
              className="text-xs tracking-widest font-bold mb-3 block"
              style={{ color: theme.silver }}
            >
              INVITE TYPE
            </label>
            <div 
              className="p-5 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.blackLight} 0%, ${theme.blackMedium} 100%)`,
                border: `1px solid ${theme.border}`,
                boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.3)`
              }}
            >
              <div 
                className="text-lg font-semibold mb-2"
                style={{ color: theme.textPrimary }}
              >
                Donor
              </div>
              <div 
                className="text-sm"
                style={{ color: theme.textSecondary }}
              >
                Admin creates donors; donors then invite nonprofits (requestors).
              </div>
            </div>
          </div>

          {/* Delivery Method - Exclusive Toggle */}
          <div className="mb-8">
            <label 
              className="text-xs tracking-widest font-bold mb-4 block"
              style={{ color: theme.silver }}
            >
              DELIVERY METHOD
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Email Option */}
              <button
                onClick={() => setDeliveryMethod("email")}
                className="relative p-6 rounded-lg transition-all group"
                style={{
                  background: deliveryMethod === "email" 
                    ? `linear-gradient(135deg, ${theme.blackLight} 0%, ${theme.blackMedium} 100%)`
                    : `linear-gradient(135deg, ${theme.blackMedium} 0%, ${theme.blackPrimary} 100%)`,
                  backgroundImage: deliveryMethod === "email"
                    ? `
                      linear-gradient(135deg, ${theme.blackLight} 0%, ${theme.blackMedium} 100%),
                      repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 2px,
                        rgba(212, 175, 55, 0.08) 2px,
                        rgba(212, 175, 55, 0.08) 4px
                      )
                    `
                    : 'none',
                  border: deliveryMethod === "email" 
                    ? `2px solid ${theme.gold}`
                    : `2px solid ${theme.border}`,
                  boxShadow: deliveryMethod === "email"
                    ? `0 6px 20px ${theme.goldGlow}, inset 0 1px 0 rgba(212, 175, 55, 0.2)`
                    : `0 2px 8px rgba(0, 0, 0, 0.3)`,
                }}
              >
                {/* Radio indicator */}
                <div className="flex items-start gap-3 mb-4">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      border: deliveryMethod === "email" 
                        ? `2px solid ${theme.gold}`
                        : `2px solid ${theme.silver}`,
                      background: deliveryMethod === "email" ? theme.blackMedium : 'transparent'
                    }}
                  >
                    {deliveryMethod === "email" && (
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.goldDark} 0%, ${theme.gold} 100%)`,
                          boxShadow: `0 0 8px ${theme.goldGlow}`
                        }}
                      />
                    )}
                  </div>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: deliveryMethod === "email"
                        ? `linear-gradient(135deg, ${theme.goldDark} 0%, ${theme.gold} 100%)`
                        : `linear-gradient(135deg, ${theme.blackMedium} 0%, ${theme.blackLight} 100%)`,
                      border: `1px solid ${deliveryMethod === "email" ? theme.gold : theme.border}`,
                      boxShadow: deliveryMethod === "email" 
                        ? `0 2px 8px ${theme.goldGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                        : 'none'
                    }}
                  >
                    <Mail 
                      size={20} 
                      style={{ color: deliveryMethod === "email" ? theme.blackDark : theme.silver }} 
                    />
                  </div>
                </div>
                <div>
                  <div 
                    className="text-lg font-semibold mb-2"
                    style={{ color: deliveryMethod === "email" ? theme.gold : theme.textPrimary }}
                  >
                    Email Invite
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    Send immediately
                  </div>
                </div>
              </button>

              {/* Copy Link Option */}
              <button
                onClick={() => setDeliveryMethod("link")}
                className="relative p-6 rounded-lg transition-all group"
                style={{
                  background: deliveryMethod === "link" 
                    ? `linear-gradient(135deg, ${theme.blackLight} 0%, ${theme.blackMedium} 100%)`
                    : `linear-gradient(135deg, ${theme.blackMedium} 0%, ${theme.blackPrimary} 100%)`,
                  backgroundImage: deliveryMethod === "link"
                    ? `
                      linear-gradient(135deg, ${theme.blackLight} 0%, ${theme.blackMedium} 100%),
                      repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 2px,
                        rgba(212, 175, 55, 0.08) 2px,
                        rgba(212, 175, 55, 0.08) 4px
                      )
                    `
                    : 'none',
                  border: deliveryMethod === "link" 
                    ? `2px solid ${theme.gold}`
                    : `2px solid ${theme.border}`,
                  boxShadow: deliveryMethod === "link"
                    ? `0 6px 20px ${theme.goldGlow}, inset 0 1px 0 rgba(212, 175, 55, 0.2)`
                    : `0 2px 8px rgba(0, 0, 0, 0.3)`,
                }}
              >
                {/* Radio indicator */}
                <div className="flex items-start gap-3 mb-4">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      border: deliveryMethod === "link" 
                        ? `2px solid ${theme.gold}`
                        : `2px solid ${theme.silver}`,
                      background: deliveryMethod === "link" ? theme.blackMedium : 'transparent'
                    }}
                  >
                    {deliveryMethod === "link" && (
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.goldDark} 0%, ${theme.gold} 100%)`,
                          boxShadow: `0 0 8px ${theme.goldGlow}`
                        }}
                      />
                    )}
                  </div>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: deliveryMethod === "link"
                        ? `linear-gradient(135deg, ${theme.goldDark} 0%, ${theme.gold} 100%)`
                        : `linear-gradient(135deg, ${theme.blackMedium} 0%, ${theme.blackLight} 100%)`,
                      border: `1px solid ${deliveryMethod === "link" ? theme.gold : theme.border}`,
                      boxShadow: deliveryMethod === "link" 
                        ? `0 2px 8px ${theme.goldGlow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                        : 'none'
                    }}
                  >
                    <Copy 
                      size={20} 
                      style={{ color: deliveryMethod === "link" ? theme.blackDark : theme.silver }} 
                    />
                  </div>
                </div>
                <div>
                  <div 
                    className="text-lg font-semibold mb-2"
                    style={{ color: deliveryMethod === "link" ? theme.gold : theme.textPrimary }}
                  >
                    Copy Link
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    Share manually
                  </div>
                </div>
              </button>
            </div>

            {/* Helper text */}
            {deliveryMethod === "email" && (
              <div 
                className="mt-4 px-4 py-3 rounded-lg flex items-start gap-3"
                style={{
                  background: `linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)`,
                  border: `1px solid ${theme.borderGold}`,
                }}
              >
                <Sparkles size={16} style={{ color: theme.gold, marginTop: 2, flexShrink: 0 }} />
                <div 
                  className="text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  When the code is created, an invite email is sent immediately (via Mailgun). You can still copy/share the link after creation.
                </div>
              </div>
            )}
          </div>

          {/* Note Field */}
          <div className="mb-8">
            <label 
              className="text-xs tracking-widest font-bold mb-3 block"
              style={{ color: theme.silver }}
            >
              NOTE (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder='e.g. "Donor: Yehuda (pilot)"'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-5 py-4 rounded-lg outline-none transition-all"
              style={{
                background: theme.blackPrimary,
                color: theme.textPrimary,
                border: `2px solid ${theme.border}`,
                boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.3)`,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.gold;
                e.target.style.boxShadow = `inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 3px ${theme.goldGlow}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.border;
                e.target.style.boxShadow = `inset 0 2px 4px rgba(0, 0, 0, 0.3)`;
              }}
            />
          </div>

          {/* Recipient Email - Only shown if email delivery */}
          {deliveryMethod === "email" && (
            <div className="mb-8">
              <label 
                className="text-xs tracking-widest font-bold mb-3 block"
                style={{ color: theme.silver }}
              >
                RECIPIENT EMAIL
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. someone@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-lg outline-none transition-all"
                  style={{
                    background: theme.blackPrimary,
                    color: theme.textPrimary,
                    border: `2px solid ${theme.border}`,
                    boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.3)`,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.gold;
                    e.target.style.boxShadow = `inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 3px ${theme.goldGlow}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.border;
                    e.target.style.boxShadow = `inset 0 2px 4px rgba(0, 0, 0, 0.3)`;
                  }}
                />
                <div 
                  className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.3) 100%)`,
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.5)'
                  }}
                >
                  REQUIRED
                </div>
              </div>
            </div>
          )}

          {/* Advanced Section */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all w-full"
              style={{
                background: showAdvanced 
                  ? `linear-gradient(135deg, ${theme.blackLight} 0%, ${theme.blackMedium} 100%)`
                  : 'transparent',
                border: `1px solid ${theme.border}`,
                color: theme.silver,
              }}
            >
              {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              <span className="text-sm font-semibold tracking-wide">Advanced</span>
            </button>

            {showAdvanced && (
              <div 
                className="mt-4 p-6 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme.blackLight} 0%, ${theme.blackMedium} 100%)`,
                  border: `1px solid ${theme.border}`,
                  boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.3)`
                }}
              >
                <div 
                  className="text-sm"
                  style={{ color: theme.textSecondary }}
                >
                  Advanced options will appear here...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
