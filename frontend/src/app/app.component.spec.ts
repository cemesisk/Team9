import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { Tour } from './models/tour.model';
import { TourLog } from './models/tour-log.model';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title "Tour Planner"', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Tour Planner');
  });

  it('should open edit modal with cloned tour data', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const selectedTour: Tour = {
      id: 1,
      name: 'Test Tour',
      description: 'Desc',
      from: 'Vienna',
      to: 'Graz',
      transportType: 'Car',
      distance: 120,
      estimatedTime: '2h 00min',
      imageUrl: 'https://example.com/image.png',
      logs: []
    };

    app.selectedTour = selectedTour;
    app.openEditModal();

    expect(app.isEditModalOpen).toBeTrue();
    expect(app.editTourDraft).not.toBeNull();
    expect(app.editTourDraft).not.toBe(app.selectedTour);

    app.editTourDraft!.name = 'Changed Name';
    expect(app.selectedTour.name).toBe('Test Tour');
  });

  it('should close edit modal and clear draft', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.isEditModalOpen = true;
    app.editTourDraft = {
      name: 'Draft',
      description: 'Draft description',
      from: 'A',
      to: 'B',
      transportType: 'Walk',
      distance: 0,
      estimatedTime: '0h 30min',
      imageUrl: '',
      logs: []
    };

    app.closeEditModal();

    expect(app.isEditModalOpen).toBeFalse();
    expect(app.editTourDraft).toBeNull();
  });

  it('should open log edit modal with cloned log data', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const log: TourLog = {
      id: 10,
      dateTime: '2026-03-04T12:00',
      comment: 'Original comment',
      difficulty: 2,
      totalDistance: 8,
      totalTime: 70,
      rating: 4
    };

    app.openLogEditModal(log);

    expect(app.isLogEditModalOpen).toBeTrue();
    expect(app.editLogDraft).not.toBeNull();
    expect(app.editLogDraft).not.toBe(log);

    app.editLogDraft!.comment = 'Changed comment';
    expect(log.comment).toBe('Original comment');
  });

  it('should close log edit modal and clear log draft', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.isLogEditModalOpen = true;
    app.editLogDraft = {
      id: 11,
      dateTime: '2026-03-04T12:00',
      comment: 'Draft comment',
      difficulty: 1,
      totalDistance: 0,
      totalTime: 0,
      rating: 3
    };

    app.closeLogEditModal();

    expect(app.isLogEditModalOpen).toBeFalse();
    expect(app.editLogDraft).toBeNull();
  });
});
