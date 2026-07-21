# Deployment Guide

# Overview

This document defines the deployment strategy for NasFon Store across development, staging, and production environments.

The deployment process must be automated, repeatable, secure, and minimize downtime.

---

# Deployment Architecture

```text
Developer
      │
      ▼
GitHub Repository
      │
      ▼
Vercel
      │
      ▼
Next.js Application
      │
      ├────────────► Supabase
      │               PostgreSQL
      │               Authentication
      │               Edge Functions
      │
      ├────────────► Cloudinary
      │               Product Images
      │
      └────────────► Flutterwave
                      Dynamic Accounts
                      Payment Webhooks
```

---

# Environments

## Development

Purpose

* Local development
* Feature implementation
* Debugging

Services

* Local Next.js
* Development Supabase Project
* Cloudinary Development Folder
* Flutterwave Sandbox

---

## Staging

Purpose

* Internal testing
* QA
* Client acceptance testing

Services

* Staging Vercel Project
* Staging Supabase Project
* Staging Cloudinary Folder
* Flutterwave Sandbox

---

## Production

Purpose

* Live customers

Services

* Production Vercel Project
* Production Supabase Project
* Production Cloudinary Folder
* Flutterwave Live

---

# Source Control

Repository

GitHub

Main Branches

* main
* develop

Feature Branches

Example

```text
feature/product-management
feature/payment-module
feature/admin-dashboard
```

---

# Deployment Workflow

Developer

↓

Create Feature Branch

↓

Develop Feature

↓

Open Pull Request

↓

Code Review

↓

Merge into develop

↓

Deploy to Staging

↓

Testing

↓

Merge into main

↓

Automatic Production Deployment

---

# Environment Variables

## Next.js

Required variables

```text
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

Store all secrets using the hosting platform's encrypted environment variable manager.

Never commit `.env` files to version control.

---

# Build Process

1. Install dependencies
2. Run linting
3. Run type checking
4. Run automated tests
5. Build Next.js application
6. Deploy

Deployment should stop if any step fails.

---

# Database Deployment

Use version-controlled SQL migrations.

Deployment process

1. Create migration
2. Review migration
3. Apply to Development
4. Test
5. Apply to Staging
6. Verify
7. Apply to Production

Never edit the production database manually unless it is part of an approved emergency procedure.

---

# Storage Deployment

Cloudinary

* Separate folders per environment
* Organize images by product
* Remove unused assets during maintenance
* Optimize images automatically

Example structure

```text
development/
staging/
production/
```

---

# Payment Configuration

## Development

* Flutterwave Sandbox
* Test webhook endpoint

---

## Production

* Flutterwave Live Keys
* Production webhook endpoint
* Signature verification enabled

Always verify webhook authenticity before updating orders.

---

# Monitoring

Monitor

* Application uptime
* Build failures
* API errors
* Database performance
* Payment failures
* Image upload failures
* Authentication failures

---

# Logging

Record

* Deployment history
* Application errors
* Payment webhook events
* Authentication events
* Server exceptions

Do not log passwords, tokens, API keys, or sensitive customer information.

---

# Backup Strategy

Supabase

* Automated backups
* Point-in-time recovery (if available)

Cloudinary

* Original assets retained
* Regular export if required

Application

* GitHub repository as source of truth

---

# Rollback Strategy

If a deployment fails

1. Stop traffic to the failed release if necessary.
2. Roll back to the last stable deployment.
3. Investigate the issue.
4. Fix and redeploy.
5. Verify application health.

Database rollbacks must be planned carefully to avoid data loss.

---

# Deployment Checklist

Before Production Deployment

* All tests pass
* No TypeScript errors
* No linting errors
* Environment variables configured
* Database migrations reviewed
* Payment webhook verified
* Cloudinary credentials verified
* HTTPS enabled
* Security headers enabled
* SEO metadata reviewed
* Product images optimized
* Admin login verified
* Customer checkout verified
* Order tracking verified
* Bank transfer payment flow verified

---

# Post-Deployment Verification

Confirm that:

* Home page loads
* Products are visible
* Search works
* Buy Now works
* Cart works
* Checkout works
* Dynamic bank account generation works
* Flutterwave webhook updates payments correctly
* Orders are created
* Order tracking works
* Admin dashboard works
* Product uploads work
* Images load correctly
* Emails or notifications (if enabled) are sent successfully

---

# Disaster Recovery

If production becomes unavailable:

1. Identify the affected service.
2. Restore from the latest stable deployment or backup.
3. Verify database integrity.
4. Validate payment processing.
5. Confirm customer-facing functionality.
6. Document the incident and preventive actions.

---

# Deployment Principles

* Automate deployments whenever possible.
* Keep production and staging environments consistent.
* Never deploy directly from a local machine to production.
* Protect secrets using secure environment variables.
* Validate every deployment before exposing it to customers.
* Ensure every deployment can be rolled back safely.

