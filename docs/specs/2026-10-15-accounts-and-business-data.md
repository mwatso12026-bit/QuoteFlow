# QuoteFlow — Accounts and Secure Business Data

Date: October 15, 2026
Status: scope approved; written specification awaiting owner review.
Milestone: first production foundation. No database or deployment changes are authorized by this document alone.

## Intent
Turn the existing QuoteFlow demo into an application where a small service-business owner can securely sign in and manage leads and estimates across devices. Preserve the approved design and existing estimate/status behavior.

## Decisions and boundaries
- Keep React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
- Use a new, dedicated Supabase project for QuoteFlow Auth and PostgreSQL.
- Target Cloudflare for frontend hosting after this milestone is verified; do not deploy during this milestone.
- One business per account, with one owner. Reserve a membership model for future employee access; no invitations or role-management interface now.
- Keep the public fictional demo available separately from authenticated business data.
- Use development infrastructure first. No paid resource upgrades, custom-domain purchases, or live billing activation without an explicit cost decision.
- Never store secrets, real customer data, project credentials, private Notion links, or personal filesystem paths in the public repository.

## User journeys
1. A visitor can open the fictional demo without creating an account.
2. An owner signs up with email and password, receives a confirmation email, and verifies their address. Email confirmation is required before accessing business data.
3. After signing in, an owner without a business completes onboarding with business name, business contact email, and optional phone. No record is created until validation succeeds.
4. A returning owner lands in their own dashboard. A new business starts empty; demo leads are never seeded into it.
5. The owner can create/edit leads and estimates, filter leads, and change New/Quoted/Won/Lost statuses. Existing money and status rules remain unchanged.
6. Refreshing or signing in on another device retrieves the saved business records.
7. The owner can request a password reset, follow the recovery link, set a new password, and return to sign-in.
8. Logout immediately clears business records and open editors from application memory. Switching accounts cannot show the previous business's data.

## Screens and navigation
Retain the approved navy/teal design and responsive navigation.
Add sign-in, sign-up, check-your-email, password-recovery, set-new-password, and business-onboarding screens. Separate demo navigation from account navigation with a clear Demo label.
A business profile screen lets the owner update business name, contact email, and optional phone.
The existing Request form becomes an authenticated way to enter a customer request in the business workspace. In demo mode it remains browser-only. A publicly shared customer-intake endpoint is deferred.

## Authentication state and errors
Render an explicit loading state while resolving the session; do not briefly show another workspace or demo data.
Route authenticated sessions with no business to onboarding. Route expired or signed-out sessions to sign-in and clear sensitive in-memory state.
Configure exact local-development and future deployment callback allowlists. Invalid, expired, or reused confirmation/recovery links show a useful retry path.
Keep passwords and tokens out of logs, URLs created by application code, analytics, and Git. Use Supabase's supported browser session mechanism; do not create a second custom token store.
Do not persist customer records in localStorage in production mode. Keep unsaved editor input only in the current session; logout discards it.
Use generic recovery and signup feedback where needed to avoid disclosing whether an email is registered.
Verify real email delivery before accepting external customers; default development mail delivery is not the production delivery plan.

## Data model
Use UUID primary keys, server-managed timestamps, database validation, and business ownership throughout.
- businesses: id, owner_user_id (unique), name, contact_email, optional phone, created_at, updated_at, revision.
- business_members: business_id, user_id, role (owner initially), created_at. One unique membership per user for this milestone. Create the owner membership only as part of trusted business provisioning.
- leads: existing lead fields plus business_id and revision. Keep the current contact fields on leads; a standalone customer directory is deferred.
- estimates: existing estimate header fields plus business_id and revision. Enforce one estimate per lead as in the current demo.
- estimate_items: id, business_id, estimate_id, position, description, quantity, unit_price_cents.
Business-scoped composite foreign keys must reject a lead/estimate/item relationship spanning businesses, even when its UUID exists.
Retain USD integer cents, positive whole quantities up to 100,000, nonnegative unit prices up to 100,000,000 cents, at least one valid estimate item, and the current length limits from src/domain/types.ts. Preserve item order.
New/Quoted rows have no closed_at. Moving to Won/Lost records the transition time. Editing a terminal lead's estimate does not reopen the lead or change its closure time.

