# External Integrations

**Analysis Date:** 2026-01-21

## APIs & External Services

**Form Processing:**
- Formspree - Email form handling and submission
  - SDK/Client: `@formspree/react` (v3.0.0)
  - Form ID: Stored in `public/content.json` under `contact.formspreeId`
  - Config: `mqapzrgk` (specific form ID)
  - Usage: `src/components/sections/ContactSection.tsx` uses `useForm(content.formspreeId)` hook

**Discord Presence:**
- Lagden Presence API - Discord activity status integration
  - Endpoint: `https://api.lagden.dev/v1/watcher/{userId}`
  - Client ID env var: `NEXT_PUBLIC_DISCORD_USER_ID`
  - Purpose: Display current Spotify playback and VS Code activity
  - Usage: `src/components/ui/PresenceStatus.tsx` fetches every 5 seconds
  - Features: Spotify track display, VS Code activity indicator

## Data Storage

**Static Content:**
- Local JSON file: `public/content.json`
  - Contains: Personal info, experience, education, skills, certifications, navigation, contact form ID
  - Client-side loading: `src/utils/contentLoader.ts`
  - Server-side loading: `src/utils/serverContentLoader.ts`
  - Type safety: `src/types/content.ts` defines all interfaces

**File Storage:**
- Local filesystem only
  - CV PDF: `/public/Zach_Lagden_CV.pdf` (prefetched in layout)
  - Images: `/public` directory (OG images, Twitter images, favicons)
  - Metadata: `og-image.png`, `twitter-image.png` referenced in content.json

**Caching:**
- None (custom caching handled by Next.js)

## Authentication & Identity

**Auth Provider:**
- Custom (none required)
- No authentication needed for portfolio viewing
- Sentry integration handles error tracking without user auth

## Monitoring & Observability

**Error Tracking:**
- Sentry (v10.31.0)
  - DSN: `https://4dbe35acaa7aabdd1fdb26e6d803bd89@o4508059445952512.ingest.de.sentry.io/4508948404437072`
  - Organization: `lagden-development`
  - Project: `zml-cv`
  - Server config: `sentry.server.config.ts`
  - Edge config: `sentry.edge.config.ts`
  - Trace sample rate: 1 (100% sampling)
  - Features enabled:
    - Source map upload
    - React component annotation
    - Tunnel route at `/monitoring` (ad-blocker circumvention)
    - Automatic Vercel Cron Monitors
    - Client and server error capture via `src/app/global-error.tsx` and `src/instrumentation.ts`

**Logs:**
- Browser console (development)
- Sentry error logging (production)
- Console warnings from presence API failures

**Analytics:**
- Google Analytics
  - ID: `G-JGDJX5L7B9` (from `public/content.json`)
  - Integration: `@next/third-parties/google` via GoogleAnalytics component in `src/app/layout.tsx`
  - Implementation: `<GoogleAnalytics gaId={googleAnalyticsId} />`

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Sentry Cron Monitors integration in `next.config.ts`)

**CI Pipeline:**
- Vercel CI/CD (automatic on git push to main)
- Environment variable setup required for:
  - `NEXT_PUBLIC_DISCORD_USER_ID` (Discord presence feature)
  - Sentry DSN (auto-configured via @sentry/nextjs)
  - Google Analytics ID (loaded from content.json)

**Build Process:**
- Next.js App Router compilation
- TypeScript type checking
- ESLint validation
- Sentry source map upload during build

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_DISCORD_USER_ID` - Discord user ID for presence integration (optional, feature gracefully degrades if missing)

**Optional env vars:**
- `CI` - Set during CI builds to enable Sentry logging
- `NEXT_RUNTIME` - Set by Next.js to determine server vs edge runtime

**Secrets location:**
- Sentry DSN: Hardcoded in `sentry.server.config.ts` and `sentry.edge.config.ts`
- Formspree ID: Stored in `public/content.json` (not sensitive)
- Discord User ID: Environment variable (public, safe to expose)
- Google Analytics ID: Stored in `public/content.json` (public, safe to expose)

## Webhooks & Callbacks

**Incoming:**
- Formspree handles email delivery (no webhooks configured)
- No incoming webhooks

**Outgoing:**
- None implemented

## External Resources

**Fonts:**
- Google Fonts (Inter family)
  - Preconnected in `src/app/layout.tsx` for performance
  - Self-hosted subset loading via `next/font/google`

**CDN Resources:**
- Google Fonts CDN: `https://fonts.googleapis.com`
- Google Fonts static CDN: `https://fonts.gstatic.com`

---

*Integration audit: 2026-01-21*
