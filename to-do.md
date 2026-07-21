# NasFon Store — Project Todo

> Complete checklist from repository creation to production deployment.

---

## Phase 1: Foundation & Repository Setup

- [ ] **Create GitHub repository** (`nasfon-store`)
- [ ] **Configure branching strategy**
  - `main` — production-ready code
  - `develop` — integration branch
  - `feature/*` — feature branches
- [ ] **Set up local development environment**
  - Node.js (LTS)
  - Git
  - VS Code (or preferred IDE)
- [ ] **Add `.gitignore`** (Next.js defaults + `.env` files)
- [ ] **Create `develop` branch** as default working branch

---

## Phase 2: Project Initialization

- [ ] **Scaffold Next.js project** (App Router, TypeScript)
  ```bash
  npx create-next-app@latest apps/web --typescript --tailwind --app --src-dir
  ```
- [ ] **Install core dependencies**
  - `@supabase/supabase-js`
  - `@supabase/ssr`
  - `@tanstack/react-query`
  - `react-hook-form` + `@hookform/resolvers`
  - `zod`
  - `lucide-react`
  - `cloudinary` + `next-cloudinary`
  - `sonner` (toast notifications)
- [ ] **Configure Tailwind CSS** (custom design tokens)
  - Primary (Blue), Secondary (White), Neutral & Status colors
  - Font family: Geist (fallback: Inter, system-ui, sans-serif)
  - Font sizes: 48px → 12px scale
  - Spacing scale: 4, 8, 12, 16, 24, 32, 40, 48, 64
  - Border radius: 6px, 10px, 16px, 9999px
  - Shadows: small (cards), medium (dropdowns), large (modals)
- [ ] **Set up folder structure**
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

- [ ] **Create Supabase project** (dev environment)
- [ ] **Enable Supabase Authentication** (Email + Password)
- [ ] **Create database migration** for all tables
  - [ ] `users` (extends Supabase auth.users)
  - [ ] `categories`
  - [ ] `products`
  - [ ] `product_images`
  - [ ] `delivery_locations`
  - [ ] `orders`
  - [ ] `order_items`
  - [ ] `payments`
  - [ ] `reviews`
  - [ ] `settings`
- [ ] **Add database indexes**
  - `email`, `phone_number`, `slug`, `sku`, `category_id`, `product_id`
  - `order_number`, `payment_id`, `flutterwave_reference`
  - `payment_status`, `order_status`
- [ ] **Configure Row Level Security (RLS)** on every table
  - [ ] Guests: read active products/categories only
  - [ ] Customers: own orders, own profile, reviews for delivered purchases
  - [ ] Admins: full access
- [ ] **Create database triggers** for `created_at` / `updated_at` timestamps
- [ ] **Seed development data** (categories, sample products, delivery locations)
- [ ] **Create Supabase Edge Functions** (if needed for webhooks/payments)
- [ ] **Set up staging Supabase project** (mirror dev schema)

---

## Phase 4: Supabase Client & Auth Setup

- [ ] **Initialize Supabase client** (`src/lib/supabase/client.ts`)
  - Browser client (public anon key)
  - Server client (service role for admin ops)
- [ ] **Set up Supabase SSR helpers** for Next.js App Router
- [ ] **Build auth pages**
  - [ ] `/login` — email + password
  - [ ] `/register` — full name, email, password
  - [ ] `/forgot-password`
  - [ ] `/reset-password`
- [ ] **Implement authentication hooks**
  - `useAuth` / `useUser` — session + user state
  - `useLogin` / `useRegister` / `useLogout`
- [ ] **Create auth middleware** (`src/middleware.ts`)
  - Redirect unauthenticated users from protected pages
  - Redirect non-admin users away from admin pages
  - Preserve intended destination after login
- [ ] **Implement route protection patterns**
  - Public routes: home, products, cart, checkout, order tracking
  - Customer routes: dashboard, orders, profile, reviews
  - Admin routes: admin dashboard, products, categories, orders, customers, delivery locations, analytics, settings
