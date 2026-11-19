package com.darlink.dto.property;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public class CreatePropertyRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotBlank(message = "La localisation est obligatoire")
    private String location;

    @NotBlank(message = "La ville est obligatoire")
    private String city;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être strictement positif")
    private BigDecimal price;

    @NotBlank(message = "Le type de bien est obligatoire")
    private String type;

    @NotBlank(message = "L'URL de l'image principale est obligatoire")
    private String imageUrl;

    private List<String> galleryUrls;

    @NotNull(message = "Le nombre de chambres est obligatoire")
    @Positive(message = "Le nombre de chambres doit être positif")
    private Integer bedrooms = 1;

    @NotNull(message = "Le nombre de salles de bain est obligatoire")
    @Positive(message = "Le nombre de salles de bain doit être positif")
    private Integer bathrooms = 1;

    @NotNull(message = "La surface est obligatoire")
    @Positive(message = "La surface doit être positive")
    private BigDecimal surfaceM2;

    private Integer yearBuilt = 2023;
    private String standing = "Haut Standing";
    private Boolean isRental = false;
    private List<String> amenities;
    private String agentName = "Sonia Ben Salem";
    private String agentPhone = "+216 71 888 999";
    private BigDecimal latitude = new BigDecimal("36.806500");
    private BigDecimal longitude = new BigDecimal("10.181500");

    public CreatePropertyRequest() {}

    // Getters and Setters
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
}

