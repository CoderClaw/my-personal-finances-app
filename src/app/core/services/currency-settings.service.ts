import { Injectable, signal } from '@angular/core';
import { DisplayCurrency, loadDisplayCurrency, setDisplayCurrency } from '../utils/date-utils';

@Injectable({ providedIn: 'root' })
export class CurrencySettingsService {
  readonly options: Array<{ value: DisplayCurrency; label: string }> = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'ARG', label: 'Argentine Peso (ARG)' },
    { value: 'EUR', label: 'Euro (EUR)' },
  ];

  readonly currency = signal<DisplayCurrency>(loadDisplayCurrency());

  constructor() {
    setDisplayCurrency(this.currency());
  }

  refreshFromStorage(): void {
    const current = loadDisplayCurrency();
    this.currency.set(current);
    setDisplayCurrency(current);
  }

  updateCurrency(currency: DisplayCurrency): void {
    this.currency.set(currency);
    setDisplayCurrency(currency);
  }
}
