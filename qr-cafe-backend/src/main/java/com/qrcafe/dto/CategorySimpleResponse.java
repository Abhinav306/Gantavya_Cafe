package com.qrcafe.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySimpleResponse {
    private Long id;
    private String name;
    private int displayOrder;
}
