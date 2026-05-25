---
name: Academic Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#4e45d5'
  on-secondary: '#ffffff'
  secondary-container: '#6860ef'
  on-secondary-container: '#fffbff'
  tertiary: '#041528'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a2a3e'
  on-tertiary-container: '#8191a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#100069'
  on-secondary-fixed-variant: '#372abf'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max-width: 1440px
---

## Brand & Style

This design system is built for the rigorous environment of educational administration. It prioritizes clarity over decoration, fostering an atmosphere of focus and institutional reliability. The design narrative follows a **Corporate/Modern Minimalism** approach, stripping away non-essential elements to reduce cognitive load for administrators, teachers, and parents.

The emotional response should be one of "effortless control." By utilizing a disciplined grid and a restrained color palette, the interface communicates competence and structural integrity. Every pixel serves a functional purpose, ensuring that data-heavy tasks feel manageable and streamlined.

## Colors

The color strategy utilizes a hierarchical "Deep Indigo and Slate" palette. 

- **Primary (Deep Indigo):** Used for navigation backgrounds, primary actions, and brand identification. It provides a grounded, academic feel.
- **Secondary (Active Indigo):** A brighter indigo variant used specifically for interactive states, focus indicators, and highlighting progress.
- **Neutrals (Slate Grays):** A sophisticated range of cool grays. Slate-900 for text, Slate-500 for secondary information, and Slate-200 for subtle borders.
- **Backgrounds (Crisp White/Off-White):** Pure white (#FFFFFF) is reserved for card surfaces and data inputs, while the base application background uses a very soft slate (#F8FAFC) to reduce glare during extended use.

## Typography

The design system utilizes **Inter** exclusively to leverage its exceptional legibility in data-dense environments. 

The typographic hierarchy is strictly enforced. Large headlines are slightly tighter in letter-spacing to appear more authoritative. Labels utilize a subtle uppercase treatment and increased tracking to differentiate them from body text and to clearly categorize form fields and table headers. Line heights are generous to prevent visual "crowding" in dense student records and reports.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop and a **Fluid Grid** for mobile.

- **Desktop:** A 12-column grid with 24px gutters. Content is housed within a 1440px max-width container to ensure readability on ultra-wide monitors.
- **Sidebar:** A persistent 260px left-hand navigation menu for institutional modules.
- **Rhythm:** An 8px base unit (4px sub-unit) controls all padding and margins. Vertical rhythm is emphasized in forms and list views to create a sense of logical progression.
- **Mobile Adaption:** At the 768px breakpoint, the sidebar collapses into a bottom navigation or "hamburger" menu, and margins reduce to 16px.

## Elevation & Depth

To maintain a clean, academic aesthetic, this design system rejects heavy shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Surface Levels:** The base background is the lowest level. Content sits on "Cards" (Level 1) which are pure white.
- **Definition:** Cards are defined by a 1px solid border in Slate-200 rather than a shadow.
- **Interaction Depth:** Only high-priority floating elements (like dropdown menus or modals) utilize a "Soft Ambient Shadow"—a subtle, 12% opacity slate tint with a 16px blur and no offset. This ensures the UI feels flat and organized, not cluttered by artificial depth.

## Shapes

The shape language is **Soft**. A consistent 4px (0.25rem) corner radius is applied to buttons, input fields, and small UI components. Larger containers like dashboard widgets and cards utilize an 8px (0.5rem) radius.

This subtle rounding bridges the gap between the "sharp" traditional academic feel and modern software usability. It provides enough softness to feel approachable without losing the professional, structured edge required for a management system.

## Components

### Data Tables
Tables are the heart of the system. They feature a fixed header, alternating row zebra-striping (Slate-50), and a 48px row height for optimal scanning. Sort icons are subtle and only appear on hover or when active.

### Dashboard Widgets
Widgets are unified cards containing a single data point or visualization. Each widget must have a standard header (Label-md) and a clear action link (Label-sm) in the top right.

### Buttons
- **Primary:** Deep Indigo background, white text. No gradient.
- **Secondary:** White background, Slate-200 border, Slate-900 text.
- **Ghost:** No border or background; text only. Used for tertiary actions to keep the interface uncluttered.

### Input Fields
Inputs use a 1px Slate-300 border that transitions to Indigo-600 on focus. Labels are always persistent above the field (never floating) to ensure accessibility and clarity during rapid data entry.

### Status Chips
Small, low-saturation pills used for "Attendance," "Grades," or "Payment Status." They use background tints (e.g., soft green for "Present") with high-contrast text for legibility.