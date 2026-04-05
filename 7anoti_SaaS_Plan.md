# 📦 7anoti – Retail Shop Management SaaS Roadmap

This document outlines the implementation strategy for the **7anoti** platform, focusing on digitizing the traditional grocery retail workflow (Moul7anout) in Morocco.

---

## 🏛️ Project Architecture
- **Backend**: Spring Boot (REST API), PostgreSQL, Spring Security (JWT).
- **Frontend (Web)**: React + TailwindCSS (Admin, Staff, Moul7anout).
- **Mobile (App)**: React Native (Staff for Scanning, Clients for Tracking).
- **Cloud Services**: Cloudinary (Image Hosting), Push Notifications (FCM).

---

## 📅 Phase 1: Authentication & RBAC (COMPLETED ✅)
- [x] JWT Integration with Spring Security.
- [x] Defined Roles: `ADMIN`, `STAFF`, `MOUL7ANOUT`, `CLIENT`.
- [x] Secure Dashboard navigation based on user scope.
- [x] Database seeding for initial platform users.

---

## 📦 Phase 2: Product & Stock Controller (STAFF FOCUS)
*Goal: Build the digital warehouse and image management.*
1.  **Backend Implementation**:
    - [ ] **Product Entity**: `id`, `name`, `barcode`, `stockQuantity`, `price`, `imageUrl`, `categoryId`.
    - [ ] **Cloudinary Integration**: Service to handle product image uploads.
    - [ ] **Barcode Search**: Endpoint for looking up products via barcode string.
2.  **Web Interface**:
    - [ ] **Staff Dashboard**: Overview of stock levels and alerts.
    - [ ] **Product Management**: Grid view with search/filter & CRUD forms.
3.  **Mobile Component**:
    - [ ] **Barcode Scanner**: React Native camera integration to scan products for quick entry.

---

## ⚖️ Phase 3: The Digital Carnet (MOUL7ANOUT FOCUS)
*Goal: Manage the core business transactions and client debt.*
1.  **Client Management**:
    - [ ] CRUD for shop clients (Name, Phone, Address).
    - [ ] **Credit Control**: Setting credit limits per client.
2.  **Sales System**:
    - [ ] **Point of Sale (POS)**: Interface to add items to a "cart" (Cash or Credit).
    - [ ] **Transaction Engine**: Atomic operation to update stock + update client debt + record sale.
3.  **Ticket Generation**:
    - [ ] **PDF/Receipt Service**: Generate unique sales receipts with shop branding.

---

## 📊 Phase 4: Business Intelligence & Transparency
*Goal: Analytics for the Owner and Visibility for the Client.*
1.  **Analytics Layer**:
    - [ ] **Owner Dashboard**: Charting Daily/Weekly revenue and Total Debt Exposure.
    - [ ] **Admin Terminal**: Platform-wide monitoring of active 7anouts and users.
2.  **Client Visibility**:
    - [ ] **App Debt Tracker**: Mobile view for Clients to see their real-time balance.
    - [ ] **Notification System**: Push notifications for every new purchase or credit payment.

---

## 🚀 Phase 5: SaaS Multi-Tenancy & Scaling
*Goal: Enabling multiple 7anouts to coexist securely.*
1.  **Organization Context**: Filtering data so a Moul7anout only sees their own clients/products.
2.  **Deployment**: Dockerizing the stack and deploying to a production VPS.
3.  **Optimization**: Performance tuning for high-volume transactions.

---

## 🛠️ Tech Stack Refinement
| Component | Technology |
| :--- | :--- |
| **API** | Spring Boot 3.2.4 |
| **Design** | TailwindCSS + Framer Motion (Animations) |
| **Icons** | Lucide React |
| **Image Hosting** | Cloudinary API |
| **Database** | PostgreSQL 15 |
| **State** | React Context API / Redux Toolkit (Optional) |
