import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Tour } from './models/tour.model';
import { TourLog } from './models/tour-log.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';

  tours: Tour[] = [
    {
      id: 1,
      name: 'Vienna City Tour',
      description: 'A sightseeing tour through the city center of Vienna.',
      from: 'Stephansplatz',
      to: 'Schönbrunn Palace',
      transportType: 'Walking',
      distance: 6.5,
      estimatedTime: '2h 15min',
      imageUrl: 'https://via.placeholder.com/400x200?text=Vienna+City+Tour',
      logs: [
        {
          id: 1,
          dateTime: '2026-03-20T10:30',
          comment: 'Very nice route with many interesting places.',
          difficulty: 2,
          totalDistance: 6.5,
          totalTime: 135,
          rating: 5
        },
        {
          id: 2,
          dateTime: '2026-03-21T14:00',
          comment: 'Good route, but a bit crowded.',
          difficulty: 3,
          totalDistance: 6.5,
          totalTime: 145,
          rating: 4
        }
      ]
    },
    {
      id: 2,
      name: 'Danube Bike Ride',
      description: 'A relaxing bike ride along the Danube.',
      from: 'Donauinsel',
      to: 'Klosterneuburg',
      transportType: 'Bicycle',
      distance: 14.2,
      estimatedTime: '1h 20min',
      imageUrl: 'https://via.placeholder.com/400x200?text=Danube+Bike+Ride',
      logs: [
        {
          id: 1,
          dateTime: '2026-03-18T09:15',
          comment: 'Perfect weather and an easy ride.',
          difficulty: 2,
          totalDistance: 14.2,
          totalTime: 80,
          rating: 5
        }
      ]
    },
    {
      id: 3,
      name: 'Forest Hiking Trail',
      description: 'A hiking route through a quiet forest area.',
      from: 'Lainzer Tor',
      to: 'Hubertuswarte',
      transportType: 'Hiking',
      distance: 9.8,
      estimatedTime: '3h 00min',
      imageUrl: 'https://via.placeholder.com/400x200?text=Forest+Hiking+Trail',
      logs: [
        {
          id: 1,
          dateTime: '2026-03-19T08:45',
          comment: 'A beautiful and calm hiking experience.',
          difficulty: 4,
          totalDistance: 9.8,
          totalTime: 180,
          rating: 4
        }
      ]
    }
  ];

  selectedTour: Tour | null = this.tours[0];

  addTour(): void {
    const newId =
      this.tours.length > 0
        ? Math.max(...this.tours.map(tour => tour.id)) + 1
        : 1;

    const newTour: Tour = {
      id: newId,
      name: `New Tour ${newId}`,
      description: 'New tour description',
      from: 'Start location',
      to: 'Destination',
      transportType: 'Walking',
      distance: 0,
      estimatedTime: '0h 00min',
      imageUrl: 'https://via.placeholder.com/400x200?text=New+Tour',
      logs: []
    };

    this.tours.push(newTour);
    this.selectedTour = newTour;
  }

  deleteSelectedTour(): void {
    if (!this.selectedTour) {
      return;
    }

    this.tours = this.tours.filter(tour => tour.id !== this.selectedTour!.id);

    if (this.tours.length > 0) {
      this.selectedTour = this.tours[0];
    } else {
      this.selectedTour = null;
    }
  }

  addLog(): void {
    const selectedTour = this.selectedTour;

    if (!selectedTour) {
      return;
    }

    const newId =
      selectedTour.logs.length > 0
        ? Math.max(...selectedTour.logs.map(log => log.id)) + 1
        : 1;

    const newLog: TourLog = {
      id: newId,
      dateTime: '2026-03-04T12:00',
      comment: 'New tour log',
      difficulty: 1,
      totalDistance: 0,
      totalTime: 0,
      rating: 1
    };

    selectedTour.logs.push(newLog);
  }

  deleteLog(logId: number): void {
    const selectedTour = this.selectedTour;

    if (!selectedTour) {
      return;
    }

    selectedTour.logs = selectedTour.logs.filter(log => log.id !== logId);
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

  isLogCommentInvalid(log: TourLog): boolean {
    return log.comment.trim().length === 0;
  }

  isLogDifficultyInvalid(log: TourLog): boolean {
    return log.difficulty < 0;
  }

  isLogDistanceInvalid(log: TourLog): boolean {
    return log.totalDistance < 0;
  }

  isLogTimeInvalid(log: TourLog): boolean {
    return log.totalTime < 0;
  }

  isLogRatingInvalid(log: TourLog): boolean {
    return log.rating < 1 || log.rating > 5;
  }
}