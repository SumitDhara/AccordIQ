package com.accordiq.security.config;

import com.accordiq.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(Customizer.withDefaults())

                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * Public endpoints
                         *
                         * These do not require an authenticated user.
                         */
                        .requestMatchers(
                                "/health",
                                "/api/v1/auth/**",
                                "/api/v1/ai/**",
                                "/api/v1/analyze/**",
                                "/api/v1/document-analyses/**",
                                "/api/v1/reviews/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger",
                                "/actuator/health"
                        ).permitAll()

                        /*
                         * Anonymous document analysis.
                         *
                         * A visitor can upload a document and receive
                         * an analysis without creating an account.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/documents/upload"
                        ).permitAll()

                        /*
                         * Everything else involving stored documents
                         * requires authentication.
                         *
                         * This includes:
                         * - document history
                         * - document details
                         * - document deletion
                         * - document search
                         */
                        .requestMatchers(
                                "/api/v1/documents/**"
                        ).authenticated()

                        /*
                         * All other protected application endpoints.
                         */
                        .anyRequest().authenticated()
                )

                .authenticationProvider(
                        authenticationProvider
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}