package com.hanotak.backend.dto;

import jakarta.validation.constraints.*;

public class SignupRequest {
  @NotBlank
  @Size(max = 50)
  private String name;

  @Size(max = 50)
  @Email
  private String email;

  private String role;

  @NotBlank
  @Size(min = 6, max = 40)
  private String password;

  private String phone;

  public SignupRequest() {}

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getRole() { return role; }
  public void setRole(String role) { this.role = role; }
  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
}
