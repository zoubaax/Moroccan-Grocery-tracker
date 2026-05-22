package com.hanotak.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.hanotak.backend.dto.PlanInfoDto;
import com.hanotak.backend.dto.SubscriptionFeaturesDto;
import com.hanotak.backend.dto.SubscriptionStatusDto;
import com.hanotak.backend.model.ERole;
import com.hanotak.backend.model.EPlanFeature;
import com.hanotak.backend.model.ESubscriptionPlan;
import com.hanotak.backend.model.User;
import java.util.Arrays;
import java.util.List;

@Service
public class SubscriptionPlanService {

    public ESubscriptionPlan resolvePlan(User user) {
        if (user == null || user.getSubscriptionPlan() == null) {
            return ESubscriptionPlan.START;
        }
        return user.getSubscriptionPlan();
    }

    public boolean bypassesSubscription(User user) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        ERole role = user.getRole().getName();
        return role == ERole.ROLE_ADMIN || role == ERole.ROLE_STAFF;
    }

    public SubscriptionFeaturesDto resolveFeatures(User user) {
        if (bypassesSubscription(user)) {
            return new SubscriptionFeaturesDto(true, true, true, true);
        }
        if (user.getRole() != null && user.getRole().getName() == ERole.ROLE_CLIENT) {
            return new SubscriptionFeaturesDto(true, true, true, false);
        }
        ESubscriptionPlan plan = resolvePlan(user);
        return new SubscriptionFeaturesDto(
                plan.hasSales(),
                plan.hasCredit(),
                plan.hasMarketplace(),
                plan.hasAiAutomation());
    }

    public SubscriptionStatusDto resolveStatus(User user) {
        SubscriptionStatusDto status = new SubscriptionStatusDto();
        ESubscriptionPlan plan = bypassesSubscription(user) ? ESubscriptionPlan.ULTIMATE : resolvePlan(user);
        status.setPlan(plan.name());
        status.setFeatures(resolveFeatures(user));
        status.setRequiredPlanForMarketplace(ESubscriptionPlan.PRO.name());
        status.setRequiredPlanForAi(ESubscriptionPlan.ULTIMATE.name());
        return status;
    }

    public void requireFeature(User user, EPlanFeature feature) {
        if (hasFeature(user, feature)) {
            return;
        }
        String required = feature == EPlanFeature.MARKETPLACE
                ? ESubscriptionPlan.PRO.name()
                : ESubscriptionPlan.ULTIMATE.name();
        String message = switch (feature) {
            case MARKETPLACE -> "Marketplace requires the " + required + " plan. Upgrade to unlock.";
            case AI_AUTOMATION -> "AI automation requires the " + required + " plan. Upgrade to unlock.";
            case SALES -> "Sales requires an active subscription plan.";
            case CREDIT -> "Credit ledger requires an active subscription plan.";
        };
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }

    public boolean hasFeature(User user, EPlanFeature feature) {
        SubscriptionFeaturesDto features = resolveFeatures(user);
        return switch (feature) {
            case SALES -> features.isSales();
            case CREDIT -> features.isCredit();
            case MARKETPLACE -> features.isMarketplace();
            case AI_AUTOMATION -> features.isAiAutomation();
        };
    }

    public List<PlanInfoDto> listPlans() {
        return Arrays.asList(
                planInfo(ESubscriptionPlan.START),
                planInfo(ESubscriptionPlan.PRO),
                planInfo(ESubscriptionPlan.ULTIMATE));
    }

    private PlanInfoDto planInfo(ESubscriptionPlan plan) {
        SubscriptionFeaturesDto features = new SubscriptionFeaturesDto(
                plan.hasSales(),
                plan.hasCredit(),
                plan.hasMarketplace(),
                plan.hasAiAutomation());
        return new PlanInfoDto(plan.name(), plan.name(), features);
    }

    public void assignPlan(User user, ESubscriptionPlan plan) {
        if (user.getRole() == null || user.getRole().getName() != ERole.ROLE_MOUL7ANOUT) {
            throw new RuntimeException("Subscription plans apply to Moul7anout accounts only.");
        }
        user.setSubscriptionPlan(plan);
    }
}
