# Repository Info

- Name: Smart Budget App
- Stack: Next.js 14, React 18, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Recharts
- App Dir: Next.js App Router (app/)
- Auth: Custom (bcryptjs), contexts under app/contexts
- UI: Tailwind-based components in components/ui
- DB: Prisma schema in prisma/schema.prisma; migrations present
- Scripts: npm run dev/build/start/lint
- Notable Pages:
  - /auth/login (app/page.tsx redirects to /auth/login)
  - /dashboard (main app area)
  - /transactions, /budgets, /categories, /analytics, /settings, /notifications
- Theming: ThemeWrapper applies CSS variables and dark class; now pre-init via theme-init Script

## Conventions
- Components use forwardRef and cn utility from lib/utils
- Toasts via react-hot-toast
- Modals are portal-based, now with focus management and ARIA
- Inputs use React useId for stable ids

## Local Dev
- Env: DATABASE_URL in .env.local; optional NEXT_PUBLIC_USE_DEMO_DATA
- Prisma: npx prisma generate / migrate deploy
- Start: npm run dev (http://localhost:3000)

## TODO Candidates
- Move dynamic color styles to CSS variables in Tailwind config
- Add keyboard shortcuts (Cmd/Ctrl+K) for quick actions
- Virtualize long transaction lists