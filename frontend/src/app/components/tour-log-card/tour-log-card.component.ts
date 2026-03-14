import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TourLog } from '../../models/tour-log.model';

@Component({
  selector: 'app-tour-log-card',
  standalone: true,
  imports: [FormsModule],
  template: `
    <li class="log-item">
      <div class="log-header">
        <h4>Log {{ log.id }}</h4>
        <button
          type="button"
          class="delete-button small-button"
          (click)="deleteRequested.emit(log.id)"
        >
          Delete
        </button>
      </div>

      <p><strong>Date:</strong> {{ log.dateTime }}</p>
      <p><strong>Comment:</strong> {{ log.comment }}</p>
      <p><strong>Difficulty:</strong> {{ log.difficulty }}</p>
      <p><strong>Distance:</strong> {{ log.totalDistance }} km</p>
      <p><strong>Time:</strong> {{ log.totalTime }} min</p>
      <p><strong>Rating:</strong> {{ log.rating }}/5</p>

      <div class="edit-form log-edit-form">
        <h4>Edit Log</h4>

        <label>
          Date
          <input type="datetime-local" [(ngModel)]="log.dateTime" />
        </label>

        <label>
          Comment
          <textarea
            [(ngModel)]="log.comment"
            [class.invalid-input]="isCommentInvalid"
          ></textarea>
          @if (isCommentInvalid) {
            <div class="error-text">Comment must not be empty.</div>
          }
        </label>

        <label>
          Difficulty
          <input
            type="number"
            [(ngModel)]="log.difficulty"
            [class.invalid-input]="isDifficultyInvalid"
          />
          @if (isDifficultyInvalid) {
            <div class="error-text">Difficulty must be 0 or greater.</div>
          }
        </label>

        <label>
          Distance
          <input
            type="number"
            [(ngModel)]="log.totalDistance"
            [class.invalid-input]="isDistanceInvalid"
          />
          @if (isDistanceInvalid) {
            <div class="error-text">Distance must be 0 or greater.</div>
          }
        </label>

        <label>
          Time
          <input
            type="number"
            [(ngModel)]="log.totalTime"
            [class.invalid-input]="isTimeInvalid"
          />
          @if (isTimeInvalid) {
            <div class="error-text">Time must be 0 or greater.</div>
          }
        </label>

        <label>
          Rating
          <input
            type="number"
            [(ngModel)]="log.rating"
            [class.invalid-input]="isRatingInvalid"
          />
          @if (isRatingInvalid) {
            <div class="error-text">Rating must be between 1 and 5.</div>
          }
        </label>

        <button
          type="button"
          class="save-button small-button"
          (click)="saveRequested.emit(log)"
          [disabled]="isFormInvalid"
        >
          Save Changes
        </button>
      </div>
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

    .log-header h4 {
      margin: 0;
    }

    .edit-form {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .edit-form h4 {
      margin-top: 0;
      margin-bottom: 1rem;
    }

    .edit-form label {
      display: block;
      margin-bottom: 1rem;
      font-weight: bold;
    }

    .edit-form input,
    .edit-form textarea {
      width: 100%;
      box-sizing: border-box;
      margin-top: 0.35rem;
      padding: 0.65rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font: inherit;
    }

    .edit-form textarea {
      min-height: 100px;
      resize: vertical;
    }

    .log-edit-form {
      margin-top: 1rem;
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

    .delete-button {
      background-color: #b42318;
    }

    .save-button {
      background-color: #175cd3;
    }

    .small-button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .small-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .invalid-input {
      border: 2px solid #d92d20 !important;
      background-color: #fff5f5;
    }

    .error-text {
      margin-top: 0.35rem;
      color: #d92d20;
      font-size: 0.9rem;
      font-weight: normal;
    }

    @media (max-width: 900px) {
      .log-header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class TourLogCardComponent {
  @Input({ required: true }) log!: TourLog;
  @Output() deleteRequested = new EventEmitter<number>();
  @Output() saveRequested = new EventEmitter<TourLog>();

  get isCommentInvalid(): boolean {
    return this.log.comment.trim().length === 0;
  }

  get isDifficultyInvalid(): boolean {
    return this.log.difficulty < 0;
  }

  get isDistanceInvalid(): boolean {
    return this.log.totalDistance < 0;
  }

  get isTimeInvalid(): boolean {
    return this.log.totalTime < 0;
  }

  get isRatingInvalid(): boolean {
    return this.log.rating < 1 || this.log.rating > 5;
  }

  get isFormInvalid(): boolean {
    return (
      this.isCommentInvalid ||
      this.isDifficultyInvalid ||
      this.isDistanceInvalid ||
      this.isTimeInvalid ||
      this.isRatingInvalid
    );
  }
}
