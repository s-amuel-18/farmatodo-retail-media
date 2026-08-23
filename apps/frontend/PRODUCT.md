# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two internal roles at Farmatodo, distinguished by a Firebase custom claim on the ID token:

- **Commercial Analyst** — creates, edits, and submits Retail Media campaigns for approval; can resubmit after a rejection.
- **Approval Manager** — reviews submitted campaigns and approves or rejects them (rejection requires a comment).

Confirmed: both roles use the product daily, at high volume — this is an internal operations tool, not an occasional-use form.

## Product Purpose

Manage the full lifecycle — creation, review, and approval — of Retail Media campaigns for Farmatodo (a retail/pharmacy chain), across four channels: two in-store (Pétalo shelf-talkers, Parrillera grid/rack) and two digital (SMS, TikTok). Success means a campaign moves predictably through a controlled approval workflow instead of ad hoc coordination between the person proposing it and the person who must sign off on it.

## Positioning

[Inferred from the state machine, role separation, and cost model in the codebase — confirm or correct] A structured, auditable approval workflow that separates campaign creation from approval authority through distinct roles and a formal state machine (Draft → Pending Approval → Approved, or → Rejected → resubmitted by the owner), with per-channel cost visibility built in. A manual process (email threads, shared spreadsheets) could replicate the paperwork but not the same consistency, role enforcement, or auditability.

## Operating Context

- Commercial Analysts create/edit a campaign through a form whose fields change per channel, then submit it for approval.
- Approval Managers work from an approvals queue and decide (approve, or reject with a required comment) on each pending campaign.
- Role-based routing keeps the two roles in their own areas: analysts are redirected away from `/approvals`, managers away from `/campaigns`.
- Sign-in is Google Sign-In via Firebase; a signed-in user with no assigned role sees a "pending access" state until an admin assigns one.
- Real authorization is enforced server-side (NestJS backend, Firebase auth guard + role guard); Firestore access is default-deny and writes to campaigns go only through the backend.

## Capabilities and Constraints

- State machine: `DRAFT → PENDING_APPROVAL → APPROVED` (terminal), or `→ REJECTED → PENDING_APPROVAL` (resubmit by owner).
- Four campaign channels with distinct fields: PETALO (zone/quantity), PARRILLERA (zone/quantity), SMS (segment/audience), TIKTOK (ad account/daily budget).
- Per-channel cost calculation by supplier/channel — a flat rate per channel, not per-audience-unit (a stated simplifying assumption).
- No frontend automated tests exist yet; the backend has domain/use-case test coverage.
- No Firestore Emulator integration tests — development happens against a real Firebase project.
- Firestore rules/index deployment is a manual CLI step, not scripted.
- Store/creative catalogs are free-text comma-separated fields (no dedicated catalog entity).
- Client-side pagination is cursor-based and held only in memory (lost on page reload).
- Concurrent edits use last-write-wins (no optimistic version control); accepted because only the campaign owner can edit it outside terminal/pending states.
- The current UI is plain inline CSS with no design system and no responsive refinement. This is the known starting point Impeccable is being used to move past — the goal is a refactor plus a durable style guide, not preservation of the current visual state as a constraint.

## Brand Commitments

Product name shown in the UI is "Retail Media" / "Retail Media - Farmatodo" (page title, header). All UI copy is in Spanish (`<html lang="es">`). No logo or brand image assets exist in the repo yet.

## Evidence on Hand

No real campaign data, testimonials, or case studies exist — only two named test accounts (one Commercial Analyst, one Approval Manager) documented in the README for local testing. Do not fabricate real usage data, customer names, or metrics anywhere in future design work.

## Product Principles

1. Separate authority from creation — analysts propose, managers decide; the interface should make that boundary visually legible, not just enforce it server-side.
2. Make approval status legible at a glance — draft/pending/approved/rejected is the single most important fact about any campaign, at any information density.
3. Design for daily, high-volume use — this is a confirmed high-throughput internal tool; prioritize scan speed and low friction over exploratory or marketing-style flourish.
4. Treat cost and channel differences as first-class — each of the four channels has different fields and cost logic; the design should surface those differences instead of forcing one generic template.
5. This is a technical-assessment codebase being brought toward production design maturity — the explicit goal is a refactor plus a durable style guide (design tokens / DESIGN.md), not a one-off visual pass.

## Accessibility & Inclusion

No accessibility work exists yet (no ARIA attributes, roles, or alt text found; only native `<label>` wrapping on some form inputs). No specific standard has been required by the user — treat this as an open gap for a future `audit` or `harden` pass rather than an established target.
