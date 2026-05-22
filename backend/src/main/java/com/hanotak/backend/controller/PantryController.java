package com.hanotak.backend.controller;

import com.hanotak.backend.dto.MessageResponse;
import com.hanotak.backend.model.ClientPantry;
import com.hanotak.backend.model.PantryItem;
import com.hanotak.backend.model.Sale;
import com.hanotak.backend.model.User;
import com.hanotak.backend.repository.UserRepository;
import com.hanotak.backend.security.services.UserDetailsImpl;
import com.hanotak.backend.model.EPlanFeature;
import com.hanotak.backend.service.PantryService;
import com.hanotak.backend.service.SubscriptionPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/pantry")
public class PantryController {

    @Autowired
    private PantryService pantryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionPlanService subscriptionPlanService;

    private User getAuthenticatedUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> getMyPantry(Authentication authentication) {
        User client = getAuthenticatedUser(authentication);
        if (client == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Client non trouvé."));
        }
        ClientPantry pantry = pantryService.getActivePantry(client);
        return ResponseEntity.ok(pantry);
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> addToPantry(@RequestBody AddToPantryRequest request, Authentication authentication) {
        User client = getAuthenticatedUser(authentication);
        if (client == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Client non trouvé."));
        }
        try {
            PantryItem item = pantryService.addItemToPantry(client, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/update/{itemId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> updateQuantity(@PathVariable Long itemId, @RequestParam Integer quantity, Authentication authentication) {
        User client = getAuthenticatedUser(authentication);
        if (client == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Client non trouvé."));
        }
        try {
            pantryService.updateItemQuantity(client, itemId, quantity);
            return ResponseEntity.ok(new MessageResponse("Quantité mise à jour."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{itemId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId, Authentication authentication) {
        User client = getAuthenticatedUser(authentication);
        if (client == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Client non trouvé."));
        }
        try {
            pantryService.removeItemFromPantry(client, itemId);
            return ResponseEntity.ok(new MessageResponse("Article supprimé de la Pania."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> clearPantry(Authentication authentication) {
        User client = getAuthenticatedUser(authentication);
        if (client == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Client non trouvé."));
        }
        try {
            pantryService.clearActivePantry(client);
            return ResponseEntity.ok(new MessageResponse("Pania vidée avec succès."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/barcode")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> getBarcode(Authentication authentication) {
        User client = getAuthenticatedUser(authentication);
        if (client == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Client non trouvé."));
        }
        try {
            ClientPantry pantry = pantryService.generatePantryBarcodeToken(client);
            return ResponseEntity.ok(Map.of(
                    "barcodeToken", pantry.getBarcodeToken(),
                    "expiresAt", pantry.getTokenExpiresAt().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/scan/{token}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MOUL7ANOUT')")
    public ResponseEntity<?> scanBarcode(@PathVariable String token, Authentication authentication) {
        User shopOwner = getAuthenticatedUser(authentication);
        if (shopOwner != null) {
            subscriptionPlanService.requireFeature(shopOwner, EPlanFeature.MARKETPLACE);
        }
        try {
            ClientPantry pantry = pantryService.resolvePantryBarcodeToken(token);
            return ResponseEntity.ok(pantry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MOUL7ANOUT')")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request, Authentication authentication) {
        User shopOwner = getAuthenticatedUser(authentication);
        if (shopOwner == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Épicier non trouvé."));
        }
        subscriptionPlanService.requireFeature(shopOwner, EPlanFeature.MARKETPLACE);
        try {
            Sale sale = pantryService.checkoutPantry(request.getPantryId(), request.getPaymentMethod(), shopOwner);
            return ResponseEntity.ok(sale);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // Inner request DTOs
    public static class AddToPantryRequest {
        private Long productId;
        private Integer quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class CheckoutRequest {
        private Long pantryId;
        private String paymentMethod;

        public Long getPantryId() { return pantryId; }
        public void setPantryId(Long pantryId) { this.pantryId = pantryId; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }
}
