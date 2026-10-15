# QuoteFlow verification

Verified locally on October 14, 2026, using Node.js 24.19.0 and Microsoft Edge through Playwright. App changes remain on `feat/quoteflow-demo`.

## Automated results

- 34 Vitest unit/component tests passed across four files.
- 7 Playwright browser tests passed.
- TypeScript check passed.
- ESLint passed after removing an unused import.
- Vite production build passed. Rollup reports two harmless annotation warnings in the installed Zod package; application output is generated successfully.

Equivalent direct commands used with the bundled runtime:

```sh
node node_modules/vitest/vitest.mjs run
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js .
node node_modules/vite/bin/vite.js build
node node_modules/@playwright/test/cli.js test
```

## Verified behavior

- Submit a fictional request, find its New lead, create a two-line estimate totaling exactly 30 dollars, and observe Quoted status.
- Mark the lead Won, reload, verify the saved status and amount, then edit its estimate without reopening the lead.
- Combine status filtering and search; display useful no-results state.
- Reject invalid request data, malformed prices, zero/fractional quantities, and empty estimates.
- Read/write browser state; report corruption or write failures; retain corrupt saved data without silent replacement.
- Confirm or cancel demo reset.
- Close a lead dialog with Escape and return keyboard focus to its opener.
- On mobile, keep closed navigation out of the accessibility tree, trap focus in the open drawer, and restore focus on Escape.
- At 375, 768, and 1440 pixels, check dashboard, request form, and estimate editor for horizontal page overflow.

Screenshots of the actual dashboard at all three widths are saved in `docs/screenshots/`. Desktop and phone captures were visually inspected; text readability was improved after inspection.

## Review and limits

A separate read-only code review checked storage recovery, money validation, duplicate-submission protection, and terminal-status preservation. Its mobile navigation focus finding was corrected, regression-tested, and confirmed addressed by the reviewer.

This is a browser-only demo with fictional data. Authentication, PostgreSQL, shared intake, email sending, tax, payment collection, and deployment are not implemented. Cross-browser testing beyond Chromium-based Edge and automated contrast auditing have not been performed. The browser test configuration supports `PLAYWRIGHT_CHANNEL=chromium` for machines without Edge.

## Environment notes

The default sandbox could not reach the package registry or consistently run browser networking. Dependency downloads and browser tests ran with approved escalation. The official shadcn CLI failed on a missing transitive dependency, so the official registry component sources were installed manually. Package-store configuration is local to this project; no global settings or ProgramPulse files were changed.
