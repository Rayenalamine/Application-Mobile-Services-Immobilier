package com.darlink.service;

import com.darlink.dto.notification.NotificationDto;
import com.darlink.entity.NotificationEntity;
import com.darlink.entity.UserEntity;
import com.darlink.exception.ResourceNotFoundException;
import com.darlink.repository.NotificationRepository;
import com.darlink.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public NotificationDto createNotification(Long userId, String title, String body, String type, Long referenceId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'id " + userId));

        NotificationEntity entity = new NotificationEntity(user, title, body, type, referenceId);
        entity = notificationRepository.save(entity);
        return mapToDto(entity);
    }

    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnread(userId);
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId, Long userId) {
        NotificationEntity entity = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée"));

        if (!entity.getUser().getId().equals(userId)) {
            throw new RuntimeException("Accès non autorisé à cette notification.");
        }

        entity.setIsRead(true);
        entity = notificationRepository.save(entity);
        return mapToDto(entity);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<NotificationEntity> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (NotificationEntity n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }

    private NotificationDto mapToDto(NotificationEntity entity) {
        return new NotificationDto(
                entity.getId(),
                entity.getUser().getId(),
                entity.getTitle(),
                entity.getBody(),
                entity.getType(),
                entity.getReferenceId(),
                entity.getIsRead(),
                entity.getCreatedAt()
        );
    }
}
