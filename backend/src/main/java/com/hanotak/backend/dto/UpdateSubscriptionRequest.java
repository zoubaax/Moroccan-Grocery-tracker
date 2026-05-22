package com.hanotak.backend.dto;

import com.hanotak.backend.model.ESubscriptionPlan;

public class UpdateSubscriptionRequest {
    private ESubscriptionPlan plan;

    public ESubscriptionPlan getPlan() { return plan; }
    public void setPlan(ESubscriptionPlan plan) { this.plan = plan; }
}
