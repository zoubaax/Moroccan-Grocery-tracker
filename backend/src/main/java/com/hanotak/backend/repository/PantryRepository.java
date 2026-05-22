package com.hanotak.backend.repository;

import com.hanotak.backend.model.ClientPantry;
import com.hanotak.backend.model.PantryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PantryRepository extends JpaRepository<ClientPantry, Long> {
    Optional<ClientPantry> findByClientIdAndStatus(Long clientId, PantryStatus status);
    Optional<ClientPantry> findByBarcodeToken(String barcodeToken);
    List<ClientPantry> findAllByClientId(Long clientId);
}
