import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./features/expenses/expenses.component').then((m) => m.ExpensesComponent),
  },
  {
    path: 'monthly-payments',
    loadComponent: () =>
      import('./features/monthly-payments/monthly-payments.component').then(
        (m) => m.MonthlyPaymentsComponent,
      ),
  },
  {
    path: 'subscriptions',
    loadComponent: () =>
      import('./features/subscriptions/subscriptions.component').then(
        (m) => m.SubscriptionsComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
