package com.qrcafe.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${cafe.admin.pin:9988}")
    private String adminPin;

    @Value("${cafe.kitchen.pin:2244}")
    private String kitchenPin;

    @PostMapping("/verify-kitchen")
    public ResponseEntity<Map<String, Object>> verifyKitchenPin(@RequestBody Map<String, String> body) {
        String pin = body.get("pin");
        boolean valid = kitchenPin.equals(pin) || adminPin.equals(pin); // Admin PIN also unlocks kitchen
        return ResponseEntity.ok(Map.of("valid", valid, "role", valid ? "KITCHEN" : "NONE"));
    }

    @PostMapping("/verify-admin")
    public ResponseEntity<Map<String, Object>> verifyAdminPin(@RequestBody Map<String, String> body) {
        String pin = body.get("pin");
        boolean valid = adminPin.equals(pin);
        return ResponseEntity.ok(Map.of("valid", valid, "role", valid ? "ADMIN" : "NONE"));
    }
}
