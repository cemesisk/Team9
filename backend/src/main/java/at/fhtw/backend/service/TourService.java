package at.fhtw.backend.service;

import at.fhtw.backend.model.Tour;
import at.fhtw.backend.model.TourLog;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TourService {

    private final Map<String, List<Tour>> toursByUser = new ConcurrentHashMap<>();
    private Long nextTourId = 1L;
    private Long nextLogId = 1L;

    public synchronized List<Tour> getAllTours(String username) {
        return Collections.unmodifiableList(new ArrayList<>(getOrCreateToursForUser(username)));
    }

    public synchronized Tour getTourById(String username, Long id) {
        return getOrCreateToursForUser(username).stream()
                .filter(tour -> tour.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public synchronized Tour createTour(String username, Tour tour) {
        String normalizedUsername = normalizeUsername(username);
        tour.setId(nextTourId++);
        tour.setOwnerUsername(normalizedUsername);
        // Ignore client-provided logs on create to prevent accidental cross-entity state import.
        tour.setLogs(new ArrayList<>());
        getOrCreateToursForUser(normalizedUsername).add(tour);
        return tour;
    }

    public synchronized Tour updateTour(String username, Long id, Tour updatedTour) {
        Tour existingTour = getTourById(username, id);

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

    public synchronized boolean deleteTour(String username, Long id) {
        return getOrCreateToursForUser(username).removeIf(tour -> tour.getId().equals(id));
    }

    public synchronized List<TourLog> getLogsByTourId(String username, Long tourId) {
        Tour tour = getTourById(username, tourId);

        if (tour == null) {
            return null;
        }

        return tour.getLogs();
    }

    public synchronized TourLog addLogToTour(String username, Long tourId, TourLog log) {
        Tour tour = getTourById(username, tourId);

        if (tour == null) {
            return null;
        }

        log.setId(nextLogId++);
        tour.getLogs().add(log);
        return log;
    }

    public synchronized TourLog updateLog(String username, Long logId, TourLog updatedLog) {
        for (Tour tour : getOrCreateToursForUser(username)) {
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

    public synchronized boolean deleteLog(String username, Long logId) {
        for (Tour tour : getOrCreateToursForUser(username)) {
            boolean removed = tour.getLogs().removeIf(log -> log.getId().equals(logId));
            if (removed) {
                return true;
            }
        }

        return false;
    }

    private List<Tour> getOrCreateToursForUser(String username) {
        return toursByUser.computeIfAbsent(normalizeUsername(username), key -> new ArrayList<>());
    }

    private String normalizeUsername(String username) {
        if (username == null) {
            return "";
        }
        return username.trim().toLowerCase(Locale.ROOT);
    }
}