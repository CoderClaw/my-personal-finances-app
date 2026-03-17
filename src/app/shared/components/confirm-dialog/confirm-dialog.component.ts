import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="open" (click)="cancel.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="actions">
          <button type="button" class="ghost" (click)="cancel.emit()">Cancel</button>
          <button type="button" class="danger" (click)="confirm.emit()">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(2, 12, 21, 0.42);
        display: grid;
        place-items: center;
        z-index: 20;
        padding: 1rem;
      }

      .dialog {
        background: #fff;
        border-radius: 14px;
        width: min(460px, 100%);
        padding: 1rem;
        box-shadow: 0 12px 35px rgba(11, 24, 36, 0.25);
      }

      h3 {
        margin: 0;
      }

      p {
        color: var(--text-muted);
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
      }

      .ghost,
      .danger {
        border: none;
        border-radius: 10px;
        padding: 0.55rem 0.9rem;
        font-weight: 600;
        cursor: pointer;
      }

      .ghost {
        background: #edf2f6;
        color: #183042;
      }

      .danger {
        background: #b8402f;
        color: #fff;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input() confirmLabel = 'Confirm';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
