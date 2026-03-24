package at.fhtw.backend.controller;

import at.fhtw.backend.model.Tour;
import at.fhtw.backend.model.TourLog;
import at.fhtw.backend.service.TourService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    private final TourService tourService;

    public TourController(TourService tourService) {
        this.tourService = tourService;
    }

    @GetMapping
    public List<Tour> getAllTours(Authentication authentication) {
        return tourService.getAllTours(authentication.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tour> getTourById(@PathVariable Long id, Authentication authentication) {
        Tour tour = tourService.getTourById(authentication.getName(), id);

        if (tour == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(tour);
    }

    @PostMapping
    public ResponseEntity<Tour> createTour(@RequestBody Tour tour, Authentication authentication) {
        Tour createdTour = tourService.createTour(authentication.getName(), tour);
        return ResponseEntity.ok(createdTour);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tour> updateTour(@PathVariable Long id, @RequestBody Tour updatedTour, Authentication authentication) {
        Tour tour = tourService.updateTour(authentication.getName(), id, updatedTour);

        if (tour == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(tour);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id, Authentication authentication) {
        boolean deleted = tourService.deleteTour(authentication.getName(), id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tourId}/logs")
    public ResponseEntity<List<TourLog>> getLogsByTourId(@PathVariable Long tourId, Authentication authentication) {
        List<TourLog> logs = tourService.getLogsByTourId(authentication.getName(), tourId);

        if (logs == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(logs);
    }

    @PostMapping("/{tourId}/logs")
    public ResponseEntity<TourLog> addLogToTour(@PathVariable Long tourId, @RequestBody TourLog log, Authentication authentication) {
        TourLog createdLog = tourService.addLogToTour(authentication.getName(), tourId, log);

        if (createdLog == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(createdLog);
    }
}