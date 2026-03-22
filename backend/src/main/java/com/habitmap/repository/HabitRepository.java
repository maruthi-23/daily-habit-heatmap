package com.habitmap.repository;

import com.habitmap.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HabitRepository extends JpaRepository<Habit, UUID> {
    List<Habit> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(UUID userId);

    Optional<Habit> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COUNT(h) FROM Habit h WHERE h.user.id = :userId AND h.isActive = true")
    long countActiveHabitsByUserId(UUID userId);
}
