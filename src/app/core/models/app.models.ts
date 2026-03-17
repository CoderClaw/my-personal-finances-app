export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'rent'
  | 'bills'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'other';

export type BillingCycle = 'monthly' | 'annual';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  note?: string;
  sourceType?: 'monthly-payment' | 'subscription';
  sourceId?: string;
  sourcePeriodKey?: string;
}

export interface MonthlyPayment {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  paidMonths: string[];
  note?: string;
}

export interface Subscription {
  id: string;
  title: string;
  amount: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  active: boolean;
  note?: string;
}

export interface AppData {
  expenses: Expense[];
  monthlyPayments: MonthlyPayment[];
  subscriptions: Subscription[];
}

export interface StoredPayload {
  version: number;
  data: AppData;
  displayCurrency?: 'USD' | 'ARG' | 'EUR';
}

export interface UpcomingPaymentItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  type: 'monthly-payment' | 'subscription';
  status: 'overdue' | 'today' | 'soon' | 'later';
  daysDelta: number;
}

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = 'personal-finance-storage';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'food',
  'transport',
  'rent',
  'bills',
  'shopping',
  'entertainment',
  'health',
  'other',
];

export const EMPTY_APP_DATA: AppData = {
  expenses: [],
  monthlyPayments: [],
  subscriptions: [],
};
