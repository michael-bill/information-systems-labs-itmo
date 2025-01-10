package com.michael.app.exception;

import com.michael.app.entity.UploadFileHistory;
import lombok.Getter;

@Getter
public class UploadFileException extends RuntimeException {
    private final UploadFileHistory uploadFileHistory;
    public UploadFileException(String message, UploadFileHistory ufh) {
        super(message);
        this.uploadFileHistory = ufh;
    }
}
