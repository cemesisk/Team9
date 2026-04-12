import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TourLog } from '../../models/tour-log.model';

@Component({
  selector: 'app-tour-log-card',
  standalone: true,
  imports: [],
  template: `
    <li class="log-item">
      <div class="log-header">
        <h4>Log {{ log.id }}</h4>
        <div class="log-actions">
          <button
            type="button"
            class="edit-button small-button"
            (click)="editRequested.emit(log)"
            [disabled]="isBusy"
          >
            Edit
          </button>
          <button
            type="button"
            class="delete-button small-button"
            (click)="requestDelete()"
            [disabled]="isBusy"
          >
            Delete
          </button>
        </div>
      </div>

      <p><strong>Date:</strong> {{ log.dateTime }}</p>
      <p><strong>Comment:</strong> {{ log.comment }}</p>
      <p><strong>Difficulty:</strong> {{ log.difficulty }}</p>
      <p><strong>Distance:</strong> {{ log.totalDistance }} km</p>
      <p><strong>Time:</strong> {{ log.totalTime }} min</p>
      <p><strong>Rating:</strong> {{ log.rating }}/5</p>
    </li>
  `,
  styles: [`
    .log-item {
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0.75rem;
      margin-top: 0.75rem;
    }

    .log-item p {
      margin: 0.4rem 0;
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .log-actions {
      display: flex;
      gap: 0.5rem;
    }

    .log-header h4 {
      margin: 0;
    }

    .small-button {
      padding: 0.45rem 0.75rem;
      font-size: 0.9rem;
      border: none;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      font-weight: bold;
    }

    .edit-button {
      background-color: #175cd3;
    }

    .delete-button {
      background-color: #b42318;
    }

    .small-button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .small-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 900px) {
      .log-header {
        flex-direction: column;
        align-items: stretch;
      }

      .log-actions {
        flex-direction: column;
      }
    }
  `]
})
export class TourLogCardComponent {
  @Input({ required: true }) log!: TourLog;
  @Input() isBusy = false;
  @Output() editRequested = new EventEmitter<TourLog>();
  @Output() deleteRequested = new EventEmitter<number>();

  requestDelete(): void {
    if (this.log.id === undefined) {
      return;
    }

    this.deleteRequested.emit(this.log.id);
  }
}