- [ ] **Admin role seeding** — insert first admin user manually via Supabase SQL editor

---

## Phase 5: Design System & UI Components

### Core UI Components

- [ ] **Button** — Primary, Secondary, Outline, Text variants
- [ ] **Input** — text, email, password, search
- [ ] **Textarea**
- [ ] **Select**
- [ ] **Checkbox**
- [ ] **Radio Button**
- [ ] **Switch**
- [ ] **Badge** — Genuine Product Badge, Secure Payment Badge
- [ ] **Card** — reusable card wrapper
- [ ] **Modal**
- [ ] **Drawer**
- [ ] **Skeleton Loader**
- [ ] **Loading Spinner**
- [ ] **Empty State**

### Feedback Components

- [ ] **Toast** (success, warning, error) — positioned top of screen
- [ ] **Alert** — success, warning, error, info variants

### Layout Components

- [ ] **Navbar** (top navigation for desktop/tablet)
  - Logo, Search, Categories, Cart, Login/Profile
- [ ] **Bottom Navigation** (mobile)
  - Home, Categories, Search, Cart, Profile
- [ ] **Footer**
  - About, Contact, FAQ, Privacy Policy, Return Policy, Terms & Conditions

### Trust Components

- [ ] **Genuine Product Badge**
- [ ] **Secure Payment Notice**
- [ ] **Delivery Information**
- [ ] **Customer Support Contact**
- [ ] **Return Policy Summary**
- [ ] **FAQ Section**
- [ ] **Customer Reviews**
- [ ] **Order Tracking Timeline**

---

## Phase 6: Public Frontend Pages & Features

### Home Page (`/`)

- [ ] **Hero section** — tagline, trust elements, CTA to browse
- [ ] **Featured products** section
- [ ] **Categories** overview
- [ ] **Trust signals** — secure payment, genuine products, delivery info
- [ ] **Footer**

### Products (`/products`)

- [ ] **Product grid** with pagination
- [ ] **Search** functionality
- [ ] **Category filter**
- [ ] **Sorting** (price, newest, name)
- [ ] **Featured filter**

### Product Detail (`/products/[slug]`)

- [ ] **Image gallery** (main image + thumbnails)
- [ ] **Product info** — name, price, description, brand, stock status
- [ ] **Compare price** display (original vs selling)
- [ ] **Add to Cart** button
- [ ] **Buy Now** button
- [ ] **Stock status** indicator
- [ ] **Reviews section**

### Categories (`/categories/[slug]`)

- [ ] **Category header** with image and description
- [ ] **Filtered product grid**

### Cart (`/cart`)

- [ ] **Cart items list** — image, name, price, quantity selector
- [ ] **Remove item**
- [ ] **Clear cart**
- [ ] **Subtotal, delivery fee, total**
- [ ] **Proceed to Checkout** button

### Checkout (`/checkout`)

- [ ] **Customer information form** — name, phone, email
- [ ] **Delivery location selection** (admin-managed locations)
- [ ] **Order summary**
- [ ] **Payment method** — Bank Transfer via Dynamic Account
- [ ] **Place Order** button

### Order Confirmation (`/order/confirmation/[id]`)

- [ ] **Order number** display
- [ ] **Payment instructions** — bank name, account number, amount, expiry
- [ ] **Next steps** info

### Order Tracking (`/track`)

- [ ] **Guest tracking** — order number + phone number
- [ ] **Status timeline** — Pending → Payment Confirmed → Processing → Ready for Delivery → Out for Delivery → Delivered
- [ ] **Order details** — items, total, delivery info

---

## Phase 7: Customer Dashboard

- [ ] **Dashboard overview** — recent orders, profile summary
- [ ] **My Orders** — list with status, total, date, track button
- [ ] **Order Detail** — items, timeline, delivery info
- [ ] **Profile Management** — view/update name, email, phone, avatar
- [ ] **My Reviews** — products purchased, write/update reviews

