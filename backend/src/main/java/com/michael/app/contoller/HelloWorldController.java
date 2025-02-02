package com.michael.app.contoller;

import com.michael.app.dto.MessageDto;
import com.michael.app.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "hello-world", description = "Hello World Controller")
@RestController
public class HelloWorldController {
    @Operation(summary = "Hello, World!")
    @GetMapping("/hello-world")
    public MessageDto helloWorld(@AuthenticationPrincipal User user) {
        return new MessageDto(
                "Hello, World! Username = " + user.getUsername() +
                ", with roles " + user.getAuthorities()
        );
    }
}
