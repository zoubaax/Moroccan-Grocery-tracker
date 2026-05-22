package com.hanotak.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.hanotak.backend.dto.SubscriptionStatusDto;
import com.hanotak.backend.model.User;
import com.hanotak.backend.security.services.UserDetailsImpl;
import com.hanotak.backend.service.SubscriptionPlanService;
import com.hanotak.backend.service.UserService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    @Autowired
    private SubscriptionPlanService subscriptionPlanService;

    @Autowired
    private UserService userService;

    @GetMapping("/plans")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> listPlans() {
        return ResponseEntity.ok(subscriptionPlanService.listPlans());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubscriptionStatusDto> getMySubscription(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        User user = userService.getUserById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found."));
        return ResponseEntity.ok(subscriptionPlanService.resolveStatus(user));
    }
}
