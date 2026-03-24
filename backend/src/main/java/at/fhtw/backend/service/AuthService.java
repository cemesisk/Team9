package at.fhtw.backend.service;

import at.fhtw.backend.dto.AuthResponse;
import at.fhtw.backend.dto.LoginRequest;
import at.fhtw.backend.dto.RegisterRequest;
import at.fhtw.backend.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserService userService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedUsername = request.getUsername().trim();
        User existingUser = userService.findByUsername(normalizedUsername);

        if (existingUser != null) {
            throw new IllegalArgumentException("Username already exists.");
        }

        User createdUser = userService.createUser(
                normalizedUsername,
                passwordEncoder.encode(request.getPassword())
        );

        String token = jwtService.generateToken(createdUser.getUsername());
        return new AuthResponse(token, createdUser.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedUsername = request.getUsername().trim();
        User user = userService.findByUsername(normalizedUsername);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password.");
        }

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }
}

