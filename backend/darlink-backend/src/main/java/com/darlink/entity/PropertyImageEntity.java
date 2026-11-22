package com.darlink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "property_images")
public class PropertyImageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public PropertyImageEntity() {}

    public PropertyImageEntity(Long propertyId, String imageUrl, Boolean isPrimary) {
        this.propertyId = propertyId;
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary != null ? isPrimary : false;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean primary) { isPrimary = primary; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

