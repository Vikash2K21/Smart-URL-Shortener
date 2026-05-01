package com.snip.controller;

import com.snip.dto.ShortenRequest;
import com.snip.dto.ShortenResponse;
import com.snip.service.RateLimiterService;
import com.snip.service.UrlShortenerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Thin controller — extracts HTTP concerns (IP, session header) and delegates
 * all business logic to UrlShortenerService. No DB calls here.
 */
@RestController
@RequestMapping("/api")
public class UrlShortenerController {

    private final UrlShortenerService service;
    private final RateLimiterService rateLimiter;

    public UrlShortenerController(UrlShortenerService service, RateLimiterService rateLimiter) {
        this.service = service;
        this.rateLimiter = rateLimiter;
    }

    /**
     * POST /api/shorten
     * Body: { "url": "https://...", "customCode": "optional" }
     * Header: X-Session-Id (UUID from frontend localStorage)
     */
    @PostMapping("/shorten")
    public ResponseEntity<ShortenResponse> shorten(
            @Valid @RequestBody ShortenRequest request,
            @RequestHeader(value = "X-Session-Id", defaultValue = "anonymous") String sessionId,
            HttpServletRequest httpRequest) {

        // Rate limit by IP + session so both proxied clients and direct clients are limited
        String clientKey = resolveClientIp(httpRequest) + ":" + sessionId;
        rateLimiter.checkLimit(clientKey);

        ShortenResponse response = service.shorten(request, sessionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/urls
     * Returns all URLs shortened in the current session, newest first.
     */
    @GetMapping("/urls")
    public ResponseEntity<List<ShortenResponse>> listUrls(
            @RequestHeader(value = "X-Session-Id", defaultValue = "anonymous") String sessionId) {
        return ResponseEntity.ok(service.listBySession(sessionId));
    }

    /**
     * GET /api/resolve/{shortCode}
     * Increments click count and returns the original URL.
     * The Next.js frontend calls this to do the client-side redirect.
     */
    @GetMapping("/resolve/{shortCode}")
    public ResponseEntity<ShortenResponse> resolve(@PathVariable String shortCode) {
        String originalUrl = service.resolve(shortCode);
        ShortenResponse resp = new ShortenResponse(shortCode, null, originalUrl, 0, null);
        return ResponseEntity.ok(resp);
    }

    /**
     * DELETE /api/urls/{shortCode}
     * Only deletes if the mapping belongs to the requesting session.
     */
    @DeleteMapping("/urls/{shortCode}")
    public ResponseEntity<Void> delete(
            @PathVariable String shortCode,
            @RequestHeader(value = "X-Session-Id", defaultValue = "anonymous") String sessionId) {
        service.delete(shortCode, sessionId);
        return ResponseEntity.noContent().build();
    }

    // Extract real client IP, respecting common reverse-proxy headers
    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
