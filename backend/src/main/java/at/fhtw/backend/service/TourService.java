package at.fhtw.backend.service;

import at.fhtw.backend.model.Tour;
import at.fhtw.backend.model.TourLog;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TourService {

    private final List<Tour> tours = new ArrayList<>();
    private Long nextTourId = 1L;
    private Long nextLogId = 1L;

    @PostConstruct
    public void initSampleData() {
        Tour tour1 = new Tour(
                nextTourId++,
                "Vienna City Tour",
                "A walk through the city center of Vienna.",
                "Stephansplatz",
                "Schönbrunn",
                "Walking",
                6.5,
                2.0,
                "https://example.com/vienna.jpg"
        );

        tour1.getLogs().add(new TourLog(
                nextLogId++,
                "2026-03-01",
                "Nice weather and easy route.",
                "Easy",
                6.5,
                2.1,
                5
        ));

        Tour tour2 = new Tour(
                nextTourId++,
                "Danube Bike Ride",
                "Cycling tour along the Danube.",
                "Donauinsel",
                "Klosterneuburg",
                "Bicycle",
                18.0,
                1.5,
                "https://example.com/danube.jpg"
        );

        tours.add(tour1);
        tours.add(tour2);
    }

    public List<Tour> getAllTours() {
        return tours;
    }

    public Tour getTourById(Long id) {
        return tours.stream()
                .filter(tour -> tour.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public Tour createTour(Tour tour) {
        tour.setId(nextTourId++);
        if (tour.getLogs() == null) {
            tour.setLogs(new ArrayList<>());
        }
        tours.add(tour);
        return tour;
    }

    public Tour updateTour(Long id, Tour updatedTour) {
        Tour existingTour = getTourById(id);

        if (existingTour == null) {
            return null;
        }

        existingTour.setName(updatedTour.getName());
        existingTour.setDescription(updatedTour.getDescription());
        existingTour.setFromLocation(updatedTour.getFromLocation());
        existingTour.setToLocation(updatedTour.getToLocation());
        existingTour.setTransportType(updatedTour.getTransportType());
        existingTour.setDistance(updatedTour.getDistance());
        existingTour.setEstimatedTime(updatedTour.getEstimatedTime());
        existingTour.setImageUrl(updatedTour.getImageUrl());

        return existingTour;
    }

    public boolean deleteTour(Long id) {
        return tours.removeIf(tour -> tour.getId().equals(id));
    }

    public List<TourLog> getLogsByTourId(Long tourId) {
        Tour tour = getTourById(tourId);

        if (tour == null) {
            return null;
        }

        return tour.getLogs();
    }

    public TourLog addLogToTour(Long tourId, TourLog log) {
        Tour tour = getTourById(tourId);

        if (tour == null) {
            return null;
        }

        log.setId(nextLogId++);
        tour.getLogs().add(log);
        return log;
    }

    public TourLog updateLog(Long logId, TourLog updatedLog) {
        for (Tour tour : tours) {
            for (TourLog log : tour.getLogs()) {
                if (log.getId().equals(logId)) {
                    log.setDate(updatedLog.getDate());
                    log.setComment(updatedLog.getComment());
                    log.setDifficulty(updatedLog.getDifficulty());
                    log.setTotalDistance(updatedLog.getTotalDistance());
                    log.setTotalTime(updatedLog.getTotalTime());
                    log.setRating(updatedLog.getRating());
                    return log;
                }
            }
        }

        return null;
    }

    public boolean deleteLog(Long logId) {
        for (Tour tour : tours) {
            boolean removed = tour.getLogs().removeIf(log -> log.getId().equals(logId));
            if (removed) {
                return true;
            }
        }

        return false;
    }
}