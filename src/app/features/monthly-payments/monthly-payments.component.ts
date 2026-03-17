import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MonthlyPayment } from '../../core/models/app.models';
import { AppDataService } from '../../core/services/app-data.service';
import {
  dueStatus,
  formatDateDisplay,
  monthKey,
  monthlyPaymentDueDate,
  toCurrency,
  daysUntil,
} from '../../core/utils/date-utils';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-monthly-payments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './monthly-payments.component.html',
  styleUrl: './monthly-payments.component.scss',
})
export class MonthlyPaymentsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly appData = inject(AppDataService);

  readonly currentMonthKey = monthKey(new Date());

  editingId = '';
  deleteCandidateId = '';

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    dueDay: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    note: [''],
  });

  get payments(): MonthlyPayment[] {
    return [...this.appData.snapshot.monthlyPayments].sort((a, b) => a.dueDay - b.dueDay);
  }

  get submitLabel(): string {
    return this.editingId ? 'Save Changes' : 'Add Monthly Payment';
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
      dueDay: Number(raw.dueDay),
      note: raw.note.trim() || undefined,
    };

    if (this.editingId) {
      this.appData.updateMonthlyPayment(this.editingId, payload);
      this.editingId = '';
    } else {
      this.appData.addMonthlyPayment(payload);
    }

    this.form.reset({ title: '', amount: 0, dueDay: 1, note: '' });
  }

  edit(item: MonthlyPayment): void {
    this.editingId = item.id;
    this.form.reset({
      title: item.title,
      amount: item.amount,
      dueDay: item.dueDay,
      note: item.note ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId = '';
    this.form.reset({ title: '', amount: 0, dueDay: 1, note: '' });
  }

  askDelete(idValue: string): void {
    this.deleteCandidateId = idValue;
  }

  confirmDelete(): void {
    if (this.deleteCandidateId) {
      this.appData.deleteMonthlyPayment(this.deleteCandidateId);
    }
    this.deleteCandidateId = '';
  }

  togglePaid(item: MonthlyPayment): void {
    this.appData.setMonthlyPaymentPaidForCurrentMonth(item.id, !this.isPaidThisMonth(item));
  }

  isPaidThisMonth(item: MonthlyPayment): boolean {
    return item.paidMonths.includes(this.currentMonthKey);
  }

  dueDate(item: MonthlyPayment): string {
    const now = new Date();
    const date = monthlyPaymentDueDate(now.getFullYear(), now.getMonth(), item.dueDay);
    return formatDateDisplay(date.toISOString());
  }

  status(item: MonthlyPayment): 'paid' | 'unpaid' | 'overdue' {
    if (this.isPaidThisMonth(item)) {
      return 'paid';
    }

    const now = new Date();
    const date = monthlyPaymentDueDate(now.getFullYear(), now.getMonth(), item.dueDay);
    return dueStatus(daysUntil(date, now)) === 'overdue' ? 'overdue' : 'unpaid';
  }

  money(amount: number): string {
    return toCurrency(amount);
  }
}
