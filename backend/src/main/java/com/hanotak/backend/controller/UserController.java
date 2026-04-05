package com.hanotak.backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.hanotak.backend.model.User;
import com.hanotak.backend.repository.UserRepository;
import com.hanotak.backend.security.services.UserDetailsImpl;
import com.hanotak.backend.dto.MessageResponse;
import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
  @Autowired
  private com.hanotak.backend.service.UserService userService;

  @GetMapping("/me")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<?> getCurrentUser(Authentication authentication) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    return ResponseEntity.ok(userDetails);
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public List<User> getAllUsers() {
    return userService.getAllUsers();
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody User userDetails) {
    User user = userService.getUserById(id)
        .orElseThrow(() -> new RuntimeException("Error: User not found."));

    user.setName(userDetails.getName());
    user.setEmail(userDetails.getEmail());
    // In a real production app, password update would be handled separately with hashing
    
    userService.saveUser(user);
    return ResponseEntity.ok(user);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.ok(new MessageResponse("User deleted successfully."));
  }
}
