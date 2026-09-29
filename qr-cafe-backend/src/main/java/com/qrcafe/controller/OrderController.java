package com.qrcafe.controller;

import com.qrcafe.dto.CreateOrderRequest;
import com.qrcafe.dto.OrderResponse;
import com.qrcafe.dto.UpdateStatusRequest;
import com.qrcafe.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Value("${cafe.admin.pin:9988}")
    private String adminPin;

    @Value("${cafe.kitchen.pin:2244}")
    private String kitchenPin;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody CreateOrderRequest request) {
        OrderResponse created = orderService.placeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(@RequestParam(required = false) List<String> status) {
        return ResponseEntity.ok(orderService.getOrders(status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @RequestHeader(value = "X-Staff-PIN", required = false) String pin,
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        if (!isStaff(pin)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized: Invalid Staff PIN");
        }
        return ResponseEntity.ok(orderService.updateStatus(id, request.getStatus()));
    }

    private boolean isStaff(String pin) {
        return kitchenPin.equals(pin) || adminPin.equals(pin);
    }
}
