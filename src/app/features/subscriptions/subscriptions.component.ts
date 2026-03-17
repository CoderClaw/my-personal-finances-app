import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingCycle, Subscription } from '../../core/models/app.models';
import { AppDataService } from '../../core/services/app-data.service';
import {
  formatDateDisplay,
  normalizedMonthlyAmount,
  parseIsoDate,
  toCurrency,
} from '../../core/utils/date-utils';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss',
})
export class SubscriptionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly appData = inject(AppDataService);

  readonly cycles: BillingCycle[] = ['monthly', 'annual'];

  editingId = '';
  deleteCandidateId = '';

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    billingCycle: ['monthly' as BillingCycle, [Validators.required]],
    renewalDate: ['', [Validators.required]],
    active: [true],
    note: [''],
  });

  get subscriptions(): Subscription[] {
    return [...this.appData.snapshot.subscriptions].sort(
      (a, b) => parseIsoDate(a.renewalDate).getTime() - parseIsoDate(b.renewalDate).getTime(),
    );
  }

  get submitLabel(): string {
    return this.editingId ? 'Save Changes' : 'Add Subscription';
  }

  get totalMonthlySubscriptionsCost(): string {
    const sum = this.subscriptions
      .filter((item) => item.active && item.billingCycle === 'monthly')
      .reduce((acc, item) => acc + item.amount, 0);
    return toCurrency(sum);
  }

  get totalAnnualSubscriptionsCost(): string {
    const sum = this.subscriptions
      .filter((item) => item.active && item.billingCycle === 'annual')
      .reduce((acc, item) => acc + item.amount, 0);
    return toCurrency(sum);
  }

  get normalizedMonthlyTotal(): string {
    const sum = this.subscriptions
      .filter((item) => item.active && item.billingCycle === 'monthly')
      .reduce((acc, item) => acc + normalizedMonthlyAmount(item.amount, item.billingCycle), 0);
    return toCurrency(sum);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      title: raw.title.trim(),
      amount: Number(raw.amount),
      billingCycle: raw.billingCycle,
      renewalDate: raw.renewalDate,
      active: Boolean(raw.active),
      note: raw.note.trim() || undefined,
    };

    if (this.editingId) {
      this.appData.updateSubscription(this.editingId, payload);
      this.editingId = '';
    } else {
      this.appData.addSubscription(payload);
    }

    this.form.reset({
      title: '',
      amount: 0,
      billingCycle: 'monthly',
      renewalDate: '',
      active: true,
      note: '',
    });
  }

  edit(item: Subscription): void {
    this.editingId = item.id;
    this.form.reset({
      title: item.title,
      amount: item.amount,
      billingCycle: item.billingCycle,
      renewalDate: item.renewalDate,
      active: item.active,
      note: item.note ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId = '';
    this.form.reset({
      title: '',
      amount: 0,
      billingCycle: 'monthly',
      renewalDate: '',
      active: true,
      note: '',
    });
  }

  toggleActive(idValue: string): void {
    this.appData.toggleSubscriptionActive(idValue);
  }

  askDelete(idValue: string): void {
    this.deleteCandidateId = idValue;
  }

  confirmDelete(): void {
    if (this.deleteCandidateId) {
      this.appData.deleteSubscription(this.deleteCandidateId);
    }
    this.deleteCandidateId = '';
  }

  formatDate(value: string): string {
    return formatDateDisplay(value);
  }

  money(value: number): string {
    return toCurrency(value);
  }

  monthlyEquivalent(item: Subscription): string {
    return toCurrency(normalizedMonthlyAmount(item.amount, item.billingCycle));
  }
}
