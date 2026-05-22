# 💳 Feature Spec: Moul Hanout Subscription Plans (v1)

> **Feature Name**: Subscription Plans for Moul 7anout  
> **Status**: ✅ Implemented (v1)  
> **Priority**: High  
> **Affects**: Spring Boot Backend, Admin Web Dashboard, Mobile App (Moul 7anout Portal)  
> **Billing (v1)**: Manual — admin assigns plans only (no payment gateway)

---

## 🧠 Concept Overview

Each **Moul 7anout** (shop owner) is assigned a **subscription plan** that controls which modules they can use in the 7anoti mobile app.

Plans bundle existing features into three tiers:

| Plan | Sales | Credit ledger | Marketplace / Pania | AI automation |
|------|:-----:|:-------------:|:-------------------:|:-------------:|
| **Start** | ✅ | ✅ | 🔒 | 🔒 |
| **Pro** | ✅ | ✅ | ✅ | 🔒 |
| **Ultimate** | ✅ | ✅ | ✅ | ✅ |

**UX principle (v1):** Locked features remain **visible** on the portal with a lock icon and an **“Upgrade to Pro / Ultimate”** message. Tapping opens a comparison modal; the user is told to **contact the administrator** (no self-service payment yet).

**No free trial** in v1.

---

## 👥 Roles & Who Is Affected

| Role | Subscription applies? | Notes |
|------|----------------------|--------|
| `ROLE_MOUL7ANOUT` | ✅ Yes | Plan stored on user; enforced in API + mobile UI |
| `ROLE_ADMIN` | ❌ No (bypass) | Full access; can assign plans to moul hanouts |
| `ROLE_STAFF` | ❌ No (bypass) | Full access |
| `ROLE_CLIENT` | ❌ No | Clients use marketplace when the shop enables it; not on a client plan in v1 |

---

## 📦 Feature Modules (What Each Plan Unlocks)

### 1. Sales (`SALES`)
- **Mobile:** Portal → *Vente normale*, scanner, cart, statistics
- **Includes:** Normal cash/card sales flow and sales reports

### 2. Credit ledger (`CREDIT`)
- **Mobile:** Portal → *Carnet de crédits*, customer search, customer detail, credit sales, payments
- **Includes:** Client debt tracking and pay-credit

### 3. Marketplace / Pania (`MARKETPLACE`)
- **Mobile:** Portal → *Marketplace / Pania* card → scanner for `PAN-…` barcodes → pantry checkout
- **Client side:** Shop, Pania, barcode (unchanged; v1 does not gate clients by shop plan)
- **Backend:** `GET /api/pantry/scan/{token}`, `POST /api/pantry/checkout` require **Pro** or higher for moul hanout

### 4. AI automation (`AI_AUTOMATION`)
- **Mobile:** Portal → *Automatisation IA*; customer detail → WhatsApp IA / Call IA buttons
- **Implementation:** External webhook (n8n); gated in mobile UI for Ultimate only in v1

---

## 🗄️ Database & Model

### User table addition

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `subscription_plan` | `VARCHAR` / enum | `START` | `START`, `PRO`, or `ULTIMATE` |

Hibernate `ddl-auto=update` adds the column automatically on startup.

### Enums (backend)

- `ESubscriptionPlan`: `START`, `PRO`, `ULTIMATE`
- `EPlanFeature`: `SALES`, `CREDIT`, `MARKETPLACE`, `AI_AUTOMATION`

### Default assignment

- New **moul hanout** registrations → `START`
- Existing moul hanouts with `null` plan → migrated to `START` on app startup (`DataInitializer`)
- Default **admin** user → `ULTIMATE` (bypass logic still applies)

---

## 🔌 API Reference

### Authentication (login)

`POST /api/auth/login`

Response includes (in addition to token / user fields):

```json
{
  "token": "...",
  "role": "ROLE_MOUL7ANOUT",
  "subscriptionPlan": "START",
  "features": {
    "sales": true,
    "credit": true,
    "marketplace": false,
    "aiAutomation": false
  }
}
```

### Current user subscription

`GET /api/subscription/me`  
**Auth:** any authenticated user  

Returns `SubscriptionStatusDto`: `plan`, `features`, `requiredPlanForMarketplace` (`PRO`), `requiredPlanForAi` (`ULTIMATE`).

### List plans

`GET /api/subscription/plans`  
**Auth:** authenticated  

Returns plan codes and feature flags (for UI comparison).

### Admin: assign plan

`PUT /api/users/{id}/subscription`  
**Auth:** `ROLE_ADMIN` only  

**Body:**
```json
{ "plan": "PRO" }
```

**Rules:**
- Only users with role `ROLE_MOUL7ANOUT` can receive a plan
- Returns updated `SubscriptionStatusDto` on success
- `400` + message if invalid (e.g. not a moul hanout)

### Protected endpoints (examples)

