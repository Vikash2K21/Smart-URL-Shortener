package com.snip.repository;

import com.snip.model.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UrlMappingRepository extends JpaRepository<UrlMapping, Long> {

    Optional<UrlMapping> findByShortCode(String shortCode);

    List<UrlMapping> findBySessionIdOrderByCreatedAtDesc(String sessionId);

    boolean existsByShortCode(String shortCode);

    // Atomic increment — prevents read-modify-write race condition on click counts.
    // Using SQL UPDATE ensures concurrent visitors never lose a click.
    @Modifying
    @Query("UPDATE UrlMapping u SET u.clickCount = u.clickCount + 1 WHERE u.shortCode = :shortCode")
    int incrementClickCount(@Param("shortCode") String shortCode);

    void deleteByShortCodeAndSessionId(String shortCode, String sessionId);
}