## Ownership and database access
Enable row-level security on every exposed table. Both grants and policies must match the intended operation.
A verified owner may read/write only their own business records. Anonymous visitors cannot read or mutate production business data.
Never authorize from user-editable auth metadata, client-selected business IDs alone, or UI visibility.
Clients cannot add memberships, reassign business ownership, move records across businesses, or change server-owned timestamps/revisions.
Business creation and owner membership creation are atomic and idempotent: retrying onboarding returns the existing business rather than creating duplicates or partial membership state.
Use narrowly scoped database operations for provisioning. Any privileged function must derive the actor from the verified authenticated session, accept no arbitrary owner/user assignment, have a fixed safe search path, and expose only the required execute permissions. No admin key is available to browser code.

## Repository and write behavior
Replace the production use of load/save-whole-workspace/reset with record-oriented operations. Keep the existing local adapter for the separate fictional demo.
Production operations cover get business, create/update business, list/create/update lead, set lead status, list estimates, and save one estimate with all its items.
Use revision numbers for optimistic concurrency. A stale update returns a conflict and offers reload; it never silently overwrites a newer edit.
Saving an estimate and its items, and changing a New lead to Quoted, must occur in one transaction. A failed save leaves the prior estimate and lead status intact.
Show success only after the server confirms persistence. On failure, keep the editor open, preserve input, and provide retry feedback.
Do not include the demo's reset function in the production repository or show reset-demo controls in authenticated business mode.

## Environment separation
Use separate development and eventual production configuration. Only the Supabase URL and publishable key belong in Vite's public environment variables; these do not replace database policies.
Keep secret/service-role credentials server-side and out of browser bundles and source control.
Commit example environment variable names with empty values only. Keep actual values in ignored local configuration or hosting secret settings.
Do not automatically upload or migrate existing browser demo data into the new database.
Maintain the standalone QuoteFlow repository and its existing MIT license. Public documentation contains architecture and setup steps, not private account identifiers.

## Validation and acceptance
The milestone is complete only when:
- A new verified account can onboard once, log out, log back in, and load the same business.
- Signup, email confirmation, sign-in, password recovery, expired links, and session expiry have working success/error states.
- Two independent businesses cannot read, insert, update, delete, or link each other's data through direct database/API requests.
- A signed-out request is denied production access.
- A forged business ID, owner ID, membership, revision, or server timestamp cannot escalate access or alter another business.
- Concurrent edits produce a visible conflict. A failed multi-item save rolls back all related changes.
- Creating an estimate quotes a New lead; editing Won/Lost estimates preserves closure.
- Business records survive reload and a second authenticated session. They never appear in demo storage or after switching accounts.
- The fictional demo, including confirmed reset, still works independently.
- Keyboard, focus, validation, and responsive checks pass at 375, 768, and 1440 pixels.
- Existing tests pass alongside new authentication, repository, database policy, and browser lifecycle tests.
- Database security advisors have been reviewed and relevant findings addressed before external customer use.

## Deferred work
Quote PDFs and versioned issued documents; quote sending and acceptance; transactional quote email; employee invitations; job tracking; Stripe subscriptions; invoices; Android; public customer-intake endpoint; file uploads and storage policies; migration of real historical data; paid launch and deployment.
These remain subsequent milestones, not incomplete promises of this foundation.

## Implementation sequence after written-spec review
1. Write a concrete implementation plan with repository contracts and test boundaries.
2. Establish the dedicated development environment and schema/policy tests.
3. Implement record-oriented repositories and concurrency handling.
4. Add account flows and business onboarding, then connect protected workspace screens.
5. Verify two-business isolation and full account lifecycle; update GitHub and the separate private Notion plan.
6. Review readiness for the next milestone. Do not deploy or enable payments automatically.

## References
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase email templates and callback configuration: https://supabase.com/docs/guides/auth/auth-email-templates
- Existing local demo specification: 2026-10-14-quoteflow-design.md
