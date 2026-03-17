import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../../core/models/app.models';
import { AppDataService } from '../../core/services/app-data.service';
import { formatDateDisplay, monthKey, parseIsoDate, toCurrency } from '../../core/utils/date-utils';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly appData = inject(AppDataService);

  readonly categories = EXPENSE_CATEGORIES;
  readonly currentMonth = monthKey(new Date());

  deleteCandidateId = '';
  editingId = '';

  readonly monthFilter = this.fb.nonNullable.control(this.currentMonth);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: ['', [Validators.required]],
    category: ['other', [Validators.required]],
    note: [''],
  });

  get expenses(): Expense[] {
    const selectedMonth = this.monthFilter.value;
    return [...this.appData.snapshot.expenses]
      .filter((item) =>
        selectedMonth ? monthKey(parseIsoDate(item.date)) === selectedMonth : true,
      )
      .sort((a, b) => parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime());
  }

  get submitLabel(): string {
    return this.editingId ? 'Save Changes' : 'Add Expense';
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
      date: raw.date,
      category: raw.category as ExpenseCategory,
      note: raw.note.trim() || undefined,
    };

    if (this.editingId) {
      this.appData.updateExpense(this.editingId, payload);
      this.editingId = '';
    } else {
      this.appData.addExpense(payload);
    }

    this.form.reset({ title: '', amount: 0, date: '', category: 'other', note: '' });
  }

  edit(item: Expense): void {
    this.editingId = item.id;
    this.form.reset({
      title: item.title,
      amount: item.amount,
      date: item.date,
      category: item.category,
      note: item.note ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId = '';
    this.form.reset({ title: '', amount: 0, date: '', category: 'other', note: '' });
  }

  askDelete(idValue: string): void {
    this.deleteCandidateId = idValue;
  }

  confirmDelete(): void {
    if (this.deleteCandidateId) {
      this.appData.deleteExpense(this.deleteCandidateId);
    }
    this.deleteCandidateId = '';
  }

  money(amount: number): string {
    return toCurrency(amount);
  }

  date(value: string): string {
    return formatDateDisplay(value);
  }
}
