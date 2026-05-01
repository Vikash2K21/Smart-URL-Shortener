package com.snip;

import com.snip.exception.InvalidUrlException;
import com.snip.service.UrlValidatorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class UrlValidatorServiceTest {

    @Autowired
    private UrlValidatorService validator;

    @Test
    void validHttpUrl_passes() {
        assertThatNoException().isThrownBy(() -> validator.validate("https://www.google.com"));
    }

    @Test
    void validHttpWithPath_passes() {
        assertThatNoException().isThrownBy(() -> validator.validate("https://github.com/user/repo"));
    }

    @Test
    void blankUrl_throws() {
        assertThatThrownBy(() -> validator.validate(""))
            .isInstanceOf(InvalidUrlException.class)
            .hasMessageContaining("must not be empty");
    }

    @Test
    void nullUrl_throws() {
        assertThatThrownBy(() -> validator.validate(null))
            .isInstanceOf(InvalidUrlException.class);
    }

    @Test
    void ftpScheme_throws() {
        assertThatThrownBy(() -> validator.validate("ftp://files.example.com"))
            .isInstanceOf(InvalidUrlException.class)
            .hasMessageContaining("Only http");
    }

    @Test
    void noScheme_throws() {
        assertThatThrownBy(() -> validator.validate("www.google.com"))
            .isInstanceOf(InvalidUrlException.class);
    }

    @Test
    void ownDomain_throws() {
        // Configured base-url in test profile is http://localhost:3000
        assertThatThrownBy(() -> validator.validate("http://localhost:3000/abc123"))
            .isInstanceOf(InvalidUrlException.class)
            .hasMessageContaining("cannot shorten a URL that points to this shortener");
    }
}
