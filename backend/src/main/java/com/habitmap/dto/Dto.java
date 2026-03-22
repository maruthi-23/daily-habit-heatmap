package com.habitmap.dto;

import com.habitmap.entity.HabitEntry;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Dto {

    // ---- Auth ----

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                 message = "Password must contain uppercase, lowercase and digit")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @Builder
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private UserResponse user;
    }

    @Data
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }

    // ---- User ----

    @Data
    @Builder
    public static class UserResponse {
        private UUID id;
        private String name;
        private String email;
        private String role;
        private LocalDateTime createdAt;
    }

    // ---- Habit ----

    @Data
    public static class CreateHabitRequest {
        @NotBlank(message = "Habit name is required")
        @Size(min = 1, max = 100)
        private String name;

        @Size(max = 500)
        private String description;

        private String icon;
        private String color;

        @Min(1) @Max(7)
        private Integer targetDaysPerWeek;
    }

    @Data
    public static class UpdateHabitRequest {
        @Size(min = 1, max = 100)
        private String name;

        @Size(max = 500)
        private String description;

        private String icon;
        private String color;

        @Min(1) @Max(7)
        private Integer targetDaysPerWeek;

        private Boolean isActive;
    }

    @Data
    @Builder
    public static class HabitResponse {
        private UUID id;
        private String name;
        private String description;
        private String icon;
        private String color;
        private Integer targetDaysPerWeek;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private int currentStreak;
        private int longestStreak;
        private int totalCompletions;
        private boolean completedToday;
    }

    // ---- Habit Entry ----

    @Data
    public static class MarkHabitRequest {
        private LocalDate date;
        private HabitEntry.Status status;
        private String note;
    }

    @Data
    @Builder
    public static class HabitEntryResponse {
        private UUID id;
        private UUID habitId;
        private LocalDate date;
        private HabitEntry.Status status;
        private String note;
    }

    // ---- Heatmap ----

    @Data
    @Builder
    public static class HeatmapResponse {
        private List<HeatmapEntry> entries;
        private int totalDays;
        private int completedDays;
        private double completionRate;
    }

    @Data
    @Builder
    public static class HeatmapEntry {
        private LocalDate date;
        private int count;
        private int total;
        private double intensity;
    }

    // ---- Analytics / Stats ----

    @Data
    @Builder
    public static class DashboardStats {
        private long totalHabits;
        private int todayCompleted;
        private int todayTotal;
        private int currentStreak;
        private int longestStreak;
        private double weeklyCompletionRate;
        private List<HabitResponse> habits;
    }

    @Data
    @Builder
    public static class MonthlySummary {
        private int year;
        private int month;
        private Map<Integer, Integer> dailyCompletions;
        private int totalDays;
        private int completedDays;
        private double completionRate;
        private int bestStreak;
    }

    // ---- Error ----

    @Data
    @Builder
    public static class ErrorResponse {
        private int status;
        private String error;
        private String message;
        private LocalDateTime timestamp;
        private Map<String, String> fieldErrors;
    }

    @Data
    @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;
    }
}
