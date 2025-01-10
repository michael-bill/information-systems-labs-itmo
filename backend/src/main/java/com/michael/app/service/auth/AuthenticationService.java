package com.michael.app.service.auth;

import com.michael.app.dto.auth.JwtAuthenticationDto;
import com.michael.app.dto.auth.SignInDto;
import com.michael.app.dto.auth.SignUpDto;
import com.michael.app.entity.User;
import com.michael.app.service.core.UserService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @PostConstruct
    public void init() {
        if (userService.getAdminCount() == 0) {
            userService.create(User.builder().username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .role(User.Role.ROLE_ADMIN)
                    .build());
        }
    }

    public JwtAuthenticationDto signUp(SignUpDto request) {

        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ROLE_USER)
                .build();

        userService.create(user);

        var jwt = jwtService.generateToken(user);
        return new JwtAuthenticationDto(jwt);
    }

    public JwtAuthenticationDto signIn(SignInDto request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()));

        var user = userService
                .userDetailsService()
                .loadUserByUsername(request.getUsername());

        var jwt = jwtService.generateToken(user);
        return new JwtAuthenticationDto(jwt);
    }
}
