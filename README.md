# Royal Rumble App

Operations hub for **Royal Rumble**, Hamilton Southeastern High School's annual
welcome program for incoming freshmen. Upperclassman mentors run building
tours, group activities, and a pep rally for freshmen on the day of the
event; this app is what mentors and admins use to plan it, staff it, and run
it live.

The app has three audiences:

- **Public site** — event info, FAQ, and a ticket link for freshmen/families.
- **Mentor dashboards** — role-specific pages (Ambassador, Hallway Host,
  Utility Squad, CCA Convos, etc.) for viewing assignments, marking
  attendance, and following the tour route.
- **Admin console** — rosters, group/route setup, live day-of-event tools,
  and bulk data import.

See [`docs/`](docs/) for details beyond this quick start:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — tech stack, auth model, dev mode, route-management engine, environment variables
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — full database schema reference
- [`docs/API.md`](docs/API.md) — HTTP API route handlers
- [`docs/FEATURES.md`](docs/FEATURES.md) — page-by-page tour of the admin and mentor apps

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Drizzle ORM on Neon
(serverless Postgres) · Auth.js v5 with Microsoft Entra ID SSO · Bootstrap 5
· Tiptap (rich text editing) · SheetJS/`xlsx` (bulk import/export)

## Getting started

### Prerequisites

- Node.js 20+
- A Neon Postgres database (or any Postgres instance)
- A Microsoft Entra ID (Azure AD) app registration — not required if you use
  `DEV_MODE` (see below)

### Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values — see docs/ARCHITECTURE.md
```

Apply the database schema with Drizzle Kit:

```bash
npx drizzle-kit push
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Skipping SSO locally

Set `DEV_MODE=true` and `NEXT_PUBLIC_DEV_MODE=true` in `.env.local` to bypass
Microsoft Entra login entirely. Admin and mentor pages fall back to
hardcoded dev IDs so you can exercise `/admin` and `/mentor/*` without an
Entra app registration. **Never enable this in production.** Details in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#dev-mode).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve a production build |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Push `src/db/schema.ts` changes directly to the database |
| `npx drizzle-kit generate` | Generate a SQL migration file under `drizzle/` |
| `npx drizzle-kit studio` | Open Drizzle Studio (visual DB browser) |

There is no automated test suite in this project yet.

## Deployment

Deployed on Vercel. `vercel.json` redirects `www.hseroyalrumble.com` to the
apex domain `hseroyalrumble.com`. Set the environment variables from
`.env.example` in the Vercel project settings (with `DEV_MODE` unset or
`false`).

## Project status

Fully built out except for one remaining feature (in progress — see the
project board / current branch for details).
