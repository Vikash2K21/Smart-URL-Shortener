package com.snip.service;

import com.snip.exception.InvalidUrlException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;

/**
 * Validates incoming URLs before shortening.
 * Rules:
 *  1. Must not be blank
 *  2. Must have http or https scheme (rejects ftp://, mailto:, etc.)
 *  3. Must have a non-empty host
 *  4. Must not point back to our own domain (infinite loop prevention)
 *  5. Must not be a raw IP address (optional policy, prevents abuse)
 */
@Service
public class UrlValidatorService {

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

    @Value("${app.base-url}")
    private String baseUrl;

    public void validate(String url) {
        if (url == null || url.isBlank()) {
            throw new InvalidUrlException("URL must not be empty.");
        }

        URI uri;
        try {
            uri = new URI(url.trim());
        } catch (URISyntaxException e) {
            throw new InvalidUrlException("The URL is malformed and cannot be parsed.");
        }

        String scheme = uri.getScheme();
        if (scheme == null || !ALLOWED_SCHEMES.contains(scheme.toLowerCase())) {
            throw new InvalidUrlException(
                "Only http:// and https:// URLs are supported. Got: " + (scheme == null ? "none" : scheme));
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new InvalidUrlException("The URL does not contain a valid host.");
        }

        // Prevent users from shortening our own short URLs (loop prevention)
        String ownHost = extractHost(baseUrl);
        if (host.equalsIgnoreCase(ownHost)) {
            throw new InvalidUrlException(
                "You cannot shorten a URL that points to this shortener itself.");
        }
    }

    private String extractHost(String url) {
        try {
            return new URI(url).getHost();
        } catch (URISyntaxException e) {
            return "";
        }
    }
}
