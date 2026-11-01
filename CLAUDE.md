# Karthigai Deepam 2026 — Smart Pilgrim Help Center

## Project Overview
QR-code-based, no-install web app for pilgrims visiting Tiruvannamalai during Karthigai Deepam festival.
One-day event serving up to 50 lakh crowd. Also a **Tavix brand showcase** — every screen is a brand impression.

**Organization:** Izivar Technologies Pvt Ltd, Tiruvannamalai
**Product:** Tavix (hotel booking app, WhatsApp-based)

## Tech Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Firestore (free tier)
- **Maps:** Mapbox (free tier — lazy load, only when user taps "View on Map")
- **Hosting:** Vercel free tier (Cloud Run as fallback)
- **Package Manager:** pnpm
- **AI:** None — use keyword-based search on static data instead

## Brand Identity

### Colors (from Izivar UX Lib)
- **Primary Green:** `#25ab5a` / `oklch(0.62 0.17 155)` — trust, safety, CTAs, buttons
- **Accent Gold:** `#fdc40c` / `oklch(0.82 0.16 85)` — festival warmth, Deepam lamp connection, highlights
- **Dark Navy:** `#192b3d` — headers, footer, premium feel
- **Background:** `#ffffff` — clean white
- **Foreground:** `#172722` — dark text
- **Muted:** `oklch(0.96 0.005 250)` — light gray backgrounds
- **Border:** `oklch(0.91 0.005 250)` — subtle borders
- **Error:** `oklch(0.58 0.22 25)` — red for emergencies

Do NOT use Tavix coral (`#FF6F61`) — that's Tavix booking app specific. Keep apps visually distinct.

### Logos
- Izivar logo (green bull): `/Users/sathishvasu/izivar_workspace/amiom-website/apps/web/public/images/logo/`
  - `logo-original.svg` — full color
  - `logo-white.svg` — for dark backgrounds
  - `favicon.svg` — icon only
- Tavix logo: `/Users/sathishvasu/izivar_hotel_workspace/izivar-booking-app/public/tavix.png`

### Typography
- **Font:** Source Sans 3 (from Izivar UX Lib) — weights 400, 600, 700
- **Fallback:** `ui-sans-serif, system-ui, sans-serif`
- **Fluid scaling:** Use `clamp()` for responsive text (375px → 1440px mobile-first)
- Headlines: 700 weight, tight tracking
- Body: 400 weight, 14-16px
- Labels: 600 weight, 12-14px

## Design References (Izivar UX Lib)

### Reuse These Patterns
- **Component primitives:** Button, Card, Badge, Input from `izivar-ux-lib/src/components/ui/`
- **Design tokens:** `izivar-ux-lib/src/design-system/tokens.ts`
- **Color system:** `izivar-ux-lib/src/styles/izivar-globals.css`
- **Typography scale:** Same file, lines 187-353 (fluid clamp-based)
- **Touch targets:** 44px minimum (WCAG 2.5.5)
- **Mobile bottom nav:** Pattern from `izivar-booking-app/src/components/layout/MobileBottomNav.tsx`
- **StatCard:** For admin dashboard from `izivar-ux-lib/src/components/data-display/`
- **Admin sidebar:** Pattern from `izivar-booking-app/src/components/super-admin/AdminSidebar.tsx`
- **Border radius:** sm=6px, md=8px, lg=12px, xl=16px
- **Motion:** fast=150ms, normal=200ms, slow=350ms

### Reference Paths
- UX Lib: `/Users/sathishvasu/izivar_hotel_workspace/izivar-ux-lib/`
- Booking App: `/Users/sathishvasu/izivar_hotel_workspace/izivar-booking-app/`
- Amiom Website: `/Users/sathishvasu/izivar_workspace/amiom-website/`

## Brand Exposure Strategy

### Every Screen
- Footer: "Powered by Izivar | Tavix" — persistent on all guest pages

### Splash Screen
- Izivar logo + Tavix logo — 100% impression rate, every user sees it

### Hotels & Stays Category
- Will integrate Tavix hotel data (planned later)
- "Book via WhatsApp" → Tavix booking flow
- Each listing: "Listed on Tavix"

### QR Signboards (Physical)
- Placed across Girivalam route — physical brand presence
- Izivar/Tavix branding on every signboard

### Festival Info Page
- Contextual prompts: "Planning to stay? Find verified hotels on Tavix"

## Competitive Edge vs NIC App
- Clean modern UX (vs government generic UI)
- 6 languages (vs Tamil/English)
- GPS-based "near me" proximity sorting
- Smart keyword search in native language
- Direct hotel booking via Tavix (NIC cannot do this)
- PWA with offline cached essentials (poor signal on Girivalam route)

## Architecture

### Guest Routes `(guest)/`
- `/` — Splash / QR Entry
- `/services` — Home / Categories
- `/services/[category]` — Service list (police, medical, toilet, water, hotel, helpdesk)
- `/location/[id]` — Location detail with map
- `/map` — Full map view (Mapbox lazy loaded)
- `/assistant` — Smart keyword search / FAQ
- `/festival-info` — Routes, parking, bus stands, announcements
- `/language` — Language selection (EN, TA, HI, TE, KN, ML)

### Admin Routes `/admin/`
- `/admin/dashboard` — Overview stats, map, activity feed
- `/admin/help-points` — CRUD help points
- `/admin/qr-logs` — Scan tracking
- `/admin/requests` — Assistance requests
- `/admin/reports` — Analytics & downloads
- `/admin/settings` — Festival mode, broadcasts, user management

### API Routes
- `/api/help-points` — CRUD for help points
- `/api/search` — Keyword search across help points

## Key Rules
- Zero cost deployment — stay within free tiers
- Mobile-first responsive design — pilgrims use phones
- Reliability over complexity — must work perfectly on the ONE day
- Static data, no LLM — help points are known, pre-loaded
- Lazy load Mapbox — show list/distance first, map on demand
- Offline-friendly — cache emergency numbers, basic info via service worker
- All data must be verified before festival day
