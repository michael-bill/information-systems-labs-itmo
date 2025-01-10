package com.michael.app.exception;

import org.springframework.http.HttpStatus;

public class UploadFileException extends MyAppException {
    public UploadFileException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
