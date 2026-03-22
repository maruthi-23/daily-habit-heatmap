package com.habitmap.controller;

import com.habitmap.dto.Dto;
import com.habitmap.service.HabitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @PostMapping
    public ResponseEntity<Dto.HabitResponse> createHabit(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody Dto.CreateHabitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitService.createHabit(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<Dto.HabitResponse>> getHabits(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(habitService.getUserHabits(userDetails.getUsername()));
    }

    @PutMapping("/{habitId}")
    public ResponseEntity<Dto.HabitResponse> updateHabit(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID habitId,
            @Valid @RequestBody Dto.UpdateHabitRequest request) {
        return ResponseEntity.ok(habitService.updateHabit(userDetails.getUsername(), habitId, request));
    }

    @DeleteMapping("/{habitId}")
    public ResponseEntity<Void> deleteHabit(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID habitId) {
        habitService.deleteHabit(userDetails.getUsername(), habitId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{habitId}/complete")
    public ResponseEntity<Dto.HabitEntryResponse> markHabit(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID habitId,
            @RequestBody(required = false) Dto.MarkHabitRequest request) {
        if (request == null) request = new Dto.MarkHabitRequest();
        return ResponseEntity.ok(habitService.markHabit(userDetails.getUsername(), habitId, request));
    }

    @DeleteMapping("/{habitId}/complete")
    public ResponseEntity<Void> unmarkHabit(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID habitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        habitService.unmarkHabit(userDetails.getUsername(), habitId, date);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/heatmap")
    public ResponseEntity<Dto.HeatmapResponse> getHeatmap(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().year}") int year) {
        return ResponseEntity.ok(habitService.getHeatmap(userDetails.getUsername(), year));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Dto.DashboardStats> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(habitService.getDashboardStats(userDetails.getUsername()));
    }
}
