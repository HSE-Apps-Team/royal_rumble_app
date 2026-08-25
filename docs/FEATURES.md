# Feature Tour

A page-by-page map of the app. Paths are under `src/app/` unless noted.

## Public site

| Route | Purpose |
|---|---|
| `/` (`page.tsx`) | Homepage — event info, photos, committee bios, login button, and (if signed in) a link into the right dashboard based on `job` |
| `/about` | About Royal Rumble |
| `/faq` | FAQ list, sourced from `faq_content` |

## Admin console (`/admin/*`)

Gated to `job === "ADMIN"` (see [`ARCHITECTURE.md`](ARCHITECTURE.md#route-gating-middleware)).
`/admin/page.tsx` is the landing dashboard, organized into three groups:

**Daily Operations** — the things admins touch most often:
- `/admin/attendees` — attendee/freshman roster
- `/admin/mentor` — mentor roster, plus `/admin/mentor/assignGroup` to assign mentors to groups
- `/admin/all_groups` — list of all freshman groups
- `/admin/ghost_groups` — groups with no members or incomplete assignment, for cleanup
- `/admin/attendance` — attendance hub with three sub-views:
  - `/admin/attendance/mentor` — review/manage mentor event check-in, generate attendance codes
  - `/admin/attendance/all_groups` — review group tour-stop attendance
  - `/admin/attendance/attendees` — review student check-in
- `/admin/events` — event CRUD (create/edit sessions, dates, attendance codes)

**Setup & Configuration** — done ahead of the event:
- `/admin/admin` — manage admin accounts
- `/admin/add/*` and `/admin/edit/*` — add/edit forms for admins, attendees, attendee groups, events, mentors (edit forms are `[id]`-scoped)
- `/admin/edit/hallwayGroup/[id]` — edit a hallway stop/group mapping
- `/admin/upload` — bulk Excel import UI for mentors, attendees, seminar rosters, and mentor-attendance scan sheets (see [`API.md`](API.md))
- `/admin/routes` — Tour Route Management UI: build routes, assign hallway stops to a route, reorder stops, set per-stop durations
- `/admin/manageJobs` — CRUD for the `job_data` catalog (add/rename/remove mentor job types, mark protected/non-utility)
- `/admin/editContent` — Tiptap rich-text editor for site copy (`site_content` — job blurbs, ticket link, etc.)

**Other**:
- `/admin/day_of_event` — live event-day tools:
  - `/admin/day_of_event/find_group` — look up which group a freshman belongs to
  - `/admin/day_of_event/attendee_lost` — mark/handle a lost attendee
  - `/admin/day_of_event/add_walk_in` — register a same-day walk-in, split into `add_freshman` and `add_sophomore_plus` flows
- `/admin/mentor_preview` — view mentor-facing dashboards as an admin, without a real mentor session:
  - `/admin/mentor_preview/ambassador` (+ `attendance`, `route`)
  - `/admin/mentor_preview/non_utility` — preview of the generic `/mentor/[job]` dashboard
- `/admin/reset` — destructive table-reset utilities (`src/actions/reset.tsx`) — wipes data per table or entirely; use with care, no confirmation beyond the UI itself

## Mentor dashboards (`/mentor/*`)

Gated to any logged-in, registered, non-admin `job` (coarse gate in
middleware; exact job → page matching happens in the page via the job
catalog — see [`ARCHITECTURE.md`](ARCHITECTURE.md#route-gating-middleware)).

- `/mentor/[job]` — generic dashboard for any `isNonUtility` job (Utility
  Squad, CCA Convos, etc., as configured in `src/lib/nonUtilityJobs.ts` and
  the `job_data` table). Resolved by slug via `getJobBySlug`.
- `/mentor/ambassador` — Ambassador dashboard: their group's details, group
  mentors, group attendees plus "possible" (unregistered) attendees, and
  the ambassador's own events.
  - `/mentor/ambassador/attendance` — mark group/student attendance
  - `/mentor/ambassador/route` — the group's computed tour schedule, with
    per-stop check-off as the group moves through the building

## Shared UI (`src/app/components/`)

~35 components covering navigation (`MobileNav`, admin/mentor nav bars),
buttons (`loginButton`, `faqButton`, `ticketButton`, `addButton`), tables,
modals, the Tiptap-based content editor, and global alert/toast surfaces
backed by `src/app/context/AlertContext.tsx` and `ToastContext.tsx`.
