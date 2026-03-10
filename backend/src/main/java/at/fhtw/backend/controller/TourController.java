package at.fhtw.backend.controller;

import at.fhtw.backend.model.Tour;
import at.fhtw.backend.service.TourService;
import org.springframework.http.ResponseEntity;
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
    public List<Tour> getAllTours() {
        return tourService.getAllTours();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tour> getTourById(@PathVariable Long id) {
        Tour tour = tourService.getTourById(id);

        if (tour == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(tour);
    }

    @PostMapping
    public ResponseEntity<Tour> createTour(@RequestBody Tour tour) {
        Tour createdTour = tourService.createTour(tour);
        return ResponseEntity.ok(createdTour);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        boolean deleted = tourService.deleteTour(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}