---

## Phase 8: API Routes (Next.js API Handlers)

### Auth Endpoints (`/api/v1/auth/...`)

- [ ] `POST /auth/register` — create account + Supabase user
- [ ] `POST /auth/login` — authenticate
- [ ] `POST /auth/logout` — invalidate session
- [ ] `GET /auth/me` — current user info
- [ ] `POST /auth/forgot-password`
- [ ] `POST /auth/reset-password`

### Product Endpoints (`/api/v1/products/...`)

- [ ] `GET /products` — paginated, search, category filter, featured, sort
- [ ] `GET /products/[slug]` — single product with images
- [ ] `GET /products/featured` — featured products
- [ ] `GET /products/search` — search results

### Category Endpoints (`/api/v1/categories/...`)

- [ ] `GET /categories` — all active categories
- [ ] `GET /categories/[slug]` — single category with products

### Cart Endpoints (`/api/v1/cart/...`)

- [ ] `GET /cart` — get current cart
- [ ] `POST /cart/items` — add item
- [ ] `PATCH /cart/items/[itemId]` — update quantity
- [ ] `DELETE /cart/items/[itemId]` — remove item
- [ ] `DELETE /cart` — clear cart

### Checkout Endpoints (`/api/v1/checkout/...`)

- [ ] `POST /checkout` — full checkout (validate products, stock, calculate totals + delivery fee, create payment, create order)
- [ ] `POST /checkout/buy-now` — single product direct purchase (skip cart)

### Payment Endpoints (`/api/v1/payments/...`)

- [ ] `POST /payments/dynamic-account` — generate Flutterwave virtual account
- [ ] `GET /payments/[reference]` — verify payment
- [ ] `POST /payments/webhook/flutterwave` — Flutterwave webhook handler
  - Verify webhook signature
  - Confirm payment
  - Update payment record
  - Update linked order(s)
  - Trigger customer notification

### Order Endpoints (`/api/v1/orders/...`)

- [ ] `GET /orders/track` — guest tracking (order_number + phone_number)
- [ ] `GET /orders` — customer's orders (auth required)
- [ ] `GET /orders/[id]` — single order detail

### Review Endpoints (`/api/v1/reviews/...`)

- [ ] `POST /reviews` — create review (auth required, verified delivered order)
- [ ] `GET /products/[id]/reviews` — product reviews (public)

### Customer Profile (`/api/v1/profile/...`)

- [ ] `GET /profile` — get profile
- [ ] `PATCH /profile` — update profile

### Admin Endpoints (`/api/v1/admin/...`)

- [ ] `GET/POST /admin/products`
- [ ] `PATCH/DELETE /admin/products/[id]`
- [ ] `GET/POST /admin/categories`
- [ ] `PATCH/DELETE /admin/categories/[id]`
- [ ] `GET /admin/orders`
- [ ] `GET /admin/orders/[id]`
- [ ] `PATCH /admin/orders/[id]` — update order/payment/delivery status
- [ ] `GET/POST /admin/delivery-locations`
- [ ] `PATCH/DELETE /admin/delivery-locations/[id]`
- [ ] `GET /admin/customers`
- [ ] `GET /admin/customers/[id]`
- [ ] `PATCH /admin/customers/[id]`
- [ ] `GET /admin/settings`
- [ ] `PATCH /admin/settings`
- [ ] `GET /admin/dashboard` — revenue, orders, pending, products, customers, low stock, recent orders

---

## Phase 9: Admin Dashboard

- [ ] **Dashboard overview** — stats cards, charts, recent orders
- [ ] **Product management** — CRUD, image upload, inventory
- [ ] **Category management** — CRUD
- [ ] **Order management** — view, update status, verify payment
- [ ] **Customer management** — view, disable/enable accounts
- [ ] **Delivery location management** — CRUD, set fees, enable/disable
- [ ] **Store settings** — support phone/email, store address, return/privacy/terms
- [ ] **Analytics** — sales data, popular products, order trends

