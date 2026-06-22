---
name: Chemical Laboratory Library System
description: Modern, high-precision laboratory inventory and equipment scheduling system.
colors:
  primary: "#3f1b85"
  primary-hover: "#31146b"
  neutral-bg: "#f8fafc"
  neutral-card: "#ffffff"
  neutral-text: "#1e293b"
  neutral-muted: "#64748b"
  border: "#e2e8f0"
  accent-blue: "#3b82f6"
  accent-red: "#ef4444"
  accent-orange: "#f97316"
  accent-yellow: "#f59e0b"
  accent-green: "#10b981"
typography:
  body:
    fontFamily: "Prompt, Sora, sans-serif"
    fontSize: "14px"
    lineHeight: "1.5"
rounded:
  xl: "20px"
  lg: "16px"
  md: "12px"
  sm: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.border}"
---

# Design System: Chemical Laboratory Library System

## 1. Overview

**Creative North Star: "The Obsidian Flask"**

The Obsidian Flask design system provides a sleek, high-precision interface modeled after professional laboratory journals. It combines a clean, readable typographic layout with structured information boxes and color-coded status badges, making it simple to track stock levels, upcoming bookings, and purchase orders.

The system emphasizes high contrast and clear grid alignment. Layouts are designed to look sharp, clean, and professional, minimizing visual clutter to maximize cognitive efficiency.

**Key Characteristics:**
- High-contrast typography optimized for rapid scanning.
- Grid-based card structures with consistent border radiuses and gutters.
- Vibrant status accents to convey warnings, alerts, and active elements immediately.

## 2. Colors

The color system uses a deep royal purple as the primary anchor, supported by functional safety accents representing status alerts.

### Primary
- **Deep Royal Purple** (#3f1b85): Used for sidebar background, primary brand accents, and main submission buttons.
- **Deep Purple Hover** (#31146b): Used for hover states of primary buttons.

### Neutral
- **Main Background** (#f8fafc): Low-glare near-white background for comfortable viewing in brightly lit laboratory environments.
- **Card Background** (#ffffff): Clean white for card elements to stand out from the page.
- **Ink Primary** (#1e293b): Dark slate text for high readability.
- **Ink Muted** (#64748b): Slate gray for secondary metadata.
- **Border Slate** (#e2e8f0): Thin border lines to structure layout boxes without adding visual noise.

### Accent
- **Safety Blue** (#3b82f6): Used for information states, lab booking badges, and neutral actions.
- **Safety Red** (#ef4444): Used for expired materials, destructive actions, and critical alerts.
- **Safety Orange** (#f97316): Used for low-stock items or medium-priority alerts.
- **Safety Yellow** (#f59e0b): Used for near-expiry items.
- **Safety Green** (#10b981): Used for active/approved bookings, healthy budgets, and success notifications.

**The Contrast Rule.** Text colors must maintain a contrast ratio of at least 4.5:1. Never use light-gray text on a white background.

## 3. Typography

**Body Font:** Prompt, Sora, sans-serif

### Hierarchy
- **Display** (bold, 36px, 1.2): Used for primary dashboard metrics.
- **Headline** (semibold, 20px, 1.3): Used for page headers.
- **Title** (semibold, 16px, 1.4): Used for card titles.
- **Body** (regular, 14px, 1.5): Used for main table rows, labels, and form fields. Max line length: 70ch.
- **Label** (medium, 12px, 1.4): Used for small metadata, table headers, and badges.

## 4. Elevation

The system follows a strict flat depth model, relying on background tone shifts and border lines rather than ambient shadows to separate elements.

**The Flat-By-Default Rule.** Surfaces do not use drop-shadows. Boundaries between elements are created using border outlines (1px solid #e2e8f0) and subtle background variations.

## 5. Components

### Buttons
- **Shape:** Soft edges (8px radius)
- **Primary:** Deep royal purple background with white text.
- **Hover:** Darker purple hover (#31146b) with ease-in-out transition.

### Cards / Containers
- **Corner Style:** Medium curved corners (12px radius)
- **Background:** White background (#ffffff)
- **Border:** 1px solid slate border (#e2e8f0)
- **Internal Padding:** Comfortably padded (16px to 24px)

### Inputs / Fields
- **Style:** 1px border (#e2e8f0) on white background with 8px radius.
- **Focus:** Highlighted outline matching the primary color.

## 6. Do's and Don'ts

### Do:
- **Do** align form grids horizontally to maintain clean lines.
- **Do** use uppercase bold text for table headers to establish a clear hierarchy.
- **Do** verify contrast scores when placing text on color-tinted status badges.

### Don't:
- **Don't** use colored side-stripes to represent status on card containers.
- **Don't** use decorative gradients behind text or cards.
- **Don't** use ambient drop-shadows on card elements.
