# Research and assumptions

- Spec Kit source: https://github.com/github/spec-kit at a55782f1f1e7f2469cb204843c05d1a42fa2fae7. Official templates/scripts copied into .specify; specification/plan/tasks follow their structures. Python/uv/Specify CLI are not installed, so this uses source-template integration rather than claiming CLI initialization.
- Existing UI: self-contained administrative navigation and compact data views, with primary brown #6f4b33, canvas #f7f5f1, and amber #d9a441. Preserve the current interface and behavior.
- The user confirmed a tailor shop. Materials, units, colors, locations and job references are informed assumptions pending workbook receipt.
- SQLite fits a single local workspace without requiring a database service. PostgreSQL would be the recommended migration for concurrent remote/multi-branch use; no such migration or service is required here.
- ExcelJS supports XLSX read/write. Only our documented template is supported until the original sheets can be mapped; avoid silently guessing arbitrary workbook structures.
