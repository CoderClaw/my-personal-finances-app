import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AppDataService } from '../../core/services/app-data.service';
import { UpcomingPaymentItem } from '../../core/models/app.models';
import { dueStatusLabel, formatDateDisplay, toCurrency } from '../../core/utils/date-utils';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, StatCardComponent, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  constructor(private readonly appData: AppDataService) {}

  get totalExpenses(): string {
    return toCurrency(this.appData.currentMonthExpensesTotal());
  }

  get paymentTotals(): { scheduled: string; paid: string } {
    const totals = this.appData.currentMonthPaymentsTotal();
    return {
      scheduled: toCurrency(totals.scheduled),
      paid: toCurrency(totals.paid),
    };
  }

  get normalizedSubscriptions(): string {
    return toCurrency(this.appData.normalizedMonthlySubscriptionsTotal());
  }

  get upcomingItems(): UpcomingPaymentItem[] {
    return this.appData.upcomingItems();
  }

  get recentExpenses() {
    return this.appData.recentExpenses(5);
  }

  dueLabel(item: UpcomingPaymentItem): string {
    return dueStatusLabel(item.daysDelta);
  }

  formatDate(dateIso: string): string {
    return formatDateDisplay(dateIso);
  }

  money(value: number): string {
    return toCurrency(value);
  }

  markPaid(item: UpcomingPaymentItem): void {
    this.appData.markUpcomingItemAsPaid(item);
  }
}
