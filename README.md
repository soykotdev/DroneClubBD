# Drone Club Bangladesh — Website & Admin Platform

A production-track corporate website and administration platform for Drone Club Bangladesh: drone-based solar panel inspection, cleaning, operation & maintenance, equipment supply and training.

> **Read [PROGRESS.md](./PROGRESS.md) first.** It states plainly what is fully built and verified versus what is scaffolded and still needs work. This README describes the system as designed; PROGRESS.md is the honest status report.

## 1. Overview

- **Public site**: marketing pages, service/equipment/project catalogs backed by the CMS, a multi-step inspection-request form, contact/newsletter, and token-gated secure report access.
- **Admin panel** (`/admin`): role-based CMS, lead management, project management, and secure report-link sharing.
- **API**: Express + TypeScript REST API over MongoDB, with Argon2id + JWT auth, rate limiting, and server-side validation as the actual authority (never trusting the frontend).

## 2. Technology Stack

| Layer | Stack |
|---|---|
| Frontend | React 18 + TypeScript, Vite, React Router, Tailwind CSS 4, Motion for React, TanStack Query, React Hook Form + Zod, Recharts, Sonner |
| Backend | Node.js, Express, TypeScript, MongoDB Node driver, Argon2id, JWT, Helmet, express-rate-limit, Multer, Nodemailer |
| Shared | Zod schemas + TypeScript types consumed by both client and server (`shared/`) |
| Testing | Vitest, React Testing Library, Supertest, Playwright, ESLint, TypeScript strict mode |

## 3. Folder Structure

```text
droneclub-bangladesh/ (this repo)
  client/     React frontend (Vite)
  server/     Express API
  shared/     Zod schemas & types used by both
  tests/e2e/  Playwright specs
  scripts/    Repo-level tooling (image optimization)
  docker-compose.yml   Local MongoDB fallback
  .env.example
```

See `client/src/` and `server/src/` for the internal module layout (components/features/pages vs. controllers/repositories/routes).

## 4. Local Setup

Requirements: Node.js ≥ 20.19 (or ≥ 22.12 — see the engine note below), npm ≥ 10.

```bash
npm install
```

> `@vitejs/plugin-react` requires Node `^20.19.0 || >=22.12.0`. Node 22.11 or earlier will print a harmless `EBADENGINE` warning during install — upgrade Node if you hit real issues, otherwise it can be ignored.

### 4.1 Environment Configuration

```bash
cp .env.example server/.env
cp client/.env.example client/.env
```

Fill in `server/.env` with real values. **Never commit `server/.env` or `client/.env`.**

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run that three times for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET`.

### 4.2 ⚠️ Credential Rotation Warning

If a MongoDB connection string was ever shared outside of `server/.env` (in chat, a doc, a screenshot, a support ticket — anywhere outside this one git-ignored file), **treat it as permanently compromised**, not just "before production." Rotate it immediately in Atlas:

**Database Access → Edit user → Edit password**, then update `server/.env` with the new value. Do this *now*, independent of whether the site has shipped yet — an exposed credential doesn't become safe by virtue of the project being in development.

General rules enforced throughout this codebase:

- `MONGODB_URI` is read only in `server/src/config/env.ts` and is never logged, never sent to the client, never placed in a `VITE_`-prefixed variable.
- `server/.env` and `client/.env` are git-ignored (see `.gitignore`).
- The MongoDB user should be least-privileged (read/write on the `droneclub` database only — not an Atlas admin account) and network access should be restricted to your backend's egress IPs where possible.

### 4.3 MongoDB Atlas Setup

1. Create (or reuse, after rotating credentials as above) a database user scoped to the `droneclub` database only.
2. Under Network Access, allow only the IP ranges your backend actually runs from (or `0.0.0.0/0` temporarily during local development only, then tighten before production).
3. Copy the SRV connection string into `MONGODB_URI` in `server/.env`.
4. TLS and the MongoDB Stable API are already configured in `server/src/database/mongoClient.ts` — no extra setup needed.

### 4.4 Local MongoDB via Docker (no Atlas credential needed)

```bash
docker compose up -d
```

Then in `server/.env`:

```env
MONGODB_URI=mongodb://droneclub:droneclub_dev_only@localhost:27017/droneclub?authSource=admin
```

This starts MongoDB plus Mongo Express (a web UI) at `http://localhost:8081` (basic auth `admin` / `droneclub_dev_only`) — local development only, not a production credential.

