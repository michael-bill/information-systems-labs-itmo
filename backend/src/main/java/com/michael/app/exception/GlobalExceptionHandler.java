package com.michael.app.exception;

import com.michael.app.dto.MessageDto;
import com.michael.app.entity.UploadFileHistory;
import com.michael.app.service.file.UploadFileHistoryService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Objects;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@ControllerAdvice
public class GlobalExceptionHandler {

    private final UploadFileHistoryService uploadFileHistoryService;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<MessageDto> handleMyCustomException(MethodArgumentNotValidException ex) {
        return new ResponseEntity<>(
                new MessageDto(Objects.requireNonNull(ex.getFieldError()).getDefaultMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<MessageDto> handleMyCustomException(ConstraintViolationException ex) {
        return new ResponseEntity<>(
                new MessageDto(ex.getConstraintViolations().stream().map(ConstraintViolation::getMessage).collect(Collectors.joining(", "))),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(MyAppException.class)
    public ResponseEntity<MessageDto> handleMyCustomException(MyAppException ex) {
        return new ResponseEntity<>(
                new MessageDto(Objects.requireNonNull(ex.getMessage())),
                ex.getStatus()
        );
    }

    @ExceptionHandler(UploadFileException.class)
    public ResponseEntity<UploadFileHistory> handleUploadFileException(UploadFileException ex) {
        UploadFileHistory history = uploadFileHistoryService.save(ex.getUploadFileHistory());
        return new ResponseEntity<>(history, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<MessageDto> handleMyCustomException(IllegalArgumentException ex) {
        return new ResponseEntity<>(
                new MessageDto(Objects.requireNonNull(ex.getMessage())),
                HttpStatus.BAD_REQUEST
        );
    }
}
