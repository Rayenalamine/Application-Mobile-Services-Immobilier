package com.darlink.service;

import com.darlink.dto.message.MessageDto;
import com.darlink.dto.message.SendMessageRequest;
import com.darlink.entity.MessageEntity;
import com.darlink.entity.PropertyEntity;
import com.darlink.entity.UserEntity;
import com.darlink.exception.ResourceNotFoundException;
import com.darlink.repository.MessageRepository;
import com.darlink.repository.PropertyRepository;
import com.darlink.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final NotificationService notificationService;

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            NotificationService notificationService
    ) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public MessageDto sendMessage(Long senderId, SendMessageRequest request) {
        UserEntity sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Expéditeur non trouvé."));

        UserEntity receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Destinataire non trouvé."));

        PropertyEntity property = null;
        if (request.getPropertyId() != null) {
            property = propertyRepository.findById(request.getPropertyId()).orElse(null);
        }

        MessageEntity message = new MessageEntity(sender, receiver, property, request.getContent().trim());
        message = messageRepository.save(message);

        // Déclencher une notification automatique pour le destinataire
        String preview = message.getContent().length() > 50
                ? message.getContent().substring(0, 47) + "..."
                : message.getContent();
        notificationService.createNotification(
                receiver.getId(),
                "Nouveau message de " + sender.getFullName(),
                preview,
                "MESSAGE",
                message.getId()
        );

        return mapToDto(message);
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getConversation(Long userId, Long contactId) {
        return messageRepository.findConversation(userId, contactId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markConversationAsRead(Long userId, Long contactId) {
        List<MessageEntity> messages = messageRepository.findConversation(userId, contactId);
        for (MessageEntity m : messages) {
            if (m.getReceiver().getId().equals(userId) && !m.getIsRead()) {
                m.setIsRead(true);
            }
        }
        messageRepository.saveAll(messages);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecentConversations(Long userId) {
        List<MessageEntity> all = messageRepository.findAllUserMessages(userId);
        Map<Long, MessageEntity> latestPerContact = new LinkedHashMap<>();

        for (MessageEntity m : all) {
            Long contactId = m.getSender().getId().equals(userId)
                    ? m.getReceiver().getId()
                    : m.getSender().getId();

            if (!latestPerContact.containsKey(contactId)) {
                latestPerContact.put(contactId, m);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, MessageEntity> entry : latestPerContact.entrySet()) {
            Long contactId = entry.getKey();
            MessageEntity lastMsg = entry.getValue();
            UserEntity contact = lastMsg.getSender().getId().equals(userId)
                    ? lastMsg.getReceiver()
                    : lastMsg.getSender();

            long unread = all.stream()
                    .filter(m -> m.getSender().getId().equals(contactId) && m.getReceiver().getId().equals(userId) && !m.getIsRead())
                    .count();

            Map<String, Object> map = new HashMap<>();
            map.put("contactId", contact.getId());
            map.put("contactName", contact.getFullName());
            map.put("contactRole", contact.getRole());
            map.put("lastMessage", lastMsg.getContent());
            map.put("lastMessageDate", lastMsg.getCreatedAt());
            map.put("unreadCount", unread);
            if (lastMsg.getProperty() != null) {
                map.put("propertyId", lastMsg.getProperty().getId());
                map.put("propertyTitle", lastMsg.getProperty().getTitle());
            }
            result.add(map);
        }

        return result;
    }

    public long getUnreadMessagesCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    private MessageDto mapToDto(MessageEntity m) {
        return new MessageDto(
                m.getId(),
                m.getSender().getId(),
                m.getSender().getFullName(),
                m.getReceiver().getId(),
                m.getReceiver().getFullName(),
                m.getProperty() != null ? m.getProperty().getId() : null,
                m.getProperty() != null ? m.getProperty().getTitle() : null,
                m.getContent(),
                m.getIsRead(),
                m.getCreatedAt()
        );
    }
}