### 4.5 Database Seeding & Initial Admin

```bash
npm run build:shared        # shared/ compiles to dist/ — required before server/client can resolve it
npm run seed --workspace=server
npm run create-admin --workspace=server
```

`create-admin` reads `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` from `server/.env` (≥ 12 characters) and creates a Super Admin account with `mustChangePassword: true` — the temporary password stops being usable as soon as the admin logs in and is forced through the change-password screen. Never put a real password directly in a seed script.

Seeding populates verified services, verified equipment, and default site settings. **Projects are intentionally left empty** — add real projects only through the admin panel; the public site shows an honest empty state until then.

## 5. Development

```bash
npm run dev
```

This builds `shared/` once, then runs the API (port 4000) and the Vite dev server (port 5173, proxying `/api` and `/uploads` to 4000) together.

If you edit anything in `shared/src/`, re-run `npm run build:shared` (or `npm run build:shared` in a second terminal loop) — both `client` and `server` resolve `@droneclub/shared` from its built `dist/`, not from source, so changes there aren't picked up automatically by watch mode.

Admin panel: `http://localhost:5173/admin/login`.

## 6. Image & Asset Management

The 15 required homepage images were mapped from the supplied `images/` folder by content (see `client/public/assets/images/`) — exact filenames from the brief weren't all present, so the closest genuine photo was used for each slot (e.g. the infrared/thermal photo covers both the thermal-comparison and hotspot-identification slots). Every image is replaceable through the admin Media Library once that upload flow is wired to a given page section.

To generate optimized WebP variants and the favicon set from the logo:

```bash
npm run prepare-assets
```

This uses `sharp` (a root devDependency) and writes to `client/public/assets/images/generated/` — review the output before wiring it into `<picture>` sources / `index.html`.

## 7. Storage Configuration

