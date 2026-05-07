package com.snip.service;

import com.snip.dto.ShortenRequest;
import com.snip.dto.ShortenResponse;
import com.snip.exception.CustomCodeConflictException;
import com.snip.exception.ShortCodeNotFoundException;
import com.snip.model.UrlMapping;
import com.snip.repository.UrlMappingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core business logic for URL shortening.
 *
 * Concurrency safety:
 *   Short codes are randomly generated from a 54-char alphabet at 6 chars
 *   (~24 billion combinations). After generating a candidate code, we INSERT
 *   a new row. The short_code column has a UNIQUE constraint, so if two
 *   concurrent requests generate the same code, only one INSERT succeeds;
 *   the other throws DataIntegrityViolationException. We catch that and retry
 *   up to MAX_RETRIES times with a fresh code.
 */
@Service
public class UrlShortenerService {

    private static final String ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final int MAX_RETRIES = 5;

    private final UrlMappingRepository repository;
    private final UrlValidatorService validator;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.base-url}")
    private String baseUrl;

    public UrlShortenerService(UrlMappingRepository repository, UrlValidatorService validator) {
        this.repository = repository;
        this.validator = validator;
    }

    @Transactional
    public ShortenResponse shorten(ShortenRequest request, String sessionId) {
        validator.validate(request.getUrl());

        String customCode = request.getCustomCode();
        if (customCode != null && !customCode.isBlank()) {
            return shortenWithCustomCode(request.getUrl().trim(), customCode.trim(), sessionId);
        }
        return shortenWithGeneratedCode(request.getUrl().trim(), sessionId);
    }

    private ShortenResponse shortenWithCustomCode(String url, String code, String sessionId) {
        if (!code.matches("^[a-zA-Z0-9_-]{3,20}$")) {
            throw new com.snip.exception.InvalidUrlException(
                "Custom code must be 3–20 characters and contain only letters, numbers, hyphens, or underscores.");
        }
        if (repository.existsByShortCode(code)) {
            throw new CustomCodeConflictException(code);
        }
        UrlMapping mapping = new UrlMapping(url, code, sessionId);
        mapping = repository.save(mapping);
        return toResponse(mapping);
    }

    private ShortenResponse shortenWithGeneratedCode(String url, String sessionId) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            String code = generateCode();
            try {
                UrlMapping mapping = new UrlMapping(url, code, sessionId);
                mapping = repository.save(mapping);
                return toResponse(mapping);
            } catch (DataIntegrityViolationException e) {
                if (attempt == MAX_RETRIES) {
                    throw new RuntimeException(
                        "Could not generate a unique short code after " + MAX_RETRIES + " attempts.", e);
                }
            }
        }
        throw new RuntimeException("Unexpected: retry loop exited without returning.");
    }

    @Transactional
    public String resolve(String shortCode) {
        int updated = repository.incrementClickCount(shortCode);
        if (updated == 0) {
            throw new ShortCodeNotFoundException(shortCode);
        }
        return repository.findByShortCode(shortCode)
            .orElseThrow(() -> new ShortCodeNotFoundException(shortCode))
            .getOriginalUrl();
    }

    @Transactional(readOnly = true)
    public List<ShortenResponse> listBySession(String sessionId) {
        return repository.findBySessionIdOrderByCreatedAtDesc(sessionId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public void delete(String shortCode, String sessionId) {
        repository.deleteByShortCodeAndSessionId(shortCode, sessionId);
    }

    /**
     * Returns the full short URL for a given short code.
     * Used by the QR code endpoint to know what URL to encode into the QR image.
     */
    @Transactional(readOnly = true)
    public String getShortUrl(String shortCode) {
        repository.findByShortCode(shortCode)
            .orElseThrow(() -> new ShortCodeNotFoundException(shortCode));
        return baseUrl + "/" + shortCode;
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    private ShortenResponse toResponse(UrlMapping m) {
        return new ShortenResponse(
            m.getShortCode(),
            baseUrl + "/" + m.getShortCode(),
            m.getOriginalUrl(),
            m.getClickCount(),
            m.getCreatedAt()
        );
    }
}
