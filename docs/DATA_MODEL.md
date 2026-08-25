# Data Model

Source of truth: [`src/db/schema.ts`](../src/db/schema.ts). All tables are
PostgreSQL, defined with Drizzle ORM. Migrations live in
[`drizzle/`](../drizzle/) — generate new ones with `npx drizzle-kit generate`
after editing the schema, or push directly with `npx drizzle-kit push`
during early development.

## Core roster tables

### `mentor_data`
Upperclassman mentors. Primary key `mentorId` (matches the school-issued
student ID, not auto-generated). `job` holds a role string that should match
a `job_data.dbJob` value. `phoneNum` is encrypted at rest (see
[`ARCHITECTURE.md`](ARCHITECTURE.md#field-level-encryption)). Has a
**case-insensitive unique index on `email`** (`mentor_data_email_lower_unique`)
because Microsoft Entra returns login emails in lowercase and the app always
normalizes before writing (`fixEmail`, `getUserByEmail`) — the index makes
that a DB-enforced guarantee rather than relying solely on app discipline.

### `admin_data`
Admin accounts. Same case-insensitive unique-email pattern as `mentor_data`.
A user with a row here is implicitly `job = "ADMIN"` (there's no explicit
job column — see [`ARCHITECTURE.md`](ARCHITECTURE.md#role-model)).

### `attendee_data`
The incoming-freshman roster. Primary key `attendeeId` (student ID, not
auto-generated). `healthConcerns` is encrypted at rest. `present` is a
simple boolean flag for student check-in (distinct from group tour
attendance — see below). `groupId` links to `group_data`.

### `seminar_data`
Raw seminar/homeroom roster data (name, semester, teacher, period) used to
derive freshman groups. Unique on `freshmenId`. Has a 1:1 relation to
`attendee_data` via `freshmenId ↔ attendeeId`.

### `group_data`
A freshman seminar group. `eventOrder` stores a JSON-encoded block sequence
(which `event_order_pattern` the group follows) and `routeNum` points at a
`tour_route`. Groups with no members/assignment are informally called
"ghost groups" in the admin UI (`/admin/ghost_groups`).

## Job catalog

### `job_data`
DB-backed catalog of valid mentor job types, added to replace a previously
hardcoded list (see [`ARCHITECTURE.md`](ARCHITECTURE.md#role-model)).

| Column | Notes |
|---|---|
| `slug` | URL segment for non-utility jobs (`/mentor/[job]`); unique, case-insensitively |
| `dbJob` | The exact string stored in `mentor_data.job`; unique, case-insensitively |
| `label` | Human-readable display name |
| `contentKey` | Key into `site_content` for this job's "more details" blurb |
| `isProtected` | `true` for jobs with hand-built dedicated routes (Ambassador, Hallway Host) — their slug can't be edited away from those routes |
| `isNonUtility` | `true` for jobs that use the generic `/mentor/[job]` dashboard |

Managed via `/admin/manageJobs`, backed by `src/actions/job.tsx`.

## Job-specific assignment tables

### `ambassador_data`
Ambassador mentor → group assignment. Unique on `mentorId` (one group per
ambassador).

### `hallway_host_data`
Hallway Host mentor → hallway stop assignment. Unique on `mentorId`.

## Events and mentor attendance

### `events_data`
Event/session records. Supports an optional second date/time
(`date2`/`time2`) for recurring or two-part events. `isRoyalRumble` flags
the main event vs. other mentor events (e.g. training). `attendanceCode` +
`attendanceCodeExpiresAt` back the self-service mentor check-in feature —
admins generate a time-limited code per event that mentors enter to mark
themselves present.

### `mentor_attendance_data`
Per-mentor, per-event presence flag. Unique on `(mentorId, eventId)`. Set
either by a mentor entering the event's attendance code, or in bulk via
`POST /api/upload/mentor-attendance` (see [`API.md`](API.md)).

## Tour route management system

This group of tables powers the building-tour scheduling engine described
in [`ARCHITECTURE.md`](ARCHITECTURE.md#the-tour-route-engine).

### `hallway_stop_data`
A named location — either a real tour stop or a non-tour "block" (Gym,
Leonard, etc.) reused by name. Case-insensitive unique index on `location`
makes "find or create by name" (`ensureGroupBlockAttendance` in
`src/actions/routes.tsx`) safe under concurrent requests instead of relying
on an unenforced check-then-insert.

### `block_schedule`
Duration (minutes) for each named block. Case-insensitive unique index on
`blockName`.

### `event_order_pattern`
A named sequence of blocks (`blockOrder`, JSON array) that a group follows
through the day — e.g. "Tour first," "Tour last." Lets different groups be
staggered so they don't collide on shared resources.

### `tour_route`
A numbered building tour route (`routeNum`, unique).

### `tour_route_stop`
Ordered stops within a route. `routeId` and `hallwayStopId` are foreign
keys (`routeId` cascades on delete). Unique on `(routeId, hallwayStopId)`
(a stop appears once per route) and `(routeId, stopOrder)` (no two stops
share a position) — reordering stops uses a two-phase update in
`routes.tsx` specifically to avoid transiently violating this constraint.

### `group_route_attendance`
Whether a group has checked into a given hallway stop. Unique on
`(groupId, hallwayStopId)`, `present` defaults to `false`, `markedAt`
records when it was set. This table's data-integrity bug (data getting
corrupted across routes) was fixed alongside the admin homepage redesign —
if you touch `routes.tsx`'s attendance-marking logic, re-read the
surrounding comments carefully.

## Site content

### `site_content`
Generic key/value store (`key` unique, `content` text) for admin-editable
copy — job "more details" blurbs (keyed by `job_data.contentKey`), the
Royal Rumble ticket link, event start time text, etc. Edited via the Tiptap
rich-text editor at `/admin/editContent`.

### `faq_content`
Simple `question`/`answer` rows powering the public `/faq` page.

## Relations

Defined via Drizzle's `relations()` helper at the bottom of `schema.ts`:

- `mentorData` → many `mentorAttendanceData`, `hallwayHostData`, `ambassadorData`
- `groupData` → many `ambassadorData` (as leaders), `seminarData`, `groupRouteAttendance`
- `attendeeData` → one `seminarData` (via `attendeeId ↔ freshmenId`)
- `tourRoute` → many `tourRouteStop`
- `tourRouteStop` → one `tourRoute`, one `hallwayStopData`
- `hallwayStopData` → many `tourRouteStop`, many `groupRouteAttendance`

These are used for Drizzle's relational query API (`db.query.*`) where the
codebase favors it over manual joins.
