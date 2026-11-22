package com.darlink.dto.contact;

import com.darlink.entity.ContactRequestEntity;
import java.time.Instant;

public class ContactRequestDto {
    private Long id;
    private Long propertyId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderPhone;
    private String message;
    private String status;
    private Instant createdAt;

    public ContactRequestDto() {}

    public static ContactRequestDto fromEntity(ContactRequestEntity entity) {
        ContactRequestDto dto = new ContactRequestDto();
        dto.setId(entity.getId());
        dto.setPropertyId(entity.getPropertyId());
        dto.setSenderId(entity.getSenderId());
        dto.setSenderName(entity.getSenderName());
        dto.setSenderEmail(entity.getSenderEmail());
        dto.setSenderPhone(entity.getSenderPhone());
        dto.setMessage(entity.getMessage());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderPhone() { return senderPhone; }
    public void setSenderPhone(String senderPhone) { this.senderPhone = senderPhone; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

