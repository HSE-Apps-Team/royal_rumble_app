# API Reference

The app is mostly server-rendered and driven by Next.js Server Actions
(`src/actions/*.tsx`), called directly from page/component code rather than
over HTTP. The handful of true HTTP route handlers under `src/app/api/`
exist because they need to run outside the Server Action calling convention
(NextAuth's own handler) or accept a large file payload from a client-side
`fetch`.

All routes below are POST-only; each responds `405` to `GET`.

## `POST/GET /api/auth/[...nextauth]`

Standard Auth.js catch-all handler — exports `{ GET, POST } = handlers` from
[`auth.ts`](../auth.ts). Handles the Microsoft Entra ID OAuth redirect flow,
session callback, and sign-out. Not meant to be called directly; see
[`ARCHITECTURE.md`](ARCHITECTURE.md#authentication-and-authorization).

## `POST /api/upload`

Bulk Excel import for the three roster tables. Used by `/admin/upload`.

**Request body** (JSON):
```jsonc
{
  "fileData": "<base64-encoded .xlsx/.xls file>",
  "table": "mentor_data" | "attendee_data" | "seminar_data"
}
```

**Behavior**:
1. Decodes and parses the file with SheetJS, using the first sheet.
2. Normalizes headers (lowercase, trim, spaces → underscores).
3. Validates required columns are present for the target table, and that
   required fields are non-blank / numeric per row — returns a `400` with
   up to 10 specific row-level error messages (plus a count of any more) if
   validation fails.
4. Inserts rows:
   - `mentor_data` — delegates per-row to `insertMentorRow`
     (`src/lib/mentorUpload.ts`). Rows whose `job` doesn't match a known
     `job_data.dbJob` are **held back** and grouped by job into a
     `mismatches` array instead of failing the whole upload.
   - `attendee_data` — upserts on `attendeeId` conflict; encrypts
     `health_concerns` before storing.
   - `seminar_data` — inserts, ignoring conflicts on `freshmenId`
     (`onConflictDoNothing`).

**Response** (`200`):
```jsonc
{
  "message": "✅ Inserted N row(s)...",
  "mismatches": [ /* only present when table === "mentor_data" */
    { "job": "UNKNOWN_JOB", "mentors": [{ "mentorId": 1, "fName": "...", "lName": "...", "row": { /* raw row */ } }] }
  ]
}
```

If there are mentor job mismatches, the admin UI is expected to follow up
with `POST /api/upload/resolve-mentor-jobs`.

## `POST /api/upload/mentor-attendance`

Bulk mentor **event check-in** from a scanned roster spreadsheet — a
separate mechanism from the self-service attendance-code check-in (see
[`ARCHITECTURE.md`](ARCHITECTURE.md#attendance-tracking-two-independent-systems)).

**Request body**:
```jsonc
{ "fileData": "<base64 .xlsx/.xls>", "eventId": 123 }
```

**Behavior**:
1. Parses the file and auto-detects an ID column from a candidate list
   (`mentor_id`, `id`, `student_id`, `mentorid`, `studentid`, `attendee_id`,
   `attendeeid`) and an optional job column (`job`, `role`, `position`,
   `assigned_job`, `job_title`).
2. Looks up each scanned ID in `mentor_data`.
3. Classifies each row as **matched** (found, and job matches if a job
   column was present), **mismatched** (found, but uploaded job differs
   from the mentor's assigned job), or **not found**.
4. Bulk-sets `mentor_attendance_data.status = true` for matched mentors at
   the given `eventId`.

**Response** (`200`):
```jsonc
{
  "message": "Processed N scan(s): M marked present, ...",
  "matchedCount": 10,
  "mismatches": [{ "mentorId": 1, "fName": "...", "lName": "...", "assignedJob": "AMBASSADOR", "uploadedJob": "HALLWAY_HOST" }],
  "notFound": [42, 99]
}
```

## `POST /api/upload/resolve-mentor-jobs`

Follow-up step after `/api/upload` reports mentor job mismatches. Lets an
admin resolve each unrecognized job by either creating a new job type or
mapping the uploaded rows onto an existing one, then inserts the
previously-held-back mentor rows.

**Request body**:
```jsonc
{
  "resolutions": [
    {
      "uploadedJob": "TOUR_GUIDE",
      "action": "add" | "override",
      "newJobLabel": "Tour Guide",       // required if action === "add"
      "overrideDbJob": "HALLWAY_HOST",   // required if action === "override"
      "rows": [ /* the raw mentor rows held back for this job */ ]
    }
  ]
}
```

- `action: "add"` creates a new `job_data` row via `addJob`
  (`src/actions/job.tsx`) and inserts the rows under it.
- `action: "override"` maps the rows onto an existing `dbJob`.

**Response** (`200`):
```jsonc
{ "message": "Inserted N mentor(s)...", "insertedCount": 12, "errors": [] }
```

## Server Actions (not HTTP)

Most read/write operations go through `"use server"` functions in
`src/actions/*.tsx`, called directly from Server/Client Components — these
are Next.js Server Actions, not REST endpoints, so they have no URL. See
[`ARCHITECTURE.md`](ARCHITECTURE.md#directory-map) for which file owns
which domain (events/content in `other.tsx`, groups in `group.tsx`, tour
routing in `routes.tsx`, etc.).
