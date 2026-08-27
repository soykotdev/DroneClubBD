# Build Status — Honest Progress Report

This project is a genuinely large, multi-week production platform (full CMS, RBAC admin, lead pipeline, secure report sharing, SEO, accessibility, full test suites). This document says plainly what has actually been built and verified in this pass versus what is scaffolded, stubbed, or still pending — so nothing here is overstated.

**Verified in this pass** (actually run, not just written):
- `npm install` — clean, 0 vulnerabilities after dependency version fixes (see §6).
- `npm run build:shared`, `--workspace=server`, `--workspace=client` — all compile clean, including a full clean rebuild from scratch.
- `npm run typecheck` — clean on `shared`, `server`, `client` (TypeScript strict mode, `noUncheckedIndexedAccess`).
- `npm run lint` — 0 errors on both `server` and `client` (a couple of harmless warnings remain, noted inline in code).
- `npm run test --workspace=server` — 4/4 Supertest API tests pass (health check, 404 handling, Zod validation returning 422 before any DB call, admin route auth-gating + `X-Robots-Tag`).
- `npm run test --workspace=client` — 2/2 React Testing Library tests pass.
- A compiled-app smoke test (`node` importing the built `dist/src/app.js` and calling `createApp()`) confirms the entire module graph resolves and constructs at runtime, not just under `tsc`.

**Not verified**: an actual live MongoDB connection. There is no Docker available in the environment this was built in, and the only MongoDB credential available was one the user shared directly in chat — which Section 3 of the platform spec itself says must be treated as exposed and never used. So it was never connected to, logged, or embedded anywhere. **Rotate that credential in Atlas before using it at all** (see README §4.2). Once you have `server/.env` filled in (Atlas or `docker compose up -d`), run `npm run seed --workspace=server` and `npm run create-admin --workspace=server`, then `npm run dev` — the code paths are written and typecheck/lint clean, but end-to-end DB behavior (index creation, seeding, real CRUD round-trips) should be your first thing to check.

## What's fully built and wired end-to-end

- **Monorepo**: `shared/` (Zod schemas + types) → `server/` (Express + MongoDB) → `client/` (React + Vite), building in that order.
- **Auth**: Argon2id, JWT access tokens (in-memory only, never localStorage), rotating HTTP-only refresh cookies with reuse detection, forced initial password change, role-based middleware (`requireRole`) enforced server-side, audit logging on login/password-change/lead/service/equipment/project/report actions.
- **Public site**: Home (hero, capability strip, core services from live API, interactive workflow stepper, RGB/thermal comparison slider, why-us, final CTA), Services list/detail, Equipment list/detail, Projects list/detail with real empty state, About, Resources (empty-state ready), Inspection Process, Contact (with honeypot), Privacy/Terms placeholders, 404, and the token-gated `/report/:secureToken` page.
- **Inspection request system**: full 3-step form (contact → project → supporting info) with Zod validation on both ends, file upload with MIME + magic-byte signature validation, honeypot, session-draft preservation, rate limiting, reference-number generation, optional email notifications.
- **Admin panel**: login, forced password change, dashboard (real DB-backed counts + monthly chart with an accessible text summary), Leads (search/filter/status/priority/notes/convert-to-project/CSV export), Services & Equipment (list + create form), Projects (list + status/publish controls), secure Report link generation/listing/revocation per project, Settings (contact info/footer text).
- **Security**: Helmet, CORS allowlist, rate limiting (login + public forms + general API), credential-redacting logger, central error handler with no stack traces in production, `X-Robots-Tag: noindex` on all `/api/admin/*` responses, `robots.txt` disallowing `/admin` and `/report/`.
- **Brand system**: logo used unmodified, brand CSS tokens exactly as specified, three logo-derived motion primitives (`Propeller`, `RedCircle`, `SignalArc`) reused consistently for loaders, hotspot markers, active-nav indicators, and mega-menu-adjacent motion, `prefers-reduced-motion` respected globally and specifically inside Motion-for-React components.
- **Accessibility**: skip-link, focus-trapped + Escape-closing mobile menu, keyboard-operable comparison slider with proper ARIA slider semantics, 44px touch targets, accessible chart text summary, labelled forms with inline error messages.

## What's scaffolded but not fully built out

