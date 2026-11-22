package com.darlink.controller;

import com.darlink.dto.notification.NotificationDto;
import com.darlink.exception.ForbiddenException;
import com.darlink.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Notifications in-app et alertes (V9/V10)")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private Long resolveUserId(Authentication auth) {
        if (auth != null && auth.getDetails() instanceof Long) {
            return (Long) auth.getDetails();
        }
        throw new ForbiddenException("Authentification requise pour les notifications.");
    }

    @GetMapping
    @Operation(summary = "Lister les notifications de l'utilisateur connecté")
    public ResponseEntity<List<NotificationDto>> getNotifications(Authentication auth) {
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Obtenir le nombre de notifications non lues")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Marquer une notification comme lue")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable Long id,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Marquer toutes les notifications comme lues")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication auth) {
        Long userId = resolveUserId(auth);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "Toutes les notifications sont marquées comme lues."));
    }
}
