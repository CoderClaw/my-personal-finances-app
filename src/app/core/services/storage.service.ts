import { Injectable } from '@angular/core';
import {
  AppData,
  EMPTY_APP_DATA,
  STORAGE_KEY,
  STORAGE_VERSION,
  StoredPayload,
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class StorageService {
  load(): StoredPayload {
    const fallback = this.defaultPayload();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return fallback;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!this.isStoredPayload(parsed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
        return fallback;
      }

      if (parsed.version !== STORAGE_VERSION) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
        return fallback;
      }

      return parsed;
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
  }

  save(data: AppData): void {
    const payload: StoredPayload = {
      version: STORAGE_VERSION,
      data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  replacePayload(payload: StoredPayload): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  defaultPayload(): StoredPayload {
    return {
      version: STORAGE_VERSION,
      data: {
        expenses: [...EMPTY_APP_DATA.expenses],
        monthlyPayments: [...EMPTY_APP_DATA.monthlyPayments],
        subscriptions: [...EMPTY_APP_DATA.subscriptions],
      },
    };
  }

  isStoredPayload(value: unknown): value is StoredPayload {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<StoredPayload>;
    const data = candidate.data as Partial<AppData> | undefined;

    return (
      typeof candidate.version === 'number' &&
      !!data &&
      Array.isArray(data.expenses) &&
      Array.isArray(data.monthlyPayments) &&
      Array.isArray(data.subscriptions)
    );
  }
}
