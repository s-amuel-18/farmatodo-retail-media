---
name: Retail Media — Farmatodo
description: An operator's bridge for creating and approving retail media campaigns, in Farmatodo's own navy-and-gold brand system.
colors:
  navy-950: "#0a1c40"
  navy-900: "#0f2450"
  navy-800: "#192e5a"
  navy-700: "#24396e"
  navy-100: "#e4e9f5"
  brand-blue-800: "#26568c"
  brand-blue-700: "#2f74bd"
  brand-blue-600: "#418fde"
  brand-blue-50: "#ecf3fb"
  gold-600: "#b5860a"
  gold-500: "#f0c419"
  gold-100: "#fdf1cf"
  canvas: "#f7f8fa"
  surface: "#ffffff"
  ink: "#16233f"
  text-muted: "#57678a"
  border: "#dbe2ee"
  danger-600: "#c23a2b"
  danger-50: "#fbe9e7"
  status-draft-bg: "#e6e9f2"
  status-draft-fg: "#3c4a68"
  status-pending-bg: "#fdf1cf"
  status-pending-fg: "#8a5a00"
  status-approved-bg: "#dcf3e7"
  status-approved-fg: "#0f6b42"
  status-rejected-bg: "#fbe2df"
  status-rejected-fg: "#b3271b"
typography:
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
  caption:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  control: "10px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-blue-700}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brand-blue-800}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.danger-600}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  badge-pending:
    backgroundColor: "{colors.status-pending-bg}"
    textColor: "{colors.status-pending-fg}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
    typography: "{typography.caption}"
---

# Design System: Retail Media — Farmatodo

## Overview

**Creative North Star: "The Bridge"**

Navy hull, brass instruments, full visibility of everything underway — this system reads as the operating bridge of a real Farmatodo vessel, not a generic admin theme. The navy (`#0f2450`) is structural: it is where the product asserts *this is Farmatodo's*, not a decorative wash. Gold is brass, not confetti — it appears exactly where a human decision is waiting (the Pending status) and nowhere else. Everything in between — canvas, surfaces, borders, ink — stays quiet on purpose, because the two people who live in this tool all day (Commercial Analysts, Approval Managers) are here to move campaigns through a state machine quickly, not to admire the room.

This is a real redesign, not a reskin: every color, radius, and component in this file was pulled from Farmatodo's own production site (farmatodo.com.ve) and then adapted for Operate — the promotional carousels and discount badges that make sense on a storefront were left behind on purpose; the navy, the brass gold, the pill-shaped controls, and the real Farmatodo wordmark came forward.

**Key Characteristics:**
- Navy header carries the real Farmatodo logo; everything below it lives on a quiet, near-white canvas.
- Gold is reserved for exactly one meaning: Pending, a decision waiting on a human.
- Soft, friendly control radius (10px) on every interactive control, echoing the pill-shaped buttons on the public site, tuned down from a full pill for table-dense screens.
- One real shadow in the whole system, reserved for the modal that has to float above the table it interrupts.

## Colors

Near-monochrome navy/canvas base, with two reserved accents: brand blue for action, brass gold for "needs you."

