package com.hanotak.backend.service;

import com.hanotak.backend.model.*;
import com.hanotak.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PantryService {

    @Autowired
    private PantryRepository pantryRepository;

    @Autowired
    private PantryItemRepository pantryItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SaleRepository saleRepository;

    public ClientPantry getActivePantry(User client) {
        return pantryRepository.findByClientIdAndStatus(client.getId(), PantryStatus.ACTIVE)
                .orElseGet(() -> pantryRepository.save(new ClientPantry(client)));
    }

    @Transactional
    public PantryItem addItemToPantry(User client, Long productId, Integer quantity) {
        ClientPantry pantry = getActivePantry(client);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found."));

        Optional<PantryItem> existingItem = pantry.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            PantryItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            return pantryItemRepository.save(item);
        } else {
            PantryItem newItem = new PantryItem(pantry, product, quantity);
            pantry.addItem(newItem);
            pantryRepository.save(pantry);
            return pantryItemRepository.save(newItem);
        }
    }

    @Transactional
    public void updateItemQuantity(User client, Long itemId, Integer quantity) {
        PantryItem item = pantryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Pantry item not found."));

        if (!item.getPantry().getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Unauthorized action.");
        }

        if (quantity <= 0) {
            item.getPantry().getItems().remove(item);
            pantryItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            pantryItemRepository.save(item);
        }
    }

    @Transactional
    public void removeItemFromPantry(User client, Long itemId) {
        PantryItem item = pantryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Pantry item not found."));

        if (!item.getPantry().getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Unauthorized action.");
        }

        item.getPantry().getItems().remove(item);
        pantryItemRepository.delete(item);
    }

    @Transactional
    public void clearActivePantry(User client) {
        ClientPantry pantry = getActivePantry(client);
        pantry.getItems().clear();
        pantryRepository.save(pantry);
    }

    @Transactional
    public ClientPantry generatePantryBarcodeToken(User client) {
        ClientPantry pantry = getActivePantry(client);

        // ✅ Reuse the existing token if it's still valid (not expired)
        if (pantry.getBarcodeToken() != null
                && pantry.getTokenExpiresAt() != null
                && pantry.getTokenExpiresAt().isAfter(LocalDateTime.now())) {
            // Token is still valid — return it as-is, don't regenerate
            return pantry;
        }

        // Generate a new 12-char secure random token (e.g. PAN-3A4B5C6D7E8F)
        String rawToken = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        String token = "PAN-" + rawToken;

        pantry.setBarcodeToken(token);
        pantry.setTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
        pantry.setStatus(PantryStatus.ACTIVE);

        return pantryRepository.save(pantry);
    }

    @Transactional
    public ClientPantry resolvePantryBarcodeToken(String token) {
        ClientPantry pantry = pantryRepository.findByBarcodeToken(token)
                .orElseThrow(() -> new RuntimeException("Code-barres invalide ou introuvable."));

        if (pantry.getStatus() == PantryStatus.COMPLETED) {
            throw new RuntimeException("Cette commande a déjà été complétée.");
        }

        if (pantry.getTokenExpiresAt() == null || pantry.getTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce code-barres a expiré. Veuillez en générer un nouveau.");
        }

        // Lock status to SCANNED
        pantry.setStatus(PantryStatus.SCANNED);
        return pantryRepository.save(pantry);
    }

    @Transactional
    public Sale checkoutPantry(Long pantryId, String paymentMethod, User shopOwner) {
        ClientPantry pantry = pantryRepository.findById(pantryId)
                .orElseThrow(() -> new RuntimeException("Pantry not found."));

        if (pantry.getStatus() == PantryStatus.COMPLETED) {
            throw new RuntimeException("Pantry already checked out.");
        }

        if (pantry.getItems().isEmpty()) {
            throw new RuntimeException("Pantry is empty.");
        }

        User client = pantry.getClient();
        if ("CREDIT".equals(paymentMethod) && client == null) {
            throw new RuntimeException("Credit checkout requires a client.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        Sale sale = new Sale(BigDecimal.ZERO, paymentMethod, shopOwner, client);

        for (PantryItem pantryItem : pantry.getItems()) {
            Product product = pantryItem.getProduct();
            int qty = pantryItem.getQuantity();

            if (product.getStockQuantity() < qty) {
                throw new RuntimeException("Stock insuffisant pour le produit: " + product.getName());
            }

            // Deduct Stock
            product.setStockQuantity(product.getStockQuantity() - qty);
            productRepository.save(product);

            // Create Sale Item
            SaleItem saleItem = new SaleItem(sale, product, qty, product.getPrice());
            sale.addItem(saleItem);
            totalAmount = totalAmount.add(saleItem.getSubTotal());
        }

        sale.setTotalAmount(totalAmount);
        Sale savedSale = saleRepository.save(sale);

        // Update Client Credit balance if payment is CREDIT
        if ("CREDIT".equals(paymentMethod)) {
            client.setCurrentBalance(client.getCurrentBalance().add(totalAmount));
            userRepository.save(client);
        }

        // Mark pantry as COMPLETED and clear/expire token
        pantry.setStatus(PantryStatus.COMPLETED);
        pantry.setBarcodeToken(null);
        pantry.setTokenExpiresAt(null);
        pantryRepository.save(pantry);

        return savedSale;
    }
}
