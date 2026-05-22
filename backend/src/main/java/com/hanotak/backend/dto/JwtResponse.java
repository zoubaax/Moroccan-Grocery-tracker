package com.hanotak.backend.dto;

public class JwtResponse {
  private String token;
  private String type = "Bearer";
  private Long id;
  private String name;
  private String email;
  private String phone;
  private String role;
  private String subscriptionPlan;
  private SubscriptionFeaturesDto features;

  public JwtResponse(String accessToken, Long id, String name, String email, String phone, String role,
      String subscriptionPlan, SubscriptionFeaturesDto features) {
    this.token = accessToken;
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.subscriptionPlan = subscriptionPlan;
    this.features = features;
  }

  public String getToken() { return token; }
  public void setToken(String token) { this.token = token; }
  public String getType() { return type; }
  public void setType(String type) { this.type = type; }
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getRole() { return role; }
  public void setRole(String role) { this.role = role; }
  public String getSubscriptionPlan() { return subscriptionPlan; }
  public void setSubscriptionPlan(String subscriptionPlan) { this.subscriptionPlan = subscriptionPlan; }
  public SubscriptionFeaturesDto getFeatures() { return features; }
  public void setFeatures(SubscriptionFeaturesDto features) { this.features = features; }
}
