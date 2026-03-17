# AI Project Context - personal-finances

## 1) Fast Summary

This is a frontend-only Angular 21 personal finance app.

Core capabilities:

- Track expenses
- Track recurring monthly payments
- Track subscriptions (monthly and annual)
- Show upcoming payment warnings
- Persist state in browser localStorage
- Export and import backup JSON
- Manage display currency preference (USD, ARG, EUR)

Project style:

- Standalone Angular components
- Lazy feature routes
- Simple, practical UX
- No backend, no auth, no bank integrations

## 2) Current Business Rules (source of truth)

- Monthly payments:
  - Repeat every month
  - Paid status tracked per month using YYYY-MM keys
  - Upcoming warnings include overdue, today, and next 7 days

- Subscriptions:
  - Billing cycle: monthly or annual
  - Only active subscriptions are considered for reminders/totals
  - Annual subscriptions are EXCLUDED from monthly subscription total cards
  - Annual subscriptions appear in upcoming warnings up to 30 days in advance

- Currency:
  - Display-only preference, no numeric conversion of stored amounts
  - Valid values: USD, ARG, EUR
  - Legacy ARS is normalized to ARG
  - Preference is persisted and restored

## 3) Storage and Backup

Local storage keys:

- personal-finance-storage
- personal-finance-display-currency

Main app payload (personal-finance-storage):

- version
- data.expenses[]
- data.monthlyPayments[]
- data.subscriptions[]

Backup export file includes:

- version
- data
- displayCurrency

Import behavior:

- Validate JSON shape and version
- Require user confirmation before overwrite
- Replace app data
- Restore displayCurrency when present and valid

## 4) Architecture Map

Top-level app areas:

- src/app/core
  - models: app.models.ts
  - services: app-data.service.ts, storage.service.ts, import-export.service.ts, currency-settings.service.ts
  - utils: date-utils.ts

- src/app/features
  - dashboard
  - expenses
  - monthly-payments
  - subscriptions
  - settings

- src/app/shared/components
  - confirm-dialog
  - empty-state
  - page-header
  - stat-card

Routing:

- Lazy load each feature from app.routes.ts

## 5) Key Data Shapes

Expense:

- id, title, amount, date, category, note?

MonthlyPayment:

- id, title, amount, dueDay, paidMonths[], note?

Subscription:

- id, title, amount, billingCycle, renewalDate, active, note?

StoredPayload:

- version
- data
- displayCurrency? (USD | ARG | EUR)

## 6) Developer Commands

- npm install
- npm run start
- npm run build
- npm run test

## 7) Known Notes

- Test command runs in watch mode (ng test / vitest-based setup).
- There has been an existing test failure in app.spec.ts related to router provider setup (ActivatedRoute) in this workspace.

## 8) Initial Prompt (verbatim)

Build a complete frontend-only personal finance web app using Vite + Angular.

Project goal:
Create a simple personal-use money management app focused on:

- expenses
- monthly payments
- subscriptions
- upcoming payment reminders

Important constraints:

- frontend only
- use Angular with Vite
- no backend
- no database
- persist all app data in browser localStorage
- support exporting all saved data to a JSON file
- support importing/restoring app data from such JSON file
- keep the app simple, clean, and practical for one user only
- do not add authentication
- do not add bank integrations
- do not add multi-user features
- do not add advanced analytics beyond what is explicitly requested

Main pages required:

1. Dashboard
2. Expenses
3. Monthly Payments
4. Subscriptions
5. Import / Export Settings

App requirements

1. General UX

- The UI should be modern, clean, responsive, and easy to use.
- Use a minimal personal dashboard style.
- Prioritize clarity and fast data entry.
- Use Angular standalone components if possible.
- Organize the code cleanly with reusable components and services.
- Use TypeScript strict mode.
- Use reactive patterns where appropriate.
- Make the layout work well on desktop and mobile.
- Include simple empty states when there is no data.
- Include basic form validation and friendly error messages.

2. Data persistence
   All application data must be stored in localStorage.

Implement a storage service that:

- loads initial app state from localStorage
- writes changes back to localStorage
- safely handles missing or corrupted data
- uses a versioned storage format, for example:
  {
  "version": 1,
  "data": { ... }
  }

