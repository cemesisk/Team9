package at.fhtw.backend.controller;

import at.fhtw.backend.dto.ApiStatusResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public ApiStatusResponse test() {
        return new ApiStatusResponse("Backend is working!", "OK");
    }

    @GetMapping("/api/health")
    public ApiStatusResponse health() {
        return new ApiStatusResponse("Application is running", "UP");
    }
}