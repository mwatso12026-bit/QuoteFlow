# QuoteFlow Implementation Plan

**Goal:** Build the approved responsive lead and estimate demo for small service businesses.
**Architecture:** React feature screens consume a typed asynchronous repository backed by validated versioned browser storage. Pure domain functions own money and pipeline calculations.
**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui.
**Spec:** ../specs/2026-10-14-quoteflow-design.md

## Global constraints
Separate project at the standalone QuoteFlow project folder. QuoteFlow is intended for public GitHub visibility, with explicit publication and deployment approval required. Fictional demo data only. No secrets or customer data in Git. No enabled Supabase integration in this phase.

## Review focus
- Corrupt or unavailable browser storage: explain the condition and preserve the usable session.
- Empty closed pipeline: win rate must be zero, never NaN.
- Invalid money or quantity: block nonfinite, negative, fractional quantities, and excess price precision.
- Repeated request submission: create only one lead while submission is pending.
- Editing a closed lead estimate: preserve Won/Lost and its closed timestamp.

## File responsibilities
- src/app/App.tsx and AppShell.tsx: navigation and responsive shell.
- src/components/ui/: actual shadcn/ui primitives.
- src/features/leads/: list, filters, detail/editor.
- src/features/requests/: validated request form.
- src/features/estimates/: estimate list and builder.
- src/features/overview/: metrics and follow-ups.
- src/domain/types.ts, money.ts, pipeline.ts: contracts and pure logic.
- src/data/repository.ts, localRepository.ts, demoData.ts: persistence boundary and fictional fixtures.
- src/test/: integration setup; tests beside domain/feature modules.
- e2e/quoteflow.spec.ts: complete demo workflow.
- docs/: design, plan, backend roadmap, release checklist.

### Task 1: Reliable demo data and domain
Produces Lead, Estimate, EstimateItem, StoredState types from the spec.
Repository interfaces: load(): Promise<StoredState>; save(state: StoredState): Promise<void>; reset(): Promise<StoredState>.
Pure functions: estimateTotal(items: EstimateItem[]): number; pipelineMetrics(leads: Lead[], estimates: Estimate[], now: Date): {newCount: number; quotedCount: number; wonValueCents: number; winRate: number}.
- [ ] Scaffold Vite React TypeScript in this folder; install Tailwind and shadcn/ui following current official guidance. Add Vitest and testing-library; keep the lockfile.
- [ ] Write failing domain tests: two items (quantity 2, price 1250 cents; quantity 1, price 500 cents) total 3000; zero closed leads gives winRate 0; one Won and one Lost gives 50. Cover calendar-month boundaries.
- [ ] Run npm test -- --run and confirm the new domain tests fail before implementation.
- [ ] Implement contracts, pure functions, fictional leads spanning all statuses, and validated schemaVersion 1 browser storage.
- [ ] Add tests that malformed JSON, wrong schema version, invalid status, and failed storage writes produce recoverable errors without silent overwrite.
- [ ] Run domain/repository tests, typecheck, and commit the verified deliverable locally.

### Task 2: Responsive overview and leads
Consumes repository and pipelineMetrics; produces working Overview and Leads screens.
- [ ] Write interaction tests for search combined with status, create/edit lead, transitions, and no-results state.
- [ ] Run the feature tests and confirm failure before adding the screens.
- [ ] Build shell, shadcn navigation/dialog/form controls, metrics, follow-ups, desktop table, and mobile cards to match the approved concept.
- [ ] Implement status updates with updatedAt and closedAt semantics from the spec. Persist successful changes and expose save failures.
- [ ] Verify metrics reflect transitions and terminal statuses can be changed manually; run tests and commit locally.

### Task 3: Customer request intake
Consumes repository; produces Request form with a New lead on success.
- [ ] Write failing tests for blank name, invalid email, whitespace-only description, valid input, and repeated submission while pending.
- [ ] Run the request tests to confirm failure.
- [ ] Implement labeled fields, validation, pending state, success state, and browser-only demo disclosure. Use fictional example.com addresses.
- [ ] Verify submitted lead is searchable on Leads and remains after reload; run tests and commit locally.

### Task 4: Estimate workflow
Consumes Lead and Estimate; produces estimate list and editor using estimateTotal.
- [ ] Write failing tests for add/remove items, exact 3000-cent sample total, missing description, zero quantity, fractional quantity, negative/nonfinite price, and price precision over two decimals.
- [ ] Test saving a New lead estimate makes it Quoted; editing Won/Lost preserves status and closedAt; re-edit updates the single existing estimate.
- [ ] Run estimate tests to confirm failure.
- [ ] Implement estimate editor, persisted item collection, USD totals, notes, validation, and success/error feedback.
- [ ] Verify list values and dashboard totals derive from saved estimates; run tests and commit locally.

### Task 5: End-to-end verification and release preparation
- [ ] Add a Playwright flow: submit fictional request, filter lead, save estimate, mark Won, reload, verify status and totals.
- [ ] Verify reset requires confirmation and restores the fictional dataset. Test storage errors, keyboard navigation, dialog focus, and empty states.
- [ ] Inspect real browser views at 375, 768, and 1440 pixels; compare to concept and fix overflow or unusable controls.
- [ ] Run npm test -- --run, npm run typecheck, npm run lint, npm run build, and npx playwright test; record actual results in docs/verification.md.
- [ ] Update README with verified setup commands, screenshots, demo limitations, and backend roadmap. Review Git-tracked files for secrets, exports, real customer data, and unrelated project content.
- [ ] Review the release checklist with owner: license, public repository destination, and publication approval. Create/push the public QuoteFlow repository only after approval. Deployment remains a separate approval.
- [ ] Update the separate QuoteFlow Notion page with links and verified completion status.

## Current status
Local demo implemented and verified. See ../verification.md and ../progress.md for actual execution evidence. The original checklist above is retained as the planning record. Public GitHub publication and the MIT license were approved and completed. Deployment remains pending owner approval.