If localStorage contains invalid data:

- fail gracefully
- reset to safe defaults
- avoid crashing the app

3. Import / Export
   Implement complete export/import of all saved data.

Export requirements:

- export the full app data as a JSON file
- include version metadata
- file name example:
  personal-finance-backup-YYYY-MM-DD.json

Import requirements:

- allow selecting a JSON file
- validate the file structure before importing
- if valid, replace current localStorage data with imported data
- show a confirmation step before overwriting existing data
- show user-friendly errors if the JSON is invalid or incompatible

4. Required features by page

A. Dashboard page
The dashboard should display:

- total expenses for the current month
- total monthly payments for the current month
- total subscription cost normalized to monthly view
- upcoming payments warning card
- recent expenses list

More detail:

- "total subscription cost normalized to monthly view" means:
  - monthly subscriptions count as their monthly amount
  - annual subscriptions should be converted to monthly equivalent as annualAmount / 12
- "upcoming payments warning card" should prominently show payments due soon
- the warning card should include:
  - payment/subscription name
  - amount
  - due date
  - type: monthly payment or subscription
  - status like "due in 3 days"
- define upcoming as due within the next 7 days
- overdue items should also appear clearly highlighted

Recent expenses:

- show the most recent 5 expenses
- include title, category, amount, and date

B. Expenses page
Implement expense tracking with:

- list of expenses
- add expense form
- edit expense
- delete expense
- filter by month

Fields for an expense:

- id
- title
- amount
- date
- category
- note (optional)

Suggested categories:

- food
- transport
- rent
- bills
- shopping
- entertainment
- health
- other

Expense UX requirements:

- list should be sortable by date descending by default
- show empty state when no expenses exist
- confirm before delete
- month filter should allow browsing previous months

C. Monthly Payments page
Implement recurring monthly bills tracking.

Fields:

- id
- title
- amount
- dueDay (1-31)
- paidMonths (array or structure that tracks whether a payment was paid for a given month/year)
- note (optional)

Features:

- list all monthly payments
- add monthly payment
- edit monthly payment
- delete monthly payment
- mark as paid for the current month
- unmark as paid for the current month
- show due date for current month
- show status for current month:
  - paid
  - unpaid
  - overdue

Behavior:

- monthly payments repeat every month automatically
- payment status should be tracked per month, not globally
- due dates should be calculated from dueDay and current month/year
- if due date has passed and not paid, mark as overdue

D. Subscriptions page
This page is especially important.

Implement a dedicated subscriptions page with full CRUD.

Fields for a subscription:

- id
- title
- amount
- billingCycle: monthly or annual
- renewalDate
- active (boolean)
- note (optional)

Required behavior:

- show all subscriptions in a list or cards
- add subscription
- edit subscription
- delete subscription
- mark subscription as active/inactive
- show next renewal date
- support both monthly and annual subscriptions
- clearly display whether each subscription is monthly or annual
- for annual subscriptions, show:
  - annual amount
  - monthly equivalent amount
- show totals:
  - total monthly subscriptions cost
  - total annual subscriptions cost
  - normalized monthly total across all subscriptions

Normalized monthly total rule:

- monthly subscription contributes full amount
- annual subscription contributes amount / 12

Renewal / reminder behavior:

- subscriptions with renewal dates within the next 7 days must appear in the dashboard upcoming payments warning card
- overdue renewals or due-today renewals should also appear highlighted appropriately
- inactive subscriptions should not appear in upcoming reminders

E. Import / Export Settings page
Create a page for:

- exporting all data to JSON
- importing data from JSON
- clearing all local data with confirmation

Include:

- clear warning before destructive actions
- confirmation UI for importing and clearing
- success/error messages

5. Data model
   Define clear TypeScript interfaces for all entities and app state.

Suggested interfaces:

Expense:

- id: string
- title: string
- amount: number
- date: string
- category: string
- note?: string

MonthlyPayment:

- id: string
- title: string
- amount: number
- dueDay: number
- paidMonths: string[]
- note?: string

Subscription:

- id: string
- title: string
- amount: number
- billingCycle: 'monthly' | 'annual'
- renewalDate: string
- active: boolean
- note?: string

AppData:

