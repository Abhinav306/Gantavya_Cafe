package com.qrcafe.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemRequest {
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private boolean available = true;
    private Long categoryId;
}
