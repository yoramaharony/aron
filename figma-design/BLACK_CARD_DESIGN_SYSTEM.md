# Black Card Design System
## Luxury Donor Charity System - American Express Centurion Inspired

---

## 🎨 Color Palette

### Primary Colors
```css
--black-card-primary: #1A1A1A          /* Deep Black - Main background */
--black-card-dark: #0A0A0A             /* Absolute Black - Darkest elements */
--black-card-medium: #2A2A2A           /* Medium Black - Cards & panels */
--black-card-light: #3A3A3A            /* Light Black - Hover states */
```

### Metallic Accents
```css
--gold: #D4AF37                        /* Royal Gold - Primary accent */
--gold-light: #E5C158                  /* Light Gold - Hover states */
--gold-dark: #B8941F                   /* Dark Gold - Pressed states */
--gold-glow: rgba(212, 175, 55, 0.3)   /* Gold Glow - Shadows */

--silver: #C0C0C0                      /* Platinum Silver - Secondary accent */
--silver-light: #E0E0E0                /* Light Silver - Highlights */
--silver-dark: #8C8C8C                 /* Dark Silver - Muted states */
--silver-glow: rgba(192, 192, 192, 0.2) /* Silver Glow - Subtle shadows */
```

### Text Colors
```css
--text-primary: #E5E5E5                /* Primary text - High contrast */
--text-secondary: #A0A0A0              /* Secondary text - Medium contrast */
--text-muted: #707070                  /* Muted text - Low contrast */
--text-gold: #D4AF37                   /* Gold text - Accent text */
--text-silver: #C0C0C0                 /* Silver text - Secondary accent text */
```

### Border & Divider Colors
```css
--border-primary: rgba(192, 192, 192, 0.15)   /* Primary borders */
--border-gold: rgba(212, 175, 55, 0.3)        /* Gold borders */
--border-accent: rgba(212, 175, 55, 0.5)      /* Accent borders */
```

### Shadow Colors
```css
--shadow-subtle: rgba(0, 0, 0, 0.3)    /* Subtle elevation */
--shadow-medium: rgba(0, 0, 0, 0.5)    /* Medium elevation */
--shadow-strong: rgba(0, 0, 0, 0.7)    /* Strong elevation */
--shadow-gold: rgba(212, 175, 55, 0.4) /* Gold glow effect */
--shadow-silver: rgba(192, 192, 192, 0.2) /* Silver shimmer */
```

---

## 🖼️ Premium Textures

### Brushed Metal Texture (Primary)
**Usage**: Sidebar, main panels, navigation areas
```css
background-image: 
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
  );
```

### Diagonal Weave Pattern (Secondary)
**Usage**: Header, footer, input areas
```css
background-image:
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
  );
```

### Carbon Fiber Texture (Accent)
**Usage**: Message bubbles, cards, elevated elements
```css
background-image:
  repeating-linear-gradient(
    -30deg,
    transparent,
    transparent 1px,
    rgba(192, 192, 192, 0.02) 1px,
    rgba(192, 192, 192, 0.02) 2px
  ),
  repeating-linear-gradient(
    30deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.3) 1px,
    rgba(0, 0, 0, 0.3) 2px
  );
```

### Gold Accent Texture (Premium)
**Usage**: Premium cards, CTAs, highlighted sections
```css
background-image:
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
  );
```

---

## 📐 Typography

### Font Families
```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-display: "SF Pro Display", -apple-system, sans-serif;
```

### Font Sizes
```css
--text-xs: 0.75rem      /* 12px - Labels, captions */
--text-sm: 0.875rem     /* 14px - Body text, secondary */
--text-base: 1rem       /* 16px - Body text, primary */
--text-lg: 1.125rem     /* 18px - Subheadings */
--text-xl: 1.25rem      /* 20px - Card titles */
--text-2xl: 1.5rem      /* 24px - Section headers */
--text-3xl: 1.875rem    /* 30px - Page headers */
--text-4xl: 2.25rem     /* 36px - Hero text */
```

### Font Weights
```css
--weight-regular: 400
--weight-medium: 500
--weight-semibold: 600
--weight-bold: 700
```

### Letter Spacing
```css
--tracking-tight: -0.02em
--tracking-normal: 0
--tracking-wide: 0.05em
--tracking-wider: 0.1em
--tracking-widest: 0.15em
```

---

## 📏 Spacing System

### Base Unit: 4px (0.25rem)

```css
--space-1: 0.25rem      /* 4px */
--space-2: 0.5rem       /* 8px */
--space-3: 0.75rem      /* 12px */
--space-4: 1rem         /* 16px */
--space-5: 1.25rem      /* 20px */
--space-6: 1.5rem       /* 24px */
--space-8: 2rem         /* 32px */
--space-10: 2.5rem      /* 40px */
--space-12: 3rem        /* 48px */
--space-16: 4rem        /* 64px */
```

---

