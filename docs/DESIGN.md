---
name: toon-memory docs
description: Documentation site for a persistent memory layer for AI coding agents
colors:
  brand: "#6366f1"
  brand-light: "#818cf8"
  brand-dark: "#4f46e5"
  purple: "#8b5cf6"
  lavender: "#a855f7"
  bg: "#0f0f13"
  bg-card: "#1a1a24"
  border: "#2a2a3a"
  text: "#e2e2e8"
  text-muted: "#8888a0"
  success: "#22c55e"
  warning: "#f59e0b"
  error: "#ef4444"
  pink: "#ec4899"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "4rem"
components:
  btn-primary:
    backgroundColor: "{colors.brand}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  btn-install:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "24px"
  tag:
    backgroundColor: "rgba(99, 102, 241, 0.12)"
    textColor: "{colors.brand-light}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  badge-success:
    backgroundColor: "rgba(34, 197, 94, 0.2)"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  agent-chip:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text}"
    rounded: "10px"
    padding: "12px 16px"
  stat-card:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "32px"
  faq-item:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  code-block:
    backgroundColor: "#0b0f18"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "16px 20px"
  compare-box:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "24px"
  cta-box:
    backgroundColor: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "40px 24px"
  step-num:
    backgroundColor: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "0"
    size: "36px"
  tool-card:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  hero-logo:
    backgroundColor: "transparent"
    textColor: "transparent"
    rounded: "0"
    padding: "0"
    width: "310px"
    height: "310px"
  tip-card:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "0"
    padding: "0"
  sidebar-item:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "0"
    padding: "8px 12px"
---

# Design System: toon-memory docs

## Overview

**Creative North Star: "The Neural Canvas"**

The toon-memory docs site is a living document that visualizes the act of memory being formed. The design language treats data persistence as something you can see happening — particles drift upward like neural signals, gradient glows pulse like synaptic connections, and the color palette shifts from deep indigo to vivid violet like a signal propagating through a network. The dark canvas is intentional: it is the blank slate of a fresh session, and memory fills it.

The aesthetic is modern, developer-native, and unapologetically alive. Motion is not decorative — it is the primary communicator of the product's promise: things persist, connections form, context endures. The typography hierarchy is clean and scannable, with mono fonts anchoring the technical credibility and system fonts providing approachable body copy. Rounded corners and pill-shaped controls create warmth in a space (developer tools) that often defaults to cold sharpness.

