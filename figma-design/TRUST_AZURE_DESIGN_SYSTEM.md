# Trust Azure Design System
## Luxury Donor Charity System - Clean Professional Theme

---

## 🎨 Color Palette

### Primary Colors
```css
--trust-white: #FFFFFF                 /* Pure White - Main background */
--trust-ice: #F8FAFC                   /* Ice White - Subtle backgrounds */
--trust-cloud: #F1F5F9                 /* Cloud White - Elevated surfaces */
--trust-mist: #E2E8F0                  /* Mist - Borders & dividers */
```

### Azure Blue Accent
```css
--azure-primary: #2E5C8A              /* Deep Azure - Primary accent */
--azure-medium: #3B76B3               /* Medium Azure - Interactive states */
--azure-light: #4A90D9                /* Light Azure - Hover states */
--azure-pale: #E8F0F8                 /* Pale Azure - Subtle backgrounds */
--azure-glow: rgba(46, 92, 138, 0.15) /* Azure Glow - Shadows */
```

### Supporting Blues
```css
--sky-blue: #60A5FA                   /* Sky Blue - Bright accents */
--ocean-blue: #1E40AF                 /* Ocean Blue - Dark accents */
--powder-blue: #DBEAFE                /* Powder Blue - Light backgrounds */
```

### Text Colors
```css
--text-primary: #1E293B               /* Primary text - Darkest */
--text-secondary: #475569             /* Secondary text - Medium */
--text-tertiary: #64748B              /* Tertiary text - Light */
--text-muted: #94A3B8                 /* Muted text - Lightest */
--text-azure: #2E5C8A                 /* Azure text - Accent text */
```

### Border & Divider Colors
```css
--border-light: rgba(226, 232, 240, 0.8)      /* Light borders */
--border-medium: rgba(148, 163, 184, 0.3)     /* Medium borders */
--border-azure: rgba(46, 92, 138, 0.2)        /* Azure borders */
--border-accent: rgba(46, 92, 138, 0.4)       /* Accent borders */
```

### Shadow Colors
```css
--shadow-subtle: rgba(15, 23, 42, 0.04)       /* Subtle elevation */
--shadow-light: rgba(15, 23, 42, 0.08)        /* Light elevation */
--shadow-medium: rgba(15, 23, 42, 0.12)       /* Medium elevation */
--shadow-strong: rgba(15, 23, 42, 0.16)       /* Strong elevation */
--shadow-azure: rgba(46, 92, 138, 0.15)       /* Azure glow */
```

### Status Colors
```css
--success-green: #10B981               /* Success states */
--success-light: #D1FAE5               /* Success backgrounds */
--warning-amber: #F59E0B               /* Warning states */
--warning-light: #FEF3C7               /* Warning backgrounds */
--error-red: #EF4444                   /* Error states */
--error-light: #FEE2E2                 /* Error backgrounds */
--info-blue: #3B82F6                   /* Info states */
--info-light: #DBEAFE                  /* Info backgrounds */
```

---

## 🖼️ Subtle Textures & Patterns

### Micro Dot Pattern (Primary)
**Usage**: Large backgrounds, panels, sections
```css
background-image: 
  radial-gradient(
    circle at 2px 2px,
    rgba(46, 92, 138, 0.03) 1px,
    transparent 1px
  );
background-size: 24px 24px;
```

### Diagonal Stripe Texture (Secondary)
**Usage**: Headers, cards, elevated elements
```css
background-image:
  repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(46, 92, 138, 0.02) 10px,
    rgba(46, 92, 138, 0.02) 20px
  );
```

### Grid Pattern (Accent)
**Usage**: Input areas, code blocks, technical sections
```css
background-image:
  linear-gradient(rgba(46, 92, 138, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(46, 92, 138, 0.03) 1px, transparent 1px);
background-size: 20px 20px;
```

### Radial Gradient Overlay (Depth)
**Usage**: Hero sections, featured content
```css
background-image:
  radial-gradient(
    ellipse at top,
    rgba(232, 240, 248, 0.8) 0%,
    transparent 50%
  );
```

