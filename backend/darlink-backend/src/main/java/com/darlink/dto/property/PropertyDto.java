package com.darlink.dto.property;

import com.darlink.entity.PropertyEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class PropertyDto {
    private Long id;
    private Long ownerId;
    private String title;
    private String description;
    private String location;
    private String city;
    private BigDecimal price;
    private String type;
    private String imageUrl;
    private List<String> galleryUrls;
    private Integer bedrooms;
    private Integer bathrooms;
    private BigDecimal surfaceM2;
    private Integer yearBuilt;
    private String standing;
    private Boolean isRental;
    private List<String> amenities;
    private String agentName;
    private String agentPhone;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Instant createdAt;

    public PropertyDto() {}

    public static PropertyDto fromEntity(PropertyEntity entity) {
        PropertyDto dto = new PropertyDto();
        dto.setId(entity.getId());
        dto.setOwnerId(entity.getOwnerId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setLocation(entity.getLocation());
        dto.setCity(entity.getCity());
        dto.setPrice(entity.getPrice());
        dto.setType(entity.getType());
        dto.setImageUrl(entity.getImageUrl());
        if (entity.getGalleryUrls() != null && !entity.getGalleryUrls().isBlank()) {
            dto.setGalleryUrls(Arrays.asList(entity.getGalleryUrls().split(",")));
        } else {
            dto.setGalleryUrls(Collections.emptyList());
        }
        dto.setBedrooms(entity.getBedrooms());
        dto.setBathrooms(entity.getBathrooms());
        dto.setSurfaceM2(entity.getSurfaceM2());
        dto.setYearBuilt(entity.getYearBuilt());
        dto.setStanding(entity.getStanding());
        dto.setIsRental(entity.getIsRental());
        if (entity.getAmenities() != null && !entity.getAmenities().isBlank()) {
            dto.setAmenities(Arrays.asList(entity.getAmenities().split(",")));
        } else {
            dto.setAmenities(Collections.emptyList());
        }
        dto.setAgentName(entity.getAgentName());
        dto.setAgentPhone(entity.getAgentPhone());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<String> getGalleryUrls() { return galleryUrls; }
    public void setGalleryUrls(List<String> galleryUrls) { this.galleryUrls = galleryUrls; }

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }

    public BigDecimal getSurfaceM2() { return surfaceM2; }
    public void setSurfaceM2(BigDecimal surfaceM2) { this.surfaceM2 = surfaceM2; }

    public Integer getYearBuilt() { return yearBuilt; }
    public void setYearBuilt(Integer yearBuilt) { this.yearBuilt = yearBuilt; }

    public String getStanding() { return standing; }
    public void setStanding(String standing) { this.standing = standing; }

    public Boolean getIsRental() { return isRental; }
    public void setIsRental(Boolean rental) { isRental = rental; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getAgentPhone() { return agentPhone; }
    public void setAgentPhone(String agentPhone) { this.agentPhone = agentPhone; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

