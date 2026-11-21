package com.darlink.controller;

import com.darlink.dto.message.MessageDto;
import com.darlink.dto.message.SendMessageRequest;
import com.darlink.exception.ForbiddenException;
import com.darlink.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/messages")
@Tag(name = "Messages", description = "Messagerie instantanée entre utilisateurs et propriétaires (V9)")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    private Long resolveUserId(Authentication auth) {
        if (auth != null && auth.getDetails() instanceof Long) {
            return (Long) auth.getDetails();
        }
        throw new ForbiddenException("Authentification requise pour la messagerie.");
    }

    @PostMapping
    @Operation(summary = "Envoyer un message à un autre utilisateur")
    public ResponseEntity<MessageDto> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            Authentication auth
    ) {
        Long senderId = resolveUserId(auth);
        MessageDto created = messageService.sendMessage(senderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/conversations")
    @Operation(summary = "Lister les conversations récentes avec dernier message et messages non lus")
    public ResponseEntity<List<Map<String, Object>>> getRecentConversations(Authentication auth) {
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(messageService.getRecentConversations(userId));
    }

    @GetMapping("/conversation/{contactId}")
    @Operation(summary = "Obtenir l'historique de discussion avec un utilisateur donné")
    public ResponseEntity<List<MessageDto>> getConversation(
            @PathVariable Long contactId,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(messageService.getConversation(userId, contactId));
    }

    @PatchMapping("/conversation/{contactId}/read")
    @Operation(summary = "Marquer les messages reçus d'un contact comme lus")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long contactId,
            Authentication auth
    ) {
        Long userId = resolveUserId(auth);
        messageService.markConversationAsRead(userId, contactId);
        return ResponseEntity.ok(Map.of("message", "Conversation marquée comme lue."));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Obtenir le nombre total de messages non lus")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long userId = resolveUserId(auth);
        return ResponseEntity.ok(Map.of("unreadCount", messageService.getUnreadMessagesCount(userId)));
    }
}
