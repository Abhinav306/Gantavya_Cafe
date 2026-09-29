package com.qrcafe.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    private int tableNumber;
    private List<OrderItemRequest> items;
}
