# Verification — local tailor shop inventory

Date: 2026-11-24. Scope: provisional local application; original workbook mapping remains pending receipt of the source file.

## Folder reorganization — 2026-11-25

The application now uses `admin/frontend` and `admin/backend` npm workspaces, following the reference repository's web application layout. Product and design documents are in `docs/`. Root development, build, start, type-check and test commands delegate to the appropriate workspace.

- Moved all three existing SQLite files to `admin/backend/data/` and verified matching SHA256 hashes immediately after the move.
- `npm.cmd install --offline --ignore-scripts --no-audit --no-fund`: passed; created the two workspace links and updated the shared lockfile without changing dependency versions.
- `npm.cmd run check`, `npm.cmd run build`, and `npm.cmd test`: passed; all 10 API/database integration tests passed.
- `npm.cmd run test:ui`: passed all existing desktop and mobile workflows, including workbook downloads from the relocated test directory.
- Isolated smoke checks passed for the root development launcher, both local servers, the frontend `/api` proxy, and production pages/assets served with an unrelated working directory.
- The relocated SQLite files, production build, and browser downloads remain ignored by Git.

## Automated checks

- `npm.cmd run check`: passed TypeScript validation.
- `npm.cmd run build`: passed Vite production build.
- `npm.cmd test`: 10 integration tests passed. Covers session authentication/revocation, password/token non-disclosure, roles/origins, fractional precision, overdraft rollback, whole-number units, ledger-only balance changes, stale counts, simultaneous issues, unique keys, supplier links, account creation, XLSX preview/confirm/export, invalid-workbook rollback, and SQLite restart persistence.
- `npm.cmd run test:ui`: passed installed-Chrome workflows at desktop 1440×1000 and mobile 390×844. Covers all six routes, no page-level overflow, search/empty state, category/status filters, sorting/pagination, material creation/editing, live decimal issue preview and save, supplier and account creation, template download/upload/preview/confirm/export, mobile menu, Escape dismissal, viewer write-control restrictions, and no browser JavaScript errors.
- Official Spec Kit PowerShell prerequisite helper: passed with `.specify/feature.json` pointing to this feature; specification, plan, tasks, research, data model, contracts and quickstart found.

Tests use isolated databases. Browser tests never open the user's local database. The live development app was separately checked: frontend http://localhost:5173 returned HTTP 200 and backend /api/health returned local SQLite health.

## Design review

The impeccable detector ran once across all five UI source targets. It reported one advisory: Geist is an overused font. The face was retained as the established administrative typeface; the independent reviewer accepted that choice at the actual Operate scope.

The independent initial review examined 17 valid desktop/mobile and interaction captures. A single correction batch fixed narrow-chart date collisions, moved the login demo disclosure to the account/status area, raised three small-text contrast pairs, and repaired design provenance. The reviewer scored all four fixes resolved, disposition `ship` for the four scored fixes. Corrected contrast pairs measured 5.28:1, 5.27:1 and 5.67:1. The final verdict does not claim an exhaustive security or accessibility audit.

QA captures and reports are ignored under `.impeccable/review/`. There are no shipping raster assets; icons and the spool mark are crisp SVG geometry, and typography is self-hosted.

## Requirements trace

| Requirement | Implementation / evidence |
| --- | --- |
| FR-001 local persistence | admin/backend/src/db.js schema and persistence test |
| FR-002 session authentication | admin/backend/src/app.js, salted scrypt hashes, auth tests |
| FR-003 server roles | API guards, role tests, viewer browser flow |
| FR-004 transaction integrity | integer thousandths, SQLite transactions, concurrency/rollback/count tests |
| FR-005 dashboard | admin/frontend/src/pages.tsx, actual database-derived balances/activity |
| FR-006 inventory and supplier workflows | rendered browser CRUD/search/filter/sort/pagination checks |
| FR-007 Excel | admin/backend/src/spreadsheets.js, preview/confirm/export round trips |
| FR-008 reports and references | category valuation and immutable movement ledger, XLSX exports |
| FR-009 requested UI | pinned reference, responsive captures, independent finish review |
| FR-010 localhost only | loopback listeners, no hosted services/registration/deploy/push |
| FR-011 units and precision | meter decimals, integral countable units, validation tests |

## Remaining source-dependent work

Receive and inspect the original Excel workbook, document every sheet/column/formula, and adapt the schema/import mapping and workflow to that evidence. Existing columns and dummy tailor-shop records are intentionally provisional. No claim of exact source-workbook fidelity is made.
