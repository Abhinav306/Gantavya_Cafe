package com.qrcafe.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private int tableNumber;
    private String status;
    private double totalAmount;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
