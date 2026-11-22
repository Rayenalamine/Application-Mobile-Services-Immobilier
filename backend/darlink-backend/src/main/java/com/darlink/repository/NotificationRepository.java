package com.darlink.repository;

import com.darlink.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE n.user.id = :userId AND n.isRead = false")
    long countUnread(@Param("userId") Long userId);
}
