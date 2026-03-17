import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  AppData,
  Expense,
  MonthlyPayment,
  Subscription,
  UpcomingPaymentItem,
} from '../models/app.models';
import {
  dueStatus,
  daysUntil,
  id,
  isInMonth,
  monthKey,
  monthlyPaymentDueDate,
  normalizedMonthlyAmount,
  parseIsoDate,
} from '../utils/date-utils';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AppDataService {
  private readonly storage = inject(StorageService);
  private readonly stateSubject = new BehaviorSubject<AppData>(this.storage.load().data);
  readonly state$ = this.stateSubject.asObservable();

  get snapshot(): AppData {
    return this.stateSubject.getValue();
  }

  private update(mutator: (state: AppData) => AppData): void {
    const next = mutator(this.snapshot);
    this.stateSubject.next(next);
    this.storage.save(next);
  }

  replaceAll(data: AppData): void {
    const safe: AppData = {
      expenses: [...data.expenses],
      monthlyPayments: [...data.monthlyPayments],
      subscriptions: [...data.subscriptions],
    };
    this.stateSubject.next(safe);
    this.storage.save(safe);
  }

  clearAll(): void {
    this.stateSubject.next({ expenses: [], monthlyPayments: [], subscriptions: [] });
    this.storage.clear();
  }

  addExpense(input: Omit<Expense, 'id'>): void {
    this.update((state) => ({ ...state, expenses: [{ ...input, id: id() }, ...state.expenses] }));
  }

  updateExpense(idValue: string, updates: Omit<Expense, 'id'>): void {
    this.update((state) => ({
      ...state,
      expenses: state.expenses.map((item) =>
        item.id === idValue ? { ...updates, id: idValue } : item,
      ),
    }));
  }

  deleteExpense(idValue: string): void {
    this.update((state) => ({
      ...state,
      expenses: state.expenses.filter((item) => item.id !== idValue),
    }));
  }

  addMonthlyPayment(input: Omit<MonthlyPayment, 'id' | 'paidMonths'>): void {
    this.update((state) => ({
      ...state,
      monthlyPayments: [{ ...input, id: id(), paidMonths: [] }, ...state.monthlyPayments],
    }));
  }

  updateMonthlyPayment(idValue: string, updates: Omit<MonthlyPayment, 'id' | 'paidMonths'>): void {
    this.update((state) => ({
      ...state,
      monthlyPayments: state.monthlyPayments.map((item) =>
        item.id === idValue
          ? { ...item, ...updates, id: idValue, paidMonths: [...item.paidMonths] }
          : item,
      ),
    }));
  }

  deleteMonthlyPayment(idValue: string): void {
    this.update((state) => ({
      ...state,
      monthlyPayments: state.monthlyPayments.filter((item) => item.id !== idValue),
    }));
  }

  setMonthlyPaymentPaidForCurrentMonth(idValue: string, paid: boolean): void {
    const key = monthKey(new Date());
    this.update((state) => ({
      ...state,
      monthlyPayments: state.monthlyPayments.map((item) => {
        if (item.id !== idValue) {
          return item;
        }

        const hasKey = item.paidMonths.includes(key);
        if (paid && !hasKey) {
          return { ...item, paidMonths: [...item.paidMonths, key] };
        }
        if (!paid && hasKey) {
          return { ...item, paidMonths: item.paidMonths.filter((value) => value !== key) };
        }
        return item;
      }),
      expenses: this.syncMonthlyPaymentExpense(state, idValue, key, paid),
    }));
  }

  addSubscription(input: Omit<Subscription, 'id'>): void {
    this.update((state) => ({
      ...state,
      subscriptions: [{ ...input, id: id() }, ...state.subscriptions],
    }));
  }

  updateSubscription(idValue: string, updates: Omit<Subscription, 'id'>): void {
    this.update((state) => ({
      ...state,
      subscriptions: state.subscriptions.map((item) =>
        item.id === idValue ? { ...updates, id: idValue } : item,
      ),
    }));
  }

  deleteSubscription(idValue: string): void {
    this.update((state) => ({
      ...state,
      subscriptions: state.subscriptions.filter((item) => item.id !== idValue),
    }));
  }

  toggleSubscriptionActive(idValue: string): void {
    this.update((state) => ({
      ...state,
      subscriptions: state.subscriptions.map((item) =>
        item.id === idValue ? { ...item, active: !item.active } : item,
      ),
    }));
  }

  markUpcomingItemAsPaid(item: UpcomingPaymentItem): void {
    if (item.type === 'monthly-payment') {
      this.setMonthlyPaymentPaidForCurrentMonth(item.id, true);
      return;
    }

    this.update((state) => ({
      ...state,
      subscriptions: state.subscriptions.map((subscription) => {
        if (subscription.id !== item.id) {
          return subscription;
        }

        const nextRenewalDate = this.nextSubscriptionRenewalDate(
          subscription.renewalDate,
          subscription.billingCycle,
        );

        return {
          ...subscription,
          renewalDate: nextRenewalDate,
        };
      }),
      expenses: this.upsertRecurringExpense(
        state.expenses,
        {
          sourceType: 'subscription',
          sourceId: item.id,
          sourcePeriodKey: this.isoDateOnly(item.dueDate),
        },
        {
          title: item.title,
          amount: item.amount,
          category: 'bills',
          date: this.todayIsoDate(),
        },
      ),
    }));
  }

  currentMonthExpensesTotal(now = new Date()): number {
    return this.snapshot.expenses
      .filter((expense) => isInMonth(expense.date, now.getFullYear(), now.getMonth()))
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  currentMonthPaymentsTotal(): { scheduled: number; paid: number } {
    const now = new Date();
    const key = monthKey(now);
    const scheduled = this.snapshot.monthlyPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const paid = this.snapshot.monthlyPayments
      .filter((payment) => payment.paidMonths.includes(key))
      .reduce((sum, payment) => sum + payment.amount, 0);

    return { scheduled, paid };
  }

  normalizedMonthlySubscriptionsTotal(): number {
    return this.snapshot.subscriptions
      .filter((subscription) => subscription.active && subscription.billingCycle === 'monthly')
      .reduce(
        (sum, subscription) =>
          sum + normalizedMonthlyAmount(subscription.amount, subscription.billingCycle),
        0,
      );
  }

  recentExpenses(limit = 5): Expense[] {
    return [...this.snapshot.expenses]
      .sort((a, b) => parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime())
      .slice(0, limit);
  }

  upcomingItems(now = new Date()): UpcomingPaymentItem[] {
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const currentMonthKey = monthKey(now);

    const paymentItems = this.snapshot.monthlyPayments
      .filter((payment) => !payment.paidMonths.includes(currentMonthKey))
      .map((payment) => {
        const dueDate = monthlyPaymentDueDate(year, monthIndex, payment.dueDay);
        const delta = daysUntil(dueDate, now);
        return {
          id: payment.id,
          title: payment.title,
          amount: payment.amount,
          dueDate: dueDate.toISOString(),
          type: 'monthly-payment' as const,
          status: dueStatus(delta),
          daysDelta: delta,
        };
      })
      .filter((item) => item.status !== 'later');

    const subscriptionItems = this.snapshot.subscriptions
      .filter((subscription) => subscription.active)
      .map((subscription) => {
        const renewalDate = parseIsoDate(subscription.renewalDate);
        const delta = daysUntil(renewalDate, now);
        const status = dueStatus(delta);
        const displayStatus =
          subscription.billingCycle === 'annual' && delta > 7 && delta <= 30 ? 'soon' : status;

        return {
          id: subscription.id,
          title: subscription.title,
          amount: subscription.amount,
          dueDate: renewalDate.toISOString(),
          type: 'subscription' as const,
          status: displayStatus,
          daysDelta: delta,
        };
      })
      .filter((item) => item.status !== 'later');

    return [...paymentItems, ...subscriptionItems].sort((a, b) => {
      const aDate = parseIsoDate(a.dueDate).getTime();
      const bDate = parseIsoDate(b.dueDate).getTime();
      return aDate - bDate;
    });
  }

  private nextSubscriptionRenewalDate(
    currentRenewalDate: string,
    billingCycle: 'monthly' | 'annual',
  ): string {
    const current = parseIsoDate(currentRenewalDate);
    const fallback = new Date();
    const baseDate = Number.isNaN(current.getTime()) ? fallback : current;

    const nextDate = new Date(baseDate);
    if (billingCycle === 'annual') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return nextDate.toISOString().slice(0, 10);
  }

  private todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private isoDateOnly(dateValue: string): string {
    const parsed = parseIsoDate(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return this.todayIsoDate();
    }
    return parsed.toISOString().slice(0, 10);
  }

  private syncMonthlyPaymentExpense(
    state: AppData,
    monthlyPaymentId: string,
    periodKey: string,
    paid: boolean,
  ): Expense[] {
    if (!paid) {
      return state.expenses.filter(
        (expense) =>
          !(
            expense.sourceType === 'monthly-payment' &&
            expense.sourceId === monthlyPaymentId &&
            expense.sourcePeriodKey === periodKey
          ),
      );
    }

    const payment = state.monthlyPayments.find((item) => item.id === monthlyPaymentId);
    if (!payment) {
      return state.expenses;
    }

    return this.upsertRecurringExpense(
      state.expenses,
      {
        sourceType: 'monthly-payment',
        sourceId: monthlyPaymentId,
        sourcePeriodKey: periodKey,
      },
      {
        title: payment.title,
        amount: payment.amount,
        category: 'bills',
        date: this.todayIsoDate(),
      },
    );
  }

  private upsertRecurringExpense(
    expenses: Expense[],
    source: {
      sourceType: 'monthly-payment' | 'subscription';
      sourceId: string;
      sourcePeriodKey: string;
    },
    data: Pick<Expense, 'title' | 'amount' | 'category' | 'date'>,
  ): Expense[] {
    const exists = expenses.some(
      (expense) =>
        expense.sourceType === source.sourceType &&
        expense.sourceId === source.sourceId &&
        expense.sourcePeriodKey === source.sourcePeriodKey,
    );

    if (exists) {
      return expenses;
    }

    return [
      {
        id: id(),
        ...data,
        ...source,
      },
      ...expenses,
    ];
  }
}
