---
name: Observatory
description: A restrained observatory instrument panel for inspectable agent reliability evidence.
colors:
  paper: '#f4f6f4'
  surface: '#fbfcfa'
  ink: '#193442'
  muted: '#566971'
  line: '#d3deda'
  green: '#285d4c'
  green-soft: '#e0ece5'
  amber-soft: '#f4ead7'
  focus: '#35775f'
  action-hover: '#2b4a59'
  secondary-hover: '#e4eae6'
  slot-open: '#eaf0ea'
  slot-existing: '#98a7a2'
  slot-requested: '#44715b'
typography:
  display:
    fontFamily: 'Archivo, sans-serif'
    fontSize: 'clamp(3.9rem, 6.7vw, 6rem)'
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Archivo, sans-serif'
    fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)'
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Archivo, sans-serif'
    fontSize: '1.12rem'
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: 'Archivo, sans-serif'
    fontSize: '15px'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Archivo, sans-serif'
    fontSize: '0.78rem'
    fontWeight: 400
    lineHeight: 1.6
  code:
    fontFamily: "Consolas, 'Liberation Mono', monospace"
    fontSize: '0.74rem'
    fontWeight: 400
    lineHeight: 1.65
rounded:
  badge: '3px'
  control: '4px'
  table: '5px'
  panel: '7px'
spacing:
  '8': '8px'
  '12': '12px'
  '16': '16px'
  '18': '18px'
  '20': '20px'
  '24': '24px'
  '28': '28px'
  '32': '32px'
  '40': '40px'
  '64': '64px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.surface}'
    rounded: '{rounded.control}'
    padding: '12px 19px'
  button-primary-hover:
    backgroundColor: '{colors.action-hover}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '12px 19px'
  button-secondary-hover:
    backgroundColor: '{colors.secondary-hover}'
  select:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    padding: '9px 34px 9px 12px'
  navigation:
    textColor: '{colors.muted}'
    padding: '10px 0'
  badge:
    textColor: '{colors.green}'
    rounded: '{rounded.badge}'
    padding: '3px 8px'
  evidence-panel:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.panel}'
  observation-slot:
    backgroundColor: '{colors.slot-open}'
    rounded: '{rounded.badge}'
    width: '24px'
    height: '29px'
  replay-control:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.control}'
    height: '34px'
---

# Design System: Observatory

## Overview

**Creative North Star: "The Observatory Instrument Panel"**

The approved world is a restrained observatory instrument panel: calm, precise, and readable. Pale surfaces, blue ink, modest green accents, and compact evidence displays give engineering work room to speak. The atmosphere comes from typography, the orbital brand mark, and the observation board.

Dense operational details sit within generous page spacing. Keep provenance visible and interactions understandable: this portfolio invites inspection of evidence. This document records the built interface in `app/assets/main.css`, `app/app.vue`, and the page/component files.

**Key Characteristics:**

- Quiet paper surfaces and flat bordered panels.
- Archivo typography with compact labels and readable prose.
- Green and amber states supported by written labels.
- Responsive comparisons and keyboard-operable trace replay.

## Colors

The palette combines cool paper and blue ink with subdued botanical greens and warm fault indicators.

### Primary

- **Blue ink** anchors headings, body text, navigation states, and filled actions; its hover shade adds a small response.
- **Observatory green** identifies availability, successful outcomes, range controls, and evidence labels. Its soft tint supports outcome chips.
- **Focus green** provides the visible keyboard outline.

### Secondary

- **Soft amber** supports fault notices and unsuccessful outcome chips. Dark warm text keeps those messages readable; faults also have explicit descriptions.

### Neutral

- **Paper** is the page canvas; **surface** is the slightly lighter evidence and results background.
- **Muted slate** carries explanatory copy and metadata; **line** separates sections and table rows.
- **Open-slot pale green**, **existing-booking gray**, and **requested-observation green** distinguish schedule cells. Preserve the legend and accessible cell text.

**The State in Words Rule.** Pair state color with text, a legend, or accessible labels; preserve the distinction between scripted demonstrations and recorded model runs.

## Typography

Archivo is the single interface family, locally imported at weights 400, 500, and 600. The code inspector uses Consolas with Liberation Mono and monospace fallbacks. The root size is the body token; all rem measurements depend on it.

Display type is reserved for the landing headline. Interior page headings use `clamp(2.4rem, 4.4vw, 3.8rem)`, retaining the display line height and tracking. Headline and title tokens describe the shared second- and third-level headings; individual panel headings are smaller.

