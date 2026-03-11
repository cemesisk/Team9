package at.fhtw.backend.controller;

import at.fhtw.backend.model.TourLog;
import at.fhtw.backend.service.TourService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tour-logs")
public class TourLogController {

    private final TourService tourService;

    public TourLogController(TourService tourService) {
        this.tourService = tourService;
    }

    @PutMapping("/{logId}")
    public ResponseEntity<TourLog> updateLog(@PathVariable Long logId, @RequestBody TourLog updatedLog) {
        TourLog log = tourService.updateLog(logId, updatedLog);

        if (log == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(log);
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long logId) {
        boolean deleted = tourService.deleteLog(logId);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}