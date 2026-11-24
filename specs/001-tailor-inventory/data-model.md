# Data model

- **users**: id, name, unique email, password_hash (scrypt), role (admin/staff/viewer), created_at.
- **sessions**: token_hash (SHA-256), user_id FK, expires_at. Raw token exists only in cookie.
- **suppliers**: id, name, contact, email, phone, address, created_at.
- **items**: id, unique sku, name, category, color, unit, quantity_milli, reorder_milli, cost_cents, location, supplier_id nullable FK, notes, archived, created_at, updated_at.
- **movements**: id, item_id FK, type (opening/receive/issue/adjust), delta_milli, before_milli, after_milli, reference, reason, user_id FK, created_at. Never edited or deleted by API.

API quantities/costs are human-scale decimal numbers; SQLite quantities/money are integers. Items may change units only before any stock or movement exists. Opening balance is a ledger movement, including zero. Reconciliation checks expectedQuantity and stores the signed difference. Referential integrity protects historical records.

Provisional Excel columns: SKU, Name, Category, Color, Unit, Quantity, Reorder level, Unit cost, Location, Supplier, Notes. Original workbook mapping pending file receipt.
