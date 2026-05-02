package com.snip.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:3000",
               "https://smart-url-shortener-1-ofq2.onrender.com",
                "https://smart-url-shortener-a29p.onrender.com"
)
            .allowedMethods("GET", "POST", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("X-Session-Id")
            .allowCredentials(false)
            .maxAge(3600);
    }
}
