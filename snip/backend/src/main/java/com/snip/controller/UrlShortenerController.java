package com.snip.controller;

import com.snip.dto.ShortenRequest;
import com.snip.dto.ShortenResponse;
import com.snip.service.QRCodeService;
import com.snip.service.RateLimiterService;
import com.snip.service.UrlShortenerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UrlShortenerController {

    private final UrlShortenerService service;
    private final RateLimiterService rateLimiter;
    private final QRCodeService qrCodeService;

    public UrlShortenerController(
            UrlShortenerService service,
            RateLimiterService rateLimiter,
            QRCodeService qrCodeService) {
        this.service = service;
        this.rateLimiter = rateLimiter;
        this.qrCodeService = qrCodeService;
    }

    // POST /api/shorten
    @PostMapping("/shorten")
    public ResponseEntity<ShortenResponse> shorten(
            @Valid @RequestBody ShortenRequest request,
            @RequestHeader(value = "X-Session-Id", defaultValue = "anonymous") String sessionId,
            HttpServletRequest httpRequest) {

        String clientKey = resolveClientIp(httpRequest) + ":" + sessionId;
        rateLimiter.checkLimit(clientKey);
        ShortenResponse response = service.shorten(request, sessionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/urls
    @GetMapping("/urls")
    public ResponseEntity<List<ShortenResponse>> listUrls(
            @RequestHeader(value = "X-Session-Id", defaultValue = "anonymous") String sessionId) {
        return ResponseEntity.ok(service.listBySession(sessionId));
    }

    // GET /api/resolve/{shortCode}
    @GetMapping("/resolve/{shortCode}")
    public ResponseEntity<ShortenResponse> resolve(@PathVariable String shortCode) {
        String originalUrl = service.resolve(shortCode);
        ShortenResponse resp = new ShortenResponse(shortCode, null, originalUrl, 0, null);
        return ResponseEntity.ok(resp);
    }

    // DELETE /api/urls/{shortCode}
    @DeleteMapping("/urls/{shortCode}")
    public ResponseEntity<Void> delete(
            @PathVariable String shortCode,
            @RequestHeader(value = "X-Session-Id", defaultValue = "anonymous") String sessionId) {
        service.delete(shortCode, sessionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/qr/{shortCode}
     *
     * Returns a PNG QR code image for the short URL.
     *
     * How it works:
     *  1. Get the full short URL string from service
     *  2. Pass it to QRCodeService which uses ZXing to encode as PNG
     *  3. Return raw PNG bytes with Content-Type: image/png
     *
     * Frontend displays it simply with:
     *   <img src="https://backend.com/api/qr/abc123" />
     */
    @GetMapping("/qr/{shortCode}")
    public ResponseEntity<byte[]> getQRCode(@PathVariable String shortCode) {
        try {
            String shortUrl = service.getShortUrl(shortCode);
            byte[] qrBytes = qrCodeService.generateQRCode(shortUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(qrBytes.length);
            headers.setCacheControl("public, max-age=3600");

            return new ResponseEntity<>(qrBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            // Log exact error so we can see it in Render logs
            System.err.println("QR generation failed for code: " + shortCode);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Root health check
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        return ResponseEntity.ok(Map.of(
            "app", "Snip — Smart URL Shortener",
            "status", "running",
            "version", "1.0.0"
        ));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
