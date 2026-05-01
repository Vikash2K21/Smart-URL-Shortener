package com.snip.exception;

public class CustomCodeConflictException extends RuntimeException {
    public CustomCodeConflictException(String code) {
        super("The custom short code '" + code + "' is already taken. Please choose a different one.");
    }
}