- expenses: Expense[]
- monthlyPayments: MonthlyPayment[]
- subscriptions: Subscription[]

Stored payload:

- version: number
- data: AppData

For paidMonths:

- use a simple key format like "2026-03"
- when a monthly payment is marked paid for a month, store that month key in paidMonths

6. Business logic details

Current month totals:

- expenses total:
  sum all expenses whose date is in current month
- monthly payments total:
  sum all monthly payments for current month
  optionally show separate values for total scheduled and total paid
- subscriptions normalized monthly total:
  monthly amount for monthly subscriptions
  annual amount / 12 for annual subscriptions
  only include active subscriptions

Upcoming payments warning card logic:

- include monthly payments due within next 7 days and not marked as paid for current month
- include overdue unpaid monthly payments
- include active subscriptions with renewalDate within next 7 days
- include active subscriptions whose renewalDate is today or overdue if that concept applies in your implementation
- sort by nearest due date ascending
- visually distinguish:
  - overdue
  - due today
  - due soon

Date handling:

- use native JS Date APIs unless a small utility library is truly necessary
- keep logic simple and reliable
- be careful with local timezone behavior
- use consistent formatting for display

7. UI structure
   Suggested layout:

- top header with app title
- sidebar or top navigation with links:
  - Dashboard
  - Expenses
  - Monthly Payments
  - Subscriptions
  - Settings
- main content area

Suggested reusable components:

- page header
- stat card
- warning/reminder card
- empty state
- confirm dialog
- JSON import form
- data table or list component
- shared form field components if useful

8. Forms and validation
   All create/edit forms should have validation.

Examples:

- title required
- amount required and must be > 0
- date required
- dueDay must be between 1 and 31
- billingCycle must be monthly or annual
- renewalDate required for subscriptions

Validation UX:

- show inline validation messages
- disable submit when invalid
- preserve user input during editing

9. Technical implementation expectations
   Use Angular best practices.
   Please implement:

- standalone components
- Angular routing
- services for state/storage/business logic
- strongly typed models
- small utility helpers for date calculations
- maintainable file structure

Recommended structure:

- src/app/core
- src/app/shared
- src/app/features/dashboard
- src/app/features/expenses
- src/app/features/monthly-payments
- src/app/features/subscriptions
- src/app/features/settings

Possible services:

- storage.service.ts
- app-data.service.ts
- expense.service.ts
- monthly-payment.service.ts
- subscription.service.ts
- import-export.service.ts
- date-utils.service.ts or utility module

10. Styling

- Use simple CSS, SCSS, or Angular-supported styling
- keep styling clean and modern
- use subtle colors
- highlight warnings clearly
- make cards and forms visually organized
- ensure responsive design

11. Seed data
    Optionally include a small development seed dataset if localStorage is empty, but structure it so it is easy to remove.
    If seed data is added, make it obvious and minimal.

12. Deliverables
    Generate the full app code, including:

- project structure
- all Angular components
- routing
- models/interfaces
- services
- localStorage persistence
- import/export functionality
- styling
- utility functions
- form validation
- sample data if included

Also provide:

- clear setup instructions
- commands to install dependencies and run the app
- explanation of how localStorage schema works
- explanation of import/export format

13. Acceptance criteria
    The app is complete when:

- it runs locally with Vite + Angular
- I can add/edit/delete expenses
- I can add/edit/delete monthly payments
- I can mark monthly payments paid for the current month
- I can add/edit/delete subscriptions
- subscriptions support monthly and annual billing
- annual subscriptions show a monthly equivalent
- dashboard shows current month totals
- dashboard includes a warning card for upcoming payments
- warning card includes upcoming monthly payments and subscription renewals
- all data persists in localStorage after refresh
- I can export all data to a JSON file
- I can import the JSON file and restore the app state
- I can clear all data from the settings page
- the UI is responsive and usable

14. Important notes

- Keep the app intentionally simple because it is for personal use
- Do not overengineer
- Do not add features outside this specification unless they are necessary to make the app work well
- Focus on maintainability, clarity, and practical usefulness
- The subscriptions page is a high-priority part of the app
- The upcoming payments warning card is also a high-priority feature
- Make sure annual subscription handling is correct and visible in the UI

Please generate the implementation in a clean, production-like structure and include the full code.
