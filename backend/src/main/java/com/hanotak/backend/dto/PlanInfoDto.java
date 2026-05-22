package com.hanotak.backend.dto;

public class PlanInfoDto {
    private String code;
    private String label;
    private SubscriptionFeaturesDto features;

    public PlanInfoDto() {}

    public PlanInfoDto(String code, String label, SubscriptionFeaturesDto features) {
        this.code = code;
        this.label = label;
        this.features = features;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public SubscriptionFeaturesDto getFeatures() { return features; }
    public void setFeatures(SubscriptionFeaturesDto features) { this.features = features; }
}
