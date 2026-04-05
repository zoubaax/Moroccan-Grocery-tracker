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

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {
  @Autowired
  private com.hanotak.backend.service.UserService userService;

  @Autowired
  private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

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
  public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
    User user = userService.getUserById(id)
        .orElseThrow(() -> new RuntimeException("Error: User not found."));

    user.setName(userDetails.getName());
    user.setEmail(userDetails.getEmail());
    
    // Only update role if provided and valid in schema
    if (userDetails.getRole() != null) {
        user.setRole(userDetails.getRole());
    }
    
    userService.saveUser(user);
    return ResponseEntity.ok(user);
  }

  @PutMapping("/{id}/password")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody String newPassword) {
    User user = userService.getUserById(id)
        .orElseThrow(() -> new RuntimeException("Error: User not found."));

    user.setPassword(passwordEncoder.encode(newPassword));
    userService.saveUser(user);
    
    return ResponseEntity.ok(new MessageResponse("Password updated successfully."));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.ok(new MessageResponse("User deleted successfully."));
  }
}
