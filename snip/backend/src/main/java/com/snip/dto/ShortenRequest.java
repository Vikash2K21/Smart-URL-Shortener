package com.snip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ShortenRequest {

    @NotBlank(message = "URL must not be blank")
    @Size(max = 2048, message = "URL must be under 2048 characters")
    private String url;

    // Optional custom short code chosen by the user
    private String customCode;

    public ShortenRequest() {}

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getCustomCode() { return customCode; }
    public void setCustomCode(String customCode) { this.customCode = customCode; }
}
