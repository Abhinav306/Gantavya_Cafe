package com.qrcafe.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuCategoryResponse {
    private Long id;
    private String name;
    private int displayOrder;
    private List<MenuItemResponse> items;
}