**Key Characteristics:**
- Deep dark canvas (#0f0f13) as the base, evoking a fresh terminal session
- Indigo-to-violet gradient as the visual signature — appears on headings, CTAs, step indicators, stat numbers, and particle effects
- Glow-based depth: hover states emit brand-colored light instead of casting traditional shadows
- Rounded and friendly: pill buttons, generous border-radius on cards, accessible feel
- Particle system in the hero as a persistent visual metaphor for memory formation
- Motion is purposeful: fade-in-up for content reveals, gradient shift for animated headings, pulse for live indicators

## Colors

The palette is anchored by a deep indigo-violet that communicates both technical depth and creative energy. Semantic colors follow developer tool conventions: green for success, red for errors, amber for warnings.

### Primary
- **Deep Indigo** (#6366f1): The core brand color. Used on primary CTAs, active states, step indicators, accent borders, graph nodes, and the animated gradient hero text. The single most repeated color across the site.
- **Soft Violet** (#818cf8): Lighter variant. Used for links, secondary text accents, badge text, tool name labels, and hover states on the brand.
- **Deep Violet** (#4f46e5): Darker variant. Used sparingly — only on CTA hover states and where a pressed/deeper state is needed.

### Secondary
- **Royal Purple** (#8b5cf6): Midpoint in the brand gradient. Appears in the animated gradient text, the code block scan effect, featured card highlights, and the hero logo drop-shadow.
- **Soft Lavender** (#a855f7): Warm end of the gradient. Used in the hero background radial gradients, the gradient text animation, and as the glow color for the animated stat numbers.

### Neutral
- **Canvas Black** (#0f0f13): Page background. The deep dark base that makes the gradient and glow effects visible. Not pure black — a very dark navy that feels warmer.
- **Card Surface** (#1a1a24): Card backgrounds, code block backgrounds, and elevated surfaces. Slightly lighter than canvas to create subtle depth.
- **Border** (#2a2a3a): All structural borders — cards, code blocks, dividers, agent chips. A warm dark gray that is visible but never dominant.
- **Text Primary** (#e2e2e8): Main body text, headings, card titles. Near-white with a slight cool tint.
- **Text Muted** (#8888a0): Descriptions, subtitles, FAQ answers, stat labels. A mid-gray with cool undertone.

### Semantic
- **Success Green** (#22c55e): Pulsing dot indicators, check marks in comparison, stat pills, resource labels. Used in a low-opacity background wash (rgba(34,197,94,0.1)) with the full green for text.
- **Warning Amber** (#f59e0b): Warning badges only. Low-opacity background with full amber text.
- **Error Red** (#ef4444): Bug category dots, "before" comparison box borders, error states. Low-opacity background with full red text.
- **Memory Purple** (#a855f7): Graph node category for "memory" entries — distinct from the brand indigo by being warmer.

### Named Rules
**The Gradient Rule.** The indigo-violet-lavender gradient is the site's visual signature. It appears on at most one element per viewport section (hero title, stat numbers, or step indicators). When multiple gradient elements exist in the same section, only one animates — the others are static.

**The Glow Rule.** Brand glow (rgba(99,102,241,0.5)) is used exclusively on interactive hover states. Static elements never glow. Glow is a signal of interactivity, not decoration.

## Typography

**Display Font:** System stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
**Body Font:** System stack (same family)
**Label/Mono Font:** JetBrains Mono (with 'Fira Code', 'Consolas', monospace fallback)

**Character:** The system font is the honest, developer-native choice — no pretense, no download overhead. JetBrains Mono is the technical anchor: used for code, tool names, tags, install commands, and any text that represents machine-readable content. The pairing says "we are a real developer tool, not a marketing page pretending to be one."

### Hierarchy
- **Display** (800 weight, 3rem / 2.5rem on mobile, line-height 1.1, letter-spacing -0.02em): Hero title, section headings in gradient text. The animated gradient is applied as background-clip text on display elements only.
- **Headline** (700 weight, 1.75rem, line-height 1.3): Section titles (h2), comparison headings. Static color, no gradient.
- **Title** (600 weight, 1.1rem, line-height 1.4): Card titles (h3), step titles, problem card headings. Text primary color.
- **Body** (400 weight, 0.85–1rem, line-height 1.6): Paragraphs, descriptions, FAQ answers, stat labels. Text muted for descriptions, text primary for content.
- **Label** (500 weight, 0.7–0.8rem, letter-spacing 0.01em, monospace): Tags, tool names, resource labels, stat pills, agent chip names. Mono font family. Uppercase on resource labels only.

### Named Rules
**The Mono Gate Rule.** Text rendered in JetBrains Mono is always semantically significant — it represents code, tool names, commands, or data values. Never use mono for decorative text or headings that are not machine-relevant.

## Layout

The site uses a centered single-column layout with a maximum content width of 1000px. The hero section breaks this constraint intentionally — it spans full viewport width with negative margin tricks, creating a cinematic opening that distinguishes it from the doc content below.

**Content sections** use consistent vertical rhythm: 4rem top padding, 2rem bottom padding, with section headers having 3rem margin-top from the previous section. Inner content uses 2rem horizontal padding.

**Grid systems:**
- Feature cards: 3-column (2 on tablet, 1 on mobile)
- Agent chips: 5-column (2 on mobile)
- Tool cards: 2-column (1 on mobile)
- Problem cards: 3-column (1 on mobile)
- Stats: flex row, wrapping (2-column on mobile)
- Before/After comparison: 2-column (1 on mobile)
- How It Works steps: 1-column stacked

**Responsive breakpoints:** 768px (tablet), 600px (mobile), with the hero splitting to column layout at 768px. The hero logo scales from 310px to 200px on mobile. Grid columns collapse progressively — 3→2→1 for feature grids, 5→2 for agent chips.

## Elevation & Depth

The site uses glow-based depth exclusively. There are no traditional gray box-shadows anywhere in the design system. Depth is communicated through light, not shadow — a deliberate choice that reinforces the "neural canvas" metaphor where information glows when it becomes active or relevant.

### Glow Vocabulary
- **Interactive Glow** (`box-shadow: 0 10px 30px rgba(99, 102, 241, 0.5)`): Applied on hover to cards, buttons, agent chips, stat cards, tool cards. The brand-colored glow signals "this element is alive and responding to you."
- **Ambient Glow** (`box-shadow: 0 0 20px rgba(99, 102, 241, 0.3)`): Subtle version on badges and less prominent interactive elements. Present at rest on success badges and brand badges.
- **Text Glow** (`text-shadow: 0 0 10px rgba(99, 102, 241, 0.5)`): Footer links on hover, glow text animation class. Used to draw attention to interactive text.
- **Particle Glow** (`box-shadow: 0 0 20px rgba(99, 102, 241, 0.5)`): Each particle in the hero carries this, creating the ambient neural-network effect.

### Named Rules
**The Flat-By-Default Rule.** All surfaces start flat. Glow appears only as a response to state change (hover, focus, active). The only exception is the hero section, where ambient glow (particles, gradient backgrounds) establishes the mood before any interaction.

## Shapes

The form language is rounded and friendly. Every interactive element has generous border-radius, creating an approachable feel that contrasts with the typical sharp-edged developer tool aesthetic.

**Corner vocabulary:**
- **Pill** (9999px): Primary buttons, install buttons, badges, tags, stat pills, step number circles. The dominant interactive shape — communicates approachability and modernity.
- **Large** (16px): Feature cards, CTA boxes, comparison boxes, stat cards, hero sections. The structural container shape — generous rounding without being circular.
- **Medium** (12px): Tool cards, code blocks, FAQ items, tip cards, problem cards, agent chips (10px). The content container shape — slightly tighter than large but still warm.
- **Small** (4px): Scrollbar thumb, inline code, tags. Functional rounding for small elements.

**No sharp corners exist in the design system.** The minimum radius is 4px, and that only appears on the smallest utility elements. This is a deliberate brand commitment: toon-memory is approachable, not intimidating.

## Components

### Buttons
- **Shape:** Pill (9999px radius), inline-flex with icon + gap
- **Primary:** Gradient background (#6366f1 → #8b5cf6 → #a855f7), white text, 12px 24px padding, 600 weight. Hover: translateY(-2px), glow box-shadow, text-decoration none.
- **Install:** Card surface background (#1a1a24), border (#2a2a3a), mono font, $ prefix. Hover: border shifts to brand, glow appears. Active: translateY(-1px). Contains copy-to-clipboard with "Copied!" state swap.
- **GitHub:** Ghost style — no background, no border, just text + icon. Hover: brand-light color, external icon opacity reduces. No pill shape.

### Cards
- **Shape:** 12px radius (medium), card surface background, 1px border
- **Default state:** Border #2a2a3a, flat
- **Hover:** Border shifts to brand (#6366f1), translateY(-4px), ambient glow box-shadow
- **Featured variant:** Border rgba(139, 92, 246, 0.5), subtle gradient background overlay, gradient top-bar visible at rest
- **Top-bar detail:** A 3px gradient bar appears on hover (or always on featured cards) — this is the card's "activation" signal
- **Internal padding:** 24px (1.5rem), icon 1.75rem, title 1.1rem, body 0.85rem

### Chips / Tags
- **Shape:** 4px radius (small), mono font, 500 weight
- **Default:** rgba(99,102,241,0.12) background, brand-light text
- **Success:** rgba(34,197,94,0.1) background, #22c55e text
- **Badge variants:** Pill-shaped (9999px), with ambient glow at rest. Success/green, Brand/indigo, Warning/amber.

### Stat Cards
- **Shape:** 16px radius (large), card surface background, 2px border
- **Number:** 2.5rem, 800 weight, animated gradient text (shifts position infinitely)
- **Label:** 0.8rem, text-muted, 500 weight
- **Hover:** Border → brand, glow, translateY(-8px)

### Code Blocks
- **Shape:** 12px radius, deep dark background (#0b0f18), 1px border
- **Gradient scan effect:** A translucent gradient overlay sweeps vertically across the code block on a 4.5s loop — the "data being read" visual metaphor
- **Brand glow bar:** A 4px gradient strip sits at the top of code blocks, pulsing between 0.8 and 1 opacity

### Navigation
- **Links:** Text-muted at rest, underline appears on hover via a gradient pseudo-element that expands from 0 to 100% width. The underline uses the brand gradient, not a solid color.
- **Sidebar items:** 3px left border (transparent at rest, brand on hover/active), background shifts to brand wash on hover.

### Before/After Comparison
- **Before box:** Error-tinted — rgba(239,68,68,0.06) background, rgba(239,68,68,0.25) border, red heading
- **After box:** Success-tinted — rgba(34,197,94,0.06) background, rgba(34,197,94,0.25) border, green heading
- **List markers:** ✗ in error-red for before, ✓ in success-green for after

### Step Indicators
- **Shape:** 36px circle, gradient background, white bold number
- **Glow:** 20px brand glow at rest — steps are always "active" since they represent the product working
- **Stacked vertically** with 1.5rem spacing, each step is a card with mono code block inside

### Agent Chips
- **Shape:** 10px radius, card surface, flex row with icon + name
- **Icon:** 2.625rem square, white background, 6px radius, subtle box-shadow
- **Hover:** Border → brand, translateY(-2px)
- **Grid:** 5-column desktop, 2-column mobile

### FAQ Items
- **Shape:** 12px radius, card surface, details/summary native pattern
- **Summary:** 600 weight, flex row with +/− indicator in brand-light
- **Content:** Text-muted, 0.9rem, 1.6 line-height, padded below summary

## Do's and Don'ts

### Do:
- **Do** use the gradient on one element per section maximum — it is the visual signature, and overuse dilutes it
- **Do** use glow only on interactive hover states — the flat-by-default rule keeps the canvas clean
- **Do** use JetBrains Mono for any text that represents code, commands, tool names, or data values
- **Do** use pill shapes (9999px) for all buttons and primary interactive controls
- **Do** use the card surface (#1a1a24) on the canvas black (#0f0f13) background — the subtle contrast is intentional
- **Do** use the responsive breakpoints at 768px and 600px — the grid systems are defined at these exact points
- **Do** use fadeInUp (0.8s cubic-bezier(0.16,1,0.3,1)) for content reveal animations
- **Do** use the pulsing dot animation for live/active status indicators

### Don't:
- **Don't** use traditional gray box-shadows — depth is communicated through brand-colored glow only
- **Don't** use sharp corners (0px radius) on any element — the minimum is 4px
- **Don't** use gradient text on body copy or labels — gradient is reserved for display/headline hierarchy only
- **Don't** place glow on static (non-interactive) elements — with the exception of step indicators and the hero section
- **Don't** use mono font for paragraph body text — it is reserved for semantically significant machine-readable content
- **Don't** use more than one animated gradient element per viewport section — the rest should be static gradient fills
- **Don't** use emojis as primary visual elements in content sections — they appear in feature cards and problem cards but not as structural design elements
