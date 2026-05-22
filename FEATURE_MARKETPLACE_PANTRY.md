# 🛒 Feature Spec: Client Marketplace & Smart Pantry (Pania)

> **Feature Name**: Client Marketplace & Smart Pantry  
> **Status**: 📋 Planned  
> **Priority**: High  
> **Affects**: Mobile App (Client Portal), Spring Boot Backend, Scanner (Moul 7anout POS)

---

## 🧠 Concept Overview

The **Marketplace & Smart Pantry** feature transforms the Client Portal from a passive credit-viewer into an active pre-shopping tool.

A client can now **browse the shopkeeper's catalog**, build a personal grocery list (called a **Pania** 🧺), and when they arrive at the shop, generate a **scannable QR code** that the Moul 7anout can scan directly from the POS to instantly load the full order — and process it as **credit, cash, or card**.

---

## 🔄 Full User Flow

### Client Side (Mobile App)
```
Client Login
    └─→ Portal Screen
            ├─→ "My Credit" tab     (existing feature)
            └─→ "Shop" tab          (NEW ✨)
                    └─→ Marketplace Screen
                            ├─→ Browse by Category  (Category table already exists)
                            ├─→ Search bar for products
                            ├─→ Tap product → Add to Pania
                            └─→ "My Pania" button (cart icon)
                                    └─→ Pania Screen
                                            ├─→ Review list (items + quantities)
                                            ├─→ Edit / remove items
                                            └─→ "Generate QR Code" button
                                                    └─→ QR Code Screen
                                                            └─→ Display QR code to show shopkeeper
```

### Shopkeeper Side (Moul 7anout POS)
```
POS Scanner (existing ScannerScreen)
    └─→ Scans client QR code
            └─→ Backend resolves QR → fetches client's Pania items
                    └─→ Pantry Order Review Screen (NEW ✨)
                            ├─→ Show client name + items + quantities
                            └─→ Choose payment method:
                                    ├─→ 💳 Credit (add to carnet balance)
                                    ├─→ 💵 Cash
                                    └─→ 🏦 Card
                                            └─→ Checkout → Receipt / PDF generation
```

---

## 🗄️ Database Changes

### New Table: `client_pantry`
| Column | Type | Description |
|---|---|---|
| `id` | UUID / Long | Primary key |
| `client_id` | FK → `users.id` | The client who owns this pantry |
| `created_at` | Timestamp | When the pantry was last updated |
| `status` | Enum (`ACTIVE`, `SCANNED`, `COMPLETED`) | Lifecycle state of the pantry |

### New Table: `pantry_item`
| Column | Type | Description |
|---|---|---|
| `id` | Long | Primary key |
| `pantry_id` | FK → `client_pantry.id` | Parent pantry |
| `product_id` | FK → `products.id` | The product selected |
| `quantity` | Integer | How many units the client wants |

### Relationship Diagram
```
User (CLIENT role)
    └──< ClientPantry (one active at a time)
                └──< PantryItem >── Product >── Category
```

> **Note**: A client can only have **one ACTIVE pantry** at a time. After the QR is scanned and confirmed, the status moves to `SCANNED` → `COMPLETED`.

---

## 🔗 New Backend API Endpoints

### Pantry Management
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/pantry/my` | `ROLE_CLIENT` | Get the current client's active pantry with all items. |
| `POST` | `/api/pantry/add` | `ROLE_CLIENT` | Add a product to the pantry (body: `productId`, `quantity`). |
| `PUT` | `/api/pantry/update/{itemId}` | `ROLE_CLIENT` | Update quantity of a pantry item. |
| `DELETE` | `/api/pantry/remove/{itemId}` | `ROLE_CLIENT` | Remove an item from the pantry. |
| `DELETE` | `/api/pantry/clear` | `ROLE_CLIENT` | Clear the entire pantry. |

### QR Code
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/pantry/qr` | `ROLE_CLIENT` | Generate and return a signed QR payload (JWT-encoded pantry ID). |

