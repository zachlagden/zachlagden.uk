---
status: complete
quick_id: 260506-eig
description: DOC-01 — rewrite README to match current architecture
date: 2026-05-06
---

# Plan 260506-eig: rewrite README

## Goal

Replace the legacy README (which describes a static-only portfolio and claims "no env vars required") with one that matches the current architecture — blog, admin, auth, MongoDB, Coolify deployment.

Resolves **DOC-01** (CONCERNS.md #5).

## Sections to include

- One-paragraph project description (portfolio + blog + admin)
- What's in the repo (portfolio / blog / admin breakdown)
- Tech stack (Next 16, React 19.2, MongoDB, Auth.js v5, etc.)
- Prerequisites (Node 20, pnpm, MongoDB, GitHub OAuth App)
- **Required env vars** as a clear table (5 required + optional Discord)
- Note that GA ID is read from `public/content.json`, not env
- GitHub OAuth App setup steps
- Local dev steps including how degraded MongoDB looks
- Build/run for production (with note about standalone static-asset gotcha)
- Quality scripts + note about no test suite
- Deployment via Coolify (replaces the Vercel button — Vercel can't host the filesystem upload model)
- Architecture notes: intro animation ownership, error boundaries, security headers, markdown sanitisation, upload magic-number sniffing
- Updated project tree
- Customisation guide
- License + contact

## Commit

`docs: rewrite README to match current architecture`
