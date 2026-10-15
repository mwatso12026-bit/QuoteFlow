# QuoteFlow

A responsive lead and estimate dashboard for small service businesses, built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

**Status:** working local demo. Public source: https://github.com/mwatso12026-bit/QuoteFlow. Not deployed.

![QuoteFlow dashboard](docs/screenshots/dashboard-1440.png)

## Try it locally

Use Node.js 24 and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:5178. No account, backend, environment file, or API key is required. Use fictional information: this demo stores records only in this browser.

## What works

- Dashboard metrics derived from the lead pipeline.
- Customer request intake with validation and success feedback.
- Search, status filters, lead creation, and detail editing.
- New, Quoted, Won, and Lost transitions.
- Estimate creation and editing with multiple line items and exact totals.
- Browser persistence, recoverable storage errors, and confirmed demo reset.
- Responsive layouts and keyboard-accessible dialogs and mobile navigation.

Each lead has one editable estimate. Prices are USD, quantities are whole numbers, and totals exclude tax. Saving an estimate quotes a New lead; editing an estimate preserves Won and Lost statuses.

## Verify

```sh
pnpm test --run
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

Browser tests use installed Microsoft Edge by default. On another machine, install Playwright Chromium with `pnpm exec playwright install chromium` and use `PLAYWRIGHT_CHANNEL=chromium` when running the browser tests. See [verification](docs/verification.md) for the checked behavior and environment.

## Architecture

`src/features/` owns the overview, leads, requests, and estimates. Pure calculations and validation live in `src/domain/`. Screens use a typed repository boundary in `src/data/`; the first adapter stores schema-validated data under `quoteflow:workspace:v1`.

The [backend roadmap](docs/backend-roadmap.md) covers future Supabase authentication, PostgreSQL, tenant isolation, and intake protection. Authentication and a live database are not implemented. No request or estimate is emailed, and the form is a local demo rather than a shared public intake endpoint.

## Project documentation

- [Design specification](docs/specs/2026-10-14-quoteflow-design.md)
- [Implementation plan](docs/plans/2026-10-14-quoteflow-implementation.md)
- [Verification](docs/verification.md)
- [Release checklist](docs/release-checklist.md)
- [Project links and separate Notion plan](docs/project-links.md)
- [Approved design concept](docs/design/quoteflow-dashboard-concept.png)

## Privacy and publication

Commit fictional examples only. Environment files, customer exports, local storage data, dependencies, and generated builds are excluded from Git. ProgramPulse is a separate private project and is not a dependency of QuoteFlow.

Public GitHub publication was approved by the owner. Deployment requires separate approval. QuoteFlow is licensed under the [MIT License](LICENSE). Third-party components retain their own licenses.
