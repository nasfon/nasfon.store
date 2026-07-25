# NasFon Store — Project Todo

> Complete checklist from repository creation to production deployment.

---

## Phase 1: Foundation & Repository Setup

- [x] **Create GitHub repository** (`nasfon-store`)
- [x] **Configure branching strategy**
  - `main` — production-ready code
  - `develop` — integration branch
  - `feature/*` — feature branches
- [x] **Set up local development environment**
  - Node.js (LTS)
  - Git
  - VS Code (or preferred IDE)
- [x] **Add `.gitignore`** (Next.js defaults + `.env` files)
- [ ] **Create `develop` branch** as default working branch

---

## Phase 2: Project Initialization

- [x] **Scaffold Next.js project** (App Router, TypeScript)
  ```bash
  npx create-next-app@latest apps/web --typescript --tailwind --app --src-dir
  ```
- [x] **Install core dependencies**
  - `@supabase/supabase-js`
  - `@supabase/ssr`
  - `@tanstack/react-query`
  - `react-hook-form` + `@hookform/resolvers`
  - `zod`
  - `lucide-react`
  - `cloudinary` + `next-cloudinary`
  - `sonner` (toast notifications)
- [x] **Configure Tailwind CSS** (custom design tokens)
  - Primary (Blue), Secondary (White), Neutral & Status colors
  - Font family: Geist (fallback: Inter, system-ui, sans-serif)
  - Font sizes: 48px → 12px scale
  - Spacing scale: 4, 8, 12, 16, 24, 32, 40, 48, 64
  - Border radius: 6px, 10px, 16px, 9999px
  - Shadows: small (cards), medium (dropdowns), large (modals)
- [x] **Set up folder structure**
  ```
  src/
  ├── app/
  │   ├── (public)/       — public-facing routes
  │   ├── (customer)/     — authenticated customer routes
  │   └── (admin)/        — admin routes
  ├── components/
  │   ├── ui/             — reusable design system components
  │   ├── layout/         — Navbar, Footer, BottomNav
  │   └── shared/         — ProductCard, OrderCard, etc.
  ├── features/           — feature-specific modules
  ├── hooks/              — custom React hooks
  ├── lib/                — Supabase client, utilities
  ├── services/           — API service layer
  ├── types/              — TypeScript type definitions
  ├── utils/              — helper functions
  └── middleware.ts       — auth/route protection
  ```
