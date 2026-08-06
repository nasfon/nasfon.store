# Seller Feature Specification

## Overview
This document specifies the Seller (Multi-Vendor) extension for NasFon Store, enabling registered users to apply to become verified sellers, manage their own shops, post products, define delivery locations, configure their individual Paystack payment credentials, and manage orders.

---

## 1. User Roles & Verification Workflow

### Roles
- **Customer / User**: Can apply to become a seller by submitting business details and verification documents.
- **Verified Seller**: A user whose verification documents have been approved by an admin. Can manage products, delivery locations, Paystack settings, and orders.
- **Admin**: Has full oversight, including reviewing and verifying/rejecting seller documents.

### Verification Flow
1. **Application**: User fills out seller application form (Shop Name, Shop Address, Contact Information [Phone Number, Email, Support Contact], Business Description, Upload Shop Logo / Image for brand recognition, and Uploads Verification Documents e.g., CAC certificate, Government ID, Utility bill).
2. **Review**: Admin reviews submitted documents in the Admin Dashboard.
3. **Approval / Rejection**: Admin approves or rejects the seller verification status (`pending` -> `approved` or `rejected`).
4. **Seller Activation**: Once approved, the user gains access to the Seller Dashboard with full vendor capabilities.

---

## 2. Database Design Additions

### `sellers` Table
Purpose: Store seller profile, shop details, branding logo, contact information, verification status, verification documents, and Paystack API configuration.

Fields:
- `id` (UUID, PK)
- `user_id` (UUID, FK to `users.id`)
- `shop_name` (Text)
- `shop_slug` (Text, Unique)
- `shop_address` (Text)
- `shop_logo_url` (Text, nullable - shop logo/image for brand recognition)
- `contact_phone` (Text)
- `contact_email` (Text)
- `support_contact` (Text, nullable)
- `business_description` (Text, nullable)
- `verification_status` (Enum: `pending`, `approved`, `rejected`)
- `verification_documents` (JSON / Array of document URLs)
- `paystack_public_key` (Text, encrypted or securely stored)
- `paystack_secret_key` (Text, encrypted or securely stored)
- `is_active` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Table Modifications
- **`products`**: Add `seller_id` (UUID, FK to `sellers.id`, nullable if admin-owned products, or required for vendor products).
- **`delivery_locations`**: Add `seller_id` (UUID, FK to `sellers.id`, nullable for global/admin delivery locations, or specific to the seller).
- **`orders` / `order_items`**: Ensure order items link back to products and sellers so sellers can view and manage orders containing their products.

---

## 3. API Specification

### Seller Application & Profile Endpoints
- `POST /api/v1/seller/apply` - Submit seller application and verification documents.
- `GET /api/v1/seller/profile` - Get current user's seller profile and status.
- `PATCH /api/v1/seller/profile` - Update seller profile / shop details.
- `GET /api/v1/sellers/{slug}` - Public endpoint for customers to view seller profile, shop address, and verified documents.

### Admin Seller Management Endpoints
- `GET /api/v1/admin/sellers` - List all seller applications (with filtering by status).
- `GET /api/v1/admin/sellers/{id}` - View seller details and verification documents.
- `PATCH /api/v1/admin/sellers/{id}/verify` - Approve or reject seller verification.

### Seller Product Endpoints
- `GET /api/v1/seller/products` - List seller's products.
- `POST /api/v1/seller/products` - Create product.
- `PATCH /api/v1/seller/products/{id}` - Update product.
- `DELETE /api/v1/seller/products/{id}` - Delete product.

### Seller Delivery Location Endpoints
- `GET /api/v1/seller/delivery-locations` - List seller's delivery locations.
- `POST /api/v1/seller/delivery-locations` - Create delivery location.
- `PATCH /api/v1/seller/delivery-locations/{id}` - Update delivery location.
- `DELETE /api/v1/seller/delivery-locations/{id}` - Delete delivery location.

### Seller Payment Configuration Endpoints
- `GET /api/v1/seller/payment/config` - Get seller Paystack configuration status.
- `POST /api/v1/seller/payment/config` - Set / update Paystack API keys (Public Key & Secret Key).

### Seller Order Management Endpoints
- `GET /api/v1/seller/orders` - List orders containing seller's products.
- `GET /api/v1/seller/orders/{id}` - View order details.
- `PATCH /api/v1/seller/orders/{id}` - Update order status (e.g. processing, ready for delivery, delivered).

---

## 4. User Flows

### Seller Registration & Verification Flow
User Dashboard -> Apply to Become a Seller -> Enter Shop Name & Address -> Upload Verification Documents -> Submit -> Pending Admin Verification.

### Admin Verification Flow
Admin Dashboard -> Sellers -> Review Application & Documents -> Approve / Reject -> Status Updated.

### Customer Viewing Seller Profile
Product Page / Store Directory -> Click Seller Name -> View Seller Profile -> See Shop Logo/Image for recognition, Verified Documents, Shop Address, and Contact Information (Phone, Email, Support Contact).

### Seller Product & Delivery Location Management
Seller Dashboard -> Products (Create/Update/Delete) -> Delivery Locations (Create/Update/Delete).

### Seller Paystack Setup
Seller Dashboard -> Settings / Payment API -> Enter Paystack Public & Secret Keys -> Save.

### Seller Order Management
Seller Dashboard -> Orders -> View Incoming Orders -> Update Order Status.