### Frosted Glass Effect (Premium)
**Usage**: Overlays, modals, floating elements
```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(226, 232, 240, 0.8);
```

---

## 📐 Typography

### Font Families
```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
--font-display: "SF Pro Display", -apple-system, sans-serif;
--font-mono: "SF Mono", Menlo, Monaco, "Courier New", monospace;
```

### Font Sizes
```css
--text-2xs: 0.625rem    /* 10px - Tiny labels */
--text-xs: 0.75rem      /* 12px - Small labels, captions */
--text-sm: 0.875rem     /* 14px - Body text, secondary */
--text-base: 1rem       /* 16px - Body text, primary */
--text-lg: 1.125rem     /* 18px - Subheadings */
--text-xl: 1.25rem      /* 20px - Card titles */
--text-2xl: 1.5rem      /* 24px - Section headers */
--text-3xl: 1.875rem    /* 30px - Page headers */
--text-4xl: 2.25rem     /* 36px - Hero text */
--text-5xl: 3rem        /* 48px - Display text */
```

### Font Weights
```css
--weight-light: 300
--weight-regular: 400
--weight-medium: 500
--weight-semibold: 600
--weight-bold: 700
--weight-extrabold: 800
```

### Line Heights
```css
--leading-tight: 1.25
--leading-snug: 1.375
--leading-normal: 1.5
--leading-relaxed: 1.625
--leading-loose: 2
```

### Letter Spacing
```css
--tracking-tighter: -0.05em
--tracking-tight: -0.025em
--tracking-normal: 0
--tracking-wide: 0.025em
--tracking-wider: 0.05em
--tracking-widest: 0.1em
```

---

## 📏 Spacing System

### Base Unit: 4px (0.25rem)

```css
--space-0: 0            /* 0px */
--space-0-5: 0.125rem   /* 2px */
--space-1: 0.25rem      /* 4px */
--space-1-5: 0.375rem   /* 6px */
--space-2: 0.5rem       /* 8px */
--space-2-5: 0.625rem   /* 10px */
--space-3: 0.75rem      /* 12px */
--space-3-5: 0.875rem   /* 14px */
--space-4: 1rem         /* 16px */
--space-5: 1.25rem      /* 20px */
--space-6: 1.5rem       /* 24px */
--space-7: 1.75rem      /* 28px */
--space-8: 2rem         /* 32px */
--space-10: 2.5rem      /* 40px */
--space-12: 3rem        /* 48px */
--space-16: 4rem        /* 64px */
--space-20: 5rem        /* 80px */
--space-24: 6rem        /* 96px */
```

---

## 🎭 Shadows & Elevation

### Elevation Levels

#### Level 0 - Flat (No shadow)
```css
box-shadow: none;
```

#### Level 1 - Subtle (Minimal elevation)
```css
box-shadow: 
  0 1px 2px 0 rgba(15, 23, 42, 0.04),
  0 1px 3px 0 rgba(15, 23, 42, 0.06);
```

#### Level 2 - Low (Cards, buttons)
```css
box-shadow: 
  0 2px 4px -1px rgba(15, 23, 42, 0.06),
  0 4px 6px -1px rgba(15, 23, 42, 0.08);
```

#### Level 3 - Medium (Panels, dropdowns)
```css
box-shadow: 
  0 4px 6px -2px rgba(15, 23, 42, 0.08),
  0 10px 15px -3px rgba(15, 23, 42, 0.10);
```

#### Level 4 - High (Modals, popovers)
```css
box-shadow: 
  0 10px 25px -5px rgba(15, 23, 42, 0.10),
  0 20px 40px -10px rgba(15, 23, 42, 0.12);
```

#### Level 5 - Highest (Overlays, notifications)
```css
box-shadow: 
  0 20px 40px -12px rgba(15, 23, 42, 0.12),
  0 25px 50px -15px rgba(15, 23, 42, 0.16);
```

#### Azure Glow (Premium Elements)
```css
box-shadow: 
  0 4px 14px rgba(46, 92, 138, 0.15),
  0 2px 6px rgba(46, 92, 138, 0.1),
  inset 0 1px 0 rgba(255, 255, 255, 0.6);
```

