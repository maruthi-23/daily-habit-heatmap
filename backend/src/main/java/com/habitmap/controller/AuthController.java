package com.habitmap.controller;

import com.habitmap.dto.Dto;
import com.habitmap.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Dto.AuthResponse> register(@Valid @RequestBody Dto.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<Dto.AuthResponse> login(@Valid @RequestBody Dto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Dto.AuthResponse> refresh(@Valid @RequestBody Dto.RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Dto.ApiResponse<Void>> logout(@AuthenticationPrincipal UserDetails userDetails) {
        authService.logout(userDetails.getUsername());
        return ResponseEntity.ok(Dto.ApiResponse.<Void>builder()
                .success(true).message("Logged out successfully").build());
    }

    @GetMapping("/me")
    public ResponseEntity<Dto.UserResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        // Return basic info from token; extend if needed
        return ResponseEntity.ok(Dto.UserResponse.builder()
                .email(userDetails.getUsername())
                .role(userDetails.getAuthorities().iterator().next().getAuthority())
                .build());
    }
}
