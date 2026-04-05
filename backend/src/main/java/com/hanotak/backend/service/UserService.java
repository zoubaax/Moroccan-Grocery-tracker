package com.hanotak.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.hanotak.backend.model.User;
import com.hanotak.backend.model.ERole;
import com.hanotak.backend.repository.UserRepository;

@Service
public class UserService {
  @Autowired
  private UserRepository userRepository;

  public List<User> getAllUsers() {
    return userRepository.findAll();
  }

  public List<User> getClients() {
    return userRepository.findByRoleName(ERole.ROLE_CLIENT);
  }

  public Optional<User> getUserById(Long id) {
    return userRepository.findById(id);
  }

  public User saveUser(User user) {
    return userRepository.save(user);
  }

  public void deleteUser(Long id) {
    userRepository.deleteById(id);
  }

  public boolean existsByEmail(String email) {
    return userRepository.existsByEmail(email);
  }
}
