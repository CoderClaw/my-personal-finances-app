# AI Quickstart - personal-finances

## Project At A Glance

- Frontend-only Angular 21 app.
- Purpose: personal finance tracking for one user.
- No backend, no auth, no external integrations.
- Persistence: browser localStorage.

## Core Features

- Expenses CRUD with month filtering.
- Monthly payments CRUD with paid-by-month tracking.
- Subscriptions CRUD (monthly + annual, active/inactive).
- Dashboard totals, recent expenses, upcoming warnings.
- Settings for import/export, clear data, display currency.

## Critical Business Rules

- Monthly payments warnings: overdue, today, next 7 days.
- Annual subscriptions are excluded from monthly total cards.
- Annual subscription warnings show up to 30 days in advance.
- Currency is display-only (USD, ARG, EUR), no value conversion.
- Legacy ARS currency values are normalized to ARG.

## Storage + Backup

- localStorage keys:
  - personal-finance-storage
  - personal-finance-display-currency
- Backup JSON contains: version, data, displayCurrency.
- Import validates shape and version, then asks confirmation.

## Key Files

- src/app/core/services/app-data.service.ts
- src/app/core/services/storage.service.ts
- src/app/core/services/import-export.service.ts
- src/app/core/services/currency-settings.service.ts
- src/app/core/utils/date-utils.ts
- src/app/features/settings/settings.component.ts
- src/app/features/dashboard/dashboard.component.html

## Commands

- npm install
- npm run start
- npm run build
- npm run test

## Known Note

- Current test setup may fail in app.spec.ts due to missing router provider (ActivatedRoute).
