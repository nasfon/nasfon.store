# Database Design

# Database Overview

NasFon Store uses **PostgreSQL** through Supabase.

The database is normalized to reduce duplication, maintain data integrity, and support future scalability.

A single payment can be linked to **many orders**, allowing grouped checkout or shared payment settlement when needed.

---

# Database Principles

* UUID primary keys
* Foreign key relationships
* Soft delete where appropriate
* Automatic timestamps
* Audit fields
* Secure with Supabase Row Level Security (RLS)

---

# Tables

## users

Purpose

Stores registered customer accounts.

Fields

* id (UUID)
* full_name
* email
* phone_number
* password (Managed by Supabase Auth)
* role (customer, admin)
* avatar_url
* is_active
* created_at
* updated_at

---

## categories

Purpose

Organize products.

Fields

* id
* name
* slug
* description
* image_url
* is_active
* created_at
* updated_at

Relationship

Category → Many Products

---

## products

Purpose

Store products sold by the store.

Fields

* id
* category_id
* name
* slug
* description
* sku
* selling_price
* compare_price
* stock_quantity
* brand
* featured_image
* is_featured
* is_active
* created_at
* updated_at

Relationship

Product belongs to one Category.

---

## product_images

Purpose

Support multiple images per product.

Fields

* id
* product_id
* image_url
* display_order
* created_at

Relationship

Product → Many Images

---

## delivery_locations

Purpose

Locations available for delivery.

Created only by Admin.

Fields

* id
* name
* delivery_fee
* estimated_delivery_days
* is_active
* created_at
* updated_at

---

## orders

Purpose

Store customer orders and link them to a payment record when applicable.

Fields

* id
* order_number
* user_id (nullable for guest checkout)
* payment_id (nullable until payment is created)
* customer_name
* customer_email
* customer_phone
* delivery_location_id
* subtotal
* delivery_fee
* total_amount
* payment_status
* order_status
* notes
* created_at
* updated_at

Relationship

Many Orders → One Payment

One Order → Many Order Items

---

## order_items

Purpose

Products purchased in an order.

Fields

* id
* order_id
* product_id
* quantity
* unit_price
* subtotal

---

## payments

Purpose

Store Flutterwave payment information that can be linked to one or more orders.

Fields

* id
* flutterwave_reference
* virtual_account_number
* bank_name
* account_name
* amount
* payment_status
* paid_at
* webhook_payload
* created_at

Relationship

One Payment → Many Orders

---

## reviews

Purpose

Customer product reviews.

Fields

* id
* user_id
* product_id
* order_id
* rating
* review
* is_visible
* created_at

---

## settings

Purpose

Store global store configuration excluding payment account details and shop name.

Fields

* id
* support_phone
* support_email
* store_address
* return_policy
* privacy_policy
* terms_conditions
* created_at
* updated_at

---

# Relationships

```
users
   │
   ├───────────────┐
   │               │
orders         reviews
   │               │
   │               │
order_items     products
   │               │
   └───────────────┤
                   │
             product_images
                   │
             categories

payments
   │
   └───────────────┐
                   │
                 orders

orders
   │
delivery_locations
```

---

# Enumerations

## User Role

* customer
* admin

---

## Payment Status

* pending
* paid
* failed
* expired
* refunded

---

## Order Status

* pending
* payment_confirmed
* processing
* ready_for_delivery
* out_for_delivery
* delivered
* cancelled

---

# Indexes

Create indexes for:

* email
* phone_number
* slug
* sku
* category_id
* product_id
* order_number
* payment_id
* flutterwave_reference
* payment_status
* order_status

---

# Row Level Security (RLS)

Customers

* Read active products
* Read active categories
* View only their own orders
* View payment records linked to their own orders
* Create reviews only for delivered orders they purchased

Guests

* Browse products
* Place orders
* Track orders using order number and phone number

Admins

* Full access to all tables

---

# Future Tables

Not included in the MVP but planned for future releases:

* wishlists
* coupons
* discount_rules
* inventory_logs
* notifications
* activity_logs
* warehouses
* shipping_partners
* banners
* featured_collections
* support_tickets
* audit_logs

---

# Database Design Rules

* Never store calculated totals that can become inconsistent unless required for historical records.
* Use foreign keys to maintain referential integrity.
* Store monetary values using PostgreSQL `numeric` (or the smallest currency unit where appropriate).
* Prefer UUIDs for all primary keys.
* Every table should include `created_at` and `updated_at`.
* Apply Row Level Security to every table before deployment.

