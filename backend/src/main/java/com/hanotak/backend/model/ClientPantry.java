package com.hanotak.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "client_pantries", indexes = {
    @Index(name = "idx_barcode_token", columnList = "barcodeToken")
})
public class ClientPantry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PantryStatus status = PantryStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(unique = true)
    private String barcodeToken;

    private LocalDateTime tokenExpiresAt;

    @OneToMany(mappedBy = "pantry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PantryItem> items = new ArrayList<>();

    public ClientPantry() {}

    public ClientPantry(User client) {
        this.client = client;
        this.status = PantryStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }

    public PantryStatus getStatus() { return status; }
    public void setStatus(PantryStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getBarcodeToken() { return barcodeToken; }
    public void setBarcodeToken(String barcodeToken) { this.barcodeToken = barcodeToken; }

    public LocalDateTime getTokenExpiresAt() { return tokenExpiresAt; }
    public void setTokenExpiresAt(LocalDateTime tokenExpiresAt) { this.tokenExpiresAt = tokenExpiresAt; }

    public List<PantryItem> getItems() { return items; }
    public void setItems(List<PantryItem> items) { this.items = items; }

    public void addItem(PantryItem item) {
        items.add(item);
        item.setPantry(this);
    }
}
