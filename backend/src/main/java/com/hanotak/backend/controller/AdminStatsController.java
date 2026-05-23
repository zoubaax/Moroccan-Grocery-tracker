package com.hanotak.backend.controller;

import com.hanotak.backend.model.ERole;
import com.hanotak.backend.model.ESubscriptionPlan;
import com.hanotak.backend.model.Sale;
import com.hanotak.backend.model.User;
import com.hanotak.backend.repository.ProductRepository;
import com.hanotak.backend.repository.SaleRepository;
import com.hanotak.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Basic Counts
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalSalesCount = saleRepository.count();

        long moul7anoutCount = userRepository.findByRoleName(ERole.ROLE_MOUL7ANOUT).size();
        long clientCount = userRepository.findByRoleName(ERole.ROLE_CLIENT).size();
        long staffCount = userRepository.findByRoleName(ERole.ROLE_STAFF).size();

        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("totalSalesCount", totalSalesCount);
        stats.put("moul7anoutCount", moul7anoutCount);
        stats.put("clientCount", clientCount);
        stats.put("staffCount", staffCount);

        // 2. Revenue calculation
        List<Sale> allSales = saleRepository.findAll();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (Sale s : allSales) {
            if (s.getTotalAmount() != null) {
                totalRevenue = totalRevenue.add(s.getTotalAmount());
            }
        }
        stats.put("totalRevenue", totalRevenue);

        // 3. Subscription Distribution
        Map<String, Integer> subscriptionPlanDistribution = new HashMap<>();
        for (ESubscriptionPlan plan : ESubscriptionPlan.values()) {
            subscriptionPlanDistribution.put(plan.name(), 0);
        }
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (u.getRole() != null && u.getRole().getName() == ERole.ROLE_MOUL7ANOUT) {
                String planName = u.getSubscriptionPlan() != null ? u.getSubscriptionPlan().name() : "START";
                subscriptionPlanDistribution.put(planName, subscriptionPlanDistribution.getOrDefault(planName, 0) + 1);
            }
        }
        stats.put("subscriptionDistribution", subscriptionPlanDistribution);

        // 4. Payment Method Distribution
        Map<String, BigDecimal> paymentMethodRevenue = new HashMap<>();
        Map<String, Integer> paymentMethodCounts = new HashMap<>();
        paymentMethodRevenue.put("CASH", BigDecimal.ZERO);
        paymentMethodRevenue.put("CARD", BigDecimal.ZERO);
        paymentMethodRevenue.put("CREDIT", BigDecimal.ZERO);
        paymentMethodCounts.put("CASH", 0);
        paymentMethodCounts.put("CARD", 0);
        paymentMethodCounts.put("CREDIT", 0);

        for (Sale s : allSales) {
            String method = s.getPaymentMethod() != null ? s.getPaymentMethod().toUpperCase() : "CASH";
            BigDecimal amt = s.getTotalAmount() != null ? s.getTotalAmount() : BigDecimal.ZERO;

            paymentMethodRevenue.put(method, paymentMethodRevenue.getOrDefault(method, BigDecimal.ZERO).add(amt));
            paymentMethodCounts.put(method, paymentMethodCounts.getOrDefault(method, 0) + 1);
        }
        stats.put("paymentMethodRevenue", paymentMethodRevenue);
        stats.put("paymentMethodCounts", paymentMethodCounts);

        // 5. Daily Sales History for the last 7 days
        List<Map<String, Object>> dailySalesHistory = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate targetDate = today.minusDays(i);
            String dayName = targetDate.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            
            BigDecimal dayRevenue = BigDecimal.ZERO;
            int daySalesCount = 0;

            for (Sale s : allSales) {
                if (s.getTransactionDate() != null && s.getTransactionDate().toLocalDate().equals(targetDate)) {
                    daySalesCount++;
                    if (s.getTotalAmount() != null) {
                        dayRevenue = dayRevenue.add(s.getTotalAmount());
                    }
                }
            }

            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("name", dayName);
            dayStat.put("date", targetDate.toString());
            dayStat.put("revenue", dayRevenue);
            dayStat.put("value", dayRevenue); // compatibility fallback for value property
            dayStat.put("count", daySalesCount);
            dailySalesHistory.add(dayStat);
        }
        stats.put("dailySalesHistory", dailySalesHistory);

        // 6. Recent Platform Activity Log
        List<Map<String, Object>> recentActivities = new ArrayList<>();
        
        // Let's add recent users as activities
        List<User> sortedUsers = new ArrayList<>(allUsers);
        sortedUsers.sort((u1, u2) -> u2.getId().compareTo(u1.getId()));
        int userLimit = Math.min(sortedUsers.size(), 3);
        for (int i = 0; i < userLimit; i++) {
            User u = sortedUsers.get(i);
            Map<String, Object> act = new HashMap<>();
            act.put("type", "USER_REGISTRATION");
            act.put("user", u.getName());
            act.put("action", "Registered as " + (u.getRole() != null ? u.getRole().getName().name().replace("ROLE_", "") : "CLIENT"));
            act.put("time", "Recently");
            recentActivities.add(act);
        }

        // Let's add recent sales as activities
        List<Sale> sortedSales = new ArrayList<>(allSales);
        sortedSales.sort((s1, s2) -> s2.getId().compareTo(s1.getId()));
        int saleLimit = Math.min(sortedSales.size(), 3);
        for (int i = 0; i < saleLimit; i++) {
            Sale s = sortedSales.get(i);
            Map<String, Object> act = new HashMap<>();
            act.put("type", "SALE_PROCESSED");
            act.put("user", s.getShopOwner() != null ? s.getShopOwner().getName() : "Shopkeeper");
            act.put("action", "Processed sale of " + s.getTotalAmount() + " DH (" + s.getPaymentMethod() + ")");
            act.put("time", "ID: #" + s.getId());
            recentActivities.add(act);
        }
        
        // Sort activities so they look mixed/interesting
        stats.put("recentActivities", recentActivities);

        return ResponseEntity.ok(stats);
    }
}
