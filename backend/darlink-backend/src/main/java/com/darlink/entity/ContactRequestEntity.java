package com.darlink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "contact_requests")
public class ContactRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "sender_id")
    private Long senderId;

    @Column(name = "sender_name", nullable = false, length = 120)
    private String senderName;

    @Column(name = "sender_email", nullable = false, length = 150)
    private String senderEmail;

    @Column(name = "sender_phone", length = 30)
    private String senderPhone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 30)
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public ContactRequestEntity() {}

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