## 🎭 Shadows & Elevation

### Elevation Levels

#### Level 1 - Subtle (Cards)
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
```

#### Level 2 - Medium (Panels)
```css
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
```

#### Level 3 - Strong (Modals, Overlays)
```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
```

#### Gold Glow (Premium Elements)
```css
box-shadow: 
  0 6px 20px rgba(212, 175, 55, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

#### Silver Shimmer (Accented Elements)
```css
box-shadow: 
  0 4px 16px rgba(192, 192, 192, 0.2),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

---

## 🔘 Border Radius

```css
--radius-sm: 0.375rem   /* 6px - Small elements */
--radius-md: 0.5rem     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem    /* 12px - Cards */
--radius-xl: 1rem       /* 16px - Panels */
--radius-2xl: 1.5rem    /* 24px - Large cards */
--radius-full: 9999px   /* Full circle/pill */
```

---

## 🎨 Gradient Presets

### Black Gradients

#### Primary Panel Gradient
```css
background: linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%);
```

#### Dark Panel Gradient
```css
background: linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%);
```

#### Subtle Depth Gradient
```css
background: linear-gradient(180deg, #2A2A2A 0%, #1A1A1A 100%);
```

### Metallic Gradients

#### Gold Gradient
```css
background: linear-gradient(135deg, #B8941F 0%, #D4AF37 50%, #E5C158 100%);
```

#### Silver Gradient
```css
background: linear-gradient(135deg, #8C8C8C 0%, #C0C0C0 50%, #E0E0E0 100%);
```

#### Gold to Silver Gradient
```css
background: linear-gradient(90deg, #D4AF37 0%, #C0C0C0 100%);
```

---

## 🧱 Component Specifications

### Navigation Button

#### Default State
```css
background: transparent;
color: #A0A0A0;
padding: 0.875rem 1rem;
border-radius: 0.5rem;
transition: all 0.2s ease;
```

#### Active State
```css
background: linear-gradient(90deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%);
color: #D4AF37;
border-left: 3px solid #D4AF37;
box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
```

#### Hover State (Inactive)
```css
background: linear-gradient(90deg, rgba(192, 192, 192, 0.05) 0%, transparent 100%);
color: #C0C0C0;
```

---

### Primary Button

#### Default
```css
background: linear-gradient(135deg, #B8941F 0%, #D4AF37 50%, #E5C158 100%);
color: #0A0A0A;
padding: 1rem 2rem;
border-radius: 0.75rem;
border: 1px solid rgba(212, 175, 55, 0.3);
box-shadow: 
  0 6px 20px rgba(212, 175, 55, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.2);
font-weight: 600;
letter-spacing: 0.05em;
```

#### Hover
```css
transform: scale(1.02);
box-shadow: 
  0 8px 25px rgba(212, 175, 55, 0.5),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);
```

---

### Card (Standard)

```css
background: linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%);
background-image: 
  linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%),
  repeating-linear-gradient(
    -30deg,
    transparent,
    transparent 1px,
    rgba(192, 192, 192, 0.02) 1px,
    rgba(192, 192, 192, 0.02) 2px
  ),
  repeating-linear-gradient(
    30deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.3) 1px,
    rgba(0, 0, 0, 0.3) 2px
  );
border: 1px solid rgba(192, 192, 192, 0.15);
border-radius: 0.75rem;
padding: 1.5rem;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
```

---

### Card (Premium/Highlighted)

```css
background: linear-gradient(135deg, #3A3A3A 0%, #2A2A2A 100%);
background-image: 
  linear-gradient(135deg, #3A3A3A 0%, #2A2A2A 100%),
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
  );
border: 2px solid rgba(212, 175, 55, 0.5);
border-radius: 1rem;
padding: 1.5rem;
box-shadow: 
  0 6px 20px rgba(212, 175, 55, 0.4),
  inset 0 1px 0 rgba(212, 175, 55, 0.2);
```

---

### Input Field

```css
background: #1A1A1A;
color: #E5E5E5;
border: 2px solid rgba(192, 192, 192, 0.15);
border-radius: 0.5rem;
padding: 1rem 1.25rem;
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
outline: none;
transition: all 0.2s ease;
```

#### Focus State
```css
border-color: rgba(212, 175, 55, 0.5);
box-shadow: 
  inset 0 2px 4px rgba(0, 0, 0, 0.3),
  0 0 0 3px rgba(212, 175, 55, 0.1);
```

---

### Badge/Tag

#### Standard
```css
background: linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.15) 100%);
color: #C0C0C0;
border: 1.5px solid rgba(192, 192, 192, 0.3);
border-radius: 9999px;
padding: 0.375rem 0.75rem;
font-size: 0.75rem;
font-weight: 600;
letter-spacing: 0.05em;
```

#### Premium (Gold)
```css
background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.25) 100%);
color: #D4AF37;
border: 1.5px solid rgba(212, 175, 55, 0.5);
box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
```

---

### Icon Container

#### Standard
```css
background: linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%);
border: 1px solid rgba(192, 192, 192, 0.2);
border-radius: 0.5rem;
padding: 0.5rem;
color: #C0C0C0;
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