`STORAGE_PROVIDER=local` (default) writes uploads to `server/uploads/` (outside the client's public source tree) and serves them from `/uploads/*`. Set `STORAGE_PROVIDER=s3` and fill in the `S3_*` variables to use S3-compatible object storage instead — see `server/src/storage/s3StorageProvider.ts` (currently a stub; implement with `@aws-sdk/client-s3` before using in production). Private report files are never served from a static path — only through the token-gated `/api/public/reports/:secureToken` endpoint.

## 8. Email Configuration

Leave `SMTP_*` blank in development — the app logs "SMTP not configured — skipping send" instead of failing. Fill in `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `EMAIL_FROM` to enable inspection-request confirmation and admin-notification emails.

## 9. Commands

```bash
npm run lint          # ESLint across server + client
npm run typecheck     # TypeScript strict mode across shared + server + client
npm run test          # Vitest (server: Supertest API tests; client: RTL component tests)
npm run test:e2e      # Playwright — needs `npx playwright install` once, and a seeded database
npm run build          # shared → server → client, in order
```

Run `npm run build:shared` before the others touch `@droneclub/shared` for the first time in a fresh checkout.

## 10. Production Build & Deployment

```bash
npm run build
npm run start --workspace=server   # serves the API from server/dist/src/server.js
```

The client build (`client/dist/`) is static output — serve it from any static host or CDN, with the API reachable at the path configured in `VITE_API_BASE_URL` at build time. Point your reverse proxy's `/uploads` path at the server's upload directory (or your S3 bucket, if `STORAGE_PROVIDER=s3`).

### 10.1 Recommended split: Vercel (client) + Render (API)

Vercel hosts static builds and serverless functions — it does not run this Express server as a persistent process. The straightforward pairing:

1. **API on Render**: `render.yaml` at the repo root is a ready-to-use Blueprint. In the Render dashboard, "New +" → "Blueprint" → pick this repo. Fill in the `sync: false` values it leaves blank: `MONGODB_URI` (your rotated Atlas string), `CLIENT_URL` and `CORS_ALLOWED_ORIGINS` (your Vercel URL, e.g. `https://your-app.vercel.app`), and `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`. Render injects `PORT` itself — don't set it. After the first deploy, run `npm run create-admin --workspace=server` once via Render's shell (or locally against the same `MONGODB_URI`) to create the Super Admin account, and `npm run seed --workspace=server` to populate services/equipment.
2. **Client on Vercel**: import the repo, set the project root to `client/`, framework preset Vite. Set `VITE_API_BASE_URL` to your Render service's URL plus `/api` (e.g. `https://droneclub-api.onrender.com/api`) — this must be the **real deployed API URL**, not `localhost`.
3. Once both are live, update the Render service's `CLIENT_URL` / `CORS_ALLOWED_ORIGINS` to match the final Vercel domain if it changed, and redeploy the API so CORS reflects it.

**Cross-site cookie note**: because the client and API sit on different domains in this split (`*.vercel.app` vs `*.onrender.com`), the refresh-token cookie is set with `SameSite=None; Secure` in production (see `server/src/controllers/authController.ts`) — required for the browser to send it on cross-site requests at all. In local development both run on `localhost` (same site, different ports), so `SameSite=Strict` is used there instead.

**Free-tier caveats**: Render's free web services spin down after inactivity (the first request after idle takes ~30–50s to wake up) and use an **ephemeral filesystem** — anything written to `uploads/` (inspection-request attachments, media library files) is lost on every redeploy or restart. `STORAGE_PROVIDER=s3` is the fix for persistent uploads in production, but that provider is currently a stub (see `server/src/storage/s3StorageProvider.ts`) — implement it with `@aws-sdk/client-s3` before relying on file uploads surviving a redeploy.

## 11. Backup Recommendations

- Enable MongoDB Atlas's continuous backups (or a scheduled `mongodump` for a self-hosted instance).
- Back up the `uploads/` directory (or your S3 bucket) alongside the database — media references in MongoDB point to files that live outside it.
- Keep `server/.env` in a secrets manager or password manager, never in a backup that could end up somewhere less controlled than the server itself.

## 12. Security Checklist

- [x] Secrets read only server-side, via `server/src/config/env.ts`; never logged, never in a `VITE_` variable.
- [x] Argon2id password hashing, short-lived access tokens, rotating HTTP-only refresh cookies, refresh-token-reuse detection (burns the session family on replay).
- [x] Role-based authorization enforced in Express middleware (`requireRole`), not just hidden in the UI.
- [x] Rate limiting on login and public form submissions; progressive account lockout after repeated failed logins.
- [x] Multer file uploads validated by MIME type, size, and magic-byte signature (not just the client-supplied `Content-Type`).
- [x] Secure report links: only a SHA-256 hash of the share token is ever stored; the raw token is shown to the admin exactly once.
- [x] Central error handler never leaks stack traces in production.
- [x] `.env`, `uploads/`, and generated build output are all git-ignored.
- [ ] CSRF hardening beyond `SameSite=strict` cookies + CORS allowlist — revisit before production if the admin panel will ever be embedded or accessed cross-origin.
- [ ] Dependency vulnerability scanning in CI (`npm audit` was run manually during this build — wire it into CI going forward).

## 13. Admin User Guide (quick start)

1. Sign in at `/admin/login` with the account created by `create-admin`.
2. You'll be forced to set a new password on first login.
3. **Dashboard** shows live counts from MongoDB (zero, not fake data, when empty).
4. **Leads** lists inspection requests — filter by status/service, add internal notes, and use **Convert to Project** once you're ready to start work.
5. **Services / Equipment** let Content Editors and Super Admins create and publish catalog entries.
6. **Projects** are created via lead conversion; toggle **Publish as case study** to surface one on the public `/projects` page.
7. **Reports** (inside a project's detail page) generates a secure, time-limited share link — copy it immediately, it is shown only once.
8. **Settings** (Super Admin only) edits company contact info and footer text.

## 14. Report-Sharing Guide

1. Open the relevant project under **Admin → Projects**.
2. Under **Secure Report Sharing**, provide a title, the uploaded report's file URL, and an expiry date/time.
3. Click **Generate Share Link** — copy the URL shown; it will not be displayed again (only its hash is stored).
4. Send that link directly to the client. Anyone with the link can view/download the report until it expires, is revoked, or hits its download limit (if one was set).
5. To cut off access early, click **Revoke** next to the link — this takes effect immediately.

---

Built as a phased, verified implementation — see [PROGRESS.md](./PROGRESS.md) for exactly what has been run and checked versus what remains.
