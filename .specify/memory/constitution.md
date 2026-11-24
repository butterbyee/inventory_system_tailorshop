# Thread & Stock Constitution

## Core Principles

### I. Workbook fidelity
The user's workbook defines final terminology and columns. Until received, document all schema assumptions and label sample data. Never claim unseen workbook fidelity.

### II. Stock integrity
All quantity changes are database transactions with before/after quantities, acting user, reason, time, and reference. Stock cannot become negative. Fabrics support three decimal places; countable units are integral.

### III. Local ownership
Bind servers to loopback. Store SQLite and sessions locally, exclude runtime data from version control. Do not deploy or push without a later explicit instruction.

### IV. Usable administrative interface
Preserve the established brown/amber administrative design and impeccable quality floor. Support keyboard use, mobile navigation, validation, errors, loading and empty states.

### V. Verifiable behavior
Verify authentication, role enforcement, stock invariants, persistence, and spreadsheet round trips through integration tests. Render and exercise desktop and mobile flows before completion.

## Development Workflow

Use the official Spec Kit templates and scripts vendored from github/spec-kit. Maintain specs/001-tailor-inventory/spec.md, plan.md, tasks.md, data-model.md and contracts/api.md. Record incomplete workbook mapping honestly.

## Governance

This constitution governs the local implementation. Product corrections from the user take precedence. Amend documents when scope changes.

**Version**: 1.0.0 | **Ratified**: 2026-11-24 | **Last Amended**: 2026-11-24
