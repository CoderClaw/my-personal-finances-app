import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CurrencySettingsService } from './core/services/currency-settings.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly currencySettings = inject(CurrencySettingsService);

  navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/expenses', label: 'Expenses' },
    { path: '/monthly-payments', label: 'Monthly Payments' },
    { path: '/subscriptions', label: 'Subscriptions' },
    { path: '/settings', label: 'Settings' },
  ];

  constructor() {
    this.currencySettings.currency();
  }
}
