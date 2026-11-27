# Implementation Plan: Tailor shop inventory

**Branch**: logical `001-tailor-inventory` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

## Summary

Build a genuine local full-stack inventory application with realistic tailor-shop sample data. Preserve the frontend's established administrative composition and brown/amber identity. The unseen Excel workbook remains an explicit integration gap.

## Technical Context

**User-confirmed stack**: React.js frontend and Node.js/Express backend, confirmed 2026-11-24. Retain the existing TypeScript/Vite implementation and local SQLite database.

**Language/Version**: TypeScript frontend, JavaScript backend; Node 24.13+ (available runtime Node 26).
**Primary Dependencies**: React 19, Vite 7, Express 5, Zod, ExcelJS, Multer, Lucide.
**Storage**: SQLite via node:sqlite, WAL, foreign keys, transactional stock changes; integer thousandths for quantities and integer centavos for money.
**Testing**: Node test runner for isolated API/database integration; Playwright with installed Chrome for browser QA; tsc and production Vite build.
**Target Platform**: localhost Windows desktop, responsive mobile browser.
**Constraints**: no deployment/push; no cloud dependency; synthetic data; original workbook unavailable.
**Scale/Scope**: single tailor shop, six workspace areas, small local dataset.

## Constitution Check

Workbook limitation documented; local-only enforced; transaction invariants tested; roles enforced server-side; requested reference followed. No complexity exception required.

## Project Structure

```text
admin/frontend/src/  React interface, typed API models, styles
admin/frontend/tests/ Browser workflows
admin/backend/src/   Express API, SQLite schema/seed, spreadsheet services
admin/backend/tests/ API integration and database tests
admin/backend/data/  Ignored local SQLite runtime files
docs/                Product context and design system
scripts/dev.mjs      local frontend/backend launcher
others/.specify/     upstream templates/scripts adapted for this layout, and constitution
others/.impeccable/  design metadata and ignored QA captures
specs/001-tailor-inventory/ specification, plan, data model, contracts, tasks
```

## Implementation Decisions

Use same-origin proxied cookies, bounded sessions and local login throttling. Validate every write. Use integer thousandths to avoid floating-point stock drift. Countable units reject fractional values. A protected-focus drawer handles material editing and stock movements. Use responsive tables rather than discarding columns on mobile. Import previews never mutate stock; confirmation validates the complete workbook again inside a transaction.
