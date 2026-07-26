# Seller Role Specification

# Overview

The Seller role allows registered customers to list and manage their own products on NasFon Store. Sellers must be verified by an admin before they can start selling.

---

# Role Hierarchy

```
Admin (full system access)
  └── Seller (own products + read orders)
        └── Customer (buy products only)
```

---

# Seller Statuses

A seller account moves through the following statuses:

| Status | Description |
|--------|-------------|
| `none` | Regular customer, not applied |
| `pending` | Application submitted, awaiting admin review |
| `approved` | Verified and selling |
| `rejected` | Application declined |
| `suspended` | Previously approved, temporarily disabled |

---

# Seller Application Flow

Customer
  → "Become a Seller" link in dashboard or `/seller/apply`
  → Fill application form
      → Business name
      → Business description
      → Phone number
      → Upload Government-issued ID (NIN, Driver's License, or International Passport)
      → Upload Business Registration Certificate
  → Submit
  → Status: pending
  → Admin reviews application
      → Approve → Status: approved → Seller can access /seller dashboard
      → Reject  → Status: rejected → Seller can re-apply with updated info

---

# Approved Seller Capabilities

## Product Management (own products only)

- Create products
- Edit products
- Delete products
- Upload product images
- Manage inventory (stock quantity)
- Set prices (selling price, compare price)

Sellers cannot manage products created by other sellers or by admins.

## Order Visibility (read-only)

- View orders that contain their products
- View order details (customer name, delivery location, status)
- Cannot update order status

## Dashboard

- Sales overview (total revenue, order count, product count)
- Product list with stock status
- Recent orders containing their products

---

# Admin Capabilities Over Sellers

## Application Management

- View all seller applications with status filter
- View uploaded documents (ID + Business Registration)
- Approve applications → seller gains access
- Reject applications → include reason

## Account Management

- Suspend a seller (immediately removes /seller access)
- Unsuspend a seller
- View all products by a seller

---

# Route Structure

```
/seller              → Seller dashboard
/seller/products     → Manage own products
/seller/products/new → Add product
/seller/products/[id]/edit → Edit product
/seller/orders       → View orders containing own products
/seller/apply        → Application page (for non-sellers)
```

---

# Database Changes

## users table

Add column:

```sql
seller_verification_status text not null default 'none'
```

Check constraint: `seller_verification_status IN ('none', 'pending', 'approved', 'rejected', 'suspended')`

## seller_documents table (new)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users.id |
| document_type | text | 'government_id' or 'business_registration' |
| file_url | text | Cloudinary URL |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## products table

Add column:

```sql
seller_id uuid references users(id) on delete set null
```

- `null` = admin-managed product
- non-null = seller-managed product

---

# Authorization Rules

## Server-side (lib/api.ts)

```typescript
requireAdmin()       // admin only
requireSeller()      // seller or admin
requireUser()        // any authenticated user
```

## Product Access

| Action | Admin | Seller (own) | Seller (other) | Customer |
|--------|-------|-------------|----------------|----------|
| Create | ✅ | ✅ | ❌ | ❌ |
| Read | ✅ | ✅ | ❌ | ✅ (active only) |
| Update | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |

## Order Access

| Action | Admin | Seller (contains own product) | Customer (own) |
|--------|-------|------------------------------|----------------|
| View | ✅ | ✅ (read-only) | ✅ |
| Update Status | ✅ | ❌ | ❌ |

---

# Row-Level Security (RLS) Rules

## products

- Admins: full access
- Sellers: CRUD where `seller_id = auth.uid()`
- Customers: read where `is_active = true`

## seller_documents

- Admins: full access
- Sellers: read/write their own documents only

---

# API Endpoints

## Seller Application

| Method | Path | Description |
|--------|------|-------------|
| POST | `/seller/apply` | Submit seller application with documents |
| GET | `/seller/application` | Get own application status |

## Product Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/seller/products` | List own products |
| POST | `/seller/products` | Create product |
| GET | `/seller/products/{id}` | Get own product details |
| PATCH | `/seller/products/{id}` | Update own product |
| DELETE | `/seller/products/{id}` | Delete own product |
| POST | `/seller/products/{id}/images` | Upload product images |
| DELETE | `/seller/products/{id}/images/{imageId}` | Delete product image |

## Order Visibility

| Method | Path | Description |
|--------|------|-------------|
| GET | `/seller/orders` | List orders containing own products |
| GET | `/seller/orders/{id}` | View order details |

## Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/seller/dashboard` | Seller dashboard stats |

## Admin — Seller Management

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/sellers` | List all seller applications |
| GET | `/admin/sellers/{id}` | View seller details + documents |
| POST | `/admin/sellers/{id}/approve` | Approve seller |
| POST | `/admin/sellers/{id}/reject` | Reject seller |
| POST | `/admin/sellers/{id}/suspend` | Suspend seller |
| POST | `/admin/sellers/{id}/unsuspend` | Unsuspend seller |

---

# UI Pages

## Seller Application (`/seller/apply`)

- Business name (required)
- Business description (optional)
- Phone number (prefilled from profile)
- File uploads:
  - Government-issued ID (PDF or image)
  - Business Registration Certificate (PDF or image)
- Submit button

## Seller Dashboard (`/seller`)

- Stats cards: Total products, Total orders, Revenue
- Recent orders table (last 10)
- Quick links to manage products

## Product Management (`/seller/products`)

- Table view of own products
- Add Product button
- Edit/Delete actions per row
- Stock status indicator

## Orders View (`/seller/orders`)

- Orders containing their products
- Customer name, delivery location, order status
- Read-only — no status change

## Admin — Seller Management (`/admin/sellers`)

- Table of all seller applications
- Status filter tabs (pending, approved, rejected, suspended)
- Click to view application details + documents
- Approve/Reject/Suspend actions
