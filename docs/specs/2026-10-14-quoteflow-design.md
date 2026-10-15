# QuoteFlow design specification

Recorded: October 14, 2026. Status: visual direction approved; local demo implemented and verified.

## Purpose and boundaries
QuoteFlow helps small service businesses capture customer requests, manage leads, and create estimates. It is a separate project at the standalone QuoteFlow project folder. Do not modify, reference as a dependency, publish, or change visibility of ProgramPulse. QuoteFlow is intended for a public GitHub repository; ProgramPulse remains private. Publication and deployment require explicit approval.

## Approved visual direction
See ../design/quoteflow-dashboard-concept.png. The user approved this desktop and mobile concept. Navy sidebar, white content, teal actions, restrained borders, rounded cards, legible typography, and generous spacing. Navigation: Overview, Leads, Estimates, Request form. Desktop lead table becomes stacked cards on mobile. The image is a visual guide: displayed dates, metrics, arrows, and sample percentages are illustrative, not fixed requirements. Only implement controls with working behavior; do not show decorative inactive settings or fabricated trend comparisons.

## Stack and architecture
React, TypeScript, Vite, Tailwind CSS, shadcn/ui. Client-only demo initially. Feature modules consume a typed repository interface rather than accessing browser storage directly. Use a versioned localStorage adapter with runtime validation and a fictional seed dataset; expose storage failure to users without losing the current in-memory session. All saved state belongs to a quoteflow namespace. No network services, authentication claims, or shared customer request ingestion in the demo.
Future Supabase authentication and PostgreSQL integration are architecture provisions, not enabled services.

## Screens and behavior
- Overview: New leads, awaiting response (Quoted), won estimate value this calendar month, win rate defined as Won / (Won + Lost), and zero when no closed leads. All metrics derive from records. Follow-ups are leads marked New or Quoted ordered by oldest update; no outbound notifications.
- Leads: search customer or service, combine search with All/New/Quoted/Won/Lost filters, view details, create/edit a lead, update status, and display useful empty states.
- Request form: customer name, email, optional phone, service, and request description. Validate required fields and email, trim text, then create one New lead and display success. Prevent duplicate submission. Mark as demo and explain that requests stay in this browser.
- Estimates: select lead, add/edit/remove line items, description, quantity, unit price, optional notes, and display subtotal. USD only; amounts stored as integer cents. No tax, discounts, payment collection, email sending, or invoicing in version one. Quantities are positive whole numbers; prices are finite non-negative amounts with at most two decimal places; at least one valid item required. Saving a new estimate changes a New lead to Quoted; editing never reopens a Won or Lost lead.
- One active estimate per lead in the first version. Saved estimates remain editable. Won and Lost can be changed manually; updated timestamps and closed timestamps reflect transitions. New or Quoted clears closedAt.
- Browser persistence: reload retains changes. Offer a confirmed reset to fictional demo data.

## Data contracts
Lead: id, customerName, email, optional phone, service, description, status (New | Quoted | Won | Lost), createdAt, updatedAt, closedAt (nullable).
Estimate: id, leadId, items, notes, createdAt, updatedAt.
EstimateItem: id, description, quantity, unitPriceCents.
StoredState: schemaVersion (1), leads, estimates.
Use UUID identifiers and ISO timestamps. Keep customer contact information out of source fixtures except explicitly fictional example.com addresses and synthetic phone numbers. Never commit browser exports or real customer information.

## Future backend boundary
Document a proposed PostgreSQL model: businesses, business_members, leads, estimates, estimate_items. Tenant-scoped rows and relationships must be enforced by database constraints and row-level security before live use. Authenticated membership must determine access. Never trust a browser-supplied business ID alone. No Supabase project, keys, SQL migration, or live auth is created during the demo phase. A future repository adapter replaces localStorage while screens retain the same contracts. Design tenant provisioning, request-form abuse protection, and data migration before enabling a public intake endpoint.

## Accessibility and quality
Keyboard-operable navigation and dialogs, visible focus, labels and field errors, status text in addition to color, and dialog focus management. Verify at 375, 768, and 1440 pixels. Empty, invalid, and storage-failure states must be useful. Derived totals and statuses update immediately after changes.

## Public repository preparation
README, design spec, implementation plan, backend roadmap, release checklist, approved concept image, and .gitignore. No secrets or real customer data. Ignore environment files, local exports, dependencies, build output, and test output. Use empty placeholders only if an environment example later becomes necessary. Retain lockfile when app dependencies are added. Select a license with the owner before publication. No remote repository creation, push, or deployment without explicit approval.

## Acceptance
A person can submit a fictional request, find the new lead, create an estimate with correct totals, mark it Won or Lost, and reload without losing changes. Search, filters, status counts, and value totals remain consistent. The public repository contains only QuoteFlow material.
