# Architecture

# Overview

NasFon Store uses a modern, modular architecture that is easy to maintain, secure, and scalable. The MVP is designed for one city, with the ability to expand to multiple cities and additional product categories in the future.

---

# Architecture Style

* Client-Server Architecture
* Modular Architecture
* API-First Design
* Mobile-First Frontend

---

# Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* TanStack Query
* React Hook Form
* Zod

---

## Backend

* Supabase

  * PostgreSQL Database
  * Authentication
  * Row Level Security (RLS)
  * Edge Functions
  * Storage (optional)

---

## Image Storage

* Cloudinary

---

## Payment

* Paystack
* Redirect Checkout
* Paystack Webhooks

---

## Deployment

Frontend

* Vercel

Backend

* Supabase Cloud

---

# High-Level Architecture

```
Customer
      │
      ▼
Next.js Frontend
      │
      ▼
Supabase
├── Authentication
├── PostgreSQL Database
├── Row Level Security
└── Edge Functions
      │
      ├────────────► Cloudinary
      │               Product Images
      │
      └────────────► Paystack
                      Redirect Checkout
                      Payment Webhook
```

---

# Frontend Modules

* Home
* Products
* Categories
* Search
* Cart
* Checkout
* Authentication
* Order Tracking
* Customer Dashboard
* Admin Dashboard
* Settings

---

# Backend Modules

## Authentication

Responsible for:

* Login
* Registration
* Password Reset
* Session Management

---

## Product Module

Responsible for:

* Products
* Categories
* Inventory
* Product Images

---

## Cart Module

Responsible for:

* Shopping Cart
* Buy Now Flow

---

## Checkout Module

Responsible for:

* Customer Information
* Delivery Location
* Order Creation

---

## Payment Module

Responsible for:

* Initialize Paystack transaction
* Receive Payment Webhooks
* Verify Payment
* Update Order Status

---

## Order Module

Responsible for:

* Order Creation
* Order Tracking
* Order Status
* Order History

---

## Delivery Module

Responsible for:

* Delivery Locations
* Delivery Fees
* Delivery Status

---

## Review Module

Responsible for:

* Ratings
* Reviews

---

## Admin Module

Responsible for:

* Products
* Categories
* Orders
* Customers
* Delivery Locations
* Store Settings
* Analytics

---

# Data Flow

Customer

↓

Browse Products

↓

Add to Cart / Buy Now

↓

Checkout

↓

Create Order

↓

Generate Dynamic Bank Account

↓

Customer Makes Transfer

↓

Paystack Webhook

↓

Payment Verified

↓

Order Updated

↓

Admin Processes Order

↓

Delivery

↓

Customer Receives Product

---

# Security

* HTTPS Everywhere
* Supabase Authentication
* Row Level Security (RLS)
* **Role-Based Access Control (RBAC)** — customer and admin roles enforced server-side
* Protected Admin Routes
* Server-side Authorization
* Secure Environment Variables
* Webhook Signature Verification
* Input Validation
* Rate Limiting

---

# File Structure

```
apps/
└── web/

src/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
└── middleware.ts
```

---

# External Services

## Cloudinary

Purpose

* Product Images

---

## Paystack

Purpose

* Redirect Checkout
* Payment Confirmation
* Payment Webhooks

---

## Email Service

Purpose

* Order Confirmation
* Payment Confirmation
* Order Status Updates

---

# Scalability

Future upgrades should support:

* Multiple cities
* Multiple warehouses
* Additional payment methods
* Coupons
* Discounts
* Mobile applications
* Multi-vendor marketplace

---

# Architecture Principles

* Keep business logic on the server.
* Never trust client-side data.
* Protect all sensitive operations with authentication and authorization.
* Use reusable modules and components.
* Optimize for performance and simplicity.
* Every architectural decision should improve reliability, maintainability, or customer trust.

