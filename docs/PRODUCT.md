# Thread & Stock

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Confirmed by the user on 2026-11-24: React.js frontend and Node.js/Express backend. The existing implementation uses React with TypeScript and Vite. SQLite through Node's built-in SQLite driver keeps this localhost version independent of cloud services. Node 24.13+ required. PostgreSQL is a future option for a multi-site deployment, not a dependency of this build.

## Users

Confirmed: a tailor shop. Assumption: the owner and stockroom staff receive materials, issue them for tailoring jobs, and check remaining quantities. Admin, staff, and viewer are demonstration roles.

## Product Purpose

Turn the shop's Excel inventory into a working local inventory application with dummy records and accounts. The workbook is the intended source of truth for the final fields.

## Operating Context

Confirmed business: tailoring. Inferred starting data: fabrics measured in meters, threads by cone, notions by piece or pack, tools and packaging. Allow fractional quantities for measured materials. Reference numbers can identify a tailoring job or purchase.

## Capabilities and Constraints

Run the application on localhost; do not deploy the website. The user authorized publishing the source to a public GitHub repository on 2026-11-25, superseding the earlier no-push constraint. Exclude local databases, credentials, dependencies, downloaded references, and temporary artifacts from Git. Follow GitHub Spec Kit. Persist real changes in a local database. Use clearly labeled synthetic data. The Excel file was mentioned but has not been provided or found in the workspace; exact sheet/column mapping remains open. Provide a documented import template and preview in the interim. Do not claim the provisional fields reproduce the unseen workbook.

## Brand Commitments

Preserve the established administrative shell, brown and amber palette, warm light canvas, and compact tabular workflow. Continue using the impeccable quality floor. Thread & Stock is a provisional demo name, not a claimed business identity.

## Evidence on Hand

GitHub Spec Kit source under .references/spec-kit. No original inventory workbook, logo, or real shop data received.

## Product Principles

- Quantities must remain accurate, with a transaction history for every stock change.
- Show units everywhere a quantity is actionable.
- Keep local setup simple and all demonstration data separate from real business claims.
- Let the supplied workbook determine the final data structure once available.