- [ ] **Create environment variable templates** (`.env.example`)
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
  FLUTTERWAVE_SECRET_KEY=
  FLUTTERWAVE_WEBHOOK_SECRET=
  APP_URL=
  ```

---

## Phase 3: Supabase & Database Setup

- [x] **Create Supabase project** (dev environment)
- [x] **Enable Supabase Authentication** (Email + Password)
- [x] **Create database migration** for all tables
  - [x] `users` (extends Supabase auth.users)
  - [x] `categories`
  - [x] `products`
  - [x] `product_images`
  - [x] `delivery_locations`
  - [x] `orders`
  - [x] `order_items`
  - [x] `payments`
  - [x] `reviews`
  - [x] `settings`
- [x] **Add database indexes**
  - `email`, `phone_number`, `slug`, `sku`, `category_id`, `product_id`
  - `order_number`, `payment_id`, `flutterwave_reference`
  - `payment_status`, `order_status`
  - `search_vector` (GIN index for full-text search)
- [x] **Configure Row Level Security (RLS)** on every table
  - [x] Guests: read active products/categories only
  - [x] Customers: own orders, own profile, reviews for delivered purchases
  - [x] Admins: full access
- [x] **Create database triggers** for `created_at` / `updated_at` timestamps
- [x] **Seed development data** (categories, sample products, delivery locations)
- [ ] **Create Supabase Edge Functions** (if needed for webhooks/payments)
- [ ] **Set up staging Supabase project** (mirror dev schema)

---

## Phase 4: Supabase Client & Auth Setup

- [x] **Initialize Supabase client** (`src/lib/supabase/client.ts`)
  - Browser client (public anon key)
  - Server client (service role for admin ops)
- [x] **Set up Supabase SSR helpers** for Next.js App Router
- [x] **Build auth pages**
  - [x] `/login` — email + password
  - [x] `/register` — full name, email, password
  - [x] `/forgot-password`
  - [ ] `/reset-password`
- [x] **Implement authentication hooks**
  - `useAuth` / `useUser` — session + user state
  - `useLogin` / `useRegister` / `useLogout`
- [x] **Create auth middleware** (`src/middleware.ts`)
  - Redirect unauthenticated users from protected pages
  - Redirect non-admin users away from admin pages
  - Preserve intended destination after login
- [x] **Implement route protection patterns**
  - Public routes: home, products, cart, checkout, order tracking
  - Customer routes: dashboard, orders, profile, reviews
  - Admin routes: admin dashboard, products, categories, orders, customers, delivery locations, analytics, settings
- [ ] **Admin role seeding** — insert first admin user manually via Supabase SQL editor

---

## Phase 5: Design System & UI Components

### Core UI Components

- [x] **Button** — Primary, Secondary, Outline, Text variants
- [x] **Input** — text, email, password, search
- [x] **Textarea**
- [x] **Select**
- [ ] **Checkbox**
- [ ] **Radio Button**
- [ ] **Switch**
- [x] **Badge** — Genuine Product Badge, Secure Payment Badge
- [x] **Card** — reusable card wrapper
- [x] **Modal**
- [ ] **Drawer**
- [x] **Skeleton Loader**
- [x] **Loading Spinner**
- [x] **Empty State**

### Feedback Components

- [x] **Toast** (success, warning, error) — positioned top of screen
- [x] **Alert** — success, warning, error, info variants

### Layout Components

- [x] **Navbar** (top navigation for desktop/tablet)
  - Logo, Search, Categories, Cart, Login/Profile
- [x] **Bottom Navigation** (mobile)
  - Home, Categories, Search, Cart, Profile
- [x] **Footer**
  - About, Contact, FAQ, Privacy Policy, Return Policy, Terms & Conditions

### Trust Components

- [x] **Genuine Product Badge**
- [ ] **Secure Payment Notice**
- [ ] **Delivery Information**
- [ ] **Customer Support Contact**
- [ ] **Return Policy Summary**
- [ ] **FAQ Section**
- [x] **Customer Reviews**
- [x] **Order Tracking Timeline**

---

## Phase 6: Public Frontend Pages & Features

### Home Page (`/`)

- [x] **Hero section** — tagline, trust elements, CTA to browse
- [x] **Featured products** section
- [x] **Categories** overview
- [x] **Trust signals** — secure payment, genuine products, delivery info
- [x] **Footer**

### Products (`/products`)

- [x] **Product grid** with infinite scroll (Intersection Observer)
- [x] **Search** with full-text search (PostgreSQL tsvector + GIN index)
- [x] **Category filter**
- [x] **Sorting** (price, newest, name)
- [x] **Server-side caching** (React cache, Cache-Control headers)
- [x] **Virtualized rendering** (content-visibility: auto, lazy loading)

### Product Detail (`/products/[slug]`)

- [x] **Image gallery** (main image + thumbnails)
- [x] **Product info** — name, price, description, brand, stock status
- [x] **Compare price** display (original vs selling)
- [x] **Add to Cart** button
- [x] **Buy Now** button
- [x] **Stock status** indicator
- [x] **Reviews section**

### Categories (`/categories`)
- [x] **Categories listing page** — grid of all active categories
- [x] **Category detail** (`/categories/[slug]`) — products filtered by category

### Cart (`/cart`)

- [x] **Cart items list** — image, name, price, quantity selector
- [x] **Remove item**
- [x] **Clear cart**
- [x] **Subtotal, delivery fee, total**
- [x] **Proceed to Checkout** button

### Checkout (`/checkout`)

- [x] **Customer information form** — name, phone, email
- [x] **Delivery location selection** (admin-managed locations)
- [x] **Order summary**
- [x] **Payment method** — Bank Transfer via Dynamic Account
- [x] **Place Order** button

### Order Confirmation (`/order/confirmation/[id]`)

- [x] **Order number** display
- [x] **Payment instructions** — bank name, account number, amount, expiry
- [x] **Next steps** info

### Search (`/search`)

- [x] **Search page** — debounced input, full-text search, infinite scroll results

### Order Tracking (`/track`)

- [x] **Guest tracking** — order number + phone number
- [x] **Status timeline** — Pending → Payment Confirmed → Processing → Ready for Delivery → Out for Delivery → Delivered
- [x] **Order details** — items, total, delivery info

---

## Phase 7: Customer Dashboard

- [x] **Dashboard overview** — recent orders, profile summary
- [x] **My Orders** — list with status, total, date, track button
- [x] **Order Detail** — items, timeline, delivery info
- [x] **Profile Management** — view/update name, email, phone, avatar
- [x] **My Reviews** — products purchased, write/update reviews

---

## Phase 8: API Routes (Next.js API Handlers)

### Auth Endpoints (`/api/v1/auth/...`)

- [x] `POST /auth/register` — create account + Supabase user
- [x] `POST /auth/login` — authenticate
- [x] `POST /auth/logout` — invalidate session
- [x] `GET /auth/me` — current user info
- [x] `POST /auth/forgot-password`
- [x] `POST /auth/reset-password`

### Product Endpoints (`/api/v1/products/...`)

- [x] `GET /products` — paginated, search, category filter, featured, sort
- [x] `GET /products/[slug]` — single product with images
- [x] `GET /products/featured` — featured products
- [x] `GET /products/search` — search results

### Category Endpoints (`/api/v1/categories/...`)

- [x] `GET /categories` — all active categories
- [x] `GET /categories/[slug]` — single category with products

### Cart Endpoints (`/api/v1/cart/...`)

- [x] `GET /cart` — get current cart
- [x] `POST /cart/items` — add item
- [x] `PATCH /cart/items/[itemId]` — update quantity
- [x] `DELETE /cart/items/[itemId]` — remove item
- [x] `DELETE /cart` — clear cart

### Checkout Endpoints (`/api/v1/checkout/...`)

- [x] `POST /checkout` — full checkout (validate products, stock, calculate totals + delivery fee, create payment, create order)
- [x] `POST /checkout/buy-now` — single product direct purchase (skip cart)

### Payment Endpoints (`/api/v1/payments/...`)

- [x] `POST /payments/dynamic-account` — generate Flutterwave virtual account
- [x] `GET /payments/[reference]` — verify payment
- [x] `POST /payments/webhook/flutterwave` — Flutterwave webhook handler
  - Verify webhook signature
  - Confirm payment
  - Update payment record
  - Update linked order(s)
  - Trigger customer notification

### Order Endpoints (`/api/v1/orders/...`)

- [x] `GET /orders/track` — guest tracking (order_number + phone_number)
- [x] `GET /orders` — customer's orders (auth required)
- [x] `GET /orders/[id]` — single order detail

### Review Endpoints (`/api/v1/reviews/...`)

- [x] `POST /reviews` — create review (auth required, verified delivered order)
- [x] `GET /products/[id]/reviews` — product reviews (public)

### Customer Profile (`/api/v1/profile/...`)

- [x] `GET /profile` — get profile
- [x] `PATCH /profile` — update profile

### Admin Endpoints (`/api/v1/admin/...`)

- [x] `GET/POST /admin/products`
- [x] `PATCH/DELETE /admin/products/[id]`
- [x] `GET/POST /admin/categories`
- [x] `PATCH/DELETE /admin/categories/[id]`
- [x] `GET /admin/orders`
- [x] `GET /admin/orders/[id]`
- [x] `PATCH /admin/orders/[id]` — update order/payment/delivery status
- [x] `GET/POST /admin/delivery-locations`
- [x] `PATCH/DELETE /admin/delivery-locations/[id]`
- [x] `GET /admin/customers`
- [x] `GET /admin/customers/[id]`
- [x] `PATCH /admin/customers/[id]`
- [x] `GET /admin/settings`
- [x] `PATCH /admin/settings`
- [x] `GET /admin/dashboard` — revenue, orders, pending, products, customers, low stock, recent orders

---

## Phase 9: Admin Dashboard

- [x] **Product management** — CRUD, image upload, inventory
- [x] **Category management** — CRUD, Cloudinary image upload
- [x] **Order management** — view, update status, verify payment
- [x] **Customer management** — view, suspend/activate, delete accounts
- [x] **Delivery location management** — CRUD, set fees, enable/disable
- [x] **Store settings** — support phone/email, store address, admin email, return/privacy/terms
- [x] **Analytics** — sales data, store overview
- [x] **Dashboard overview** — server component (no client-side API call)

---

## Phase 10: Payment Integration (Flutterwave)

- [x] **Create Flutterwave account** (sandbox + live)
- [x] **Generate API keys** (secret key, webhook secret)
- [x] **Implement dynamic virtual bank account generation**
  - `POST /api/v1/payments/dynamic-account`
  - Return bank name, account number, account name, amount, expiry
- [x] **Implement payment verification**
  - `GET /api/v1/payments/[reference]`
- [x] **Implement Flutterwave webhook handler**
  - Verify webhook signature
  - Idempotent processing (prevent duplicates)
  - Update payment status
  - Update linked orders
  - Trigger notifications
- [x] **Build payment UI components**
  - Payment instructions display
  - Payment status polling
  - Payment confirmation page
- [ ] **Configure webhook endpoints** in Flutterwave dashboard
  - Development: ngrok/local tunnel
  - Staging: staging URL
  - Production: production URL

---

## Phase 11: Image Management (Cloudinary)

- [x] **Create Cloudinary account** (and upload preset `nasfon_store` with unsigned upload)
- [x] **Set up folders per environment** (`development/`, `staging/`, `production/`)
- [x] **Integrate Cloudinary upload widget** or API
- [x] **Build admin product image upload** (multiple images, reorder)
- [x] **Build admin category image upload** (single image, Cloudinary)
- [x] **Configure image transformations** (optimize, resize)
- [x] **Display images** on product cards, category cards, detail pages

---

## Phase 12: Email & Notifications

- [x] **Set up email service** (Resend)
- [x] **Order confirmation email** — order number, items, total, payment instructions (bank, account number, amount, expiry)
- [x] **Payment confirmation email** — payment received, order being processed
- [x] **Order status update emails** — processing, out for delivery, delivered (triggered by admin status change)
- [x] **Admin notification** — new order placed (admin email managed via settings page)

---

## Phase 13: Security Hardening

- [x] **Enable HTTPS** (Vercel provides by default)
- [x] **Configure HTTP security headers**
  - Content-Security-Policy (CSP)
  - X-Content-Type-Options
  - X-Frame-Options
  - Referrer-Policy
  - Permissions-Policy
  - Strict-Transport-Security (HSTS)
- [x] **Implement rate limiting** on sensitive endpoints
  - Login, registration, password reset, checkout, order tracking, payments, webhooks
- [x] **Add input validation** (Zod schemas) on all API routes
- [x] **Implement CSRF protection** for state-changing requests
- [x] **Configure CORS** — allow only approved origins
- [x] **Webhook signature verification** (Flutterwave)
- [x] **Sanitize user-generated content** (reviews, names, search terms)
- [x] **File upload restrictions** — images only, size limits, MIME validation
- [x] **Server-side caching** — React cache(), Cache-Control headers on API routes
- [x] **Verify RLS policies** on every database table before deployment

---

## Phase 14: Testing

- [x] **Unit tests** for utility functions and hooks
- [x] **Component tests** for UI components
- [x] **Integration tests** for API routes
  - [x] Auth flow (register, login, logout, password reset)
  - [x] Product CRUD
  - [x] Cart operations
  - [x] Checkout flow
  - [x] Payment webhook handling
  - [x] Order tracking
  - [x] Admin operations
- [ ] **E2E tests** for critical user flows
  - [x] Guest purchase (browse → cart → checkout → payment)
  - [x] Buy Now flow
  - [x] Customer registration → login → purchase
  - [x] Order tracking
  - [x] Admin product management
  - [x] Admin order management
- [x] **Security testing**
  - [x] Authentication tests
  - [x] Authorization tests (guests, customers, admins)
  - [x] Input validation
  - [x] Rate limiting
  - [x] CORS
  - [x] CSRF
  - [x] Webhook signature verification

---

## Phase 15: Staging Deployment

- [ ] **Create staging Supabase project** (run all migrations)
- [ ] **Create staging Vercel project** (linked to `develop` branch)
- [ ] **Configure staging environment variables**
- [ ] **Set up Cloudinary staging folder**
- [ ] **Configure Flutterwave sandbox keys** for staging
- [ ] **Set up staging webhook endpoints**
- [ ] **Deploy staging** via Vercel (auto-deploy from `develop`)
- [ ] **Verify all flows on staging**
  - [ ] Home page loads
  - [ ] Products visible
  - [ ] Search works
  - [ ] Cart + Checkout works
  - [ ] Dynamic account generation works
  - [ ] Webhook processes payment
  - [ ] Order tracking works
  - [ ] Admin dashboard works
  - [ ] Image upload works

---

## Phase 16: Production Deployment

### Pre-Deployment Checklist

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Environment variables configured in Vercel
- [ ] Database migrations reviewed and applied
- [ ] Payment webhook verified (Flutterwave live)
- [ ] Cloudinary production credentials verified
- [ ] HTTPS enabled
- [ ] Security headers enabled
- [ ] SEO metadata reviewed
- [ ] Product images optimized
- [ ] Admin login verified
- [ ] Customer checkout verified
- [ ] Order tracking verified
- [ ] Bank transfer payment flow verified

### Deploy

- [ ] **Create production Supabase project** (run migrations, enable RLS)
- [ ] **Create production Vercel project** (linked to `main` branch)
- [ ] **Configure production environment variables**
- [ ] **Set up Cloudinary production folder**
- [ ] **Configure Flutterwave live keys**
- [ ] **Set up production webhook endpoints** in Flutterwave dashboard
- [ ] **Merge `develop` → `main`** (triggers auto-deploy to Vercel)
- [ ] **Verify production deployment**

---

## Phase 17: Post-Deployment

### Verification

- [ ] Home page loads
- [ ] Products are visible and images load
- [ ] Search works
- [ ] Buy Now works
- [ ] Cart works
- [ ] Checkout works
- [ ] Dynamic bank account generation works
- [ ] Flutterwave webhook updates payments correctly
- [ ] Orders are created
- [ ] Order tracking works
- [ ] Admin dashboard works
- [ ] Product uploads work
- [ ] Email notifications are sent

### Monitoring & Operations

- [ ] **Set up monitoring** (Vercel Analytics, Supabase monitoring)
  - Application uptime
  - Build failures
  - API errors
  - Database performance
  - Payment failures
  - Authentication failures
- [ ] **Configure logging** — deployment history, app errors, payment webhooks, auth events
- [ ] **Enable automated database backups** (Supabase)
- [ ] **Document rollback procedures**
- [ ] **Document incident response plan**

---

## Phase 18: Future Enhancements (Post-MVP)

- [ ] Email verification on registration
- [ ] Product wishlist
- [ ] Coupons & discount rules
- [ ] Inventory logs & low-stock alerts
- [ ] Multiple warehouses
- [ ] Multiple cities
- [ ] Shipping partner integration
- [ ] Live chat support
- [ ] Social login (Google, Apple)
- [ ] Two-factor authentication (2FA)
- [ ] Dark mode
- [ ] Multi-vendor marketplace
- [ ] Mobile app (React Native)
- [ ] AI-powered product recommendations

---

> **Legend:** `[ ]` = pending, `[x]` = completed
