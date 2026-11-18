# SkinSync 💧

**A full-stack web app for managing a personal skincare routine and product inventory.**
Tracks product expiry, detects conflicts between active ingredients, builds a weekly routine and keeps maintenance reminders, all in one dashboard.

🔗 **Live demo:** [skinsync-bpzh.vercel.app](https://skinsync-bpzh.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)

## Screenshots

**Weekly routine with ingredient conflict warnings** (retinol + AHA scheduled on the same evening)

![Weekly routine with conflict warnings](docs/screenshots/schedule.png)

| Daily dashboard | Skincare cabinet |
|---|---|
| ![Daily dashboard](docs/screenshots/dashboard.png) | ![Skincare cabinet](docs/screenshots/inventory.png) |
| **Product details: expiry, benefits and conflicts** | **Login** |
| ![Product details](docs/screenshots/product.png) | ![Login](docs/screenshots/login.png) |

---

## Features

- **Secure personal area:** sign-up and sign-in with Supabase Auth (email and password).
- **Skincare cabinet (inventory):** add, edit and delete products; track the opening date and shelf life after opening, with green / yellow / red indicators by time left until expiry.
- **Ingredient conflict detection:** each product is tagged with its active ingredients (retinol, vitamin C, AHA/BHA, etc.), and the app warns when a problematic combination (e.g. retinol + AHA) is scheduled in the same routine.
- **Weekly routine:** assign products and tools to days and morning/evening slots, check off completed steps, and see conflicts right in the relevant cell.
- **Maintenance reminders:** recurring non-skin tasks (cleaning brushes, washing silk pillowcases, etc.) with "every N days" and "last done" tracking.
- **Dashboard:** a daily snapshot of today's routine, products that need attention, and upcoming or overdue reminders.

## Technical highlights

- **Row Level Security everywhere:** every table is protected by Postgres RLS, so users can only read and write their own data. A hardening migration also blocks cross-user actions such as checking off or scheduling another user's item.
- **Defense in depth:** input is validated both in Server Actions and by database `CHECK` constraints (e.g. weekdays limited to 0–6).
- **Server Actions** for all database writes, with a uniform `ActionResult` error model.
- **Tested at three levels with Vitest:** unit tests for pure logic, Server Action tests with simulated failures, UI component tests (jsdom), and integration tests that run against a real local Supabase in Docker, including tests that verify one user cannot access another user's data.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | Next.js Server Actions |
| Database & Auth | Supabase (PostgreSQL, Auth, Row Level Security) |
| Testing | Vitest, jsdom, local Supabase via Docker |
| Deployment | Vercel |

## Project structure

```
src/
  app/
    login/, signup/        auth pages
    auth/callback/         email verification handler
    (app)/                 pages that require login
      dashboard/           daily dashboard
      inventory/           skincare cabinet
      schedule/            weekly routine
      reminders/           maintenance reminders
  components/              UI components (forms, product cards, routine grid...)
  lib/
    supabase/              Supabase clients (browser / server / proxy)
    actions/               Server Actions (database CRUD)
    expiry.ts              expiry and reminder status logic
    ingredients.ts         active ingredient conflict matrix
    validation.ts          shared validation (weekdays, dates)
    errors.ts              uniform error messages + ActionResult
    types.ts               shared types
supabase/
  config.toml              local Supabase settings
  migrations/              database schema + RLS, in order
tests/
  unit/, ui/               logic, Server Action and UI tests
  integration/             tests against a real local Supabase
```

## Running locally

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (the free plan is enough).
2. Under **Project Settings → API**, copy the `Project URL` and the `anon public` key.
3. In the **SQL Editor**, run the files in `supabase/migrations/` in order:
   1. `20260601000000_initial_schema.sql`: tables, RLS policies and triggers
   2. `20261109000000_harden_schedule_ownership_and_weekdays.sql`: RLS hardening and weekday constraints

   Or with the CLI: `npx supabase link --project-ref <ref>` and then `npx supabase db push`.
4. Make sure the Email provider is enabled under **Authentication → Providers**. To skip email confirmation on sign-up, turn off **Confirm email** under **Authentication → Settings**.

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Install and run

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000. A user profile is created automatically on first sign-up.

### 4. Tests

```bash
npm run test:unit          # pure logic + Server Actions with simulated failures + UI (jsdom)
npm run db:start           # local Supabase in Docker (first run downloads images)
npm run test:integration   # runs against the real local database
npm test                   # everything
```

Integration tests require Docker. They read the local URL and keys from `supabase status` and refuse to run against anything other than localhost. After changing a migration run `npm run db:reset`, and stop the local stack with `npm run db:stop`.

### 5. Production build

```bash
npm run build
npm start
```

To deploy on [Vercel](https://vercel.com), connect the repository, set the two environment variables in the project settings, and deploy.

## Future ideas

- Real email / push notifications for expiring products and overdue reminders (Supabase Edge Functions + cron, reusing the logic in `lib/expiry.ts`).
- A larger ingredient conflict matrix.
- Product photos with Supabase Storage.
- A guest / demo mode before sign-up.

## Credits

- Login screen video: [Pexels, video 6446058](https://www.pexels.com/video/6446058/), under the free Pexels license (trimmed, mirrored, looped and compressed).

> **Note:** the ingredient conflict matrix is a general reference and does not replace professional dermatological advice.

---

Built by **Paz Rachman** as the final project of the *Internet Technologies* course, B.Sc. Computer Science, Reichman University (2026).
