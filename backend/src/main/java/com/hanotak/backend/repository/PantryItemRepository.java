package com.hanotak.backend.repository;

import com.hanotak.backend.model.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PantryItemRepository extends JpaRepository<PantryItem, Long> {
}
