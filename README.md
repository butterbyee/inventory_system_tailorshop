# Thread & Stock

A local inventory system for a tailor shop, with fictional materials and accounts. Built with a brown/amber administrative interface and the impeccable design workflow. The application runs on localhost; publishing its source to GitHub does not deploy the website.

## Repository layout

The web application follows the `admin/frontend` and `admin/backend` organization used by [SMaRT-PDM](https://github.com/mcartv/SMaRT-PDM). npm workspaces share one root install and lockfile.

```text
Inventory System/
|-- admin/
|   |-- frontend/
|   |   |-- src/              # React interface and styles
|   |   |-- tests/            # Browser workflows
|   |   |-- index.html        # Web entry point
|   |   |-- vite.config.ts
|   |   |-- tsconfig.json
|   |   |-- package.json
|   |   |-- dist/             # Ignored production build
|   |   `-- test-results/     # Ignored browser downloads
|   `-- backend/
|       |-- src/              # Express API, SQLite and spreadsheets
|       |-- tests/            # API and database integration tests
|       |-- data/             # Ignored local SQLite files
|       `-- package.json
|-- docs/                     # Product context and design system
|-- scripts/                  # Shared development launcher
|-- specs/                    # Feature specifications and contracts
|-- .specify/                 # Spec Kit configuration and templates
|-- .impeccable/              # Design metadata and ignored QA captures
|-- package.json              # Workspace commands
|-- package-lock.json         # Shared dependency lockfile
`-- README.md
```

## Run locally

Install Node.js 24.13 or newer. This project was verified with Node 26.13. In PowerShell:

```powershell
cd 'C:\Projects VS\Inventory System'
npm.cmd install
npm.cmd run dev
```

Open **http://127.0.0.1:5173** (or **http://localhost:5173**). Both frontend and backend bind to loopback; they are not exposed on the local network. `npm.cmd` avoids PowerShell execution-policy restrictions on `npm.ps1`.

The API runs at http://127.0.0.1:3001 and Vite proxies `/api` to it. Stop both with Ctrl+C.

The root commands remain the same. To run either part separately after installing from the root, use two terminals:

```powershell
cd admin/backend
npm.cmd run dev
```

```powershell
cd admin/frontend
npm.cmd run dev
```

To run the compiled site locally on a single port:

```powershell
npm.cmd run build
npm.cmd start
```

Then open **http://127.0.0.1:3001**.

## Dummy accounts

| Access | Email | Password |
| --- | --- | --- |
| Administrator | admin@threadstock.local | Admin123! |
| Staff | staff@threadstock.local | Staff123! |
| Viewer | viewer@threadstock.local | Viewer123! |

The login screen lets you choose a demo account and fills its credentials. All supplier names/contact details and inventory records are fictional. An administrator can add local accounts in Settings & accounts.

## Backend and database

| Layer | Choice | Purpose |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite 7 | Responsive interface and local development |
| Backend | Node.js + Express 5 | Authentication, inventory rules, reports, imports |
| Database | SQLite through `node:sqlite` | Persistent local storage without a database server |
| Spreadsheet handling | ExcelJS | XLSX template, preview, atomic import and export |
| Validation | Zod | Server-side validation of all writes |
| Icons / typography | Lucide / self-hosted Geist | Consistent administrative interface |

SQLite is a good starting point for one shop working on one computer. If you later require multiple branches or many concurrent remote users, PostgreSQL is the recommended migration. No cloud database or paid service is required for this local version.

Data is saved in **`admin/backend/data/inventory.sqlite`**, with related `-wal` and `-shm` files while running. This default path is resolved from the backend source location, so starting from a different directory still uses the same database. The first start seeds 24 material SKUs, 4 suppliers, 120 movement records, and 3 accounts. Subsequent starts preserve edits. Runtime data and `.env` files are ignored by version control. For a backup, stop the app first and copy the `admin/backend/data` directory; do not copy only the database while it is being written.

Quantities are stored as integer thousandths and costs as integer centavos to avoid floating-point balance drift. Fabrics measured in meters accept up to three decimal places. Pieces, cones, spools, packs, rolls and sets use whole numbers. Each material has its own stock unit. To track a roll by length, use `meter` and record its width/roll details in notes.

Stock receipts, issues, opening balances and count reconciliations are recorded atomically in an immutable movement ledger. Issues cannot overdraw stock. Reconciliation requires admin access and detects stale counts. Passwords use salted scrypt hashes. Sessions use opaque, hashed tokens with HttpOnly, SameSite cookies and an 8-hour expiry. This is a local demo with public demo credentials; further production hardening and credential replacement belong to a separate, explicitly authorized deployment task.

## What works

- Dashboard with live material totals, fabric meters, valuation, low-stock list and daily receipt/issue activity.
- Inventory search by SKU/name/color/location/supplier; category/status filters; sorting and pagination.
- Material creation/editing, supplier creation/editing and detailed material history.
- Receive stock, issue materials to a job reference, and reconcile a physical count.
- Stock movement search, movement/date filters and complete Excel ledger download.
- Category valuation reports and filtered inventory workbook exports.
- Excel import template, row-level preview and all-or-nothing import confirmation.
- Admin/staff/viewer permissions enforced on the API, profile updates and admin account creation.
- Responsive navigation, keyboard focus, native dialog focus containment, Escape dismissal, loading/error/empty states and reduced motion.

## Original Excel reference — pending

**The original inventory workbook was not attached or found in the workspace. Its exact sheets, columns, formulas and inventory process have not been mapped yet.** The user confirmed that it should be the source of truth and that the business is a tailor shop. The initial data model is therefore provisional, rather than a claimed reproduction of the unseen workbook.

Until the original is available, use **Inventory → Import → Download Excel template**. The `Inventory` worksheet has these columns in order:

| Column | Format |
| --- | --- |
| SKU | New unique material code; letters, digits, hyphen or underscore |
| Name | Material name |
| Category | Fabrics; Threads; Trims & notions; Tools & equipment; Packaging |
| Color | Color or variant, optional |
| Unit | meter; piece; cone; spool; pack; roll; set |
| Quantity | Non-negative opening balance |
| Reorder level | Non-negative reorder threshold |
| Unit cost | PHP, up to 2 decimal places |
| Location | Shelf/bin/rack, optional |
| Supplier | Existing supplier name, or blank |
| Notes | Width, pack size, handling details, optional |

Replace the example row and retain the headings. Upload `.xlsx` files up to 4 MB / 1,000 rows. Use plain values rather than formulas. Preview does not save. Confirmation validates all rows again and commits them together. Existing or duplicate SKUs are rejected; change existing quantities through stock movements. Create suppliers before referencing them in imports. Inventory exports use the same column layout, but existing SKUs must not be reimported as new stock.

## Spec Kit

Official upstream templates, command definitions and PowerShell helpers are included under `.specify/`, with the upstream MIT license. Source: [github/spec-kit](https://github.com/github/spec-kit), commit `a55782f1f1e7f2469cb204843c05d1a42fa2fae7`.

This environment did not have Python/uv/Specify CLI, so integration uses the official source templates/scripts directly, with project-specific constitution, specification, plan, tasks, data model, API contract and convergence record. It does not claim that `specify init` was run.

- Constitution: `.specify/memory/constitution.md`
- Feature artifacts: `specs/001-tailor-inventory/`
- Product context: [`docs/PRODUCT.md`](docs/PRODUCT.md)
- Built design system: [`docs/DESIGN.md`](docs/DESIGN.md) and `.impeccable/design.json`

The application source is self-contained. GitHub Spec Kit development references stay ignored under `.references/`.

## Verification

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run test:ui
```

API tests use isolated databases, including temporary SQLite persistence checks. Browser tests use an in-memory database and installed Chrome; they do not touch the user's inventory. `CHROME_PATH` can override the browser executable for another machine. Build before browser tests because they verify the compiled app. Screenshots and browser reports are under `.impeccable/review/`; downloaded workbooks are under `admin/frontend/test-results/`. Both are ignored.
