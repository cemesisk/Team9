import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Tour } from './models/tour.model';
import { TourLog } from './models/tour-log.model';
import { TourLogCardComponent } from './components/tour-log-card/tour-log-card.component';
import { TourService } from './tour.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, TourLogCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  tours: Tour[] = [];
  selectedTour: Tour | null = null;

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.tourService.getTours().subscribe({
      next: (tours) => {
        this.tours = tours;

        if (this.tours.length === 0) {
          this.selectedTour = null;
          return;
        }

        if (!this.selectedTour) {
          this.selectedTour = this.tours[0];
          return;
        }

        const updatedSelectedTour = this.tours.find(
          tour => tour.id === this.selectedTour?.id
        );

        this.selectedTour = updatedSelectedTour ?? this.tours[0];
      },
      error: (error) => {
        console.error('Error loading tours:', error);
      }
    });
  }

  addTour(): void {
    const newTour: Tour = {
      name: `New Tour ${this.tours.length + 1}`,
      description: 'New tour description',
      from: 'Start location',
      to: 'Destination',
      transportType: 'Walking',
      distance: 0,
      estimatedTime: '0h 00min',
      imageUrl: 'https://via.placeholder.com/400x200?text=New+Tour',
      logs: []
    };

    this.tourService.createTour(newTour).subscribe({
      next: (createdTour) => {
        this.loadTours();
        this.selectedTour = createdTour;
      },
      error: (error) => {
        console.error('Error creating tour:', error);
      }
    });
  }

  deleteSelectedTour(): void {
    if (!this.selectedTour || this.selectedTour.id === undefined) {
      return;
    }

    const deletedTourId = this.selectedTour.id;

    this.tourService.deleteTour(deletedTourId).subscribe({
      next: () => {
        this.selectedTour = null;
        this.loadTours();
      },
      error: (error) => {
        console.error('Error deleting tour:', error);
      }
    });
  }

  saveTour(): void {
    if (!this.selectedTour || this.selectedTour.id === undefined) {
      return;
    }

    if (
      this.isTourNameInvalid(this.selectedTour) ||
      this.isTourFromInvalid(this.selectedTour) ||
      this.isTourToInvalid(this.selectedTour) ||
      this.isTourDistanceInvalid(this.selectedTour) ||
      this.isTourEstimatedTimeInvalid(this.selectedTour)
    ) {
      return;
    }

    this.tourService.updateTour(this.selectedTour.id, this.selectedTour).subscribe({
      next: () => {
        this.loadTours();
      },
      error: (error) => {
        console.error('Error updating tour:', error);
      }
    });
  }

  addLog(): void {
    const selectedTour = this.selectedTour;

    if (!selectedTour || selectedTour.id === undefined) {
      return;
    }

    const newLog: TourLog = {
      dateTime: '2026-03-04T12:00',
      comment: 'New tour log',
      difficulty: 1,
      totalDistance: 0,
      totalTime: 0,
      rating: 1
    };

    this.tourService.addLogToTour(selectedTour.id, newLog).subscribe({
      next: () => {
        this.loadTours();
      },
      error: (error) => {
        console.error('Error creating log:', error);
      }
    });
  }

  deleteLog(logId: number): void {
    if (!this.selectedTour) {
      return;
    }

    this.tourService.deleteLog(logId).subscribe({
      next: () => {
        this.loadTours();
      },
      error: (error) => {
        console.error('Error deleting log:', error);
      }
    });
  }

  isTourNameInvalid(tour: Tour): boolean {
    return tour.name.trim().length === 0;
  }

  isTourFromInvalid(tour: Tour): boolean {
    return tour.from.trim().length === 0;
  }

  isTourToInvalid(tour: Tour): boolean {
    return tour.to.trim().length === 0;
  }

  isTourDistanceInvalid(tour: Tour): boolean {
    return tour.distance < 0;
  }

  isTourEstimatedTimeInvalid(tour: Tour): boolean {
    return tour.estimatedTime.trim().length === 0;
  }
}
