package com.michael.app.exception;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class UniqueValueExistsException extends RuntimeException {
    public UniqueValueExistsException(String message) {
        super(message);
    }

    public UniqueValueExistsException(String message, Throwable cause) {
        super(message, cause);
    }

    public UniqueValueExistsException(Throwable cause) {
        super(cause);
    }
}
