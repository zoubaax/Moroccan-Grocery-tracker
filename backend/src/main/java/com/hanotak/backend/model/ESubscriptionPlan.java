package com.hanotak.backend.model;

public enum ESubscriptionPlan {
    START,
    PRO,
    ULTIMATE;

    public boolean hasSales() {
        return true;
    }

    public boolean hasCredit() {
        return true;
    }

    public boolean hasMarketplace() {
        return this == PRO || this == ULTIMATE;
    }

    public boolean hasAiAutomation() {
        return this == ULTIMATE;
    }
}
