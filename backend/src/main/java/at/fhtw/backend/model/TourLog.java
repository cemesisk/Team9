package at.fhtw.backend.model;

public class TourLog {

    private Long id;
    private String date;
    private String comment;
    private String difficulty;
    private double totalDistance;
    private double totalTime;
    private int rating;

    public TourLog() {
    }

    public TourLog(Long id, String date, String comment, String difficulty, double totalDistance, double totalTime, int rating) {
        this.id = id;
        this.date = date;
        this.comment = comment;
        this.difficulty = difficulty;
        this.totalDistance = totalDistance;
        this.totalTime = totalTime;
        this.rating = rating;
    }

    public Long getId() {
        return id;
    }

    public String getDate() {
        return date;
    }

    public String getComment() {
        return comment;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public double getTotalTime() {
        return totalTime;
    }

    public int getRating() {
        return rating;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setTotalDistance(double totalDistance) {
        this.totalDistance = totalDistance;
    }

    public void setTotalTime(double totalTime) {
        this.totalTime = totalTime;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }
}