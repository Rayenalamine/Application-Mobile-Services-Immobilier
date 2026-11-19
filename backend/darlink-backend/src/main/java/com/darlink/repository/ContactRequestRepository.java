package com.darlink.repository;

import com.darlink.entity.ContactRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequestEntity, Long> {
    List<ContactRequestEntity> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    List<ContactRequestEntity> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

    @Query("SELECT cr FROM ContactRequestEntity cr, PropertyEntity p WHERE cr.propertyId = p.id AND p.ownerId = :ownerId ORDER BY cr.createdAt DESC")
    List<ContactRequestEntity> findReceivedRequestsByOwnerId(@Param("ownerId") Long ownerId);
}
