# Shot on iPhone - Dark Editorial Portfolio Design Blueprint

## Goals
- Showcase a photographer portfolio that proves skill over gear.
- Feel Apple-like in typography and restraint while still being design-element heavy.
- Use a dark theme with subtle metallic accents and controlled glow fields.
- Support continuous growth through themed photo series.
- Provide a clear, build-ready spec with no remaining design decisions.

## Audience
- Art directors, clients, and viewers who value craft and intentional technique.
- Visitors browsing on desktop and mobile with a preference for premium, minimal aesthetic.

## Site Structure (Evolving Portfolio)
- Home: highlights the latest theme drop, manifesto, and a curated selection.
- Series pages: one page per theme, consistent visual system across themes.
- Archive index: list of all themes with dates and short descriptions.

## Page Narrative (Home)
1) Hero
2) Philosophy / Manifesto
3) Latest Theme (Editorial Spreads)
4) Process / Constraints
5) About / Contact
6) Archive Preview
7) Footer

## Visual System

### Palette (Tokens)
- bg-900: #0A0A0B
- bg-800: #111214
- text-100: #F5F5F7
- text-300: #A8A8AF
- accent-silver: #C7C7CC
- line-700: #2A2A2E
- glow-600: #1D1F24

### Background Treatment
- Base: bg-900.
- Add 2 linear gradients:
  - 180deg from #0A0A0B to #111214 at 35% opacity.
  - 90deg from #0B0C0E to #0A0A0B at 20% opacity.
- Add 1 radial gradient behind hero title:
  - center at 35% width / 20% height, color glow-600, radius 60%.
- Add subtle noise overlay (3-4% opacity) for depth.
- Add thin grid lines (1px, line-700 at 12% opacity) over entire page.

### Contrast
- Text must pass WCAG AA (>= 4.5:1).
- Use text-100 only on bg-900 or bg-800.
- Use text-300 for secondary copy and metadata only.

## Typography

### Primary Fonts
- Display: SF Pro Display (600/500).
- Body: SF Pro Text (400/500).
- Mono: SF Mono (400/500).
- Fallbacks: system-ui, -apple-system, Helvetica Neue, Arial, sans-serif; and ui-monospace for mono.

### Type Scale
- H0 (Hero): 96-120px, weight 600, tracking -0.02em, line-height 0.90.
- H1: 56-72px, weight 600, tracking -0.01em, line-height 1.0.
- H2: 32-40px, weight 500, tracking -0.005em.
- Body: 16-18px, weight 400, line-height 1.6.
- Caption/EXIF: 12-13px, weight 500, tracking 0.06em (mono), line-height 1.4.

### Title Treatment
- Text: "Shot on iPhone" set in Display weight 600.
- Tracking tight, minimal punctuation, generous whitespace.
- Title sits on its own line with clear breathing room and thin rule beneath.

## Layout + Grid

### Breakpoints
- Desktop: >= 1200px
- Tablet: 768-1199px
- Mobile: <= 767px

### Grid
- Desktop: 12 columns, 32px gutters.
- Tablet: 6 columns, 24px gutters.
- Mobile: 4 columns, 16px gutters.

### Container
- Max width: 1200-1280px.
- Side padding: 80px desktop, 48px tablet, 24px mobile.

### Spacing System
- Base unit: 8px.
- Section gaps: 96-128px on desktop, 72-96px on tablet, 56-72px on mobile.

## Components (Specs)

### 1) Hero
- Full viewport height (min 85vh) with center-left title alignment.
- Elements:
  - Title H0
  - Tagline body: "Skill over gear. Proof in every frame."
  - CTA buttons: primary (solid) and ghost
  - Hairline rule below title (line-700)
- Background: radial glow + grid + noise.
- CTA styles:
  - Primary: bg accent-silver, text bg-900, 48px height, 20px horizontal padding, 8px radius.
  - Ghost: transparent, 1px border line-700, text-100.

### 2) Philosophy / Manifesto
- Oversized section index "01" in outline or low-opacity text-300.
- Quote block: H2 text, 60-80 characters per line.
- Underline: 2px accent-silver, 40% width.
- Supporting paragraph below with body text.

### 3) Latest Theme (Home)
- Title block with theme name + date + location.
- Editorial spread layout (same as gallery spec).
- CTA: "View full series" linking to series page.

### 4) Series Page (Per Theme)
- Header with theme title, date range, location, and 2-3 line overview.
- Editorial spreads repeating pattern:
  - Full-bleed single image -> asymmetrical two-up -> full-bleed.
