# Commit 006

**Message:** Build customer dashboard and admin panel pages

**Date:** 2026-07-21

---

## Customer Dashboard Pages (`(customer)/dashboard/`)

| Route | Page |
|-------|------|
| `/dashboard` | Dashboard overview — order stats, recent orders |
| `/dashboard/orders` | Order history list |
| `/dashboard/orders/[id]` | Order detail with timeline, items, delivery, payment |
| `/dashboard/profile` | Edit profile (name, email, phone) |
| `/dashboard/reviews` | My reviews listing |

## Admin Panel Pages (`(admin)/admin/`)

| Route | Page |
|-------|------|
| `/admin` | Dashboard — revenue, orders, customers, low stock |
| `/admin/products` | Product table with CRUD |
| `/admin/categories` | Category table with CRUD |
| `/admin/orders` | Orders table with status |
| `/admin/customers` | Customers table |
| `/admin/delivery-locations` | Delivery locations CRUD |
| `/admin/analytics` | Analytics with chart placeholders |
| `/admin/settings` | Store settings form |

## Infrastructure
- Customer layout with sidebar nav (Dashboard, Orders, Profile, Reviews)
- Admin layout with sidebar nav (all admin sections)
