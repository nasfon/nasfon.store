# API Specification

# Overview

NasFon Store exposes RESTful APIs for the web application, admin dashboard, and third-party integrations.

## API Version

v1

Base URL

```text
/api/v1
```

---

# Authentication

Authentication is handled using Supabase Authentication.

Authorization

* Public
* Authenticated Customer
* Admin

Protected endpoints require a valid access token.

---

# API Response Format

## Success

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Error

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

---

# Authentication Endpoints

## Register

POST

```
/auth/register
```

---

## Login

POST

```
/auth/login
```

---

## Logout

POST

```
/auth/logout
```

---

## Current User

GET

```
/auth/me
```

---

## Forgot Password

POST

```
/auth/forgot-password
```

---

## Reset Password

POST

```
/auth/reset-password
```

---

# Product Endpoints

## Get Products

GET

```
/products
```

Supports

* Pagination
* Search
* Category Filter
* Featured Filter
* Sorting

---

## Product Details

GET

```
/products/{slug}
```

---

## Featured Products

GET

```
/products/featured
```

---

## Search Products

GET

```
/products/search
```

---

# Category Endpoints

## Get Categories

GET

```
/categories
```

---

## Category Details

GET

```
/categories/{slug}
```

---

# Cart Endpoints

## Get Cart

GET

```
/cart
```

---

## Add Item

POST

```
/cart/items
```

---

## Update Quantity

PATCH

```
/cart/items/{itemId}
```

---

## Remove Item

DELETE

```
/cart/items/{itemId}
```

---

## Clear Cart

DELETE

```
/cart
```

---

# Checkout Endpoints

## Create Checkout

POST

```
/checkout
```

Responsibilities

* Validate products
* Validate stock
* Calculate totals
* Calculate delivery fee
* Create payment
* Create order

---

## Buy Now

POST

```
/checkout/buy-now
```

Responsibilities

* Purchase a single product directly
* Skip shopping cart
* Generate checkout session

---

# Payment Endpoints

## Generate Dynamic Account

POST

```
/payments/dynamic-account
```

Returns

* Bank Name
* Account Number
* Account Name
* Amount
* Expiry Time

---

## Verify Payment

GET

```
/payments/{reference}
```

---

## Flutterwave Webhook

POST

```
/payments/webhook/flutterwave
```

Responsibilities

* Verify webhook signature
* Confirm payment
* Update payment
* Update linked order(s)
* Trigger customer notification

---

# Order Endpoints

## Guest Order Tracking

GET

```
/orders/track
```

Parameters

* order_number
* phone_number

---

## Customer Orders

GET

```
/orders
```

---

## Order Details

GET

```
/orders/{id}
```

---

# Review Endpoints

## Create Review

POST

```
/reviews
```

---

## Product Reviews

GET

```
/products/{id}/reviews
```

---

# Customer Profile

## Get Profile

GET

```
/profile
```

---

## Update Profile

PATCH

```
/profile
```

---

# Admin APIs

All endpoints require an Admin role (RBAC enforcement).

---

## Products

GET

```
/admin/products
```

POST

```
/admin/products
```

PATCH

```
/admin/products/{id}
```

DELETE

```
/admin/products/{id}
```

---

## Categories

GET

```
/admin/categories
```

POST

```
/admin/categories
```

PATCH

```
/admin/categories/{id}
```

DELETE

```
/admin/categories/{id}
```

---

## Orders

GET

```
/admin/orders
```

GET

```
/admin/orders/{id}
```

PATCH

```
/admin/orders/{id}
```

Update

* Order Status
* Payment Status
* Delivery Status

---

## Delivery Locations

GET

```
/admin/delivery-locations
```

POST

```
/admin/delivery-locations
```

PATCH

```
/admin/delivery-locations/{id}
```

DELETE

```
/admin/delivery-locations/{id}
```

---

## Customers

GET

```
/admin/customers
```

GET

```
/admin/customers/{id}
```

PATCH

```
/admin/customers/{id}
```

---

## Store Settings

GET

```
/admin/settings
```

PATCH

```
/admin/settings
```

---

## Dashboard

GET

```
/admin/dashboard
```

Returns

* Revenue
* Orders
* Pending Orders
* Products
* Customers
* Low Stock Products
* Recent Orders

---

# Status Codes

* 200 OK
* 201 Created
* 204 No Content
* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 409 Conflict
* 422 Validation Error
* 429 Too Many Requests
* 500 Internal Server Error

---

# Security

* HTTPS only
* JWT Authentication
* Supabase Row Level Security
* Server-side authorization
* Rate limiting
* Request validation with Zod
* Webhook signature verification
* CORS protection
* Secure environment variables

---

# API Design Principles

* Use nouns instead of verbs in endpoint names.
* Version all APIs.
* Return consistent response structures.
* Validate every request before processing.
* Keep endpoints focused on a single responsibility.
* Never expose sensitive internal data.
* Design endpoints to be backward compatible whenever possible.

