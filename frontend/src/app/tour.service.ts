import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Tour } from './models/tour.model';
import { TourLog } from './models/tour-log.model';

interface BackendTourLog {
  id?: number;
  date: string;
  comment: string;
  difficulty: string;
  totalDistance: number;
  totalTime: number;
  rating: number;
}

interface BackendTour {
  id?: number;
  name: string;
  description: string;
  fromLocation: string;
  toLocation: string;
  transportType: string;
  distance: number;
  estimatedTime: number;
  imageUrl: string;
  logs: BackendTourLog[];
}

@Injectable({
  providedIn: 'root'
})
export class TourService {

  private readonly baseUrl = 'http://localhost:8080/api/tours';
  private readonly tourLogBaseUrl = 'http://localhost:8080/api/tour-logs';

  constructor(private http: HttpClient) {}

  getTours(): Observable<Tour[]> {
    return this.http.get<BackendTour[]>(this.baseUrl).pipe(
      map(tours => tours.map(tour => this.mapBackendTourToFrontend(tour)))
    );
  }

  getTourById(id: number): Observable<Tour> {
    return this.http.get<BackendTour>(`${this.baseUrl}/${id}`).pipe(
      map(tour => this.mapBackendTourToFrontend(tour))
    );
  }

  createTour(tour: Tour): Observable<Tour> {
    const backendTour = this.mapFrontendTourToBackend(tour);

    return this.http.post<BackendTour>(this.baseUrl, backendTour).pipe(
      map(createdTour => this.mapBackendTourToFrontend(createdTour))
    );
  }

  updateTour(id: number, tour: Tour): Observable<Tour> {
    const backendTour = this.mapFrontendTourToBackend(tour);

    return this.http.put<BackendTour>(`${this.baseUrl}/${id}`, backendTour).pipe(
      map(updatedTour => this.mapBackendTourToFrontend(updatedTour))
    );
  }

  deleteTour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getLogsByTourId(tourId: number): Observable<TourLog[]> {
    return this.http.get<BackendTourLog[]>(`${this.baseUrl}/${tourId}/logs`).pipe(
      map(logs => logs.map(log => this.mapBackendLogToFrontend(log)))
    );
  }

  addLogToTour(tourId: number, log: TourLog): Observable<TourLog> {
    const backendLog = this.mapFrontendLogToBackend(log);

    return this.http.post<BackendTourLog>(`${this.baseUrl}/${tourId}/logs`, backendLog).pipe(
      map(createdLog => this.mapBackendLogToFrontend(createdLog))
    );
  }

  updateLog(logId: number, log: TourLog): Observable<TourLog> {
    const backendLog = this.mapFrontendLogToBackend(log);

    return this.http.put<BackendTourLog>(`${this.tourLogBaseUrl}/${logId}`, backendLog).pipe(
      map(updatedLog => this.mapBackendLogToFrontend(updatedLog))
    );
  }

  deleteLog(logId: number): Observable<void> {
    return this.http.delete<void>(`${this.tourLogBaseUrl}/${logId}`);
  }

  private mapBackendTourToFrontend(tour: BackendTour): Tour {
    return {
      id: tour.id ?? 0,
      name: tour.name,
      description: tour.description,
      from: tour.fromLocation,
      to: tour.toLocation,
      transportType: tour.transportType,
      distance: tour.distance,
      estimatedTime: this.formatEstimatedTime(tour.estimatedTime),
      imageUrl: tour.imageUrl,
      logs: (tour.logs ?? []).map(log => this.mapBackendLogToFrontend(log))
    };
  }

  private mapFrontendTourToBackend(tour: Tour): BackendTour {
    return {
      id: tour.id,
      name: tour.name,
      description: tour.description,
      fromLocation: tour.from,
      toLocation: tour.to,
      transportType: tour.transportType,
      distance: tour.distance,
      estimatedTime: this.parseEstimatedTimeToHours(tour.estimatedTime),
      imageUrl: tour.imageUrl,
      logs: (tour.logs ?? []).map(log => this.mapFrontendLogToBackend(log))
    };
  }

  private mapBackendLogToFrontend(log: BackendTourLog): TourLog {
    return {
      id: log.id ?? 0,
      dateTime: this.formatDateForDateTimeInput(log.date),
      comment: log.comment,
      difficulty: this.mapDifficultyTextToNumber(log.difficulty),
      totalDistance: log.totalDistance,
      totalTime: this.mapBackendTotalTimeToMinutes(log.totalTime),
      rating: log.rating
    };
  }

  private mapFrontendLogToBackend(log: TourLog): BackendTourLog {
    return {
      id: log.id,
      date: this.extractDate(log.dateTime),
      comment: log.comment,
      difficulty: this.mapDifficultyNumberToText(log.difficulty),
      totalDistance: log.totalDistance,
      totalTime: log.totalTime,
      rating: log.rating
    };
  }

  private formatEstimatedTime(hoursValue: number): string {
    const totalMinutes = Math.round(hoursValue * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  }

  private parseEstimatedTimeToHours(value: string): number {
    const trimmedValue = value.trim();

    const match = trimmedValue.match(/(\d+)\s*h\s*(\d+)?/i);
    if (match) {
      const hours = Number(match[1]);
      const minutes = match[2] ? Number(match[2]) : 0;
      return hours + minutes / 60;
    }

    const numericValue = Number(trimmedValue);
    return Number.isNaN(numericValue) ? 0 : numericValue;
  }

  private formatDateForDateTimeInput(date: string): string {
    if (date.includes('T')) {
      return date.slice(0, 16);
    }

    return `${date}T12:00`;
  }

  private extractDate(dateTime: string): string {
    if (dateTime.includes('T')) {
      return dateTime.split('T')[0];
    }

    return dateTime;
  }

  private mapDifficultyTextToNumber(difficulty: string): number {
    const normalized = difficulty.trim().toLowerCase();

    switch (normalized) {
      case 'very easy':
        return 1;
      case 'easy':
        return 2;
      case 'medium':
        return 3;
      case 'hard':
        return 4;
      case 'very hard':
        return 5;
      default:
        return 1;
    }
  }

  private mapDifficultyNumberToText(difficulty: number): string {
    switch (difficulty) {
      case 1:
        return 'Very Easy';
      case 2:
        return 'Easy';
      case 3:
        return 'Medium';
      case 4:
        return 'Hard';
      case 5:
        return 'Very Hard';
      default:
        return 'Easy';
    }
  }

  private mapBackendTotalTimeToMinutes(value: number): number {
    if (value <= 24) {
      return Math.round(value * 60);
    }

    return Math.round(value);
  }
}
