package com.darlink.service;

import com.darlink.dto.property.CreatePropertyRequest;
import com.darlink.dto.property.PageResponse;
import com.darlink.dto.property.PropertyDto;
import com.darlink.dto.property.UpdatePropertyRequest;
import com.darlink.entity.PropertyEntity;
import com.darlink.entity.PropertyImageEntity;
import com.darlink.exception.ForbiddenException;
import com.darlink.exception.ResourceNotFoundException;
import com.darlink.repository.PropertyImageRepository;
import com.darlink.repository.PropertyRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.darlink.repository.UserRepository;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final UserRepository userRepository;

    public PropertyService(
            PropertyRepository propertyRepository,
            PropertyImageRepository propertyImageRepository,
            UserRepository userRepository
    ) {
        this.propertyRepository = propertyRepository;
        this.propertyImageRepository = propertyImageRepository;
        this.userRepository = userRepository;
    }

    public PageResponse<PropertyDto> getProperties(
            int page, int size, String city, String type, Boolean isRental,
            BigDecimal minPrice, BigDecimal maxPrice, Integer minBedrooms,
            String search, String sort
    ) {
        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "price_asc":
                    sortObj = Sort.by(Sort.Direction.ASC, "price");
                    break;
                case "price_desc":
                    sortObj = Sort.by(Sort.Direction.DESC, "price");
                    break;
                case "date_asc":
                    sortObj = Sort.by(Sort.Direction.ASC, "createdAt");
                    break;
                case "date_desc":
                default:
                    sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
                    break;
            }
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);

        Specification<PropertyEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (city != null && !city.isBlank() && !city.equalsIgnoreCase("Toutes")) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }

            if (type != null && !type.isBlank() && !type.equalsIgnoreCase("Tous")) {
                predicates.add(cb.equal(cb.lower(root.get("type")), type.trim().toLowerCase()));
            }

            if (isRental != null) {
                predicates.add(cb.equal(root.get("isRental"), isRental));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (minBedrooms != null && minBedrooms > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bedrooms"), minBedrooms));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate locLike = cb.like(cb.lower(root.get("location")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleLike, locLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PropertyEntity> entityPage = propertyRepository.findAll(spec, pageable);
        Page<PropertyDto> dtoPage = entityPage.map(PropertyDto::fromEntity);
        return new PageResponse<>(dtoPage);
    }

    public PropertyDto getPropertyById(Long id) {
        PropertyEntity entity = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun bien immobilier trouvé avec l'identifiant " + id + "."));
        return PropertyDto.fromEntity(entity);
    }

    public List<PropertyDto> getMapProperties() {
        return propertyRepository.findAll().stream()
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PropertyDto> getUserProperties(Long userId) {
        return propertyRepository.findByOwnerIdOrderByCreatedAtDesc(userId).stream()
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PropertyDto createProperty(CreatePropertyRequest req, Long ownerId) {
        PropertyEntity entity = new PropertyEntity();
        entity.setTitle(req.getTitle().trim());
        entity.setDescription(req.getDescription().trim());
        entity.setLocation(req.getLocation().trim());
        entity.setCity(req.getCity().trim());
        entity.setPrice(req.getPrice());
        entity.setType(req.getType().trim());
        entity.setImageUrl(req.getImageUrl().trim());

        if (req.getGalleryUrls() != null && !req.getGalleryUrls().isEmpty()) {
            entity.setGalleryUrls(String.join(",", req.getGalleryUrls()));
        }

        entity.setBedrooms(req.getBedrooms() != null ? req.getBedrooms() : 1);
        entity.setBathrooms(req.getBathrooms() != null ? req.getBathrooms() : 1);
        entity.setSurfaceM2(req.getSurfaceM2());
        entity.setYearBuilt(req.getYearBuilt());
        entity.setStanding(req.getStanding());
        entity.setIsRental(req.getIsRental() != null && req.getIsRental());

        if (req.getAmenities() != null && !req.getAmenities().isEmpty()) {
            entity.setAmenities(String.join(",", req.getAmenities()));
        }

        String agentName = "Propriétaire";
        if (req.getAgentName() != null && !req.getAgentName().isBlank()) {
            agentName = req.getAgentName().trim();
        } else if (ownerId != null) {
            agentName = userRepository.findById(ownerId)
                    .map(com.darlink.entity.UserEntity::getFullName)
                    .orElse("Propriétaire");
        }
        entity.setAgentName(agentName);

        String agentPhone = null;
        if (req.getAgentPhone() != null && !req.getAgentPhone().isBlank()) {
            agentPhone = req.getAgentPhone().trim();
        } else if (ownerId != null) {
            agentPhone = userRepository.findById(ownerId)
                    .map(com.darlink.entity.UserEntity::getPhone)
                    .filter(p -> p != null && !p.isBlank())
                    .orElse(null);
        }
        if (agentPhone == null || agentPhone.isBlank() || agentPhone.contains("888 999")) {
            agentPhone = "+216 71 999 888";
        }
        entity.setAgentPhone(agentPhone);
        if (req.getLatitude() != null) {
            entity.setLatitude(req.getLatitude());
        }
        if (req.getLongitude() != null) {
            entity.setLongitude(req.getLongitude());
        }

        entity.setOwnerId(ownerId != null ? ownerId : 1L);

        PropertyEntity saved = propertyRepository.save(entity);
        return PropertyDto.fromEntity(saved);
    }

    @Transactional
    public PropertyDto updateProperty(Long id, UpdatePropertyRequest req, Long userId) {
        PropertyEntity entity = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun bien immobilier trouvé avec l'identifiant " + id + "."));

        // Vérification stricte de la propriété
        if (entity.getOwnerId() == null || userId == null || !entity.getOwnerId().equals(userId)) {
            throw new ForbiddenException("Action refusée : vous n'êtes pas le propriétaire de ce bien immobilier.");
        }

        entity.setTitle(req.getTitle().trim());
        entity.setDescription(req.getDescription().trim());
        entity.setLocation(req.getLocation().trim());
        entity.setCity(req.getCity().trim());
        entity.setPrice(req.getPrice());
        entity.setType(req.getType().trim());

        if (req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
            entity.setImageUrl(req.getImageUrl().trim());
        }

        if (req.getGalleryUrls() != null && !req.getGalleryUrls().isEmpty()) {
            entity.setGalleryUrls(String.join(",", req.getGalleryUrls()));
        }

        if (req.getBedrooms() != null) entity.setBedrooms(req.getBedrooms());
        if (req.getBathrooms() != null) entity.setBathrooms(req.getBathrooms());
        if (req.getSurfaceM2() != null) entity.setSurfaceM2(req.getSurfaceM2());
        if (req.getYearBuilt() != null) entity.setYearBuilt(req.getYearBuilt());
        if (req.getStanding() != null) entity.setStanding(req.getStanding());
        if (req.getIsRental() != null) entity.setIsRental(req.getIsRental());

        if (req.getAmenities() != null) {
            entity.setAmenities(String.join(",", req.getAmenities()));
        }
        if (req.getLatitude() != null) entity.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) entity.setLongitude(req.getLongitude());

        entity = propertyRepository.save(entity);
        return PropertyDto.fromEntity(entity);
    }

    @Transactional
    public void deleteProperty(Long id, Long userId) {
        PropertyEntity entity = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun bien immobilier trouvé avec l'identifiant " + id + "."));

        // Vérification stricte de la propriété
        if (entity.getOwnerId() == null || userId == null || !entity.getOwnerId().equals(userId)) {
            throw new ForbiddenException("Action refusée : vous n'êtes pas le propriétaire de ce bien immobilier.");
        }

        propertyRepository.delete(entity);
    }

    @Transactional
    public PropertyImageEntity addImage(Long propertyId, String imageUrl, Boolean isPrimary, Long userId) {
        PropertyEntity entity = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun bien immobilier trouvé avec l'identifiant " + propertyId + "."));

        if (entity.getOwnerId() != null && userId != null && !entity.getOwnerId().equals(userId)) {
            throw new ForbiddenException("Action refusée : vous ne pouvez pas ajouter d'image à ce bien.");
        }

        PropertyImageEntity img = new PropertyImageEntity(propertyId, imageUrl, isPrimary);
        return propertyImageRepository.save(img);
    }

    @Transactional
    public void deleteImage(Long propertyId, Long imageId, Long userId) {
        PropertyEntity entity = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun bien immobilier trouvé avec l'identifiant " + propertyId + "."));

        if (entity.getOwnerId() != null && userId != null && !entity.getOwnerId().equals(userId)) {
            throw new ForbiddenException("Action refusée : vous ne pouvez pas supprimer d'image de ce bien.");
        }

        propertyImageRepository.deleteById(imageId);
    }

    public List<PropertyImageEntity> getPropertyImages(Long propertyId) {
        return propertyImageRepository.findByPropertyId(propertyId);
    }
}
