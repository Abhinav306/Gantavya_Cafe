package com.qrcafe.repository;

import com.qrcafe.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.menuItem WHERE o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithItems(@Param("orderNumber") String orderNumber);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.menuItem WHERE o.status IN :statuses ORDER BY o.createdAt DESC")
    List<Order> findByStatusInWithItems(@Param("statuses") List<String> statuses);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.menuItem ORDER BY o.createdAt DESC")
    List<Order> findAllWithItemsOrderByCreatedAtDesc();
}
