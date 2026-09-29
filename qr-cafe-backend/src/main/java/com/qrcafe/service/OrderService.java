package com.qrcafe.service;

import com.qrcafe.dto.CreateOrderRequest;
import com.qrcafe.dto.OrderItemRequest;
import com.qrcafe.dto.OrderItemResponse;
import com.qrcafe.dto.OrderResponse;
import com.qrcafe.entity.MenuItem;
import com.qrcafe.entity.Order;
import com.qrcafe.entity.OrderItem;
import com.qrcafe.repository.MenuItemRepository;
import com.qrcafe.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public OrderResponse placeOrder(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item.");
        }

        Order order = new Order();
        order.setTableNumber(request.getTableNumber());
        order.setStatus("PLACED");

        long orderCount = orderRepository.count();
        String orderNumber = String.format("ORD-%04d", orderCount + 1);
        order.setOrderNumber(orderNumber);

        double totalAmount = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() <= 0) {
                continue;
            }
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemReq.getMenuItemId()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemReq.getQuantity())
                    .itemPrice(menuItem.getPrice())
                    .build();

            orderItems.add(orderItem);
            totalAmount += menuItem.getPrice() * itemReq.getQuantity();
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        OrderResponse response = toOrderResponse(savedOrder);

        // Real-time broadcast to kitchen
        try {
            messagingTemplate.convertAndSend("/topic/orders", response);
            log.info("Broadcasted new order {} to /topic/orders", orderNumber);
        } catch (Exception e) {
            log.error("Failed to broadcast order to WebSocket: {}", e.getMessage());
        }

        return response;
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found with number: " + orderNumber));
        return toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(List<String> statuses) {
        List<Order> orders;
        if (statuses != null && !statuses.isEmpty()) {
            orders = orderRepository.findByStatusInWithItems(statuses);
        } else {
            orders = orderRepository.findAllWithItemsOrderByCreatedAtDesc();
        }
        return orders.stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        order.setStatus(newStatus.toUpperCase());
        Order updated = orderRepository.save(order);
        OrderResponse response = toOrderResponse(updated);

        // Broadcast status update to kitchen and tracking clients
        try {
            messagingTemplate.convertAndSend("/topic/orders", response);
            log.info("Broadcasted status update for order {} to {}", order.getOrderNumber(), newStatus);
        } catch (Exception e) {
            log.error("Failed to broadcast order update to WebSocket: {}", e.getMessage());
        }

        return response;
    }

    public OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getItems() != null) {
            itemResponses = order.getItems().stream().map(oi -> OrderItemResponse.builder()
                    .menuItemId(oi.getMenuItem() != null ? oi.getMenuItem().getId() : null)
                    .menuItemName(oi.getMenuItem() != null ? oi.getMenuItem().getName() : "Item")
                    .quantity(oi.getQuantity())
                    .itemPrice(oi.getItemPrice())
                    .subtotal(oi.getItemPrice() * oi.getQuantity())
                    .build()).collect(Collectors.toList());
        }

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableNumber(order.getTableNumber())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now())
                .items(itemResponses)
                .build();
    }
}
