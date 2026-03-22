package com.habitmap.service;

import com.habitmap.dto.Dto;
import com.habitmap.entity.Habit;
import com.habitmap.entity.HabitEntry;
import com.habitmap.entity.User;
import com.habitmap.exception.AppException;
import com.habitmap.repository.HabitEntryRepository;
import com.habitmap.repository.HabitRepository;
import com.habitmap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitEntryRepository entryRepository;
    private final UserRepository userRepository;

    @Transactional
    public Dto.HabitResponse createHabit(String email, Dto.CreateHabitRequest request) {
        User user = getUser(email);

        Habit habit = Habit.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon() != null ? request.getIcon() : "🎯")
                .color(request.getColor() != null ? request.getColor() : "#22c55e")
                .targetDaysPerWeek(request.getTargetDaysPerWeek() != null ? request.getTargetDaysPerWeek() : 7)
                .build();

        habit = habitRepository.save(habit);
        log.info("Habit created: {} for user: {}", habit.getName(), email);
        return toHabitResponse(habit);
    }

    public List<Dto.HabitResponse> getUserHabits(String email) {
        User user = getUser(email);
        return habitRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toHabitResponse)
                .toList();
    }

    @Transactional
    public Dto.HabitResponse updateHabit(String email, UUID habitId, Dto.UpdateHabitRequest request) {
        User user = getUser(email);
        Habit habit = getHabitOfUser(habitId, user.getId());

        if (request.getName() != null) habit.setName(request.getName());
        if (request.getDescription() != null) habit.setDescription(request.getDescription());
        if (request.getIcon() != null) habit.setIcon(request.getIcon());
        if (request.getColor() != null) habit.setColor(request.getColor());
        if (request.getTargetDaysPerWeek() != null) habit.setTargetDaysPerWeek(request.getTargetDaysPerWeek());
        if (request.getIsActive() != null) habit.setIsActive(request.getIsActive());

        habit = habitRepository.save(habit);
        return toHabitResponse(habit);
    }

    @Transactional
    public void deleteHabit(String email, UUID habitId) {
        User user = getUser(email);
        Habit habit = getHabitOfUser(habitId, user.getId());
        habit.setIsActive(false);
        habitRepository.save(habit);
    }

    @Transactional
    public Dto.HabitEntryResponse markHabit(String email, UUID habitId, Dto.MarkHabitRequest request) {
        User user = getUser(email);
        Habit habit = getHabitOfUser(habitId, user.getId());

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        HabitEntry.Status status = request.getStatus() != null ? request.getStatus() : HabitEntry.Status.DONE;

        Optional<HabitEntry> existing = entryRepository.findByHabitIdAndDate(habitId, date);

        HabitEntry entry;
        if (existing.isPresent()) {
            entry = existing.get();
            entry.setStatus(status);
            entry.setNote(request.getNote());
        } else {
            entry = HabitEntry.builder()
                    .habit(habit)
                    .date(date)
                    .status(status)
                    .note(request.getNote())
                    .build();
        }

        entry = entryRepository.save(entry);
        return toEntryResponse(entry);
    }

    @Transactional
    public void unmarkHabit(String email, UUID habitId, LocalDate date) {
        User user = getUser(email);
        getHabitOfUser(habitId, user.getId());

        LocalDate targetDate = date != null ? date : LocalDate.now();
        entryRepository.findByHabitIdAndDate(habitId, targetDate)
                .ifPresent(entryRepository::delete);
    }

    public Dto.HeatmapResponse getHeatmap(String email, int year) {
        User user = getUser(email);
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to = LocalDate.of(year, 12, 31);

        long totalHabits = habitRepository.countActiveHabitsByUserId(user.getId());
        List<HabitEntry> entries = entryRepository.findAllDoneEntriesByUserAndDateRange(user.getId(), from, to);

        // Group by date
        var byDate = entries.stream()
                .collect(java.util.stream.Collectors.groupingBy(HabitEntry::getDate, java.util.stream.Collectors.counting()));

        List<Dto.HeatmapEntry> heatmapEntries = byDate.entrySet().stream()
                .map(e -> {
                    int count = e.getValue().intValue();
                    double intensity = totalHabits > 0 ? Math.min(1.0, (double) count / totalHabits) : 0;
                    return Dto.HeatmapEntry.builder()
                            .date(e.getKey())
                            .count(count)
                            .total((int) totalHabits)
                            .intensity(intensity)
                            .build();
                })
                .sorted(java.util.Comparator.comparing(Dto.HeatmapEntry::getDate))
                .toList();

        return Dto.HeatmapResponse.builder()
                .entries(heatmapEntries)
                .totalDays((int) from.datesUntil(to.plusDays(1)).count())
                .completedDays(byDate.size())
                .completionRate(byDate.isEmpty() ? 0 : (double) byDate.size() / LocalDate.now().getDayOfYear())
                .build();
    }

    public Dto.DashboardStats getDashboardStats(String email) {
        User user = getUser(email);
        List<Dto.HabitResponse> habits = getUserHabits(email);

        long todayCompleted = habits.stream().filter(Dto.HabitResponse::isCompletedToday).count();
        int overallStreak = habits.stream().mapToInt(Dto.HabitResponse::getCurrentStreak).max().orElse(0);
        int longestStreak = habits.stream().mapToInt(Dto.HabitResponse::getLongestStreak).max().orElse(0);

        // Weekly completion rate
        LocalDate weekStart = LocalDate.now().minusDays(6);
        long weekEntries = entryRepository.findAllDoneEntriesByUserAndDateRange(user.getId(), weekStart, LocalDate.now()).size();
        double weeklyRate = habits.isEmpty() ? 0 : (double) weekEntries / (habits.size() * 7) * 100;

        return Dto.DashboardStats.builder()
                .totalHabits(habits.size())
                .todayCompleted((int) todayCompleted)
                .todayTotal(habits.size())
                .currentStreak(overallStreak)
                .longestStreak(longestStreak)
                .weeklyCompletionRate(weeklyRate)
                .habits(habits)
                .build();
    }

    // ----- helpers -----

    private Dto.HabitResponse toHabitResponse(Habit habit) {
        LocalDate today = LocalDate.now();
        boolean completedToday = entryRepository.findByHabitIdAndDate(habit.getId(), today)
                .map(e -> e.getStatus() == HabitEntry.Status.DONE)
                .orElse(false);

        int currentStreak = calculateCurrentStreak(habit.getId(), today);
        int longestStreak = calculateLongestStreak(habit.getId());

        long total = entryRepository.findByHabitIdAndDateBetweenOrderByDateAsc(habit.getId(),
                LocalDate.of(2000, 1, 1), today).stream()
                .filter(e -> e.getStatus() == HabitEntry.Status.DONE).count();

        return Dto.HabitResponse.builder()
                .id(habit.getId())
                .name(habit.getName())
                .description(habit.getDescription())
                .icon(habit.getIcon())
                .color(habit.getColor())
                .targetDaysPerWeek(habit.getTargetDaysPerWeek())
                .isActive(habit.getIsActive())
                .createdAt(habit.getCreatedAt())
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalCompletions((int) total)
                .completedToday(completedToday)
                .build();
    }

    private int calculateCurrentStreak(UUID habitId, LocalDate today) {
        List<LocalDate> doneDates = entryRepository.findDoneDatesByHabitIdBeforeOrOn(habitId, today);
        if (doneDates.isEmpty()) return 0;

        int streak = 0;
        LocalDate expected = today;
        for (LocalDate date : doneDates) {
            if (date.equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else if (date.isBefore(expected)) {
                break;
            }
        }
        return streak;
    }

    private int calculateLongestStreak(UUID habitId) {
        List<LocalDate> doneDates = entryRepository
                .findDoneDatesByHabitIdBeforeOrOn(habitId, LocalDate.now());
        if (doneDates.isEmpty()) return 0;

        int longest = 1, current = 1;
        for (int i = 1; i < doneDates.size(); i++) {
            if (doneDates.get(i - 1).minusDays(1).equals(doneDates.get(i))) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 1;
            }
        }
        return longest;
    }

    private Dto.HabitEntryResponse toEntryResponse(HabitEntry entry) {
        return Dto.HabitEntryResponse.builder()
                .id(entry.getId())
                .habitId(entry.getHabit().getId())
                .date(entry.getDate())
                .status(entry.getStatus())
                .note(entry.getNote())
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }

    private Habit getHabitOfUser(UUID habitId, UUID userId) {
        return habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new AppException("Habit not found", HttpStatus.NOT_FOUND));
    }
}
