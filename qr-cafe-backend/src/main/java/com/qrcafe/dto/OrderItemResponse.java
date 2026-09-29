package com.qrcafe.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long menuItemId;
    private String menuItemName;
    private int quantity;
    private double itemPrice;
    private double subtotal;
}
