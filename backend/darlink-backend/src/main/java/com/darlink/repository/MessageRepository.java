package com.darlink.repository;

import com.darlink.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, Long> {

    @Query("SELECT m FROM MessageEntity m WHERE " +
           "(m.sender.id = :userId AND m.receiver.id = :contactId) OR " +
           "(m.sender.id = :contactId AND m.receiver.id = :userId) " +
           "ORDER BY m.createdAt ASC")
    List<MessageEntity> findConversation(@Param("userId") Long userId, @Param("contactId") Long contactId);

    @Query("SELECT m FROM MessageEntity m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.createdAt DESC")
    List<MessageEntity> findAllUserMessages(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM MessageEntity m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") Long userId);
}
