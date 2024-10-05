package com.michael.app.exception;

import com.michael.app.dto.MessageDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Objects;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<MessageDto> handleMyCustomException(MethodArgumentNotValidException ex) {
        return new ResponseEntity<>(
                new MessageDto(Objects.requireNonNull(ex.getFieldError()).getDefaultMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(UniqueValueExistsException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<MessageDto> handleMyCustomException(UniqueValueExistsException ex) {
        return new ResponseEntity<>(
                new MessageDto(Objects.requireNonNull(ex.getMessage())),
                HttpStatus.BAD_REQUEST
        );
    }
}