- Each image has overlay elements:
  - EXIF badge: mono, uppercase, 12px, background bg-800 at 80% opacity.
  - Decision note: 1-2 lines, text-300, positioned lower-left.
  - Crop marks: 1px line-700, subtle corner brackets.
- Hover: image scale 1.02, EXIF badge brightens to text-100.

### 5) Process / Constraints
- Format: 3-5 item checklist or timeline.
- Each item includes:
  - Constraint (e.g., "Available light")
  - Technique decision (e.g., "Expose for highlights, lift shadows")
  - 1 small image crop (square, 180-220px).

### 6) About / Contact
- Name: "Jonah Kim" with H2.
- Location: "Krakow, Poland" shown as secondary text.
- Bio (mix of direct and poetic, pragmatic tone):
  "Jonah Kim is a Krakow-based photographer working across landscape, nature, architecture, and portraiture.
  Every image in this portfolio is made on iPhone to keep the focus on timing, light, and restraint.
  The work is a practical proof of a simple idea: skill matters more than gear."
- CTA: "Email Jonah" primary button linking to jonahkim@iskonline.org.
- Contact line: "jonahkim@iskonline.org" in mono.
- Social links: optional line-art icons only if needed.

### 7) Archive Index
- List all themes in reverse chronological order.
- Each entry includes:
  - Theme title
  - Date or season
  - Location
  - 1-line description
  - Thumbnail (small crop) if available

### 8) Footer
- Repeat "Shot on iPhone" mark (smaller H2).
- Year + short credo: "Skill first. Gear second."
- Hairline rule top.

## Interaction and Motion
- Page load: title and tagline fade in + translateY(10px) over 500ms.
- Scroll reveal: staggered image and text fade-in (100ms increments).
- Hover (desktop): image scale 1.02, EXIF badge glow.
- Reduced motion: remove transforms, keep opacity transitions only.

## Responsive Behavior
- Mobile: hero title wraps to 2 lines; CTAs stack vertically.
- Gallery: all full-bleed images become full-width with 16px side padding.
- Asym grids collapse to single column with consistent spacing.
- EXIF badges move to top-left with solid bg for readability.

## Content Model (Repo Collections)

### Theme collection file
- One file per theme, stored under `content/series/`.
- Format: Markdown or JSON with front matter.
- Required fields:
  - slug
  - title
  - date (YYYY-MM-DD)
  - location
  - summary (1-2 lines)
  - hero_image
  - photos (list)

### Photo fields (per theme)
- title
- location
- date
- exif: ISO, shutter, focal length, lens
- technique note (1-2 lines)
- image path

### Example (front matter style)
```
slug: fog-and-stone
title: Fog and Stone
date: 2026-01-18
location: Krakow, Poland
summary: Winter streets where detail disappears and light becomes the subject.
hero_image: /images/fog-and-stone/hero.jpg
photos:
  - title: Tram Window
    location: Krakow Old Town
    date: 2026-01-18
    exif: ISO 64, 1/250, 26mm
    note: Exposed for highlights, then lifted midtones in post.
    image: /images/fog-and-stone/01.jpg
```

## Content Placeholders

### Per-photo required fields
- Title
- Location
- Date
- EXIF: ISO, shutter, focal length, lens
- Technique note (1-2 lines)

### Placeholder Copy Examples
- Name: "Jonah Kim"
- Location: "Krakow, Poland"
- Bio: "Jonah Kim is a Krakow-based photographer working across landscape, nature, architecture, and portraiture. Every image in this portfolio is made on iPhone to keep the focus on timing, light, and restraint. The work is a practical proof of a simple idea: skill matters more than gear."
- Manifesto quote: "Great images come from attention, not equipment."

## Accessibility
- Minimum contrast 4.5:1 for body text.
- Visible focus styles for all interactive elements.
- Reduced motion support via prefers-reduced-motion.
- Semantic heading order (H1 for title, H2 for sections).

## Acceptance Checks
- Visual hierarchy is clear on desktop and mobile.
- Title treatment feels Apple-like but does not copy branding.
- EXIF overlays remain legible on varied imagery.
- Reduced motion mode removes transforms.
- Low-contrast images still show readable EXIF badges.
- Latest theme displays correctly and archive grows without layout break.

## Implementation Notes (Non-code)
- Use SVG for corner brackets and line art icons.
- Use CSS grid for layout and fluid spacing with clamp().
- Provide placeholder images with varied aspect ratios.
- Themes share the same visual system; no per-theme palette changes.
