# Tasks: Tailor shop inventory

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/api.md

## Phase 1: Setup

- [x] T001 Inspect references, confirm tailor-shop context, document absent workbook.
- [x] T002 Integrate official Spec Kit templates/scripts, write constitution and feature artifacts.
- [x] T003 Install local React/Express/ExcelJS toolchain and launcher.

## Phase 2: Foundation

- [x] T004 Create SQLite schema, integer quantities/costs, realistic tailor-shop seed and hashed dummy accounts in server/db.js.
- [x] T005 Implement session auth, write-origin checks, role guards, validation and error handling in server/app.js.

## Phase 3: US1 — Inventory

- [x] T006 Build responsive shell/login, dashboard, searchable/filterable/sortable inventory and material details in src/.

## Phase 4: US2 — Stock movement

- [x] T007 Implement atomic receive/issue/reconcile and ledger API in server/app.js.
- [x] T008 Connect movement drawer, references and low-stock actions in src/.

## Phase 5: US3 — Maintenance

- [x] T009 Connect item and supplier forms, admin account creation, profile editing.

## Phase 6: US4 — Excel and reporting

- [x] T010 Implement Excel export, import template, preview and atomic confirmation in server/spreadsheets.js.
- [x] T011 Connect reports, downloads and import review UI.

## Phase 7: Verification

- [x] T012 Test auth/roles, stock invariants, conflicts, persistence and spreadsheet round trips.
- [x] T013 Run type check, production build and desktop/mobile browser workflows.
- [x] T014 Run impeccable detector, independent finish review and design documentation.
- [x] T015 Leave localhost available, document stack/accounts/setup and workbook limitation. No deploy/push.

## Phase 8: Convergence — source-dependent follow-up

- [ ] T016 [Source-dependent] After the user provides the original Excel workbook, map its actual sheets/columns/formulas in data-model.md and contracts/api.md, then adapt server/spreadsheets.js and the material workflow to match. Do not infer the missing workbook's structure. This remains open while the verified provisional localhost demo is available.
