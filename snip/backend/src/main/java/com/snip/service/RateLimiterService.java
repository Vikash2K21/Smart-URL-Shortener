package com.snip.service;

import com.snip.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sliding-window rate limiter implemented from scratch.
 *
 * Data structure:
 *   ConcurrentHashMap<clientKey, Deque<Instant>>
 *   - One entry per client (IP or sessionId).
 *   - The Deque holds timestamps of recent requests within the current window.
 *
 * Algorithm (per request):
 *   1. Compute the cutoff = now - windowSeconds.
 *   2. Poll timestamps from the FRONT of the deque while they are older than cutoff.
 *      (The deque is ordered oldest-first, so this is O(evictions).)
 *   3. If remaining count >= maxRequests → throw RateLimitExceededException (HTTP 429).
 *   4. Otherwise, add current timestamp to the BACK and allow the request.
 *
 * Thread safety:
 *   - ConcurrentHashMap.computeIfAbsent is atomic at the map level (one Deque per key).
 *   - synchronized(deque) makes the evict→check→add sequence atomic per client.
 *   - Different clients never contend with each other.
 *
 * Limitations (honest):
 *   - State is in-memory: a server restart resets all counters.
 *   - Does not work across multiple server instances (need Redis for distributed limiting).
 *   - No cleanup of idle keys: memory grows with unique IPs. A Caffeine cache with TTL
 *     would fix this in production.
 */
@Service
public class RateLimiterService {

    @Value("${app.rate-limit.max-requests:5}")
    private int maxRequests;

    @Value("${app.rate-limit.window-seconds:60}")
    private long windowSeconds;

    // One deque per client. ConcurrentHashMap ensures safe concurrent map access.
    private final ConcurrentHashMap<String, Deque<Instant>> store = new ConcurrentHashMap<>();

    /**
     * Call this before processing a shorten request.
     * Throws RateLimitExceededException if the client has exceeded the limit.
     *
     * @param clientKey IP address or session ID identifying the client
     */
    public void checkLimit(String clientKey) {
        Deque<Instant> timestamps = store.computeIfAbsent(clientKey, k -> new ArrayDeque<>());

        // Synchronize on the deque itself so the evict→count→add is atomic per client.
        // Different clients get different deques, so they never block each other.
        synchronized (timestamps) {
            Instant cutoff = Instant.now().minusSeconds(windowSeconds);

            // Evict timestamps that have slid outside the window
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                throw new RateLimitExceededException();
            }

            timestamps.addLast(Instant.now());
        }
    }

    /** Exposed for testing — allows inspecting current window size for a key. */
    public int currentWindowCount(String clientKey) {
        Deque<Instant> timestamps = store.get(clientKey);
        if (timestamps == null) return 0;
        synchronized (timestamps) {
            Instant cutoff = Instant.now().minusSeconds(windowSeconds);
            return (int) timestamps.stream().filter(t -> t.isAfter(cutoff)).count();
        }
    }
}
