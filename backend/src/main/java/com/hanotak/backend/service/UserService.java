package com.hanotak.backend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.hanotak.backend.model.ERole;
import com.hanotak.backend.model.Sale;
import com.hanotak.backend.model.User;
import com.hanotak.backend.repository.PantryRepository;
import com.hanotak.backend.repository.SaleRepository;
import com.hanotak.backend.repository.UserRepository;

@Service
public class UserService {
  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PantryRepository pantryRepository;

  @Autowired
  private SaleRepository saleRepository;

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

  @Transactional
  public void deleteUser(Long id, Long currentUserId) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("User not found."));

    if (currentUserId != null && currentUserId.equals(id)) {
      throw new RuntimeException("You cannot delete your own account.");
    }

    pantryRepository.deleteAll(pantryRepository.findAllByClientId(id));

    List<Sale> salesAsClient = saleRepository.findByClientId(id);
    saleRepository.deleteAll(salesAsClient);

    List<Sale> salesAsShopOwner = saleRepository.findByShopOwnerId(id);
    for (Sale sale : salesAsShopOwner) {
      sale.setShopOwner(null);
    }
    saleRepository.saveAll(salesAsShopOwner);

    try {
      userRepository.delete(user);
    } catch (DataIntegrityViolationException ex) {
      throw new RuntimeException(
          "Cannot delete user: related records still exist. Remove linked sales or pantries first.");
    }
  }

  public boolean existsByEmail(String email) {
    return userRepository.existsByEmail(email);
  }

  public Optional<User> getUserByPhone(String phone) {
    return userRepository.findByPhone(phone);
  }
}
