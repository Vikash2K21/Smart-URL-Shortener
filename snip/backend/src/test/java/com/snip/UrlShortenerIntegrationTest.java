package com.snip;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.snip.dto.ShortenRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UrlShortenerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private final String SESSION = "test-session-" + UUID.randomUUID();

    // --- Happy path ---

    @Test
    void shorten_validUrl_returns201WithShortCode() throws Exception {
        ShortenRequest req = new ShortenRequest();
        req.setUrl("https://www.example.com/some/long/path");

        mockMvc.perform(post("/api/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Session-Id", SESSION)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.shortCode", not(emptyString())))
            .andExpect(jsonPath("$.shortUrl", containsString("localhost:3000")))
            .andExpect(jsonPath("$.originalUrl", is("https://www.example.com/some/long/path")));
    }

    @Test
    void listUrls_returnsSessionUrls() throws Exception {
        String session = "list-session-" + UUID.randomUUID();
        ShortenRequest req = new ShortenRequest();
        req.setUrl("https://www.list-test.com");

        mockMvc.perform(post("/api/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Session-Id", session)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated());

        mockMvc.perform(get("/api/urls")
                .header("X-Session-Id", session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].originalUrl", is("https://www.list-test.com")));
    }

    @Test
    void resolve_validCode_returnsOriginalUrl() throws Exception {
        String session = "resolve-session-" + UUID.randomUUID();
        ShortenRequest req = new ShortenRequest();
        req.setUrl("https://www.resolve-test.com");

        MvcResult result = mockMvc.perform(post("/api/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Session-Id", session)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andReturn();

        String body = result.getResponse().getContentAsString();
        String shortCode = objectMapper.readTree(body).get("shortCode").asText();

        mockMvc.perform(get("/api/resolve/" + shortCode))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.originalUrl", is("https://www.resolve-test.com")));
    }

    @Test
    void delete_removesUrl() throws Exception {
        String session = "delete-session-" + UUID.randomUUID();
        ShortenRequest req = new ShortenRequest();
        req.setUrl("https://www.delete-test.com");

        MvcResult result = mockMvc.perform(post("/api/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Session-Id", session)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andReturn();

        String shortCode = objectMapper.readTree(result.getResponse().getContentAsString())
            .get("shortCode").asText();

        mockMvc.perform(delete("/api/urls/" + shortCode)
                .header("X-Session-Id", session))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/urls").header("X-Session-Id", session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    // --- Error cases ---

    @Test
    void shorten_blankUrl_returns400() throws Exception {
        ShortenRequest req = new ShortenRequest();
        req.setUrl("");

        mockMvc.perform(post("/api/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Session-Id", SESSION)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", not(emptyString())));
    }

    @Test
    void shorten_invalidScheme_returns400() throws Exception {
        ShortenRequest req = new ShortenRequest();
        req.setUrl("ftp://files.example.com");

        mockMvc.perform(post("/api/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Session-Id", SESSION)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", containsString("Only http")));
    }

    @Test
    void resolve_unknownCode_returns404() throws Exception {
        mockMvc.perform(get("/api/resolve/doesnotexist99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error", is("Not Found")));
    }

    @Test
    void shorten_rateLimitExceeded_returns429() throws Exception {
        String rateLimitSession = "rate-session-" + UUID.randomUUID();
        ShortenRequest req = new ShortenRequest();
        req.setUrl("https://www.ratetest.com");
        String body = objectMapper.writeValueAsString(req);

        // First 5 should succeed
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/shorten")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-Session-Id", rateLimitSession)
                    .header("X-Forwarded-For", "10.0.0.99")
                    .content(body))
                .andExpect(status().isCreated());
        }

        // 6th must return 429
        mockMvc.perform(post("/api/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Session-Id", rateLimitSession)
                .header("X-Forwarded-For", "10.0.0.99")
                .content(body))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.message", containsString("Too many requests")));
    }
}
