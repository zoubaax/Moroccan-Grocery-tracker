package com.hanotak.backend.dto;

public class SubscriptionFeaturesDto {
    private boolean sales;
    private boolean credit;
    private boolean marketplace;
    private boolean aiAutomation;

    public SubscriptionFeaturesDto() {}

    public SubscriptionFeaturesDto(boolean sales, boolean credit, boolean marketplace, boolean aiAutomation) {
        this.sales = sales;
        this.credit = credit;
        this.marketplace = marketplace;
        this.aiAutomation = aiAutomation;
    }

    public boolean isSales() { return sales; }
    public void setSales(boolean sales) { this.sales = sales; }
    public boolean isCredit() { return credit; }
    public void setCredit(boolean credit) { this.credit = credit; }
    public boolean isMarketplace() { return marketplace; }
    public void setMarketplace(boolean marketplace) { this.marketplace = marketplace; }
    public boolean isAiAutomation() { return aiAutomation; }
    public void setAiAutomation(boolean aiAutomation) { this.aiAutomation = aiAutomation; }
}
