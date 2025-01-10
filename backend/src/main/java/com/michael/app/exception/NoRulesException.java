package com.michael.app.exception;

import org.springframework.http.HttpStatus;

public class NoRulesException extends MyAppException {
    public NoRulesException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