---

## Phase 10: Payment Integration (Flutterwave)

- [ ] **Create Flutterwave account** (sandbox + live)
- [ ] **Generate API keys** (secret key, webhook secret)
- [ ] **Implement dynamic virtual bank account generation**
  - `POST /api/v1/payments/dynamic-account`
  - Return bank name, account number, account name, amount, expiry
- [ ] **Implement payment verification**
  - `GET /api/v1/payments/[reference]`
- [ ] **Implement Flutterwave webhook handler**
  - Verify webhook signature
  - Idempotent processing (prevent duplicates)
  - Update payment status
  - Update linked orders
  - Trigger notifications
- [ ] **Build payment UI components**
  - Payment instructions display
  - Payment status polling
  - Payment confirmation page
- [ ] **Configure webhook endpoints** in Flutterwave dashboard
  - Development: ngrok/local tunnel
  - Staging: staging URL
  - Production: production URL

---

## Phase 11: Image Management (Cloudinary)

- [ ] **Create Cloudinary account**
- [ ] **Set up folders per environment** (`development/`, `staging/`, `production/`)
- [ ] **Integrate Cloudinary upload widget** or API
- [ ] **Build admin product image upload** (multiple images, reorder)
- [ ] **Configure image transformations** (optimize, resize)
- [ ] **Display images** on product cards, detail pages

---

## Phase 12: Email & Notifications

- [ ] **Set up email service** (Supabase built-in or Resend/SendGrid)
- [ ] **Order confirmation email** — order number, items, total, payment instructions
- [ ] **Payment confirmation email** — payment received, order being processed
- [ ] **Order status update emails** — processing, out for delivery, delivered
- [ ] **Admin notification** — new order placed

---

## Phase 13: Security Hardening

- [ ] **Enable HTTPS** (Vercel provides by default)
- [ ] **Configure HTTP security headers**
  - Content-Security-Policy (CSP)
  - X-Content-Type-Options
  - X-Frame-Options
  - Referrer-Policy
  - Permissions-Policy
  - Strict-Transport-Security (HSTS)
- [ ] **Implement rate limiting** on sensitive endpoints
  - Login, registration, password reset, checkout, order tracking, payments, webhooks
- [ ] **Add input validation** (Zod schemas) on all API routes
- [ ] **Implement CSRF protection** for state-changing requests
- [ ] **Configure CORS** — allow only approved origins
- [ ] **Webhook signature verification** (Flutterwave)
- [ ] **Sanitize user-generated content** (reviews, names, search terms)
- [ ] **File upload restrictions** — images only, size limits, MIME validation
- [ ] **Verify RLS policies** on every database table before deployment

---

## Phase 14: Testing

- [ ] **Unit tests** for utility functions and hooks
- [ ] **Component tests** for UI components
- [ ] **Integration tests** for API routes
  - [ ] Auth flow (register, login, logout, password reset)
  - [ ] Product CRUD
  - [ ] Cart operations
  - [ ] Checkout flow
  - [ ] Payment webhook handling
  - [ ] Order tracking
  - [ ] Admin operations
- [ ] **E2E tests** for critical user flows
  - [ ] Guest purchase (browse → cart → checkout → payment)
  - [ ] Buy Now flow
  - [ ] Customer registration → login → purchase
  - [ ] Order tracking
  - [ ] Admin product management
  - [ ] Admin order management
- [ ] **Security testing**
  - [ ] Authentication tests
  - [ ] Authorization tests (guests, customers, admins)
  - [ ] Input validation
  - [ ] SQL injection
  - [ ] XSS
  - [ ] CSRF
  - [ ] File upload
  - [ ] Webhook signature verification

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