Lead copy uses a relaxed line height (1.75) and a maximum width of 54ch, narrowed to 43ch in the landing introduction. Methodology prose is limited to 72ch with line height 1.85. Labels and table metadata are compact, sentence case, and regular or medium weight. Use tabular numerals for numeric results and replay positions.

## Layout

The main content is centered at `min(1280px, calc(100% - 88px))`. Header and footer have a maximum width of 1440px. Main sections use open space and thin rules; the spacing entries above document recurring measurements, not a separate CSS variable scale.

Desktop compositions use two columns where evidence and explanation benefit from proximity. Replay has a fixed trace column (340px) beside a flexible state area. At 1100px and below, outer content gutters become 28px and replay's trace column becomes 290px.

At 760px and below, content gutters become 20px; header navigation occupies a second full-width row; hero, replay, methodology, and scenario rows stack. The landing heading uses `clamp(3.4rem, 12vw, 5rem)`; interior headings use `clamp(2.3rem, 8vw, 3.5rem)`.

Comparison rows become labeled two-column records, with scenario and agent identity spanning both columns. Preserve table semantics and metric labels. Observation boards keep their slot grid and scroll locally when necessary. Mobile trace lists scroll within a 260px maximum height; long IDs and inspector payloads wrap.

## Elevation & Depth

There are no box shadows, gradients, or floating glass surfaces. Depth comes from pale tonal fills, one-pixel borders, and clear subdivisions. Evidence panels and replay containers clip their contents to their panel radius.

**The Flat Panel Rule.** Use tone and borders to group evidence; retain the shadow-free resting surfaces.

Motion is limited to the filled/secondary action background transition (0.16s ease-out). Reduced-motion preference removes transitions. Selection in the trace changes fill without animated movement.

## Shapes

Panel corners are gently rounded; controls are tighter, and badges and observation slots use the smallest radius. Results containers have their own intermediate radius. Small circles indicate availability; small squares in the legend correspond to schedule fills.

Use the orbital line icon for the brand and restrained line arrows for directional links. The existing interface does not rely on photographic or illustrative assets.

## Components

### Buttons

Filled blue-ink actions use light text, a one-pixel matching border, medium-weight compact type, and a minimum height of 46px. Secondary actions have a transparent fill and muted green-gray border. Text links pair plain type with a small arrow and underline on hover.

Keyboard focus uses a three-pixel green outline with a four-pixel offset. Disabled buttons have opacity 0.4 and a not-allowed cursor. File import uses the secondary action styling and a focus-within outline.

### Fields

Native selects retain their native indicator, surface fill, muted green-gray stroke, and a minimum height of 43px. Labels sit above controls with a seven-pixel gap. Filters wrap; mobile fields fill the available column. The replay range input uses the green accent and a visible accessible label.

### Navigation

Desktop navigation is a plain horizontal row of muted text. Active and hovered links gain ink color and a thin underline border. On mobile the row remains visible beneath the brand. Preserve the skip link and all visible focus treatments.

### Badges and outcomes

Provenance badges are small outlined rectangles with green type. Outcome chips use green or amber tinted fills with darker corresponding text. These communicate categories and results; they are not pill-shaped filters.

### Evidence and results containers

Evidence panels combine a softly tinted title strip, surface body, and ruled footer link. Default body padding is 26px 24px with no bottom padding; mobile body padding is 23px 18px. Results use a compact semantic table, pale header, ruled rows, and a subtle row-hover fill.

### Observation board

A semantic table pairs instrument names and availability with discrete time slots. Open, existing, requested, and unavailable cells have distinct fills; the same meanings are available as text. Cells are larger in the desktop replay state panel (35px wide), reducing to 25px on mobile; the landing board uses the slot token.

### Trace replay

Previous/next controls flank a numeric position and native range input. Trace events are full-width buttons with a number, action name, and secondary description. Hover and selected events use progressively stronger pale green fills. The adjacent inspector shows state, fault notices, and wrapped monospace payloads. Preserve keyboard operation, disabled boundary controls, and visible selected state.

## Do's and Don'ts

### Do:

- **Do** use existing paper, surface, ink, and state colors consistently.
- **Do** preserve readable provenance and explicit state labels.
- **Do** keep keyboard focus visible and respect reduced motion.
- **Do** adapt dense comparison data into labeled mobile records.
- **Do** keep long identifiers and payloads inside their local containers.

### Don't:

- **Don't** introduce shadows or ornamental gradients into the flat panel system.
- **Don't** rely on color alone to explain an outcome or schedule state.
- **Don't** replace compact rectangular controls with large pill-shaped controls.
- **Don't** hide primary navigation on small screens or shrink whole tables to fit.
