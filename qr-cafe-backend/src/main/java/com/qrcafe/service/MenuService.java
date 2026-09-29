package com.qrcafe.service;

import com.qrcafe.dto.CategorySimpleResponse;
import com.qrcafe.dto.MenuCategoryResponse;
import com.qrcafe.dto.MenuItemRequest;
import com.qrcafe.dto.MenuItemResponse;
import com.qrcafe.entity.Category;
import com.qrcafe.entity.MenuItem;
import com.qrcafe.repository.CategoryRepository;
import com.qrcafe.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> getAllMenuCategories() {
        List<Category> categories = categoryRepository.findAllWithItemsOrderByDisplayOrderAsc();
        return categories.stream().map(cat -> {
            List<MenuItemResponse> itemResponses = cat.getItems().stream()
                    .map(this::toItemResponse)
                    .collect(Collectors.toList());

            return MenuCategoryResponse.builder()
                    .id(cat.getId())
                    .name(cat.getName())
                    .displayOrder(cat.getDisplayOrder())
                    .items(itemResponses)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategorySimpleResponse> getAllCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder"))
                .stream()
                .map(c -> CategorySimpleResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .displayOrder(c.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemById(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));
        return toItemResponse(item);
    }

    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        MenuItem menuItem = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .available(request.isAvailable())
                .category(category)
                .build();

        MenuItem saved = menuItemRepository.save(menuItem);
        return toItemResponse(saved);
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));

        if (request.getCategoryId() != null &&
                (item.getCategory() == null || !request.getCategoryId().equals(item.getCategory().getId()))) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            item.setCategory(category);
        }

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        item.setAvailable(request.isAvailable());

        MenuItem updated = menuItemRepository.save(item);
        return toItemResponse(updated);
    }

    @Transactional
    public MenuItemResponse toggleAvailability(Long id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));

        item.setAvailable(!item.isAvailable());
        MenuItem updated = menuItemRepository.save(item);
        return toItemResponse(updated);
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new RuntimeException("Menu item not found with id: " + id);
        }
        menuItemRepository.deleteById(id);
    }

    private MenuItemResponse toItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .available(item.isAvailable())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .build();
    }
}
