import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="stat-card">
      <p class="label">{{ label }}</p>
      <h3>{{ value }}</h3>
      <p class="hint" *ngIf="hint">{{ hint }}</p>
    </article>
  `,
  styles: [
    `
      .stat-card {
        background: var(--surface);
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        padding: 1rem;
      }

      .label {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      h3 {
        margin: 0.4rem 0;
        font-size: 1.55rem;
      }

      .hint {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = '';
  @Input() hint = '';
}