### Primary
- **Farmatodo Blue** (`{colors.brand-blue-700}` #2f74bd; hover `{colors.brand-blue-800}` #26568c): every primary action (Guardar, Aprobar, + Nueva campaña). Deliberately one step darker than the public site's own button blue (`#418fde`, kept as `brand-blue-600` for lighter touches like focus rings) because white text on the lighter shade only clears 3.4:1 — this system never trades brand fidelity for a contrast failure.

### Secondary
- **Brass Gold** (`{colors.gold-500}` #f0c419, tinted background `{colors.gold-100}` #fdf1cf): reserved for the Pending status and the computed-cost callout on the campaign form — both are moments where the interface says "look, something needs your attention or judgment."

### Neutral
- **Navy** (`{colors.navy-900}` #0f2450 / `{colors.navy-800}` #192e5a): the header. Nowhere else — navy is the bridge's hull, not a text color.
- **Canvas** (`{colors.canvas}` #f7f8fa): page background.
- **Surface** (`{colors.surface}` #ffffff): cards, table containers, the modal.
- **Border** (`{colors.border}` #dbe2ee): the single hairline gray, navy-tinted rather than neutral slate.
- **Ink** (`{colors.ink}` #16233f) / **Muted Text** (`{colors.text-muted}` #57678a): body text and secondary text, both navy-tinted rather than generic gray.

### Status (semantic, retoned into this family — not the generic pastels of a default component library)
- **Draft** (`{colors.status-draft-bg}` / `{colors.status-draft-fg}` #3c4a68): navy-tinted neutral, not yet submitted.
- **Pending** (`{colors.status-pending-bg}` / `{colors.status-pending-fg}` #8a5a00): the brass-gold family — the one status that shares its hue with the brand accent, on purpose.
- **Approved** (`{colors.status-approved-bg}` / `{colors.status-approved-fg}` #0f6b42): a cooler, navy-adjacent green rather than a lime green.
- **Rejected** (`{colors.status-rejected-bg}` / `{colors.status-rejected-fg}` #b3271b): a warm brick red, distinct from Danger.
- **Danger** (`{colors.danger-600}` #c23a2b): validation errors and rejection-comment text — "look here now," never a campaign's state.

### Named Rules
**The One Gold Rule.** Brass gold means exactly one thing: a human decision is waiting. It never decorates a heading, a hover state, or an icon.

## Typography

**Body Font:** system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif — the same stack Farmatodo's own production site ships (confirmed by inspecting its computed styles). No custom or display webfont; the brief's own evidence rules one out.

### Hierarchy
- **Title** (600, 20px): page headings ("Mis campañas", campaign name).
- **Body** (400, 16px): default text, table cells, form values.
- **Label** (400, 13px): form field labels.
- **Caption** (600, 12px): status badges, helper text, rejection-comment line.

### Named Rules
**The No-Display Rule.** No tier exists above Title (20px). This bridge never needs a hero moment.

## Layout

Tailwind's default 4px spacing scale, used exactly as Tailwind ships it (4/8/12/16/24px — the same rhythm the pre-Tailwind inline styles already used, so nothing about the product's density changed, only its consistency). Content areas cap at `max-w-2xl` (forms, detail) or run full-width inside an `overflow-x-auto` container (tables), so a narrow viewport scrolls the table horizontally instead of breaking the page. No breakpoint system beyond that yet — full responsive treatment stays the open item PRODUCT.md already names.

## Elevation & Depth

Flat everywhere except one place: the reject-campaign modal, which needs to visibly float above the table it interrupts. Its shadow (`0 10px 30px -10px rgba(15,36,80,0.35)`) is tinted from Navy, not generic black, with a real offset and blur — never a flat drop-shadow default.

### Named Rules
**The One Shadow Rule.** Exactly one elevation level exists, and exactly one component (Modal) uses it. A second shadow anywhere else is scope creep, not craft.

## Shapes

Soft control radius (`{rounded.control}` 10px) on every button, input, select, textarea, and card — enough to read as the same friendly, rounded language as Farmatodo's own pill-shaped public buttons, tuned down from a literal pill so a dense table of campaigns doesn't turn into a row of gumdrops. The pill (`{rounded.pill}` 999px) stays reserved for the one place a full pill still earns its keep: the status badge, where "distinct from everything else on the row" is the entire point.

## Components

### Button
- **Shape:** `{rounded.control}` (10px), `px-4 py-2` (or `px-3 py-1.5` at the `sm` size).
- **Primary:** Farmatodo Blue fill, white text, darkens on hover.
- **Secondary:** white fill, navy text, Border-colored outline, border darkens to Navy on hover.
- **Ghost:** transparent, navy text, tints to Navy-100 on hover — used for header actions and inline row actions ("Enviar a aprobación").
- **Danger:** Danger-600 fill, white text — reserved for "Confirmar rechazo," never for a merely secondary action.
- All four variants share one component (`components/ui/Button.tsx`); there is no second button implementation anywhere in the app.

### Status Badge
- **Shape:** pill, `padding: 2px 10px`, Caption type.
- One of the four status pairs, chosen by campaign status — the only component in the system still allowed the full pill radius.

### Card
- White surface, `{rounded.control}`, `Border`-colored 1px outline, `p-6`. Used for the login panel; the table container reuses the same recipe directly rather than a second card variant.

### Field / Input / Select / Textarea
- One shared control recipe (`components/ui/controls.ts`): white fill, Border outline, `{rounded.control}`, Border-color shifts to Farmatodo Blue on focus. Every form control in the app — text, number, date, time, select, multi-select, textarea — renders from this one recipe, so there is exactly one "what does an input look like" answer in the codebase.

### Table
- Full-width, wrapped in a white, `{rounded.control}`-bordered container with `overflow-x-auto`. Header row: Caption-weight, uppercase, Muted Text. Body rows: Border-colored divider, Canvas tint on hover. The status column always renders a Status Badge.

### Modal
- White surface, `{rounded.control}`, the system's one shadow, centered over a Navy-950-at-50%-opacity scrim. Closes on Escape or on a click outside the panel. Used today for the single confirm-with-comment flow (campaign rejection); any future confirmation dialog reuses this component rather than a new inline overlay.

## Do's and Don'ts

### Do:
- **Do** keep Navy exclusive to the header/hull — it is a structural color, not a text or accent color.
- **Do** keep gold exclusive to "a human decision is waiting" (Pending status, the computed-cost callout).
- **Do** use `brand-blue-700`, never `brand-blue-600`, wherever white text sits on a solid fill — `600` is for lighter touches (focus rings, larger brand moments) where AA text contrast doesn't apply.
- **Do** build every new form control from `components/ui/controls.ts`'s shared recipe rather than styling a bare `<input>`/`<select>`/`<textarea>` again.

### Don't:
- **Don't** add a second gray for borders or muted text. Every former inline-style gray (`#e5e7eb`/`#f0f0f0`/`#ddd`, `#666`/`#555`/`#444`) has been consolidated into the single `border` and `text-muted` tokens — reintroducing a one-off gray undoes that.
- **Don't** give a button, card, or table a radius other than `{rounded.control}`. The pill is spent entirely on the status badge.
- **Don't** add a second shadow recipe. One elevation level, one component that uses it.
- **Don't** hardcode a campaign status, channel, or role label as a string literal in a view. Every label lives in `src/lib/campaign-vocabulary.ts`; add to it instead of inlining a new one.
