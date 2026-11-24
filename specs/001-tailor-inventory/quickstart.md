# Quickstart

Requires Node.js 24.13+. From the repository root in PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:5173. Sign in as admin@threadstock.local / Admin123!.

1. Open Inventory, search Cotton twill, inspect its meter balance and material history.
2. Choose Receive stock, add 2.5 meters with a PO reference and reason.
3. Choose Issue materials, add 1.25 meters with a JOB reference and reason. Confirm the previewed balance.
4. Open Stock movements and find the two new entries.
5. Open Inventory → Import → Download Excel template. Replace its example with a unique SKU, preview the upload and confirm it.
6. Export inventory or the full movement ledger. Open Reports for category valuation.
7. Sign out and use the Viewer demo account. Confirm there are no write actions.

The original Excel workbook is still needed to finalize sheet/column mapping. The provided import template is provisional.

Validation commands and full setup/stack notes are in ../../README.md. No cloud setup, deployment or Git push is involved.
