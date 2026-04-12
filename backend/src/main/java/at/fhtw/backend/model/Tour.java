package at.fhtw.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

public class Tour {

    private Long id;
    private String name;
    private String description;
    private String fromLocation;
    private String toLocation;
    private String transportType;
    private double distance;
    private double estimatedTime;
    private String imageUrl;
    private List<TourLog> logs;
    @JsonIgnore
    private String ownerUsername;

    public Tour() {
        this.logs = new ArrayList<>();
    }

    public Tour(Long id, String name, String description, String fromLocation, String toLocation,
                String transportType, double distance, double estimatedTime, String imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.transportType = transportType;
        this.distance = distance;
        this.estimatedTime = estimatedTime;
        this.imageUrl = imageUrl;
        this.logs = new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getFromLocation() {
        return fromLocation;
    }

    public String getToLocation() {
        return toLocation;
    }

    public String getTransportType() {
        return transportType;
    }

    public double getDistance() {
        return distance;
    }

    public double getEstimatedTime() {
        return estimatedTime;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public List<TourLog> getLogs() {
        return logs;
    }

    public String getOwnerUsername() {
        return ownerUsername;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setFromLocation(String fromLocation) {
        this.fromLocation = fromLocation;
    }

    public void setToLocation(String toLocation) {
        this.toLocation = toLocation;
    }

    public void setTransportType(String transportType) {
        this.transportType = transportType;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public void setEstimatedTime(double estimatedTime) {
        this.estimatedTime = estimatedTime;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setLogs(List<TourLog> logs) {
        this.logs = logs;
    }

    public void setOwnerUsername(String ownerUsername) {
        this.ownerUsername = ownerUsername;
    }
}