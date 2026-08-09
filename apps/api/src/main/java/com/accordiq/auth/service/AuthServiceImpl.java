package com.accordiq.auth.service;

import com.accordiq.auth.dto.AuthResponse;
import com.accordiq.auth.dto.LoginRequest;
import com.accordiq.auth.dto.RefreshTokenRequest;
import com.accordiq.auth.dto.RegisterRequest;
import com.accordiq.security.jwt.JwtService;
import com.accordiq.user.entity.User;
import com.accordiq.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .accountNonLocked(true)
                .build();

        User savedUser = userRepository.save(user);

        return buildAuthResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User account could not be found."
                        )
                );

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refreshToken(
            RefreshTokenRequest request
    ) {

        String username =
                jwtService.extractUsername(
                        request.getRefreshToken()
                );

        User user = userRepository.findByEmail(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User account could not be found."
                        )
                );

        if (!jwtService.isTokenValid(
                request.getRefreshToken(),
                user
        )) {
            throw new IllegalArgumentException(
                    "Invalid or expired refresh token."
            );
        }

        return AuthResponse.builder()
                .accessToken(
                        jwtService.generateToken(user)
                )
                .refreshToken(
                        request.getRefreshToken()
                )
                .tokenType("Bearer")
                .build();
    }

    private AuthResponse buildAuthResponse(
            User user
    ) {
        return AuthResponse.builder()
                .accessToken(
                        jwtService.generateToken(user)
                )
                .refreshToken(
                        jwtService.generateRefreshToken(user)
                )
                .tokenType("Bearer")
                .build();
    }
}