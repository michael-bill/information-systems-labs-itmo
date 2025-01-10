package com.michael.app.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class MyAppException extends RuntimeException {
    private final HttpStatus status;
    public MyAppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
