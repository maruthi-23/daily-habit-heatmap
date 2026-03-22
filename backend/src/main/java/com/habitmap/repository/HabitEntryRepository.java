package com.habitmap.repository;

import com.habitmap.entity.HabitEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HabitEntryRepository extends JpaRepository<HabitEntry, UUID> {

    Optional<HabitEntry> findByHabitIdAndDate(UUID habitId, LocalDate date);

    List<HabitEntry> findByHabitIdAndDateBetweenOrderByDateAsc(UUID habitId, LocalDate from, LocalDate to);

    @Query("""
        SELECT e FROM HabitEntry e
        WHERE e.habit.user.id = :userId
          AND e.date BETWEEN :from AND :to
          AND e.status = 'DONE'
        ORDER BY e.date ASC
    """)
    List<HabitEntry> findAllDoneEntriesByUserAndDateRange(UUID userId, LocalDate from, LocalDate to);

    @Query("""
        SELECT DISTINCT e.date FROM HabitEntry e
        WHERE e.habit.id = :habitId
          AND e.status = 'DONE'
          AND e.date <= :date
        ORDER BY e.date DESC
    """)
    List<LocalDate> findDoneDatesByHabitIdBeforeOrOn(UUID habitId, LocalDate date);

    @Query("""
        SELECT COUNT(DISTINCT e.date) FROM HabitEntry e
        WHERE e.habit.user.id = :userId
          AND e.date = :date
          AND e.status = 'DONE'
    """)
    long countCompletedHabitsByUserAndDate(UUID userId, LocalDate date);

    boolean existsByHabitIdAndDate(UUID habitId, LocalDate date);
}