| Endpoint | Required feature (moul hanout) |
|----------|----------------------------------|
| `GET /api/pantry/scan/{token}` | `MARKETPLACE` |
| `POST /api/pantry/checkout` | `MARKETPLACE` |

Missing feature → **403** with message e.g. *"Marketplace requires the PRO plan."*

Admin and staff **bypass** all subscription checks.

---

## 🖥️ Admin Dashboard (Web)

**Page:** Users Management (`/users`)

- New column **Plan** for `ROLE_MOUL7ANOUT` rows
- Dropdown: **Start** / **Pro** / **Ultimate**
- Change calls `PUT /api/users/{id}/subscription` immediately

Other roles show `—` in the Plan column.

---

## 📱 Mobile App (Moul 7anout Portal)

### Portal screen

Five action cards:

1. Vente normale (sales)  
2. Carnet de crédits (credit)  
3. Marketplace / Pania  
4. Automatisation IA  
5. Statistiques & ventes  

- **Unlocked:** normal navigation  
- **Locked:** reduced opacity, lock icon, upgrade copy, tap → `UpgradeModal`  

Header shows current plan badge (FR/AR via `translations.js` → `subscription.*`).

### Upgrade modal

- Compares Start / Pro / Ultimate with checkmarks per feature  
- Button: **Contact administrator** (closes modal; no in-app payment)

### Other mobile guards

- Scanning `PAN-…` without Pro → alert  
- AI reminder buttons on customer detail without Ultimate → alert + dimmed buttons  

### Login requirement

After admin changes a plan, the moul hanout must **log in again** to refresh `features` from the login response (v1 does not poll `/subscription/me` on every screen).

---

## 🌐 Translations (mobile)

Keys under `subscription` and extra `portal` keys in:

- `mobile/src/services/translations.js` (`fr` + `ar`)

Examples: `subscription.lockMarketplace`, `subscription.upgradeTitle`, `portal.marketplaceTitle`.

---

## 📁 Key Files

### Backend
| File | Purpose |
|------|---------|
| `model/ESubscriptionPlan.java` | Plan enum + feature helpers |
| `model/EPlanFeature.java` | Feature flags for guards |
| `model/User.java` | `subscriptionPlan` field |
| `service/SubscriptionPlanService.java` | Resolve features, `requireFeature`, assign plan |
| `controller/SubscriptionController.java` | `/api/subscription/*` |
| `controller/UserController.java` | `PUT /{id}/subscription` |
| `controller/AuthController.java` | Login payload + default on register |
| `controller/PantryController.java` | Marketplace guards |
| `dto/JwtResponse.java` | `subscriptionPlan` + `features` |
| `utils/DataInitializer.java` | Defaults + migration |

### Frontend (admin)
| File | Purpose |
|------|---------|
| `frontend/src/pages/UsersManagement.jsx` | Plan column + dropdown |

### Mobile
| File | Purpose |
|------|---------|
| `mobile/src/screens/PortalScreen.js` | Locked cards + plan badge |
| `mobile/src/components/UpgradeModal.js` | Plan comparison modal |
| `mobile/App.js` | Pass features; scan / mode guards |
| `mobile/src/screens/LoginScreen.js` | Normalize login `features` |
| `mobile/src/screens/CustomerDetailScreen.js` | AI feature guard |

---

## 🧪 Test Plan

### Admin
- [ ] Open **Users** → change a moul hanout from Start → Pro → Ultimate  
- [ ] Confirm non–moul hanout users cannot get a plan (API error if tried via API)

### Mobile — Start
- [ ] Login as moul hanout with **Start**  
- [ ] Sales + Credit cards work  
- [ ] Marketplace + AI cards show lock + upgrade modal  
- [ ] Scan `PAN-…` → blocked message  

### Mobile — Pro
- [ ] Login after assigning **Pro**  
- [ ] Marketplace card opens scanner; pantry scan/checkout works  
- [ ] AI still locked  

### Mobile — Ultimate
- [ ] AI card leads to customer search  
- [ ] WhatsApp IA / Call IA work on customer with debt  

### API
- [ ] `GET /api/subscription/me` returns correct flags per plan  
- [ ] Pantry checkout as Start → 403  

---

## 🗓️ Out of Scope (v1) — Future (v2+)

- Stripe / CMI / in-app payment  
- Free trial periods  
- Self-service upgrade in app  
- Per-shop tenant (multi-store) subscription  
- Gating **clients** by shop owner’s plan (e.g. disable client shop if owner is Start)  
- Web sidebar locks for moul hanout dashboard  
- Dedicated admin **Subscriptions** page (pricing, analytics)  
- Expiry dates / `planExpiresAt`  

---

## 📝 Changelog

| Date | Version | Notes |
|------|---------|--------|
| 2026-05-22 | v1 | Initial release: manual admin plans, locked UI, API guards for marketplace |
