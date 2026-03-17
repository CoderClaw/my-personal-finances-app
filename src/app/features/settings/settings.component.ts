import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AppData, StoredPayload } from '../../core/models/app.models';
import { AppDataService } from '../../core/services/app-data.service';
import { CurrencySettingsService } from '../../core/services/currency-settings.service';
import { ImportExportService } from '../../core/services/import-export.service';
import { DisplayCurrency, parseDisplayCurrency } from '../../core/utils/date-utils';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, ConfirmDialogComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly currencySettings = inject(CurrencySettingsService);

  message = '';
  error = '';
  selectedCurrency: DisplayCurrency = 'USD';

  pendingImport: StoredPayload | null = null;
  askClear = false;

  constructor(
    private readonly appData: AppDataService,
    private readonly importExportService: ImportExportService,
  ) {}

  ngOnInit(): void {
    this.currencySettings.refreshFromStorage();
    this.selectedCurrency = this.currencySettings.currency();
  }

  get currencyOptions(): Array<{ value: DisplayCurrency; label: string }> {
    return this.currencySettings.options;
  }

  onCurrencyChanged(event: Event): void {
    const selected = (event.target as HTMLSelectElement).value as DisplayCurrency;
    this.currencySettings.updateCurrency(selected);
    this.selectedCurrency = selected;
    this.error = '';
    this.message = `Display currency updated to ${selected}.`;
  }

  exportData(): void {
    this.importExportService.exportData(this.appData.snapshot, this.currencySettings.currency());
    this.error = '';
    this.message = 'Backup exported successfully.';
  }

  async onImportFileSelected(event: Event): Promise<void> {
    this.message = '';
    this.error = '';

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const result = await this.importExportService.parseImportFile(file);
    if (!result.ok) {
      this.error = result.error;
      return;
    }

    this.pendingImport = result.payload;
    this.message = 'Backup file validated. Confirm import to overwrite current data.';
    input.value = '';
  }

  confirmImport(): void {
    if (!this.pendingImport) {
      return;
    }

    const nextData: AppData = {
      expenses: [...this.pendingImport.data.expenses],
      monthlyPayments: [...this.pendingImport.data.monthlyPayments],
      subscriptions: [...this.pendingImport.data.subscriptions],
    };

    this.appData.replaceAll(nextData);

    const importedCurrency = parseDisplayCurrency(this.pendingImport.displayCurrency);
    if (importedCurrency) {
      this.currencySettings.updateCurrency(importedCurrency);
      this.selectedCurrency = importedCurrency;
    }

    this.pendingImport = null;
    this.error = '';
    this.message = importedCurrency
      ? 'Backup imported and local data replaced successfully. Display currency restored.'
      : 'Backup imported and local data replaced successfully.';
  }

  cancelImport(): void {
    this.pendingImport = null;
    this.message = 'Import cancelled.';
  }

  confirmClearData(): void {
    this.appData.clearAll();
    this.askClear = false;
    this.error = '';
    this.message = 'All local data cleared.';
  }
}
