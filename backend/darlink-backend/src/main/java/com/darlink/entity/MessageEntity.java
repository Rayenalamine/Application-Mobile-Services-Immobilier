package com.darlink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private UserEntity sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id", nullable = false)
    private UserEntity receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private PropertyEntity property;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public MessageEntity() {}

    public MessageEntity(UserEntity sender, UserEntity receiver, PropertyEntity property, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.property = property;
        this.content = content;
        this.isRead = false;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserEntity getSender() { return sender; }
    public void setSender(UserEntity sender) { this.sender = sender; }

    public UserEntity getReceiver() { return receiver; }
    public void setReceiver(UserEntity receiver) { this.receiver = receiver; }

    public PropertyEntity getProperty() { return property; }
    public void setProperty(PropertyEntity property) { this.property = property; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
