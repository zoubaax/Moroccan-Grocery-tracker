package com.hanotak.backend.dto;

public class SubscriptionStatusDto {
    private String plan;
    private SubscriptionFeaturesDto features;
    private String requiredPlanForMarketplace;
    private String requiredPlanForAi;

    public SubscriptionStatusDto() {}

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public SubscriptionFeaturesDto getFeatures() { return features; }
    public void setFeatures(SubscriptionFeaturesDto features) { this.features = features; }
    public String getRequiredPlanForMarketplace() { return requiredPlanForMarketplace; }
    public void setRequiredPlanForMarketplace(String requiredPlanForMarketplace) {
        this.requiredPlanForMarketplace = requiredPlanForMarketplace;
    }
    public String getRequiredPlanForAi() { return requiredPlanForAi; }
    public void setRequiredPlanForAi(String requiredPlanForAi) { this.requiredPlanForAi = requiredPlanForAi; }
}
