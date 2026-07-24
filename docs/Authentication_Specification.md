# Authentication Specification

# Overview

NasFon Store uses **Supabase Authentication** for user authentication and session management.

The authentication system supports both **guest shoppers** and **registered customers**, while restricting administrative features to authorized administrators.

---

# Authentication Goals

* Keep purchasing simple.
* Allow guest checkout.
* Protect customer data.
* Protect admin resources.
* Secure all authenticated sessions.
* Minimize friction for first-time buyers.

---

# Authentication Methods

## Guest

No authentication required.

Guest users can:

* Browse products
* Search products
* View product details
* Add products to cart
* Buy Now
* Checkout
* Track orders using:

  * Order Number
  * Phone Number

Guests cannot:

* View previous orders
* Leave reviews
* Access customer dashboard
* Save profile information

---

## Customer Account

Authentication using:

* Email + Password

---

# Role-Based Access Control (RBAC)

The application enforces **Role-Based Access Control (RBAC)** — access to resources is determined by the user's assigned role (`customer` or `admin`). Guests are assigned an implicit role with the least privilege.

## Guest Role

Permissions

* Public store access
* Checkout
* Track order

---

## Customer Role

Permissions

Everything available to Guests, plus:

* View order history
* Manage profile
* Leave product reviews
* Faster future checkout

---

## Admin Role

Permissions

* Dashboard
* Products
* Categories
* Orders
* Delivery Locations
* Customers
* Analytics
* Store Settings

---

# Registration Flow

User

↓

Sign Up

↓

Enter

* Full Name
* Email
* Password

↓

Supabase Creates User

↓

Create User Profile

↓

Login

↓

Customer Dashboard

---

# Login Flow

User

↓

Enter Email

↓

Enter Password

↓

Validate Credentials

↓

Create Session

↓

Dashboard

---

# Logout Flow

Customer

↓

Logout

↓

Invalidate Session

↓

Redirect Home

---

# Password Reset Flow

Forgot Password

↓

Enter Email

↓

Reset Email Sent

↓

Create New Password

↓

Login

---

# Session Management

Supabase manages:

* Access Token
* Refresh Token
* Session Expiration
* Token Refresh

The frontend should automatically refresh valid sessions without requiring users to log in again.

---

# Route Protection

## Public Routes

* Home
* Products
* Categories
* Product Details
* Search
* Cart
* Checkout
* Order Tracking
* Login
* Register

---

## Customer Routes

Authentication required.

* Dashboard
* My Orders
* Profile
* Reviews

---

## Admin Routes

Authentication and Admin role required.

* Dashboard
* Products
* Categories
* Orders
* Customers
* Delivery Locations
* Analytics
* Settings

---

# Authorization (RBAC Enforcement)

Authorization is enforced via **RBAC** using the user's role stored in the database.

Available roles:

* customer
* admin

Every protected request must verify:

1. Valid session
2. User exists
3. User is active
4. User has the required role (RBAC check)

---

# Middleware

Next.js middleware should:

* Read authentication session
* Redirect unauthenticated users from protected pages
* Redirect non-admin users away from admin pages
* Preserve intended destination after login where appropriate

---

# Row Level Security (RLS)

Customers

* Read only their own profile
* Update only their own profile
* Read only their own orders
* Create reviews only for delivered orders they purchased

Admins

* Full access to administrative resources

Guests

* Public read access only where permitted

---

# Security

* HTTPS only
* Secure cookies
* CSRF protection where applicable
* Password hashing handled by Supabase
* JWT validation
* Server-side authorization
* Rate limiting
* Input validation
* Account status verification

---

# Validation Rules

## Registration

Full Name

* Required
* 2–100 characters

Email

* Required
* Valid email format
* Unique

Password

* Minimum 8 characters

---

## Login

Email

* Required

Password

* Required

---

# Account Status

Available statuses:

* active
* suspended
* deleted

Suspended users cannot log in or access protected resources.

---

# Authentication Events

Record the following events for auditing and troubleshooting:

* User Registered
* User Logged In
* User Logged Out
* Password Reset Requested
* Password Changed
* Session Expired
* Admin Login
* Failed Login Attempt

---

# Future Enhancements

Not included in the MVP:

* Email verification
* Two-factor authentication (2FA)
* Phone number OTP
* Social login providers
* Login history
* Trusted devices
* Account recovery by phone

---

# Authentication Principles

* Keep checkout available without requiring registration.
* Require authentication only when it provides value to the customer.
* Perform authorization checks on the server for every protected request.
* Never expose administrative functionality to unauthenticated or unauthorized users.
* Design authentication to be secure by default while keeping the shopping experience simple.

