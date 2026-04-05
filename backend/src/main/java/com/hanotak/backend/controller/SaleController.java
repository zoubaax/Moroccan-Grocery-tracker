package com.hanotak.backend.controller;

import com.hanotak.backend.dto.MessageResponse;
import com.hanotak.backend.dto.SaleRequest;
import com.hanotak.backend.model.Product;
import com.hanotak.backend.model.Sale;
import com.hanotak.backend.model.SaleItem;
import com.hanotak.backend.model.User;
import com.hanotak.backend.repository.ProductRepository;
import com.hanotak.backend.repository.SaleRepository;
import com.hanotak.backend.repository.UserRepository;
import com.hanotak.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/process")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MOUL7ANOUT')")
    @Transactional
    public ResponseEntity<?> createSale(@RequestBody SaleRequest saleRequest, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User shopOwner = userRepository.findById(userDetails.getId()).orElse(null);

        if (shopOwner == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Shop owner not found."));
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        User client = null;
        if (saleRequest.getCustomerId() != null) {
            client = userRepository.findById(saleRequest.getCustomerId()).orElse(null);
        }

        if ("CREDIT".equals(saleRequest.getPaymentMethod()) && client == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Credit sales require a valid customer account."));
        }

        Sale sale = new Sale(BigDecimal.ZERO, saleRequest.getPaymentMethod(), shopOwner, client);

        for (SaleRequest.SaleItemRequest itemReq : saleRequest.getItems()) {
            Product product = productRepository.findByBarcode(itemReq.getBarcode()).orElse(null);
            
            if (product == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Product not found: " + itemReq.getBarcode()));
            }

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Insufficient stock for " + product.getName()));
            }

            // Deduct Stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            // Create Sale Item
            SaleItem saleItem = new SaleItem(sale, product, itemReq.getQuantity(), product.getPrice());
            sale.addItem(saleItem);
            totalAmount = totalAmount.add(saleItem.getSubTotal());
        }

        sale.setTotalAmount(totalAmount);
        saleRepository.save(sale);

        if ("CREDIT".equals(saleRequest.getPaymentMethod()) && client != null) {
            client.setCurrentBalance(client.getCurrentBalance().add(totalAmount));
            userRepository.save(client);
        }

        return ResponseEntity.ok(new MessageResponse("Sale processed successfully. Total: " + totalAmount + " DH"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MOUL7ANOUT')")
    public List<Sale> getMySales(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return saleRepository.findByShopOwnerId(userDetails.getId());
    }
}
