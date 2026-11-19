package com.darlink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "favorites", uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_property_favorite", columnNames = {"user_id", "property_id"})
})
public class FavoriteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id", nullable = false)
    private PropertyEntity property;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public FavoriteEntity() {}

    public FavoriteEntity(Long userId, PropertyEntity property) {
        this.userId = userId;
        this.property = property;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public PropertyEntity getProperty() { return property; }
    public void setProperty(PropertyEntity property) { this.property = property; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

