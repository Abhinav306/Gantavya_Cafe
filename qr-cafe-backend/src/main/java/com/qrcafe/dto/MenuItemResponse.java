package com.qrcafe.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemResponse {
    private Long id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private boolean available;
    private Long categoryId;
}