- **CMS breadth**: Pages/page-sections, Posts & Categories, Team Members, Testimonials, FAQs, Navigation editor, Footer editor, and SEO-metadata-per-page editing are modeled in the database design (`server/src/database/indexes.ts` creates their indexes) and have working **public read** endpoints, but do **not** yet have admin CRUD screens. The public endpoints correctly return empty-safe results (`[]` / 404) rather than fake data in the meantime.
- **Homepage**: sections for orthomosaic/fault-detection, drone cleaning, operation & maintenance, and training exist as dedicated pages/content, but are not all also duplicated as homepage sections the way the original 15-section spec lists them — the homepage currently covers hero, capability strip, core services, workflow, and the RGB/thermal comparison, then routes to dedicated pages for the rest.
- **Workflow interactivity**: the inspection-workflow stepper is a real interactive React/CSS component, but is a click-to-select stepper rather than a pinned-scroll/scroll-jacking experience on desktop.
- **Media library**: upload endpoint and storage abstraction exist and are wired into an admin upload route, but there's no dedicated "browse/reuse existing media" picker UI yet — admin content forms currently take a plain image URL field.
- **S3 storage provider**: interface defined, throws a clear "not implemented" error if selected — implement with `@aws-sdk/client-s3` before setting `STORAGE_PROVIDER=s3` in production.
- **Image assets**: the 15 homepage image slots are filled with the closest genuine supplied photo by content match (documented in README §6). WebP/AVIF generation is scripted (`npm run prepare-assets`) but not yet run/wired into `<picture>` tags — current images are the original PNG/JPEG.
- **Favicons**: real generated 16×16/32×32/apple-touch-icon PNGs are wired into `index.html`, cropped from the logo's propeller mark (`client/public/assets/images/logo-icon.png`) via `scripts/prepare-assets.mjs`. Fixed after the logo was found to be a wide wordmark, not a square icon.
- **Service portfolio imagery (5 of 12 cards)**: the service grid was expanded to the full 12-card professional portfolio (UAV Survey & Mapping, UAV LiDAR Survey, Drone Photogrammetry, Aerial Image Acquisition, 3D Mapping & Modeling, Power Line & Tower Inspection, Construction Progress Monitoring, Flood & Disaster Assessment, Drone Equipment & Training, plus the three original solar services). **Every image in the supplied `images/` folder is solar-context** — there is no generic land, powerline, construction-site, flood, or 3D-model photography available. Five cards (UAV Survey & Mapping, UAV LiDAR Survey, Drone Photogrammetry, Power Line & Tower Inspection, Construction Progress Monitoring, Flood & Disaster Assessment — six, really) are using the closest-available solar photo as an interim stand-in rather than a genuine photo of that service. **Real photography for these should be a priority follow-up** — using solar imagery for non-solar services works against the exact repositioning this change was meant to achieve. Aerial Image Acquisition and 3D Mapping & Modeling use non-solar generic shots (enterprise drone product cutout; equipment-studio pedestal) as a reasonable placeholder in the meantime.

## Not started

- Playwright e2e suite beyond one starter spec (`tests/e2e/homepage.spec.ts`) — install browsers with `npx playwright install` and run against a seeded database.
- Sitemap generation, structured data (Organization/Service/Article/Breadcrumb schema), and Open Graph image wiring.
- CSV/PDF report file upload UI in the admin (currently takes a file URL directly — pair with the media library once that's built out).
- Prerendering of public routes.
- CI pipeline (lint/typecheck/test/build on every push).

## Dependency versions changed from the initial draft

`npm audit` found real, current advisories against the versions first specified; these were bumped and re-verified at 0 vulnerabilities:

- `nodemailer` 6.9.16 → ^9.0.5 (multiple advisories, including SMTP command injection)
- `multer` 1.4.5 → ^2.0.0 (1.x is EOL with known vulnerabilities; the API used here — `.fields()`, `.single()`, `memoryStorage`, `fileFilter` — is unchanged)
- `vite` 5.4.11 → ^6.4.3, `vitest` 2.x → ^3.2.7, `@vitejs/plugin-react` 4.x → ^5.2.0 (esbuild dev-server request-forwarding advisory)
- `react-router-dom` 6.28.0 → ^7.18.2 (open-redirect and SSR-hydration advisories; this app doesn't use SSR, but the client-routing API is otherwise unchanged from v6)
- `sharp` 0.33.5 → ^0.35.4 (libvips CVEs)
