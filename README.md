# Anjani Infra - Standalone Admin Portal

This is the standalone **Admin Portal** for Anjani Infra, separated from the main customer-facing website. It can be hosted independently (e.g. on `admin.anjaniinfra.com` or Vercel/Node.js server) or run alongside the main website.

---

## 🚀 Quick Start

### 1. Run Development Server
```bash
# From the admin directory:
cd admin
npm run dev
```
The admin portal will start at: **`http://localhost:3003`**

### 2. Login Credentials
- **URL**: `http://localhost:3003/login`
- **Email / Username**: `admin@anjaniinfra.com` *(or simply `admin`)*
- **Password**: `admin@anjani2026`
- **One-Click Autofill**: Click the **"Autofill Credentials"** button on the login screen.

---

## 📁 Directory Architecture

```
admin/
├── app/
│   ├── actions.ts          # Server Actions for CRUD operations
│   ├── globals.css         # Styling with Tailwind & animations
│   ├── layout.tsx          # Root admin layout & metadata
│   ├── page.tsx            # Main Unified Admin Dashboard
│   └── login/
│       └── page.tsx        # Luxury Gold Admin Login Page
├── components/             # Reusable UI components
├── lib/
│   ├── auth.ts             # HMAC-SHA256 session token manager
│   ├── supabaseAdmin.ts    # Supabase service role client
│   ├── supabaseClient.ts   # Public Supabase client
│   └── youtube.ts          # YouTube embed helper
├── data/                   # Local JSON fallback data
├── public/                 # Static assets (logo, icons)
├── middleware.ts           # Route protection guard
├── .env.local              # Supabase & Auth environment variables
├── package.json            # Independent dependencies & scripts
├── tsconfig.json           # Isolated TypeScript configuration
├── tailwind.config.js      # Luxury dark & gold palette config
└── next.config.mjs         # Next.js standalone settings
```

---

## 🔒 Security Features
1. **Middleware Route Protection**: Automatically redirects any unauthenticated user to `/login`.
2. **Signed Session Cookies**: Issues HTTP-only, 7-day HMAC-SHA256 encrypted tokens (`anjani_admin_session`).
3. **Dedicated Sign Out**: Instant session termination and redirection back to `/login`.
4. **Independent Deployment**: Can be deployed to a private subdomain (`admin.anjaniinfra.com`) with separate environment variables.
