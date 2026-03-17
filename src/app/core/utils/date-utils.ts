import { BillingCycle } from '../models/app.models';

export type DisplayCurrency = 'USD' | 'ARG' | 'EUR';

const DISPLAY_CURRENCY_KEY = 'personal-finance-display-currency';

const DISPLAY_CURRENCY_CONFIG: Record<DisplayCurrency, { locale: string; currency: string }> = {
  USD: { locale: 'en-US', currency: 'USD' },
  ARG: { locale: 'es-AR', currency: 'ARS' },
  EUR: { locale: 'es-ES', currency: 'EUR' },
};

let displayCurrency: DisplayCurrency = 'USD';

function isDisplayCurrency(value: unknown): value is DisplayCurrency {
  return value === 'USD' || value === 'ARG' || value === 'EUR';
}

export function loadDisplayCurrency(): DisplayCurrency {
  try {
    const rawValue = localStorage.getItem(DISPLAY_CURRENCY_KEY);
    const value = parseDisplayCurrency(rawValue);
    if (value) {
      return value;
    }
  } catch {
    // localStorage may be unavailable in restricted contexts.
  }
  return 'USD';
}

export function parseDisplayCurrency(value: unknown): DisplayCurrency | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === 'ARS') {
    // Backward compatibility with older persisted value.
    return 'ARG';
  }

  return isDisplayCurrency(normalized) ? normalized : null;
}

export function setDisplayCurrency(currency: DisplayCurrency): void {
  displayCurrency = currency;
  try {
    localStorage.setItem(DISPLAY_CURRENCY_KEY, currency);
  } catch {
    // Ignore storage failures and keep the in-memory value.
  }
}

export function getDisplayCurrency(): DisplayCurrency {
  return displayCurrency;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseIsoDate(dateValue: string): Date {
  if (!dateValue) {
    return new Date('invalid');
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return new Date('invalid');
  }
  return startOfDay(parsed);
}

export function monthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function isInMonth(dateIso: string, year: number, monthIndex: number): boolean {
  const value = parseIsoDate(dateIso);
  return value.getFullYear() === year && value.getMonth() === monthIndex;
}

export function toCurrency(value: number): string {
  const config = DISPLAY_CURRENCY_CONFIG[displayCurrency];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function clampDueDay(year: number, monthIndex: number, dueDay: number): number {
  const maxDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(dueDay, 1), maxDay);
}

export function monthlyPaymentDueDate(year: number, monthIndex: number, dueDay: number): Date {
  return new Date(year, monthIndex, clampDueDay(year, monthIndex, dueDay));
}

export function daysUntil(targetDate: Date, fromDate = new Date()): number {
  const from = startOfDay(fromDate).getTime();
  const target = startOfDay(targetDate).getTime();
  return Math.round((target - from) / (1000 * 60 * 60 * 24));
}

export function dueStatus(daysDelta: number): 'overdue' | 'today' | 'soon' | 'later' {
  if (daysDelta < 0) {
    return 'overdue';
  }
  if (daysDelta === 0) {
    return 'today';
  }
  if (daysDelta <= 7) {
    return 'soon';
  }
  return 'later';
}

export function dueStatusLabel(daysDelta: number): string {
  if (daysDelta < 0) {
    return `overdue by ${Math.abs(daysDelta)} day${Math.abs(daysDelta) === 1 ? '' : 's'}`;
  }
  if (daysDelta === 0) {
    return 'due today';
  }
  return `due in ${daysDelta} day${daysDelta === 1 ? '' : 's'}`;
}

export function normalizedMonthlyAmount(amount: number, billingCycle: BillingCycle): number {
  return billingCycle === 'annual' ? amount / 12 : amount;
}

export function formatDateDisplay(dateIso: string): string {
  const parsed = parseIsoDate(dateIso);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }
  return parsed.toLocaleDateString();
}

export function id(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
