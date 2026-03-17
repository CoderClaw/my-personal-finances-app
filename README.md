# Personal Finance App

Single-user personal finance tracker built with Angular standalone components.

## Scope

- Frontend only
- No backend, no external database, no authentication
- Data is persisted in browser localStorage

## Stack

- Angular 21
- Angular standalone components + lazy feature routes
- Angular application builder (`@angular/build:application`) with Vite-based dev/build pipeline

## What It Does

### Dashboard

- Current month expenses total
- Current month monthly-payments scheduled and paid totals
- Active monthly subscriptions total (annual subscriptions excluded)
- Upcoming payment warnings:
  - Monthly payments: overdue, due today, or due within 7 days
  - Annual subscriptions: overdue, due today, or due within 30 days
- Recent expenses list

### Expenses

- Add, edit, delete expenses
- Month filter (`YYYY-MM`)
- Date-desc sorting

### Monthly Payments

- Add, edit, delete recurring monthly payments
- Mark/unmark as paid for current month
- Status per item: paid, unpaid, overdue

### Subscriptions

- Add, edit, delete subscriptions
- Monthly and annual billing cycles
- Active/inactive toggle
- Totals shown separately for monthly and annual subscriptions
- Monthly-equivalent display for annual subscriptions

### Settings

- Display currency preference (visual-only): USD, ARG, EUR
- Export full backup JSON
- Import backup JSON with validation + overwrite confirmation
- Clear all local data with confirmation

## Currency Behavior

- Currency preference changes only formatting/display.
- Saved numeric values are not converted.
- Preference is persisted in localStorage.
- Backward compatibility: legacy `ARS` storage value is normalized to `ARG`.

## Scripts

```bash
npm install
npm run start
npm run build
npm run test
```

You can also use `ng serve` for local development.

## LocalStorage Keys

- `personal-finance-storage`
- `personal-finance-display-currency`

## Stored App Payload (`personal-finance-storage`)

```json
{
  "version": 1,
  "data": {
    "expenses": [],
    "monthlyPayments": [],
    "subscriptions": []
  }
}
```

If stored data is missing/corrupted/incompatible, the app falls back to defaults safely.

## Backup JSON Format

Export file name pattern:

- `personal-finance-backup-YYYY-MM-DD.json`

Backup payload includes app data plus currency preference:

```json
{
  "version": 1,
  "data": {
    "expenses": [],
    "monthlyPayments": [],
    "subscriptions": []
  },
  "displayCurrency": "USD"
}
```

`displayCurrency` may be `USD`, `ARG`, or `EUR`.

## Import Flow

1. User selects a `.json` file.
2. App validates payload structure and backup version.
3. User confirms overwrite.
4. App replaces current data with imported data.
5. If `displayCurrency` is present and valid, it is restored too.

Invalid or incompatible files show friendly errors and do not overwrite current data.
