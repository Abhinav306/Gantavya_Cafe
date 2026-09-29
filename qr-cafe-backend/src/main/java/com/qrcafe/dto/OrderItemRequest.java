package com.qrcafe.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {
    private Long menuItemId;
    private int quantity;
}
