# Commit 005

**Message:** Build public frontend pages — Home, Products, Cart, Checkout, Auth, and more

**Date:** 2026-07-21

---

## Public Pages Created

| Route | Page |
|-------|------|
| `/` | Home — Hero, featured products, trust signals, why NasFon |
| `/products` | Product listing with search, filters |
| `/products/[slug]` | Product detail — images, info, price, add to cart, buy now |
| `/categories/[slug]` | Category page |
| `/cart` | Cart with items, quantity controls, summary, checkout CTA |
| `/checkout` | Checkout form — customer info, delivery location, order summary |
| `/order/confirmation/[id]` | Order confirmation with payment instructions |
| `/track` | Order tracking by order number + phone |
| `/login` | Login form |
| `/register` | Registration form |
| `/forgot-password` | Password reset form |

## Infrastructure
- Added Navbar, Footer, BottomNav to root layout
- Created route groups: `(public)`, `(customer)`, `(admin)`
