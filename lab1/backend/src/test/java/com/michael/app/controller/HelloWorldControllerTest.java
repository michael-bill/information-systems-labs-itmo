package com.michael.app.controller;

import com.michael.app.entity.User;
import com.michael.app.service.auth.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class HelloWorldControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtService jwtService;
    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    public void testHelloWorld() throws Exception {
        String username = "admin";
        String password = "admin";
        User.Role role = User.Role.ROLE_ADMIN;

        User userDetails = new User(null, username, password, role);

        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        String token = jwtService.generateToken(userDetails);

        mockMvc.perform(get("/hello-world")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Hello, World! Username = " + username +
                                ", with roles " + userDetails.getAuthorities()));
    }

}