#### Premium (Gold)
```css
background: linear-gradient(135deg, #B8941F 0%, #D4AF37 100%);
border: 1px solid rgba(212, 175, 55, 0.5);
border-radius: 0.5rem;
padding: 0.5rem;
color: #0A0A0A;
box-shadow: 
  inset 0 1px 0 rgba(255, 255, 255, 0.3),
  0 2px 8px rgba(212, 175, 55, 0.4);
```

---

## 🎯 Usage Guidelines

### When to Use Gold
- Primary CTAs and action buttons
- Premium features and highlighted content
- Active navigation states
- Success indicators and achievements
- VIP/Elite badges and status markers

### When to Use Silver
- Secondary actions and buttons
- Standard navigation items
- Dividers and borders
- Icons and supporting elements
- Subtle highlights and shimmer effects

### When to Use Black Gradients
- Backgrounds and panels
- Cards and containers
- Navigation sidebars
- Message bubbles
- Overlay backgrounds

### Texture Application
- **Brushed Metal**: Use on large surfaces (sidebar, panels)
- **Diagonal Weave**: Use on interactive areas (headers, inputs)
- **Carbon Fiber**: Use on elevated cards and messages
- **Gold Accent**: Use sparingly on premium features only

---

## 🌈 Accessibility Notes

### Contrast Ratios
- Primary text (#E5E5E5) on black backgrounds: 12.6:1 ✓
- Secondary text (#A0A0A0) on black backgrounds: 6.4:1 ✓
- Gold text (#D4AF37) on black backgrounds: 5.8:1 ✓
- Muted text (#707070) on black backgrounds: 3.2:1 (Use for non-essential text only)

### Focus States
Always provide visible focus indicators:
```css
outline: 2px solid #D4AF37;
outline-offset: 2px;
```

### Motion & Animation
Keep transitions subtle and fast:
```css
transition: all 0.2s ease;
```

Avoid animations longer than 300ms to maintain premium feel.

---

## 📱 Responsive Breakpoints

```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
--breakpoint-2xl: 1536px
```

---

## 💎 Design Principles

1. **Exclusivity**: Every element should feel rare and premium
2. **Sophistication**: Clean lines, subtle details, refined aesthetics
3. **Power**: Strong contrasts, bold metallics, confident typography
4. **Luxury**: Rich textures, elegant shadows, premium materials
5. **Trust**: Solid construction, clear hierarchy, professional execution

---

## 🎨 Color Psychology

- **Black**: Power, sophistication, exclusivity, prestige
- **Gold**: Wealth, success, premium quality, achievement
- **Silver**: Modernity, technology, refinement, elegance

---

## 📦 Export Variables (CSS Custom Properties)

```css
:root {
  /* Colors */
  --bc-black-primary: #1A1A1A;
  --bc-black-dark: #0A0A0A;
  --bc-black-medium: #2A2A2A;
  --bc-black-light: #3A3A3A;
  
  --bc-gold: #D4AF37;
  --bc-gold-light: #E5C158;
  --bc-gold-dark: #B8941F;
  --bc-gold-glow: rgba(212, 175, 55, 0.3);
  
  --bc-silver: #C0C0C0;
  --bc-silver-light: #E0E0E0;
  --bc-silver-dark: #8C8C8C;
  --bc-silver-glow: rgba(192, 192, 192, 0.2);
  
  --bc-text-primary: #E5E5E5;
  --bc-text-secondary: #A0A0A0;
  --bc-text-muted: #707070;
  
  /* Spacing */
  --bc-space-xs: 0.25rem;
  --bc-space-sm: 0.5rem;
  --bc-space-md: 1rem;
  --bc-space-lg: 1.5rem;
  --bc-space-xl: 2rem;
  
  /* Border Radius */
  --bc-radius-sm: 0.375rem;
  --bc-radius-md: 0.5rem;
  --bc-radius-lg: 0.75rem;
  --bc-radius-xl: 1rem;
  
  /* Shadows */
  --bc-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --bc-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
  --bc-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.7);
  --bc-shadow-gold: 0 6px 20px rgba(212, 175, 55, 0.4);
}
```

---

## 🔧 Implementation Examples

### React Component with Theme
```jsx
const BlackCardButton = ({ children, variant = "primary" }) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #B8941F 0%, #D4AF37 50%, #E5C158 100%)',
      color: '#0A0A0A',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)',
      color: '#C0C0C0',
      border: '1px solid rgba(192, 192, 192, 0.15)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
    },
  };
  
  return (
    <button
      style={{
        ...styles[variant],
        padding: '1rem 2rem',
        borderRadius: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
};
```

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Created for**: ARON Luxury Donor Charity System
