package com.darlink.repository;

import com.darlink.entity.PropertyImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImageEntity, Long> {
    List<PropertyImageEntity> findByPropertyId(Long propertyId);
    void deleteByPropertyId(Long propertyId);
}

