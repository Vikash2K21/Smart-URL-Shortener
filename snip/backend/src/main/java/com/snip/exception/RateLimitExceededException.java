package com.snip.exception;

public class RateLimitExceededException extends RuntimeException {
    public RateLimitExceededException() {
        super("Too many requests. You can shorten up to 5 URLs per minute. Please wait and try again.");
    }
}
