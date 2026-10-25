
---
name: nextjs-architecture
description: Implement maintainable Next.js App Router architecture and Vercel-compatible server-side APIs.
---

# Next.js Architecture Skill

- Use Next.js App Router and TypeScript.
- Prefer server components; use client components only when necessary.
- Organize features by domain: auth, medicines, sales, accounts, reports, audit, and settings.
- Keep MongoDB access and privileged operations in server-only modules.
- Use Route Handlers with shared validation, authentication, authorization, and error handling.
- Put business calculations in reusable domain services rather than duplicating logic across routes.
- Cache/reuse MongoDB connections appropriately for Vercel serverless execution.
- Use stable IDs, indexes, explicit types, and pagination where needed.
- Do not leave dead routes, mock production flows, or fake-success buttons.
- Inspect existing files before changing the architecture.
- Preserve working configuration and avoid unnecessary dependencies.
- Verify lint, types, and production build.