#### Inner Shadow (Inputs, wells)
```css
box-shadow: 
  inset 0 2px 4px rgba(15, 23, 42, 0.06),
  inset 0 1px 2px rgba(15, 23, 42, 0.04);
```

---

## 🔘 Border Radius

```css
--radius-none: 0
--radius-sm: 0.25rem    /* 4px - Tight elements */
--radius-base: 0.375rem /* 6px - Standard elements */
--radius-md: 0.5rem     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem    /* 12px - Cards */
--radius-xl: 1rem       /* 16px - Panels */
--radius-2xl: 1.5rem    /* 24px - Large cards */
--radius-3xl: 2rem      /* 32px - Hero sections */
--radius-full: 9999px   /* Full circle/pill */
```

---

## 🎨 Gradient Presets

### Background Gradients

#### Subtle Gradient (Default backgrounds)
```css
background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
```

#### Cloud Gradient (Elevated surfaces)
```css
background: linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%);
```

#### Azure Gradient (Headers, CTAs)
```css
background: linear-gradient(135deg, #2E5C8A 0%, #4A90D9 100%);
```

#### Soft Azure Gradient (Subtle accents)
```css
background: linear-gradient(135deg, #E8F0F8 0%, #DBEAFE 100%);
```

### Text Gradients

#### Azure Text Gradient
```css
background: linear-gradient(135deg, #2E5C8A 0%, #4A90D9 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Overlay Gradients

#### Top Fade
```css
background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
```

#### Bottom Fade
```css
background: linear-gradient(0deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
```

---

## 🧱 Component Specifications

### Navigation Button

#### Default State
```css
background: transparent;
color: #64748B;
padding: 0.75rem 1rem;
border-radius: 0.5rem;
transition: all 0.2s ease;
font-weight: 500;
```

#### Active State
```css
background: linear-gradient(90deg, rgba(46, 92, 138, 0.08) 0%, transparent 100%);
color: #2E5C8A;
border-left: 3px solid #2E5C8A;
box-shadow: 0 2px 8px rgba(46, 92, 138, 0.1);
font-weight: 600;
```

#### Hover State (Inactive)
```css
background: rgba(241, 245, 249, 0.8);
color: #475569;
```

---

### Primary Button

#### Default
```css
background: linear-gradient(135deg, #2E5C8A 0%, #4A90D9 100%);
color: #FFFFFF;
padding: 0.75rem 1.5rem;
border-radius: 0.5rem;
border: none;
box-shadow: 
  0 4px 14px rgba(46, 92, 138, 0.15),
  0 2px 6px rgba(46, 92, 138, 0.1),
  inset 0 1px 0 rgba(255, 255, 255, 0.2);
font-weight: 600;
letter-spacing: 0.025em;
transition: all 0.2s ease;
```

#### Hover
```css
transform: translateY(-1px);
box-shadow: 
  0 6px 20px rgba(46, 92, 138, 0.2),
  0 4px 10px rgba(46, 92, 138, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.3);
```

#### Active/Pressed
```css
transform: translateY(0px);
box-shadow: 
  0 2px 8px rgba(46, 92, 138, 0.15),
  inset 0 2px 4px rgba(0, 0, 0, 0.1);
```

---

### Secondary Button

#### Default
```css
background: #FFFFFF;
color: #2E5C8A;
padding: 0.75rem 1.5rem;
border-radius: 0.5rem;
border: 2px solid rgba(46, 92, 138, 0.2);
box-shadow: 0 2px 4px rgba(15, 23, 42, 0.06);
font-weight: 600;
transition: all 0.2s ease;
```

#### Hover
```css
background: #F8FAFC;
border-color: rgba(46, 92, 138, 0.4);
box-shadow: 0 4px 8px rgba(15, 23, 42, 0.08);
```

---

### Card (Standard)

```css
background: #FFFFFF;
border: 1px solid rgba(226, 232, 240, 0.8);
border-radius: 0.75rem;
padding: 1.5rem;
box-shadow: 
  0 2px 4px -1px rgba(15, 23, 42, 0.06),
  0 4px 6px -1px rgba(15, 23, 42, 0.08);
transition: all 0.2s ease;
```

#### Hover State
```css
box-shadow: 
  0 4px 6px -2px rgba(15, 23, 42, 0.08),
  0 10px 15px -3px rgba(15, 23, 42, 0.10);
transform: translateY(-2px);
```

---

### Card (Premium/Highlighted)

```css
background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
border: 2px solid rgba(46, 92, 138, 0.2);
border-radius: 1rem;
padding: 1.5rem;
box-shadow: 
  0 4px 14px rgba(46, 92, 138, 0.15),
  0 2px 6px rgba(46, 92, 138, 0.1),
  inset 0 1px 0 rgba(255, 255, 255, 0.8);
position: relative;
overflow: hidden;
```

#### Top Accent (Optional)
```css
&::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2E5C8A 0%, #4A90D9 100%);
}
```

---

### Input Field

#### Default
```css
background: #FFFFFF;
color: #1E293B;
border: 2px solid rgba(226, 232, 240, 0.8);
border-radius: 0.5rem;
padding: 0.75rem 1rem;
box-shadow: 
  0 1px 2px rgba(15, 23, 42, 0.04),
  inset 0 1px 2px rgba(15, 23, 42, 0.02);
outline: none;
transition: all 0.2s ease;
font-size: 1rem;
```

#### Focus State
```css
border-color: #2E5C8A;
box-shadow: 
  0 0 0 3px rgba(46, 92, 138, 0.1),
  0 1px 2px rgba(15, 23, 42, 0.04),
  inset 0 1px 2px rgba(15, 23, 42, 0.02);
```

#### Error State
```css
border-color: #EF4444;
box-shadow: 
  0 0 0 3px rgba(239, 68, 68, 0.1),
  0 1px 2px rgba(15, 23, 42, 0.04);
```

#### Disabled State
```css
background: #F1F5F9;
color: #94A3B8;
border-color: rgba(226, 232, 240, 0.6);
cursor: not-allowed;
```

---

### Badge/Tag

#### Standard
```css
background: linear-gradient(135deg, #E2E8F0 0%, #F1F5F9 100%);
color: #475569;
border: 1px solid rgba(148, 163, 184, 0.3);
border-radius: 9999px;
padding: 0.25rem 0.75rem;
font-size: 0.75rem;
font-weight: 600;
letter-spacing: 0.025em;
```

#### Azure (Primary)
```css
background: linear-gradient(135deg, rgba(46, 92, 138, 0.1) 0%, rgba(74, 144, 217, 0.1) 100%);
color: #2E5C8A;
border: 1px solid rgba(46, 92, 138, 0.25);
box-shadow: 0 2px 4px rgba(46, 92, 138, 0.08);
```

#### Success
```css
background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
color: #065F46;
border: 1px solid rgba(16, 185, 129, 0.3);
```

#### Warning
```css
background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
color: #92400E;
border: 1px solid rgba(245, 158, 11, 0.3);
```

#### Error
```css
background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
color: #991B1B;
border: 1px solid rgba(239, 68, 68, 0.3);
```

---

### Icon Container

#### Standard
```css
background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
border: 1px solid rgba(226, 232, 240, 0.8);
border-radius: 0.5rem;
padding: 0.5rem;
color: #64748B;
box-shadow: 
  0 1px 2px rgba(15, 23, 42, 0.04),
  inset 0 1px 0 rgba(255, 255, 255, 0.6);
```

#### Azure (Primary)
```css
background: linear-gradient(135deg, #2E5C8A 0%, #4A90D9 100%);
border: 1px solid rgba(46, 92, 138, 0.4);
border-radius: 0.5rem;
padding: 0.5rem;
color: #FFFFFF;
box-shadow: 
  0 4px 8px rgba(46, 92, 138, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.2);
```

---

### Divider

#### Horizontal
```css
border: none;
height: 1px;
background: linear-gradient(90deg, transparent 0%, rgba(226, 232, 240, 0.8) 50%, transparent 100%);
margin: 1.5rem 0;
```

#### Vertical
```css
border: none;
width: 1px;
background: linear-gradient(180deg, transparent 0%, rgba(226, 232, 240, 0.8) 50%, transparent 100%);
margin: 0 1rem;
```

---

### Loading Spinner

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(46, 92, 138, 0.1);
  border-top-color: #2E5C8A;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

---

## 🎯 Usage Guidelines

### When to Use Azure Blue
- Primary CTAs and action buttons
- Active navigation states
- Links and interactive elements
- Success indicators and progress
- Key information highlights

### When to Use White/Light Grays
- Backgrounds and surfaces
- Input fields and forms
- Cards and panels
- Subtle dividers
- Disabled states

### When to Use Dark Grays
- Primary text and headings
- Icons and symbols
- Borders on light backgrounds
- Emphasis and hierarchy

### Texture Application
- **Micro Dots**: Use on large backgrounds for subtle visual interest
- **Diagonal Stripes**: Use on headers and feature sections
- **Grid**: Use on technical/data-heavy sections
- **Radial Gradient**: Use for hero sections and focal points
- **Frosted Glass**: Use sparingly on overlays and modals

---

## 🌈 Accessibility Notes

### Contrast Ratios (WCAG AA Compliance)
- Primary text (#1E293B) on white (#FFFFFF): 14.8:1 ✓ AAA
- Secondary text (#475569) on white (#FFFFFF): 8.6:1 ✓ AAA
- Tertiary text (#64748B) on white (#FFFFFF): 5.9:1 ✓ AA
- Azure (#2E5C8A) on white (#FFFFFF): 6.1:1 ✓ AA
- White text on Azure (#FFFFFF on #2E5C8A): 6.1:1 ✓ AA

### Focus States
Always provide clearly visible focus indicators:
```css
outline: 2px solid #2E5C8A;
outline-offset: 2px;
/* Or use box-shadow for rounded elements */
box-shadow: 0 0 0 3px rgba(46, 92, 138, 0.1);
```

### Motion & Animation
Keep transitions smooth but fast:
```css
transition: all 0.2s ease;
/* For complex animations */
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📱 Responsive Breakpoints

```css
--breakpoint-xs: 475px
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
--breakpoint-2xl: 1536px
```

### Mobile-First Approach
```css
/* Mobile default */
.element {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .element {
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element {
    padding: 2rem;
  }
}
```

---

## 💎 Design Principles

1. **Clarity**: Clean, clear, and easy to understand
2. **Trust**: Professional, reliable, and consistent
3. **Efficiency**: Fast, responsive, and optimized
4. **Sophistication**: Modern, refined, and polished
5. **Accessibility**: Inclusive, readable, and usable by all

---

## 🎨 Color Psychology

- **White**: Purity, simplicity, cleanliness, professionalism
- **Azure Blue**: Trust, stability, intelligence, confidence
- **Light Grays**: Neutrality, balance, sophistication

---

## 📦 Export Variables (CSS Custom Properties)

```css
:root {
  /* Colors - Base */
  --ta-white: #FFFFFF;
  --ta-ice: #F8FAFC;
  --ta-cloud: #F1F5F9;
  --ta-mist: #E2E8F0;
  
  /* Colors - Azure */
  --ta-azure: #2E5C8A;
  --ta-azure-medium: #3B76B3;
  --ta-azure-light: #4A90D9;
  --ta-azure-pale: #E8F0F8;
  --ta-azure-glow: rgba(46, 92, 138, 0.15);
  
  /* Colors - Text */
  --ta-text-primary: #1E293B;
  --ta-text-secondary: #475569;
  --ta-text-tertiary: #64748B;
  --ta-text-muted: #94A3B8;
  
  /* Spacing */
  --ta-space-xs: 0.25rem;
  --ta-space-sm: 0.5rem;
  --ta-space-md: 1rem;
  --ta-space-lg: 1.5rem;
  --ta-space-xl: 2rem;
  --ta-space-2xl: 3rem;
  
  /* Border Radius */
  --ta-radius-sm: 0.25rem;
  --ta-radius-base: 0.375rem;
  --ta-radius-md: 0.5rem;
  --ta-radius-lg: 0.75rem;
  --ta-radius-xl: 1rem;
  --ta-radius-2xl: 1.5rem;
  
  /* Shadows */
  --ta-shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.04);
  --ta-shadow-md: 0 4px 6px -2px rgba(15, 23, 42, 0.08);
  --ta-shadow-lg: 0 10px 25px -5px rgba(15, 23, 42, 0.10);
  --ta-shadow-azure: 0 4px 14px rgba(46, 92, 138, 0.15);
  
  /* Typography */
  --ta-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --ta-font-mono: "SF Mono", Menlo, Monaco, monospace;
}
```

---

## 🔧 Implementation Examples

### React Component with Theme
```jsx
const TrustAzureButton = ({ children, variant = "primary", ...props }) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #2E5C8A 0%, #4A90D9 100%)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 4px 14px rgba(46, 92, 138, 0.15), 0 2px 6px rgba(46, 92, 138, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    },
    secondary: {
      background: '#FFFFFF',
      color: '#2E5C8A',
      border: '2px solid rgba(46, 92, 138, 0.2)',
      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.06)',
    },
  };
  
  return (
    <button
      style={{
        ...styles[variant],
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontWeight: 600,
        letterSpacing: '0.025em',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Card Component
```jsx
const TrustAzureCard = ({ children, elevated = false }) => {
  return (
    <div
      style={{
        background: elevated 
          ? 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
          : '#FFFFFF',
        border: elevated 
          ? '2px solid rgba(46, 92, 138, 0.2)'
          : '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: elevated
          ? '0 4px 14px rgba(46, 92, 138, 0.15), 0 2px 6px rgba(46, 92, 138, 0.1)'
          : '0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 4px 6px -1px rgba(15, 23, 42, 0.08)',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </div>
  );
};
```

---

## 🎨 Color Combinations

### Primary Combinations
```css
/* Azure on White */
background: #FFFFFF;
color: #2E5C8A;
border: 1px solid rgba(46, 92, 138, 0.2);

/* White on Azure */
background: #2E5C8A;
color: #FFFFFF;
border: none;

/* Azure on Light Gray */
background: #F8FAFC;
color: #2E5C8A;
border: 1px solid rgba(226, 232, 240, 0.8);
```

### Text Hierarchy
```css
/* Heading */
color: #1E293B;
font-weight: 700;

/* Body */
color: #475569;
font-weight: 400;

/* Supporting */
color: #64748B;
font-weight: 400;

/* Muted */
color: #94A3B8;
font-weight: 400;
```

---

## 📋 Component Checklist

When creating a new component, ensure:

- [ ] Uses defined color palette (no custom colors)
- [ ] Has appropriate elevation/shadow
- [ ] Includes hover/active/focus states
- [ ] Is keyboard accessible
- [ ] Has sufficient color contrast (WCAG AA minimum)
- [ ] Includes loading/disabled states if applicable
- [ ] Uses consistent spacing from spacing system
- [ ] Follows border radius conventions
- [ ] Has smooth transitions (0.2s ease)
- [ ] Is responsive across breakpoints
- [ ] Respects prefers-reduced-motion
- [ ] Has clear visual hierarchy

---

## 🎯 Common Patterns

### Hero Section
```css
background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
padding: 4rem 2rem;
text-align: center;
border-bottom: 1px solid rgba(226, 232, 240, 0.8);
```

### Stat Card
```css
background: #FFFFFF;
border: 2px solid rgba(46, 92, 138, 0.2);
border-radius: 1rem;
padding: 2rem;
box-shadow: 0 4px 14px rgba(46, 92, 138, 0.15);
text-align: center;
```

### Data Table Row (Hover)
```css
background: #F8FAFC;
transition: background 0.15s ease;
```

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Created for**: ARON Luxury Donor Charity System
