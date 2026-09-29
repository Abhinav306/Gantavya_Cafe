package com.qrcafe.controller;

import com.qrcafe.dto.CategorySimpleResponse;
import com.qrcafe.dto.MenuCategoryResponse;
import com.qrcafe.dto.MenuItemRequest;
import com.qrcafe.dto.MenuItemResponse;
import com.qrcafe.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @Value("${cafe.admin.pin:9988}")
    private String adminPin;

    @GetMapping
    public ResponseEntity<List<MenuCategoryResponse>> getFullMenu() {
        return ResponseEntity.ok(menuService.getAllMenuCategories());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategorySimpleResponse>> getAllCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<MenuItemResponse> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuItemById(id));
    }

    @PostMapping("/items")
    public ResponseEntity<?> createMenuItem(
            @RequestHeader(value = "X-Admin-PIN", required = false) String pin,
            @RequestBody MenuItemRequest request) {
        if (!isAdmin(pin)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid Admin PIN");
        }
        MenuItemResponse created = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<?> updateMenuItem(
            @RequestHeader(value = "X-Admin-PIN", required = false) String pin,
            @PathVariable Long id,
            @RequestBody MenuItemRequest request) {
        if (!isAdmin(pin)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid Admin PIN");
        }
        MenuItemResponse updated = menuService.updateMenuItem(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/items/{id}/availability")
    public ResponseEntity<?> toggleAvailability(
            @RequestHeader(value = "X-Admin-PIN", required = false) String pin,
            @PathVariable Long id) {
        if (!isAdmin(pin)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid Admin PIN");
        }
        MenuItemResponse updated = menuService.toggleAvailability(id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteMenuItem(
            @RequestHeader(value = "X-Admin-PIN", required = false) String pin,
            @PathVariable Long id) {
        if (!isAdmin(pin)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid Admin PIN");
        }
        menuService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(String pin) {
        return adminPin.equals(pin);
    }
}
