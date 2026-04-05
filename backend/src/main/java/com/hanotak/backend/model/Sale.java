package com.hanotak.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String paymentMethod; // "CASH", "CARD", etc.

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "shop_owner_id")
    @JsonIgnore
    private User shopOwner; // The Moul7anout who made the sale

    public Sale() {}

    public Sale(BigDecimal totalAmount, String paymentMethod, User shopOwner) {
        this.transactionDate = LocalDateTime.now();
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.shopOwner = shopOwner;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public List<SaleItem> getItems() { return items; }
    public void setItems(List<SaleItem> items) { this.items = items; }
    public User getShopOwner() { return shopOwner; }
    public void setShopOwner(User shopOwner) { this.shopOwner = shopOwner; }

    public void addItem(SaleItem item) {
        items.add(item);
        item.setSale(this);
    }
}
