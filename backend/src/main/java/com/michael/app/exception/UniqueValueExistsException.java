package com.michael.app.exception;

import org.springframework.http.HttpStatus;

public class UniqueValueExistsException extends MyAppException {
    public UniqueValueExistsException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
