import { Injectable } from '@angular/core';
import { AppData, STORAGE_VERSION, StoredPayload } from '../models/app.models';
import { DisplayCurrency } from '../utils/date-utils';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ImportExportService {
  constructor(private readonly storageService: StorageService) {}

  exportData(data: AppData, displayCurrency: DisplayCurrency): void {
    const payload: StoredPayload = {
      version: STORAGE_VERSION,
      data,
      displayCurrency,
    };

    const content = JSON.stringify(payload, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const fileName = this.exportFileName();
    const objectUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(objectUrl);
  }

  async parseImportFile(
    file: File,
  ): Promise<{ ok: true; payload: StoredPayload } | { ok: false; error: string }> {
    if (!file.name.toLowerCase().endsWith('.json')) {
      return { ok: false, error: 'Please select a JSON file.' };
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (!this.storageService.isStoredPayload(parsed)) {
        return { ok: false, error: 'File structure is invalid. Expected version and data arrays.' };
      }

      if (parsed.version !== STORAGE_VERSION) {
        return {
          ok: false,
          error: `Incompatible backup version ${String(parsed.version)}. Expected version ${STORAGE_VERSION}.`,
        };
      }

      return { ok: true, payload: parsed };
    } catch {
      return { ok: false, error: 'Could not parse JSON. Please verify the file content.' };
    }
  }

  private exportFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `personal-finance-backup-${year}-${month}-${day}.json`;
  }
}
