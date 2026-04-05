package com.hanotak.backend.utils;

import com.hanotak.backend.model.ERole;
import com.hanotak.backend.model.Role;
import com.hanotak.backend.model.User;
import com.hanotak.backend.repository.RoleRepository;
import com.hanotak.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Initialize Roles if they don't exist
        for (ERole eRole : ERole.values()) {
            if (roleRepository.findByName(eRole).isEmpty()) {
                roleRepository.save(new Role(eRole));
            }
        }

        // Initialize Admin if doesn't exist
        String adminEmail = "admin@7anotk.ma";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: ADMIN Role not found."));

            User admin = new User();
            admin.setName("Master Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin@123"));
            admin.setRole(adminRole);

            userRepository.save(admin);
            System.out.println("Default Admin created: " + adminEmail + " / admin@123");
        }
    }
}
