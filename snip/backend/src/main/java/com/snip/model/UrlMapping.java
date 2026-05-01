package com.snip.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
    name = "url_mappings",
    indexes = {
        @Index(name = "idx_short_code", columnList = "short_code"),
        @Index(name = "idx_session_id", columnList = "session_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class UrlMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_url", nullable = false, length = 2048)
    private String originalUrl;

    // UNIQUE constraint is the DB-level guard against duplicate short codes
    // under concurrent inserts — see UrlShortenerService for retry logic
    @Column(name = "short_code", nullable = false, unique = true, length = 10)
    private String shortCode;

    @Column(name = "session_id", nullable = false, length = 128)
    private String sessionId;

    @Column(name = "click_count", nullable = false)
    private long clickCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public UrlMapping(String originalUrl, String shortCode, String sessionId) {
        this.originalUrl = originalUrl;
        this.shortCode = shortCode;
        this.sessionId = sessionId;
    }
}
