package com.snip;

import com.snip.exception.RateLimitExceededException;
import com.snip.service.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class RateLimiterServiceTest {

    @Autowired
    private RateLimiterService rateLimiter;

    private String clientKey;

    @BeforeEach
    void setUp() {
        // Fresh key per test so tests are fully independent
        clientKey = "test-ip:" + UUID.randomUUID();
    }

    @Test
    void firstFiveRequests_areAllowed() {
        for (int i = 0; i < 5; i++) {
            assertThatNoException().isThrownBy(() -> rateLimiter.checkLimit(clientKey));
        }
    }

    @Test
    void sixthRequest_throwsRateLimitException() {
        for (int i = 0; i < 5; i++) {
            rateLimiter.checkLimit(clientKey);
        }
        assertThatThrownBy(() -> rateLimiter.checkLimit(clientKey))
            .isInstanceOf(RateLimitExceededException.class)
            .hasMessageContaining("Too many requests");
    }

    @Test
    void differentClients_areIndependent() {
        String clientA = "ip-a:" + UUID.randomUUID();
        String clientB = "ip-b:" + UUID.randomUUID();

        // Exhaust client A's quota
        for (int i = 0; i < 5; i++) {
            rateLimiter.checkLimit(clientA);
        }
        assertThatThrownBy(() -> rateLimiter.checkLimit(clientA))
            .isInstanceOf(RateLimitExceededException.class);

        // Client B should still be fine
        assertThatNoException().isThrownBy(() -> rateLimiter.checkLimit(clientB));
    }
}
