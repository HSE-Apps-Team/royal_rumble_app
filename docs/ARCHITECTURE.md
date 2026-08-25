# Architecture

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | PostgreSQL via [Neon](https://neon.tech) serverless |
| ORM | [Drizzle ORM](https://orm.drizzle.team) (`drizzle-orm/neon-http`) + Drizzle Kit for migrations |
| Auth | Auth.js v5 (`next-auth`), single provider: Microsoft Entra ID (Azure AD) |
| UI | Bootstrap 5 + `react-bootstrap`, plus per-feature CSS under `src/app/css/` |
| Rich text | Tiptap, used in the admin site-content editor |
| Bulk data | SheetJS (`xlsx`) for Excel import/export, `file-saver` for downloads |
| Field encryption | Node `crypto` (AES-256-GCM), `src/lib/crypto.ts` |
| Hosting | Vercel |

There is no Prisma anywhere in this project — `src/db/schema.ts` is the
single source of truth for the data model, and `drizzle/` holds the
generated SQL migrations.

## Directory map

```
auth.ts                  Auth.js configuration (providers, session, callbacks)
middleware.ts             Route-level auth gate for /admin and /mentor
drizzle.config.ts         Drizzle Kit config (points at DATABASE_URL_UNPOOLED)
drizzle/                  Generated SQL migrations + snapshots

src/db/
  index.ts                Drizzle client (Neon HTTP driver)
  schema.ts                Full schema — tables, indexes, relations

src/actions/               Server actions ("use server") — the data-access
                            and business-logic layer, one file per domain:
  admin.tsx                 Admin account CRUD
  attendees.tsx              Attendee roster CRUD, encryption of health data
  group.tsx                  Groups, group assignment, ghost groups (largest file)
  job.tsx                    Job catalog (job_data) CRUD, slug/route resolution
  mentor.tsx                 Mentor roster CRUD
  other.tsx                  Events, site content, FAQ, day-of-event stats, user lookup
  reset.tsx                  Destructive "reset table" utilities (admin only)
  routes.tsx                  Tour route engine: route assignment, scheduling, attendance

src/lib/                   Small, stateless helpers
  crypto.ts                  AES-256-GCM encrypt/decrypt
  fixEmail.ts                 Email normalization (lowercase/trim)
  formatEventDates.ts         Date/time formatting for events
  mentorUpload.ts              Shared "insert one mentor row" logic used by
                                both upload endpoints
  nonUtilityJobs.ts             Static config for simple, non-protected job types
  toTitleCase.ts                Name casing helper

src/app/
  page.tsx, about/, faq/       Public marketing/info pages
  layout.tsx                    Root layout
  admin/                         Admin console (see docs/FEATURES.md)
  mentor/                        Mentor dashboards (see docs/FEATURES.md)
  api/                           Route handlers (see docs/API.md)
  components/                    ~35 shared UI components
  context/                       AlertContext, ToastContext (global UI state)
  css/                           Feature-scoped stylesheets
  assets/                        Images
```

## Authentication and authorization

Auth is Microsoft Entra ID (Azure AD) SSO via Auth.js v5, configured in
[`auth.ts`](../auth.ts):

- **Session strategy**: JWT, 30-minute max age, no silent renewal
  (`updateAge: 0`) — users are forced to re-authenticate every 30 minutes.
- **Sign-in flow**: on successful OAuth, the `signIn` callback looks up the
  user's (lowercased) email via `getUserByEmail` (`src/actions/other.tsx`),
  which checks `mentor_data` then `admin_data`. If no match is found, the
  user is still allowed to sign in but tagged `job = "UNREGISTERED"` — they
  land on the homepage with no dashboard access. If matched, `user.id` and
  `user.job` are set from the DB row and propagated onto the JWT and
  session.
- **Login prompt**: `prompt: "login"` forces the Microsoft login screen every
  time rather than silently reusing an existing Microsoft session.

### Role model

There is no dedicated roles table. A user's role **is** the `job` string:

- Rows in `admin_data` are implicitly `job = "ADMIN"`.
- Rows in `mentor_data` carry a `job` value that must match a `dbJob` in the
  `job_data` catalog (see [`docs/DATA_MODEL.md`](DATA_MODEL.md#job_data)).
- `job_data.isProtected` jobs (**Ambassador**, **Hallway Host**) have
  dedicated, hand-built route trees (`/admin/mentor_preview/ambassador`,
  `/mentor/ambassador`, etc.) because they have meaningfully different UI
  (group assignment, tour routing).
- All other (`isNonUtility`) jobs share one generic dashboard at the dynamic
  route `/mentor/[job]`, resolved through the job catalog's `slug`.

### Route gating (`middleware.ts`)

Middleware only does a **coarse** check, because it can't perform an async
per-route DB lookup on every request:

- `/admin/*` — requires a logged-in session with `job === "ADMIN"`.
- `/mentor/*` — requires a logged-in session with a real, registered,
  non-admin `job` (i.e. not empty and not `"UNREGISTERED"`).

Precise job → page matching (e.g. preventing a Hallway Host from opening the
Ambassador route page) happens **inside the page itself**, backed by a DB
lookup against the job catalog.

### Dev mode

Setting `DEV_MODE=true` (server) and `NEXT_PUBLIC_DEV_MODE=true` (client)
does two things:

1. `middleware.ts` swaps in a no-op `devMiddleware` that lets every request
   through unauthenticated.
2. `auth.ts` configures **zero** OAuth providers, and individual pages
   (`admin/page.tsx`, `mentor/[job]/page.tsx`, `mentor/ambassador/page.tsx`,
   etc.) fall back to hardcoded IDs (e.g. admin ID `10000`, ambassador
   student ID `100001`) instead of reading a session.

This lets you develop admin/mentor features without a Microsoft Entra app
registration. It must never be enabled in production — it removes
authentication entirely.

### Admin "mentor preview"

`/admin/mentor_preview/*` lets an admin view mentor-facing UI (Ambassador
dashboard, attendance, route; the generic non-utility dashboard) without a
real mentor session. These are separate, admin-gated pages that reuse the
same components and server actions rather than a true impersonation/session
swap.

## The tour route engine

The most complex subsystem lives in [`src/actions/routes.tsx`](../src/actions/routes.tsx)
(~890 lines) and its supporting tables (`tour_route`, `tour_route_stop`,
`hallway_stop_data`, `block_schedule`, `event_order_pattern`,
`group_route_attendance` — see [`docs/DATA_MODEL.md`](DATA_MODEL.md)). At a
high level:

- A **block schedule** defines named time blocks (e.g. "Gym", "Tour",
  "Leonard") and how long each lasts.
- An **event order pattern** defines the sequence of blocks a group follows
  (e.g. Tour first vs. Tour last), so different groups can be staggered
  through shared resources without colliding.
- A **tour route** is a numbered, ordered list of hallway stops
  (`tour_route_stop`), each with its own duration.
- Each **group** (`group_data`) is assigned an `eventOrder` pattern and a
  `routeNum`, and the app computes that group's minute-by-minute schedule
  from these pieces (`getGroupSchedule`).
- **Attendance** at each stop is tracked per group in
  `group_route_attendance`, keyed on `(groupId, hallwayStopId)`.
- Non-Tour blocks (Gym, Leonard, etc.) are matched to a `hallway_stop_data`
  row by name via `ensureGroupBlockAttendance`, using a case-insensitive
  unique index for race-safe "find or create."

Groups only need genuinely different tour routes if they'd otherwise
collide on a stop at the same time — the assignment logic in `routes.tsx`
has an in-line comment explaining this rule; read it before changing route
assignment behavior.

## Attendance tracking (two independent systems)

Don't conflate these — they track different things and are marked
present/absent through different flows:

1. **Mentor event check-in** (`mentor_attendance_data`) — was a given mentor
   present at a given event. Two ways to mark it:
   - An **attendance code**: each event (`events_data`) can have a
     time-limited `attendanceCode` mentors self-enter.
   - A **bulk scan upload**: `POST /api/upload/mentor-attendance` bulk-marks
     mentors present from a scanned roster spreadsheet.
2. **Group tour attendance** (`group_route_attendance`) — whether a
   freshman group reached/checked into a given tour stop, marked live by
   Ambassadors during the event via `/mentor/ambassador/route`, and
   reviewable by admins via `/admin/attendance/all_groups`.

## Field-level encryption

`src/lib/crypto.ts` wraps AES-256-GCM. Two fields are encrypted at rest:
`attendee_data.healthConcerns` and `mentor_data.phoneNum`. `decrypt()`
tolerates legacy plaintext values (no `:` separator) for backward
compatibility with data written before encryption was introduced. The key
is a 32-byte hex string in `ENCRYPTION_KEY` — losing it makes existing
encrypted data unrecoverable, so treat it like any other production secret
(back it up outside of `.env`).

## Configuration

All environment variables are documented inline in
[`.env.example`](../.env.example); copy it to `.env.local` for local
development. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled Neon connection string, used at runtime |
| `DATABASE_URL_UNPOOLED` | Yes (for migrations) | Direct Neon connection, used only by `drizzle-kit` |
| `ENCRYPTION_KEY` | Yes | Hex AES-256-GCM key for encrypted fields |
| `AUTH_SECRET` | Yes | Auth.js session secret |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | Yes unless `DEV_MODE=true` | Entra app client ID |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Yes unless `DEV_MODE=true` | Entra app client secret |
| `AUTH_MICROSOFT_ENTRA_TENANT_ID` | Yes unless `DEV_MODE=true` | Entra tenant ID |
| `NEXT_PUBLIC_MICROSOFT_ENTRA_TENANT_ID` | Yes unless `DEV_MODE=true` | Client-side copy of the tenant ID |
| `DEV_MODE` / `NEXT_PUBLIC_DEV_MODE` | No | Bypasses auth entirely for local dev — never set in production |

## Known loose ends

- Both `vercel.json` (committed) and a local `.netlify/` directory
  (gitignored) exist. Vercel is the real deployment target — `.netlify` is
  local CLI state, not a second deployment pipeline.
- No automated tests exist yet.
