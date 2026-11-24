# API contract

All endpoints start /api. JSON errors return {error}. Authenticated routes require the session cookie. Writes verify local Origin when present.

| Method | Path | Behavior / permission |
| --- | --- | --- |
| POST | /auth/login | email/password, establish session |
| GET | /auth/me | current user or 401 |
| POST | /auth/logout | revoke session |
| GET | /workspace | items, movements, suppliers, public users for authorized roles, current user |
| POST | /items | validated material and opening balance; admin/staff |
| PATCH | /items/:id | metadata only; admin/staff |
| POST | /movements | itemId, type, quantity, expectedQuantity, reference, reason; admin/staff, adjust admin only |
| POST | /suppliers | create validated supplier; admin/staff |
| PATCH | /suppliers/:id | edit supplier; admin/staff |
| POST | /users | create role-scoped account; admin only |
| PATCH | /profile | update own display name |
| GET | /export/inventory | XLSX, q/category/status filters |
| GET | /export/movements | XLSX movement ledger |
| GET | /import/template | XLSX example and instructions |
| POST | /import/preview | multipart file, row-level preview; admin/staff |
| POST | /import/confirm | multipart file, validate again, atomic all-new SKU import; admin/staff |
| GET | /health | local service health |

Validation: quantities 0..1,000,000 with up to three decimals (whole numbers for countable units); unit cost up to 10,000,000 with two decimals; bounded text; unique SKU/email; known categories/units. Imports max 4 MB / 1,000 rows, no duplicate or existing SKUs. Invalid input 400, unauthorized 401, forbidden 403, missing 404, conflict 409, throttling 429.
