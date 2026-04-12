import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet';
import { Tour } from './models/tour.model';
import { TourLog } from './models/tour-log.model';
import { TourLogCardComponent } from './components/tour-log-card/tour-log-card.component';
import { TourService } from './tour.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, FormsModule, TourLogCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Tour Planner';
  isAuthenticated = false;
  authMode: 'login' | 'register' = 'login';
  username = '';
  password = '';
  confirmPassword = '';
  currentUsername = '';
  authMessage = '';
  isAuthenticating = false;

  tours: Tour[] = [];
  selectedTour: Tour | null = null;
  editTourDraft: Tour | null = null;
  isEditModalOpen = false;
  editLogDraft: TourLog | null = null;
  isLogEditModalOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private map: L.Map | null = null;
  private mapMarker: L.CircleMarker | null = null;
  private mapSyncTimeoutId: number | null = null;

  private readonly defaultMapCenter: L.LatLngTuple = [48.2082, 16.3738];

  constructor(
    private tourService: TourService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUsername = this.authService.getUsername();

    if (this.isAuthenticated) {
      this.loadTours();
    }
  }

  ngOnDestroy(): void {
    this.clearMapSyncTimeout();
    this.destroyMap();
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.authMessage = '';
  }

  submitAuth(): void {
    const normalizedUsername = this.username.trim();

    if (normalizedUsername.length < 3) {
      this.authMessage = 'Username must be at least 3 characters long.';
      return;
    }

    if (this.password.length < 6) {
      this.authMessage = 'Password must be at least 6 characters long.';
      return;
    }

    if (this.authMode === 'register' && this.password !== this.confirmPassword) {
      this.authMessage = 'Passwords do not match.';
      return;
    }

    this.isAuthenticating = true;
    this.authMessage = '';

    const authRequest = this.authMode === 'login'
      ? this.authService.login({ username: normalizedUsername, password: this.password })
      : this.authService.register({ username: normalizedUsername, password: this.password });

    authRequest.subscribe({
      next: (response) => {
        this.isAuthenticating = false;
        this.isAuthenticated = true;
        this.currentUsername = response.username;
        this.username = '';
        this.password = '';
        this.confirmPassword = '';
        this.authMessage = '';
        this.clearMessages();
        this.loadTours();
      },
      error: (error: HttpErrorResponse) => {
        this.isAuthenticating = false;
        this.authMessage = this.getHttpErrorMessage(error, 'Authentication failed.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.currentUsername = '';
    this.authMode = 'login';
    this.tours = [];
    this.selectedTour = null;
    this.closeEditModal();
    this.closeLogEditModal();
    this.clearMessages();
    this.authMessage = '';
    this.queueMapSync();
  }

  get isSelectedTourValid(): boolean {
    if (!this.selectedTour) {
      return false;
    }

    return !(
      this.isTourNameInvalid(this.selectedTour) ||
      this.isTourFromInvalid(this.selectedTour) ||
      this.isTourToInvalid(this.selectedTour) ||
      this.isTourDistanceInvalid(this.selectedTour) ||
      this.isTourEstimatedTimeInvalid(this.selectedTour)
    );
  }

  get isEditTourDraftValid(): boolean {
    if (!this.editTourDraft) {
      return false;
    }

    return !(
      this.isTourNameInvalid(this.editTourDraft) ||
      this.isTourFromInvalid(this.editTourDraft) ||
      this.isTourToInvalid(this.editTourDraft) ||
      this.isTourDistanceInvalid(this.editTourDraft) ||
      this.isTourEstimatedTimeInvalid(this.editTourDraft)
    );
  }

  get isEditLogDraftValid(): boolean {
    if (!this.editLogDraft) {
      return false;
    }

    return !this.isLogInvalid(this.editLogDraft);
  }

  loadTours(): void {
    const previouslySelectedTourId = this.selectedTour?.id;

    this.isLoading = true;
    this.clearMessages();

    this.tourService.getTours().subscribe({
      next: (tours) => {
        this.tours = tours;

        if (this.tours.length === 0) {
          this.selectedTour = null;
          this.closeEditModal();
          this.closeLogEditModal();
          this.queueMapSync();
          this.isLoading = false;
          return;
        }

        const matchingTour = previouslySelectedTourId === undefined
          ? null
          : this.tours.find(tour => tour.id === previouslySelectedTourId);

        this.selectedTour = matchingTour ?? this.tours[0];
        this.queueMapSync();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getHttpErrorMessage(error, 'Could not load tours.');
        console.error('Error loading tours:', error);
      }
    });
  }

  selectTour(tour: Tour): void {
    this.closeEditModal();
    this.closeLogEditModal();
    this.selectedTour = tour;
    this.clearMessages();
    this.queueMapSync();
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

    this.isLoading = true;
    this.clearMessages();

    this.tourService.createTour(newTour).subscribe({
      next: (createdTour) => {
        this.tours = [...this.tours, createdTour];
        this.selectedTour = createdTour;
        this.queueMapSync();
        this.isLoading = false;
        this.successMessage = 'Tour created successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getHttpErrorMessage(error, 'Could not create the tour.');
        console.error('Error creating tour:', error);
      }
    });
  }

  deleteSelectedTour(): void {
    if (!this.selectedTour || this.selectedTour.id === undefined) {
      return;
    }

    const deletedTourId = this.selectedTour.id;

    this.isLoading = true;
    this.clearMessages();

    this.tourService.deleteTour(deletedTourId).subscribe({
      next: () => {
        this.tours = this.tours.filter(tour => tour.id !== deletedTourId);
        this.selectedTour = this.tours.length > 0 ? this.tours[0] : null;
        this.closeEditModal();
        this.closeLogEditModal();
        this.queueMapSync();
        this.isLoading = false;
        this.successMessage = 'Tour deleted successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getHttpErrorMessage(error, 'Could not delete the tour.');
        console.error('Error deleting tour:', error);
      }
    });
  }

  saveEditedTour(): void {
    if (!this.selectedTour || !this.editTourDraft || this.selectedTour.id === undefined || !this.isEditTourDraftValid) {
      return;
    }

    const tourId = this.selectedTour.id;
    const draftToSave = this.createTourDraft(this.editTourDraft);

    this.isLoading = true;
    this.clearMessages();

    this.tourService.updateTour(tourId, draftToSave).subscribe({
      next: (updatedTour) => {
        this.tours = this.tours.map(tour =>
          tour.id === updatedTour.id ? updatedTour : tour
        );
        this.selectedTour = updatedTour;
        this.closeEditModal();
        this.isLoading = false;
        this.successMessage = 'Tour updated successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getHttpErrorMessage(error, 'Could not save the tour changes.');
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

    this.isLoading = true;
    this.clearMessages();

    this.tourService.addLogToTour(selectedTour.id, newLog).subscribe({
      next: (createdLog) => {
        if (!this.selectedTour) {
          this.isLoading = false;
          return;
        }

        const updatedSelectedTour: Tour = {
          ...this.selectedTour,
          logs: [...this.selectedTour.logs, createdLog]
        };

        this.replaceTourInState(updatedSelectedTour);
        this.isLoading = false;
        this.successMessage = 'Tour log created successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getHttpErrorMessage(error, 'Could not create the tour log.');
        console.error('Error creating log:', error);
      }
    });
  }

  saveLog(log: TourLog): void {
    if (log.id === undefined || this.isLogInvalid(log)) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.tourService.updateLog(log.id, log).subscribe({
      next: (updatedLog) => {
        if (!this.selectedTour) {
          this.isLoading = false;
          return;
        }

        const updatedSelectedTour: Tour = {
          ...this.selectedTour,
          logs: this.selectedTour.logs.map(existingLog =>
            existingLog.id === updatedLog.id ? updatedLog : existingLog
          )
        };

        this.replaceTourInState(updatedSelectedTour);
        this.isLoading = false;
        this.successMessage = 'Tour log updated successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getHttpErrorMessage(error, 'Could not save the tour log changes.');
        console.error('Error updating log:', error);
      }
    });
  }

  openLogEditModal(log: TourLog): void {
    if (this.isLoading) {
      return;
    }

    this.closeEditModal();
    this.editLogDraft = this.createLogDraft(log);
    this.isLogEditModalOpen = true;
    this.clearMessages();
  }

  closeLogEditModal(): void {
    this.isLogEditModalOpen = false;
    this.editLogDraft = null;
  }

  saveEditedLog(): void {
    if (!this.editLogDraft || this.editLogDraft.id === undefined || !this.isEditLogDraftValid) {
      return;
    }

    const logId = this.editLogDraft.id;
    const draftToSave = this.createLogDraft(this.editLogDraft);

    this.isLoading = true;
    this.clearMessages();

    this.tourService.updateLog(logId, draftToSave).subscribe({
      next: (updatedLog) => {
        if (!this.selectedTour) {
          this.isLoading = false;
          return;
        }

        const updatedSelectedTour: Tour = {
          ...this.selectedTour,
          logs: this.selectedTour.logs.map(existingLog =>
            existingLog.id === updatedLog.id ? updatedLog : existingLog
          )
        };

        this.replaceTourInState(updatedSelectedTour);
        this.closeLogEditModal();
        this.isLoading = false;
        this.successMessage = 'Tour log updated successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getHttpErrorMessage(error, 'Could not save the tour log changes.');
        console.error('Error updating log:', error);
      }
    });
  }

  deleteLog(logId: number): void {
    if (!this.selectedTour) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.tourService.deleteLog(logId).subscribe({
      next: () => {
        if (!this.selectedTour) {
          this.isLoading = false;
          return;
        }

        const updatedSelectedTour: Tour = {
          ...this.selectedTour,
          logs: this.selectedTour.logs.filter(log => log.id !== logId)
        };

        this.replaceTourInState(updatedSelectedTour);
        this.closeLogEditModal();
        this.isLoading = false;
        this.successMessage = 'Tour log deleted successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getHttpErrorMessage(error, 'Could not delete the tour log.');
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

  isLogInvalid(log: TourLog): boolean {
    return (
      this.isLogCommentInvalid(log) ||
      this.isLogDifficultyInvalid(log) ||
      this.isLogDistanceInvalid(log) ||
      this.isLogTimeInvalid(log) ||
      this.isLogRatingInvalid(log)
    );
  }

  openEditModal(): void {
    if (!this.selectedTour) {
      return;
    }

    this.closeLogEditModal();
    this.editTourDraft = this.createTourDraft(this.selectedTour);
    this.isEditModalOpen = true;
    this.clearMessages();
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editTourDraft = null;
  }

  private replaceTourInState(updatedTour: Tour): void {
    this.tours = this.tours.map(tour =>
      tour.id === updatedTour.id ? updatedTour : tour
    );
    this.selectedTour = updatedTour;
    this.queueMapSync();
  }

  private queueMapSync(): void {
    this.clearMapSyncTimeout();
    this.mapSyncTimeoutId = window.setTimeout(() => {
      this.mapSyncTimeoutId = null;
      this.syncMapWithSelectedTour();
    }, 0);
  }

  private clearMapSyncTimeout(): void {
    if (this.mapSyncTimeoutId !== null) {
      window.clearTimeout(this.mapSyncTimeoutId);
      this.mapSyncTimeoutId = null;
    }
  }

  private syncMapWithSelectedTour(): void {
    if (!this.selectedTour) {
      this.destroyMap();
      return;
    }

    const mapContainer = document.getElementById('tour-map');
    if (!mapContainer) {
      return;
    }

    if (!this.map) {
      this.map = L.map(mapContainer).setView(this.defaultMapCenter, 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
    }

    const center = this.defaultMapCenter;
    this.map.setView(center, 10);

    if (this.mapMarker) {
      this.map.removeLayer(this.mapMarker);
    }

    this.mapMarker = L.circleMarker(center, {
      radius: 8,
      color: '#2563eb',
      fillColor: '#2563eb',
      fillOpacity: 0.85
    }).addTo(this.map);
    this.mapMarker.bindPopup(`${this.selectedTour.from} -> ${this.selectedTour.to}`);

    window.setTimeout(() => {
      this.map?.invalidateSize();
    }, 0);
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapMarker = null;
    }
  }

  private createTourDraft(tour: Tour): Tour {
    return {
      ...tour,
      logs: (tour.logs ?? []).map(log => ({ ...log }))
    };
  }

  private createLogDraft(log: TourLog): TourLog {
    return {
      ...log
    };
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private getHttpErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (error.status === 401 || error.status === 403) {
      return 'You are not authorized. Please log in again.';
    }

    if (error.status === 0) {
      return 'Backend is not reachable. Please make sure the Spring Boot server is running.';
    }

    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    return fallbackMessage;
  }
}
