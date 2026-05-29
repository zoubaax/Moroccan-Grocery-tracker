package com.hanotak.backend.repository;

import com.hanotak.backend.model.ClientPantry;
import com.hanotak.backend.model.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PantryItemRepository extends JpaRepository<PantryItem, Long> {
    Optional<PantryItem> findByPantryAndProductId(ClientPantry pantry, Long productId);
}
