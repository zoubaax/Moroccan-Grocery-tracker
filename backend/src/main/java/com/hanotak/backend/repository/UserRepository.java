package com.hanotak.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hanotak.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  Optional<User> findByPhone(String phone);
  Boolean existsByEmail(String email);
  java.util.List<User> findByRoleName(com.hanotak.backend.model.ERole name);
}
