package com.finance.app.controller;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String,String>> handle(RuntimeException e){
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
