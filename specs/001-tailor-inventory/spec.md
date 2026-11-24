# Feature Specification: Tailor shop inventory

**Feature Branch**: `001-tailor-inventory` (logical feature ID; no Git branch or remote created)
**Created**: 2026-11-24
**Status**: Local implementation verified; original workbook mapping pending source file
**Input**: Localhost inventory for a tailor shop, dummy data/accounts, GitHub Spec Kit, and a brown/amber administrative UI using impeccable. No deployment or push.

## User Scenarios & Testing

### User Story 1 — Find materials and stock levels (Priority: P1)
The shop owner signs in and finds fabrics, threads, trims, tools and packaging by name, SKU, category, color or location.
**Independent Test**: Sign in with a seeded account, search a material, filter low stock, open its record.
**Acceptance Scenarios**:
1. Given seeded inventory, when a category or status is selected, then only matching records and the correct filtered count appear.
2. Given meters and pieces, when quantities are displayed, then their units remain visible and fractional meters are preserved.

### User Story 2 — Receive and issue stock (Priority: P1)
Staff receives purchases and issues materials to tailoring jobs with a reference and reason. Admin can reconcile a physical count.
**Independent Test**: Receive 2.5 meters, issue 1.25 meters and verify the remaining balance and both ledger entries.
**Acceptance Scenarios**:
1. Given insufficient stock, when an issue exceeds the balance, then the entire operation fails without an audit row.
2. Given a stale physical count, when reconciliation is submitted, then a conflict requires a refresh.
3. Given a viewer, when any mutation is attempted, then the server rejects it.

### User Story 3 — Maintain materials and suppliers (Priority: P2)
Staff creates or edits a material, sets its reorder threshold, supplier, color and storage location. Admin manages accounts.
**Independent Test**: Create a supplier, link a material, edit its threshold, verify persistence after refresh.

### User Story 4 — Use Excel and reports (Priority: P2)
The owner exports inventory and transaction history, downloads an import template, previews an Excel import, and confirms it atomically.
**Independent Test**: Export a template, populate a valid row, preview and import it, then export the resulting material.
**Acceptance Scenarios**:
1. Given duplicate or invalid rows, when previewed, then row-specific errors prevent confirmation.
2. Given an import, when any row fails at confirmation, then no rows are inserted.
3. Given the original workbook is absent, then the UI explains the template columns are provisional.

### Edge Cases

Empty search, expired session, duplicate SKU/email, zero stock, fractional meters, integral pieces/cones/packs, too many decimals, negative costs, unavailable supplier, oversized or malformed upload, network failure, simultaneous changes, archived supplier/item references, CSV formula-like values on export.

## Requirements

- **FR-001**: Persist users, materials, suppliers, sessions and stock movements in SQLite.
- **FR-002**: Authenticate dummy admin/staff/viewer accounts using hashed passwords and opaque HttpOnly session cookies.
- **FR-003**: Enforce server roles for all writes; admin alone reconciles counts and creates accounts.
- **FR-004**: Receive/issue stock atomically; prevent negative balances and record an immutable movement ledger.
- **FR-005**: Provide a dashboard with actual inventory totals, low-stock list, daily movement chart, and recent activity.
- **FR-006**: Search/filter/sort/paginate inventory, inspect and edit records, and manage suppliers.
- **FR-007**: Export Excel workbooks and preview/confirm a validated template import.
- **FR-008**: Provide a material valuation report and movement ledger with job/purchase reference.
- **FR-009**: Use a responsive brown/amber administrative UI inspired by the supplied reference.
- **FR-010**: Run on localhost only; no deployment, pushes, hosted databases, or external credentials.
- **FR-011**: Track fabric lengths with up to three decimals and countable units with whole numbers.

### Key Entities

User, Session, Supplier, Item, Movement. See data-model.md.

## Success Criteria

Admin/staff/viewer login works; material and supplier edits persist; stock transactions retain accurate fractional balances and audit entries; Excel import/export round trip works; inappropriate writes fail; desktop/mobile workflows remain operable. Exact mapping to the original workbook is explicitly deferred until it is provided.