### Shopkeeper / POS
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/pantry/scan/{token}` | `ROLE_MOUL7ANOUT` | Decode the QR token, return client info + full pantry item list. |
| `POST` | `/api/pantry/checkout` | `ROLE_MOUL7ANOUT` | Confirm the order with `pantryId` + `paymentMethod` (CREDIT / CASH / CARD). Triggers full sale processing. |

---

## 📱 New Mobile Screens

### Client Portal
| Screen | File | Description |
|---|---|---|
| `MarketplaceScreen.js` | `mobile/src/screens/MarketplaceScreen.js` | Category grid + product search, browse the shop catalog. |
| `PaniaScreen.js` | `mobile/src/screens/PaniaScreen.js` | Review & manage items in the client's current pantry. |
| `PaniaQRScreen.js` | `mobile/src/screens/PaniaQRScreen.js` | Display the generated QR code for the shopkeeper to scan. |

### Moul 7anout POS
| Screen | File | Description |
|---|---|---|
| `PantryOrderScreen.js` | `mobile/src/screens/PantryOrderScreen.js` | Displayed after scanning the client QR — shows client name, item list, and payment method selector. |

---

## 📦 New Libraries Required

### Mobile
| Library | Reason |
|---|---|
| `react-native-qrcode-svg` | Renders the QR code as a native SVG on the client's screen. |

### Backend
| Library | Reason |
|---|---|
| `jjwt` (already installed) | Re-used to sign/verify the QR payload token so it cannot be forged. |

> No major new dependencies — the QR payload is a signed JWT containing the `pantryId` and `clientId`, which the backend verifies on scan.

---

## 🔐 Security Considerations

- The QR code is a **short-lived signed JWT** (e.g., 30-minute expiry), not a plain pantry ID — preventing clients from spoofing another client's pantry.
- The `/api/pantry/scan/{token}` endpoint is protected by `ROLE_MOUL7ANOUT` so only the shopkeeper's session can resolve it.
- A pantry automatically moves to `SCANNED` status once the QR is resolved, preventing double-processing.

---

## 🧩 Integration with Existing Features

| Existing Feature | Integration Point |
|---|---|
| **POS Scanner** (`ScannerScreen.js`) | Detect if the scanned code is a pantry QR (prefix/format check) and route to `PantryOrderScreen` instead of product lookup. |
| **Checkout Logic** (`SaleController.java`) | Re-use the existing sale processing pipeline — pantry checkout creates a `Sale` + `SaleItem` records just like a normal POS checkout. |
| **Credit System** (`currentBalance`) | When `paymentMethod = CREDIT`, debit the client's balance exactly like a normal credit sale. |
| **PDF Invoicing** (`expo-print`) | After pantry checkout, generate and share a PDF receipt using the existing invoice template. |
| **Category Table** | Marketplace screen groups products by the `Category` entity already linked to `Product`. |

---

## 🗓️ Development Plan (Who Does What)

| Task | Owner |
|---|---|
| `ClientPantry` + `PantryItem` DB entities & JPA repos | **BASIR Younes** |
| Pantry REST API + QR JWT signing | **BASIR Younes** |
| `PantryOrderScreen` + scan routing in `ScannerScreen` | **Wajih Ben el Adem** |
| `MarketplaceScreen`, `PaniaScreen`, `PaniaQRScreen` | **Wajih Ben el Adem** |
| Docker/ENV updates, GitHub Actions pipeline checks | **ZOUBAA Mohammed** |
| UI design, category grid, QR screen styling, RTL layout | **EL-ASRI RADOUANE** |
| Arabic/French translations for all new screens | **EL-ASRI RADOUANE** |

---

## 🚀 Milestone Breakdown

### Week 1
- [ ] BASIR: Add `ClientPantry` + `PantryItem` entities and migrations.
- [ ] BASIR: Implement `GET /api/pantry/my` and `POST /api/pantry/add`.
- [ ] ZOUBAA: Update Docker + ENV configs for any new secrets.

### Week 2
- [ ] BASIR: Implement QR endpoint (`GET /api/pantry/qr`) with signed JWT payload.
- [ ] BASIR: Implement `GET /api/pantry/scan/{token}` for shopkeeper resolution.
- [ ] Wajih: Build `MarketplaceScreen` with category grid and search bar.
- [ ] Wajih: Build `PaniaScreen` with item list and quantity controls.

### Week 3
- [ ] Wajih: Build `PaniaQRScreen` using `react-native-qrcode-svg`.
- [ ] Wajih: Update `ScannerScreen` to detect pantry QR and route to `PantryOrderScreen`.
- [ ] Wajih: Build `PantryOrderScreen` with payment method selector.
- [ ] BASIR: Implement `POST /api/pantry/checkout` reusing the sale pipeline.

### Week 4
- [ ] EL-ASRI: Final UI polish, RTL mirroring, Arabic/French translations.
- [ ] ZOUBAA: End-to-end integration tests, production build.
- [ ] All: QA on real devices — client scans categories, builds pania, generates QR, shopkeeper scans and confirms.

---

*Generated on 2026-05-22 | 7anoti Project | Marketplace & Smart Pantry Feature*
