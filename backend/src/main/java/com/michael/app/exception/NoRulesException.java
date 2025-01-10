package com.michael.app.exception;

public class NoRulesException extends RuntimeException {
    public NoRulesException(String message) {
        super(message);
    }

    public NoRulesException(String message, Throwable cause) {
        super(message, cause);
    }

    public NoRulesException(Throwable cause) {
        super(cause);
    }
}
