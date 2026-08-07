# NasFon Store — Deployment Guide

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [Git](https://git-scm.com/) — `develop` branch checked out
- [Supabase](https://supabase.com/) account
- [Vercel](https://vercel.com/) account
- [Cloudinary](https://cloudinary.com/) account
- [Paystack](https://paystack.com/) account (live keys for production)
- [Resend](https://resend.com/) account

---

> **Important:** Environment variables for Vercel are set in the **Vercel Dashboard** (Project → Settings → Environment Variables), **never** uploaded via `.env.local`. The `.env.local` file is for local development only. See `.env.example` for all required variable names.

### Resend (email delivery) troubleshooting

- Registrations and session re-verification **require** `RESEND_API_KEY` and `FROM_EMAIL`. If they are missing, the OTP flow now fails loudly instead of silently pretending the code was sent.
- The Resend SDK error `application_error` with `statusCode: null` and message `"Unable to fetch data. The request could not be resolved."` means the server **could not reach `https://api.resend.com`** (network-level failure). It is *not* a bad key (`401`) or an unverified domain (`403`/`422`). Check:
  - Outbound HTTPS access from the runtime (Vercel functions allow it; restricted networks/sandboxes may not).
  - `RESEND_BASE_URL` is not set to an invalid value (the SDK uses it as the API base URL).
  - Resend service status at https://resend-status.com — retry later if there is an incident.
- The `from` domain (`FROM_EMAIL`) must be **verified in Resend** (Domains → Add domain → DNS records). Until it is, delivery requests return HTTP 403/422.
- Use a matching key and domain: a **test** API key can only send to `@resend.dev` addresses; use a **production** key for real recipients.

## 1. Staging Deployment

### 1.1 Create Staging Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `nasfon-store-staging`
3. Note the **Project URL** and **API keys** (anon + service_role)
4. Open **SQL Editor** and run `apps/web/supabase/migrations/001_initial_schema.sql`
5. Enable **Authentication → Email provider**
6. (Optional) Disable "Confirm email" for easier testing

### 1.2 Create Staging Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/) → **Add New → Project**
2. Import the GitHub repository
3. **Root Directory**: `apps/web`
4. **Framework Preset**: Next.js (auto-detected)
5. **Environment Variables** — add all variables from `.env.example` with staging values
6. Deploy — Vercel will auto-deploy from the `develop` branch

### 1.3 Configure Cloudinary Staging Folder

1. In Cloudinary, create folder `nasfon_store/staging/`
2. Upload preset: `nasfon_store` (unsigned)

### 1.4 Set Up Staging Webhook

1. Get the staging URL: `https://nasfon-store-staging.vercel.app`
2. In the Paystack dashboard, add a webhook:
   - URL: `https://nasfon-store-staging.vercel.app/api/v1/payments/webhook/paystack`
   - Event: `charge.success`
3. Set `PAYSTACK_SECRET_KEY` to the staging secret key in Vercel env vars

### 1.5 Seed Admin User

```bash
npm run seed:admin
```

Or via Supabase dashboard:
1. **Authentication → Users → Add User** (create `admin@nasfonstore.com`)
2. Copy the user's UUID from the table
3. Open SQL Editor and run `apps/web/supabase/seed-admin.sql` with the UUID

### 1.6 Verify Staging

- Home page loads
- Products visible, search works
- Cart + checkout + Paystack payment works
- Webhook processes payment
- Order tracking works
- Admin dashboard works
- Image upload works

---

## 2. Production Deployment

### 2.1 Pre-Deployment Checklist

- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No lint errors: `npm run lint`
- [ ] Environment variables configured in Vercel
- [ ] Database migrations reviewed
- [ ] Payment webhook verified with Paystack live
- [ ] Cloudinary production credentials verified
- [ ] HTTPS enabled (Vercel default)
- [ ] Security headers confirmed (check Vercel response headers)
- [ ] Product images optimized
- [ ] Admin login verified
- [ ] Customer checkout flow verified
- [ ] Order tracking verified

### 2.2 Create Production Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. Name: `nasfon-store`
3. Save the **Project URL** and **API keys**
4. Run migrations via SQL Editor
5. Enable **Authentication → Email provider**
6. **Enable "Confirm email"** for production (recommended)

### 2.3 Create Production Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/) → **Add New → Project**
2. Import the GitHub repository (same repo, new project)
3. **Root Directory**: `apps/web`
4. **Framework Preset**: Next.js
5. **Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=<production-url>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<production-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
   PAYSTACK_SECRET_KEY=<live-secret-key>
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
   CLOUDINARY_API_KEY=<api-key>
   CLOUDINARY_API_SECRET=<api-secret>
   APP_URL=https://nasfon.store
   RESEND_API_KEY=<resend-api-key>
   FROM_EMAIL=NasFon Store <noreply@nasfon.store>
   PAYMENT_EXPIRY_MINUTES=30
   ```
6. **Production Branch**: `main`

### 2.4 Configure Paystack Live

1. In the Paystack live dashboard, add a webhook endpoint:
   - URL: `https://nasfon.store/api/v1/payments/webhook/paystack`
   - Event: `charge.success`
2. Verify webhook signature with a test transaction

### 2.5 Cloudinary Production Folder

1. Create folder `nasfon_store/production/` in Cloudinary
2. Update upload preset if needed

### 2.6 Deploy

```bash
git checkout main
git merge develop
git push origin main
```

Vercel will auto-deploy from `main`.

### 2.7 Verify Production

Run through the full verification checklist from Phase 17 of `to-do.md`.

---

## 3. Post-Deployment

### 3.1 Monitoring

- **Vercel Analytics**: Enable in Vercel dashboard for traffic and performance
- **Supabase Monitoring**: Check database health, query performance
- **Error Tracking**: Set up [Sentry](https://sentry.io/) or similar

### 3.2 Backups

- Supabase provides automatic daily backups (enable in project settings)
- Verify backup schedule in Supabase Dashboard → Database → Backups

### 3.3 Environment Variables Per Environment

| Variable | Staging | Production |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | staging project URL | production project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | staging anon key | production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | staging service key | production service key |
| `PAYSTACK_SECRET_KEY` | test secret key | live secret key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | same (or separate) | same (or separate) |
| `CLOUDINARY_API_KEY` | same | same |
| `CLOUDINARY_API_SECRET` | same | same |
| `APP_URL` | staging URL | `https://nasfon.store` |
| `RESEND_API_KEY` | test key | production key |
| `FROM_EMAIL` | staging sender | production sender |

---

## 4. Useful Commands

```bash
# Development
npm run dev            # Start dev server
npm test               # Run tests
npm run lint           # Lint code
npx tsc --noEmit       # TypeScript check

# Database
npm run seed:admin     # Seed admin user from env vars

# Staging deployment (automatic via develop branch push)
git push origin develop

# Production deployment
git checkout main && git merge develop && git push origin main
```

---

## 5. Rollback

If a production deployment fails:

1. **Vercel**: Go to project → Deployments → find last working deployment → **Promote to Production**
2. **Database**: Restore from Supabase backup if schema changes caused issues
3. **Git**: `git revert` the problematic commit on `main`
