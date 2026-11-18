package com.darlink.service;

import com.darlink.dto.property.CreatePropertyRequest;
import com.darlink.dto.property.PageResponse;
import com.darlink.dto.property.PropertyDto;
import com.darlink.entity.PropertyEntity;
import com.darlink.exception.ResourceNotFoundException;
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
import java.util.stream.Collectors;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public PageResponse<PropertyDto> getProperties(
            int page, int size, String city, String type,
            BigDecimal minPrice, BigDecimal maxPrice, String search
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<PropertyEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }

            if (type != null && !type.isBlank() && !type.equalsIgnoreCase("Tous")) {
                predicates.add(cb.equal(cb.lower(root.get("type")), type.trim().toLowerCase()));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate locLike = cb.like(cb.lower(root.get("location")), pattern);
                predicates.add(cb.or(titleLike, locLike));
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

    @Transactional
    public PropertyDto createProperty(CreatePropertyRequest req) {
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

        entity.setBedrooms(req.getBedrooms());
        entity.setBathrooms(req.getBathrooms());
        entity.setSurfaceM2(req.getSurfaceM2());
        entity.setYearBuilt(req.getYearBuilt());
        entity.setStanding(req.getStanding());
        entity.setIsRental(req.getIsRental() != null && req.getIsRental());

        if (req.getAmenities() != null && !req.getAmenities().isEmpty()) {
            entity.setAmenities(String.join(",", req.getAmenities()));
        }

        if (req.getAgentName() != null && !req.getAgentName().isBlank()) {
            entity.setAgentName(req.getAgentName().trim());
        }
        if (req.getAgentPhone() != null && !req.getAgentPhone().isBlank()) {
            entity.setAgentPhone(req.getAgentPhone().trim());
        }
        if (req.getLatitude() != null) {
            entity.setLatitude(req.getLatitude());
        }
        if (req.getLongitude() != null) {
            entity.setLongitude(req.getLongitude());
        }

        entity = propertyRepository.save(entity);
        return PropertyDto.fromEntity(entity);
    }
}
