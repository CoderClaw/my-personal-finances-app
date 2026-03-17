import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <section class="empty-state">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </section>
  `,
  styles: [
    `
      .empty-state {
        background: var(--surface);
        border: 1px dashed var(--border-strong);
        border-radius: 12px;
        text-align: center;
        padding: 1.25rem;
      }

      h3 {
        margin: 0;
        font-size: 1rem;
      }

      p {
        margin: 0.5rem 0 0;
        color: var(--text-muted);
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
}
