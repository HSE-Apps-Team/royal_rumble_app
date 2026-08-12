"use server";

// src/actions/routes.tsx

import { db } from "@/db";
import {
  eventOrderPattern,
  blockSchedule,
  tourRoute,
  tourRouteStop,
  hallwayStopData,
  groupData,
  groupRouteAttendance,
  seminarData,
  siteContent,
} from "@/db/schema";
import { eq, asc, sql, and, inArray } from "drizzle-orm";

// ============================================================
//  EVENT START TIME (single overall start time, chained across
//  each group's block order to derive per-block start times)
// ============================================================

const EVENT_START_TIME_KEY = "eventStartTime";

export async function getEventStartTime(): Promise<string> {
  const result = await db
    .select({ content: siteContent.content })
    .from(siteContent)
    .where(eq(siteContent.key, EVENT_START_TIME_KEY))
    .limit(1);
  return result[0]?.content ?? "";
}

export async function setEventStartTime(startTime: string) {
  const existing = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.key, EVENT_START_TIME_KEY));

  if (existing.length > 0) {
    await db
      .update(siteContent)
      .set({ content: startTime })
      .where(eq(siteContent.key, EVENT_START_TIME_KEY));
  } else {
    await db
      .insert(siteContent)
      .values({ key: EVENT_START_TIME_KEY, content: startTime });
  }
  return { success: true, startTime };
}

// Parses "9:00 AM" style strings into minutes since midnight.
function parseTimeToMinutes(time: string): number | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const [, hoursStr, minsStr, period] = match;
  let totalMinutes = (parseInt(hoursStr) % 12) * 60 + parseInt(minsStr);
  if (period.toUpperCase() === "PM") totalMinutes += 12 * 60;
  return totalMinutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60) % 12 || 12;
  const m = normalized % 60;
  const ap = normalized < 12 * 60 ? "AM" : "PM";
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}

// ============================================================
//  EVENT ORDER PATTERNS
// ============================================================

export async function getEventOrderPatterns() {
  const patterns = await db
    .select()
    .from(eventOrderPattern)
    .orderBy(asc(eventOrderPattern.patternNum));

  return patterns.map((p) => ({
    patternId:  p.patternId,
    patternNum: p.patternNum,
    blockOrder: JSON.parse(p.blockOrder) as string[],
  }));
}

export async function addEventOrderPattern(blockOrder: string[]) {
  const existing = await db
    .select({ patternNum: eventOrderPattern.patternNum })
    .from(eventOrderPattern)
    .orderBy(sql`${eventOrderPattern.patternNum} DESC`)
    .limit(1);

  const nextNum = existing.length > 0 ? existing[0].patternNum + 1 : 1;

  const result = await db
    .insert(eventOrderPattern)
    .values({ patternNum: nextNum, blockOrder: JSON.stringify(blockOrder) })
    .returning();

  return {
    patternId:  result[0].patternId,
    patternNum: result[0].patternNum,
    blockOrder,
  };
}

export async function updateEventOrderPattern(
  patternId: number,
  blockOrder: string[],
) {
  await db
    .update(eventOrderPattern)
    .set({ blockOrder: JSON.stringify(blockOrder) })
    .where(eq(eventOrderPattern.patternId, patternId));
  return { success: true, patternId };
}

export async function deleteEventOrderPattern(patternId: number) {
  await db
    .delete(eventOrderPattern)
    .where(eq(eventOrderPattern.patternId, patternId));
  return { success: true, patternId };
}

// ============================================================
//  BLOCK SCHEDULE
// ============================================================

export async function getBlockSchedule() {
  return db.select().from(blockSchedule).orderBy(asc(blockSchedule.blockName));
}

// Block start times are derived (chained from the overall event start time
// using each block's duration), so callers only supply duration.
export async function upsertBlockSchedule(
  blockName: string,
  durationMinutes: number,
) {
  const existing = await db
    .select()
    .from(blockSchedule)
    .where(eq(blockSchedule.blockName, blockName))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(blockSchedule)
      .set({ durationMinutes })
      .where(eq(blockSchedule.blockName, blockName));
    return { success: true, action: "updated", blockName };
  } else {
    const [inserted] = await db
      .insert(blockSchedule)
      .values({ blockName, durationMinutes })
      .returning();
    return { success: true, action: "created", blockName, inserted };
  }
}

export async function deleteBlockSchedule(blockScheduleId: number) {
  await db
    .delete(blockSchedule)
    .where(eq(blockSchedule.blockScheduleId, blockScheduleId));
  return { success: true, blockScheduleId };
}

// ============================================================
//  TOUR ROUTES
// ============================================================

export async function getTourRoutes() {
  return db.select().from(tourRoute).orderBy(asc(tourRoute.routeNum));
}

export async function getTourRouteWithStops(routeNum: number) {
  const route = await db
    .select()
    .from(tourRoute)
    .where(eq(tourRoute.routeNum, routeNum))
    .limit(1);

  if (!route[0]) return null;

  const stops = await db
    .select({
      routeStopId:     tourRouteStop.routeStopId,
      stopOrder:       tourRouteStop.stopOrder,
      durationMinutes: tourRouteStop.durationMinutes,
      hallwayStopId:   tourRouteStop.hallwayStopId,
      location:        hallwayStopData.location,
    })
    .from(tourRouteStop)
    .innerJoin(
      hallwayStopData,
      eq(tourRouteStop.hallwayStopId, hallwayStopData.hallwayStopId),
    )
    .where(eq(tourRouteStop.routeId, route[0].routeId))
    .orderBy(asc(tourRouteStop.stopOrder));

  return { routeId: route[0].routeId, routeNum: route[0].routeNum, stops };
}

export async function getAllTourRoutesWithStops() {
  const routes = await db
    .select()
    .from(tourRoute)
    .orderBy(asc(tourRoute.routeNum));

  const result = [];
  for (const route of routes) {
    const stops = await db
      .select({
        routeStopId:     tourRouteStop.routeStopId,
        stopOrder:       tourRouteStop.stopOrder,
        durationMinutes: tourRouteStop.durationMinutes,
        hallwayStopId:   tourRouteStop.hallwayStopId,
        location:        hallwayStopData.location,
      })
      .from(tourRouteStop)
      .innerJoin(
        hallwayStopData,
        eq(tourRouteStop.hallwayStopId, hallwayStopData.hallwayStopId),
      )
      .where(eq(tourRouteStop.routeId, route.routeId))
      .orderBy(asc(tourRouteStop.stopOrder));

    result.push({ routeId: route.routeId, routeNum: route.routeNum, stops });
  }
  return result;
}

export async function deleteTourRoute(routeId: number) {
  await db.delete(tourRoute).where(eq(tourRoute.routeId, routeId));
  return { success: true, routeId };
}

// ============================================================
//  TOUR ROUTE STOPS
// ============================================================

export async function addTourRouteStop(
  routeId: number,
  hallwayStopId: number,
  durationMinutes: number,
) {
  // 1. Get next stopOrder
  const existing = await db
    .select({ stopOrder: tourRouteStop.stopOrder })
    .from(tourRouteStop)
    .where(eq(tourRouteStop.routeId, routeId))
    .orderBy(sql`${tourRouteStop.stopOrder} DESC`)
    .limit(1);

  const nextOrder = existing.length > 0 ? existing[0].stopOrder + 1 : 1;

  // 2. Check for duplicate stop on this route
  const duplicate = await db
    .select({ routeStopId: tourRouteStop.routeStopId })
    .from(tourRouteStop)
    .where(and(eq(tourRouteStop.routeId, routeId), eq(tourRouteStop.hallwayStopId, hallwayStopId)))
    .limit(1);

  if (duplicate.length > 0) {
    throw new Error("This stop is already part of this route.");
  }

  // 3. Insert the stop
  const result = await db
    .insert(tourRouteStop)
    .values({ routeId, hallwayStopId, stopOrder: nextOrder, durationMinutes })
    .returning();

  // 3. Look up routeNum for this routeId
  const route = await db
    .select({ routeNum: tourRoute.routeNum })
    .from(tourRoute)
    .where(eq(tourRoute.routeId, routeId))
    .limit(1);

  if (route[0]?.routeNum != null) {
    // 4. Find all groups assigned to this routeNum
    const groups = await db
      .select({ groupId: groupData.groupId })
      .from(groupData)
      .where(eq(groupData.routeNum, route[0].routeNum));

    // 5. Seed attendance rows for each group at this new stop
    for (const group of groups) {
      if (group.groupId !== null) {
        await db
          .insert(groupRouteAttendance)
          .values({ groupId: group.groupId, hallwayStopId, present: false })
          .onConflictDoNothing();
      }
    }
  }

  return result[0];
}

export async function deleteTourRouteStop(routeStopId: number) {
  const deleted = await db
    .select()
    .from(tourRouteStop)
    .where(eq(tourRouteStop.routeStopId, routeStopId))
    .limit(1);

  if (!deleted[0]) return { success: false };

  await db
    .delete(tourRouteStop)
    .where(eq(tourRouteStop.routeStopId, routeStopId));

  // Re-sequence remaining stops
  const remaining = await db
    .select()
    .from(tourRouteStop)
    .where(eq(tourRouteStop.routeId, deleted[0].routeId))
    .orderBy(asc(tourRouteStop.stopOrder));

  for (let i = 0; i < remaining.length; i++) {
    await db
      .update(tourRouteStop)
      .set({ stopOrder: i + 1 })
      .where(eq(tourRouteStop.routeStopId, remaining[i].routeStopId));
  }

  return { success: true };
}

// Reorders a route's stops to match the given routeStopId sequence
// (drag-and-drop reordering in the admin UI). Writes stopOrder in two
// passes — first to unused high values, then to the final 1..N — so the
// (routeId, stopOrder) unique constraint never collides mid-update.
export async function reorderTourRouteStops(
  routeId: number,
  orderedRouteStopIds: number[],
) {
  const existing = await db
    .select({ routeStopId: tourRouteStop.routeStopId })
    .from(tourRouteStop)
    .where(eq(tourRouteStop.routeId, routeId));

  const existingIds = new Set(existing.map((s) => s.routeStopId));
  if (
    existingIds.size !== orderedRouteStopIds.length ||
    !orderedRouteStopIds.every((id) => existingIds.has(id))
  ) {
    return { success: false, reason: "Stop list does not match this route." };
  }

  const offset = existing.length + 1000;
  for (let i = 0; i < orderedRouteStopIds.length; i++) {
    await db
      .update(tourRouteStop)
      .set({ stopOrder: offset + i })
      .where(eq(tourRouteStop.routeStopId, orderedRouteStopIds[i]));
  }

  for (let i = 0; i < orderedRouteStopIds.length; i++) {
    await db
      .update(tourRouteStop)
      .set({ stopOrder: i + 1 })
      .where(eq(tourRouteStop.routeStopId, orderedRouteStopIds[i]));
  }

  return { success: true };
}

// ============================================================
//  GROUP ROUTE ATTENDANCE
// ============================================================

export async function seedGroupRouteAttendance(
  groupId: number,
  routeNum: number,
) {
  const route = await db
    .select()
    .from(tourRoute)
    .where(eq(tourRoute.routeNum, routeNum))
    .limit(1);

  if (!route[0]) return { success: false, reason: "Route not found" };

  const stops = await db
    .select({ hallwayStopId: tourRouteStop.hallwayStopId })
    .from(tourRouteStop)
    .where(eq(tourRouteStop.routeId, route[0].routeId));

  for (const stop of stops) {
    await db
      .insert(groupRouteAttendance)
      .values({ groupId, hallwayStopId: stop.hallwayStopId, present: false })
      .onConflictDoNothing();
  }

  return { success: true, stopsSeeded: stops.length };
}

// ============================================================
//  BLOCK ATTENDANCE (non-Tour blocks, e.g. Gym, Leonard)
//
//  Reuses hallway_stop_data as a generic named location and
//  group_route_attendance as a generic (group, location) presence
//  row — the same tables Tour stops use — so ambassadors mark
//  "reached the gym" the same way they mark "reached stop 2".
//  A block's location is found/created by matching its name
//  against hallway_stop_data.location.
// ============================================================

export async function ensureGroupBlockAttendance(groupId: number) {
  const group = await db
    .select({ eventOrder: groupData.eventOrder, routeNum: groupData.routeNum })
    .from(groupData)
    .where(eq(groupData.groupId, groupId))
    .limit(1);

  if (!group[0]) return { success: false, reason: "Group not found" };

  const eventOrder: string[] = JSON.parse(group[0].eventOrder ?? "[]");
  const nonTourBlocks = eventOrder.filter((b) => b.toLowerCase() !== "tour");

  await Promise.all([
    ...nonTourBlocks.map(async (blockName) => {
      let stop = await db
        .select({ hallwayStopId: hallwayStopData.hallwayStopId })
        .from(hallwayStopData)
        .where(eq(hallwayStopData.location, blockName))
        .limit(1);

      if (!stop[0]) {
        const inserted = await db
          .insert(hallwayStopData)
          .values({ location: blockName })
          .returning({ hallwayStopId: hallwayStopData.hallwayStopId });
        stop = inserted;
      }

      if (stop[0]) {
        await db
          .insert(groupRouteAttendance)
          .values({ groupId, hallwayStopId: stop[0].hallwayStopId, present: false })
          .onConflictDoNothing();
      }
    }),
    group[0].routeNum != null
      ? seedGroupRouteAttendance(groupId, group[0].routeNum)
      : Promise.resolve(),
  ]);

  return { success: true, blocksSeeded: nonTourBlocks.length };
}

export async function getAttendanceByGroup(groupId: number) {
  return db
    .select({
      attendanceId:  groupRouteAttendance.attendanceId,
      present:       groupRouteAttendance.present,
      markedAt:      groupRouteAttendance.markedAt,
      hallwayStopId: groupRouteAttendance.hallwayStopId,
      location:      hallwayStopData.location,
    })
    .from(groupRouteAttendance)
    .innerJoin(
      hallwayStopData,
      eq(groupRouteAttendance.hallwayStopId, hallwayStopData.hallwayStopId),
    )
    .where(eq(groupRouteAttendance.groupId, groupId));
}

export async function markGroupPresent(
  groupId: number,
  hallwayStopId: number,
  present: boolean,
) {
  await db
    .update(groupRouteAttendance)
    .set({ present, markedAt: present ? new Date() : null })
    .where(
      and(
        eq(groupRouteAttendance.groupId, groupId),
        eq(groupRouteAttendance.hallwayStopId, hallwayStopId),
      ),
    );
  return { success: true, groupId, hallwayStopId, present };
}

// ============================================================
//  CREATE GROUPS FROM DB
//
//  Route assignment logic:
//
//  Groups only need DIFFERENT routes if they do their Tour block
//  at the SAME time of day. Groups that do Tour in different
//  time slots can share a route — they walk it at different times
//  so there's no conflict.
//
//  "Tour slot" = which position Tour appears in a group's event
//  order (index 0, 1, or 2).
//
//  Example with 66 groups across 6 patterns (11 each):
//    Slot 0 (Tour first):  patterns 1 & 2 → 22 groups → routes 1–22
//    Slot 1 (Tour middle): patterns 3 & 4 → 22 groups → routes 1–22 (reused)
//    Slot 2 (Tour last):   patterns 5 & 6 → 22 groups → routes 1–22 (reused)
//
//  Result: only 22 routes need to be built, not 66.
// ============================================================

export async function createGroupsFromDB() {
  // 1. Get patterns from DB
  const patternRows = await db
    .select()
    .from(eventOrderPattern)
    .orderBy(asc(eventOrderPattern.patternNum));

  if (patternRows.length === 0) {
    throw new Error(
      "No event order patterns found. Please seed the event_order_pattern table first.",
    );
  }

  const orders = patternRows.map((p) => JSON.parse(p.blockOrder) as string[]);

  // 2. Get distinct group IDs from seminar data (now integers), ordered ascending
  const groupRows = await db
    .select({ id: seminarData.groupId })
    .from(seminarData)
    .orderBy(asc(seminarData.groupId));

  // Deduplicate while preserving order
  const seen = new Set<number>();
  const seminarGroupIds = groupRows
    .map((g) => g.id)
    .filter((id): id is number => {
      if (id === null || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

  const groupCount = seminarGroupIds.length;
  const orderCount = orders.length;

  // 3. Distribute groups evenly across patterns
  const countPerOrder = Math.floor(groupCount / orderCount);
  const remainder = groupCount % orderCount;

  const distribution = orders.map((order, index) => ({
    order,
    count: index < remainder ? countPerOrder + 1 : countPerOrder,
  }));

  // 4. Build insert rows — name defaults to "Group {seminarGroupId}"
  const tourSlotCounters = new Map<number, number>();
  const insertRows: {
    name:       string;
    eventOrder: string;
    routeNum:   number | null;
  }[] = [];

  let groupIndex = 0;

  for (const dist of distribution) {
    const tourSlot = dist.order.findIndex(
      (b) => b.toLowerCase() === "tour",
    );

    for (let i = 0; i < dist.count; i++) {
      const seminarGid = seminarGroupIds[groupIndex++];
      if (seminarGid === undefined) continue;

      let routeNum: number | null = null;

      if (tourSlot !== -1) {
        const current = tourSlotCounters.get(tourSlot) ?? 0;
        routeNum = current + 1;
        tourSlotCounters.set(tourSlot, routeNum);
      }

      insertRows.push({
        name: `Group ${seminarGid}`,
        eventOrder: JSON.stringify(dist.order),
        routeNum,
      });
    }
  }

  // 5. Insert all groups (groupId auto-generated by serial)
  const result = await db.insert(groupData).values(insertRows).returning();

  // 6. Seed tourRoute rows per unique routeNum
  const uniqueRouteNums = [
    ...new Set(
      insertRows
        .map((r) => r.routeNum)
        .filter((n): n is number => n !== null),
    ),
  ].sort((a, b) => a - b);

  for (const routeNum of uniqueRouteNums) {
    await db
      .insert(tourRoute)
      .values({ routeNum })
      .onConflictDoNothing();
  }

  return result.length;
}

// ============================================================
//  CREATE ESTIMATED GROUPS
//
//  Pre-creates a given number of groups (with auto-generated
//  serial IDs) before seminar data is uploaded. Uses the same
//  route distribution logic as createGroupsFromDB but takes a
//  user-supplied count instead of reading from seminar_data.
// ============================================================

export async function createEstimatedGroups(count: number) {
  const patternRows = await db
    .select()
    .from(eventOrderPattern)
    .orderBy(asc(eventOrderPattern.patternNum));

  if (patternRows.length === 0) {
    throw new Error(
      "No event order patterns found. Please configure event order patterns first.",
    );
  }

  const orders = patternRows.map((p) => JSON.parse(p.blockOrder) as string[]);
  const orderCount = orders.length;

  const countPerOrder = Math.floor(count / orderCount);
  const remainder = count % orderCount;

  const distribution = orders.map((order, index) => ({
    order,
    count: index < remainder ? countPerOrder + 1 : countPerOrder,
  }));

  const tourSlotCounters = new Map<number, number>();
  const insertRows: {
    name:       string;
    eventOrder: string;
    routeNum:   number | null;
  }[] = [];

  let groupNumber = 1;

  for (const dist of distribution) {
    const tourSlot = dist.order.findIndex(
      (b) => b.toLowerCase() === "tour",
    );

    for (let i = 0; i < dist.count; i++) {
      let routeNum: number | null = null;

      if (tourSlot !== -1) {
        const current = tourSlotCounters.get(tourSlot) ?? 0;
        routeNum = current + 1;
        tourSlotCounters.set(tourSlot, routeNum);
      }

      insertRows.push({
        name: `Group ${groupNumber}`,
        eventOrder: JSON.stringify(dist.order),
        routeNum,
      });
      groupNumber++;
    }
  }

  const result = await db.insert(groupData).values(insertRows).returning();

  const uniqueRouteNums = [
    ...new Set(
      insertRows
        .map((r) => r.routeNum)
        .filter((n): n is number => n !== null),
    ),
  ].sort((a, b) => a - b);

  for (const routeNum of uniqueRouteNums) {
    await db
      .insert(tourRoute)
      .values({ routeNum })
      .onConflictDoNothing();
  }

  return result.length;
}

// ============================================================
//  COMPUTED BLOCK START TIMES  (group leader route page)
//
//  The admin only sets ONE overall event start time. Each block's
//  start time is derived by chaining durations along that group's
//  own event order: block[n].startTime = block[n-1].startTime +
//  block[n-1].durationMinutes. Tour stops no longer get a computed
//  arrival time — only their duration is shown.
//
//  SCHEDULE REFERENCE DATA (shared, group-independent) is fetched
//  once via getScheduleReferenceData() below — block durations, the
//  event start time, every tour route's stops (keyed by routeNum),
//  and every hallway_stop_data location (for matching non-Tour block
//  names) — instead of re-fetching it per group.
// ============================================================

async function getScheduleReferenceData() {
  const [blocks, eventStartTime, routes, allStops, allLocations] =
    await Promise.all([
      db.select().from(blockSchedule),
      getEventStartTime(),
      db.select().from(tourRoute),
      db
        .select({
          routeId:         tourRouteStop.routeId,
          stopOrder:       tourRouteStop.stopOrder,
          durationMinutes: tourRouteStop.durationMinutes,
          hallwayStopId:   tourRouteStop.hallwayStopId,
          location:        hallwayStopData.location,
        })
        .from(tourRouteStop)
        .innerJoin(
          hallwayStopData,
          eq(tourRouteStop.hallwayStopId, hallwayStopData.hallwayStopId),
        )
        .orderBy(asc(tourRouteStop.routeId), asc(tourRouteStop.stopOrder)),
      db.select().from(hallwayStopData),
    ]);

  const blockMap = new Map(blocks.map((b) => [b.blockName.toLowerCase(), b]));

  const routeIdByRouteNum = new Map(routes.map((r) => [r.routeNum, r.routeId]));
  const stopsByRouteId = new Map<number, typeof allStops>();
  for (const stop of allStops) {
    const list = stopsByRouteId.get(stop.routeId);
    if (list) list.push(stop);
    else stopsByRouteId.set(stop.routeId, [stop]);
  }

  const stopIdByLocation = new Map(
    allLocations.map((s) => [s.location, s.hallwayStopId]),
  );

  return {
    blockMap,
    eventStartTime,
    routeIdByRouteNum,
    stopsByRouteId,
    stopIdByLocation,
  };
}

function computeSchedule(
  group: { groupId: number; name: string; eventOrder: string | null; routeNum: number | null },
  ref: Awaited<ReturnType<typeof getScheduleReferenceData>>,
  attendanceByStopId: Map<number, boolean>,
) {
  const eventOrder: string[] = JSON.parse(group.eventOrder ?? "[]");
  const routeNum = group.routeNum;

  const routeId = routeNum != null ? ref.routeIdByRouteNum.get(routeNum) : undefined;
  const stops = routeId != null ? ref.stopsByRouteId.get(routeId) ?? [] : [];

  let totalMinutes = parseTimeToMinutes(ref.eventStartTime);

  const schedule = eventOrder.map((blockName) => {
    const block = ref.blockMap.get(blockName.toLowerCase());
    const isTour = blockName.toLowerCase() === "tour";

    const blockHallwayStopId = isTour
      ? null
      : ref.stopIdByLocation.get(blockName) ?? null;

    const base = {
      blockName,
      hallwayStopId: blockHallwayStopId,
      present: blockHallwayStopId != null
        ? attendanceByStopId.get(blockHallwayStopId) ?? false
        : false,
    };

    if (!block) {
      return { ...base, startTime: "TBD", stops: [] };
    }

    const startTime = totalMinutes === null ? "TBD" : formatMinutesToTime(totalMinutes);
    if (totalMinutes !== null) totalMinutes += block.durationMinutes;

    return {
      ...base,
      startTime,
      durationMinutes: block.durationMinutes,
      stops: isTour
        ? stops.map((stop) => ({
            ...stop,
            present: attendanceByStopId.get(stop.hallwayStopId) ?? false,
          }))
        : [],
    };
  });

  return { groupId: group.groupId, groupName: group.name, routeNum, schedule };
}

export async function getGroupSchedule(groupId: number) {
  const group = await db
    .select({ name: groupData.name, eventOrder: groupData.eventOrder, routeNum: groupData.routeNum })
    .from(groupData)
    .where(eq(groupData.groupId, groupId))
    .limit(1);

  if (!group[0]) return null;

  await ensureGroupBlockAttendance(groupId);

  const [ref, attendanceRows] = await Promise.all([
    getScheduleReferenceData(),
    getAttendanceByGroup(groupId),
  ]);
  const attendanceByStopId = new Map(
    attendanceRows.map((a) => [a.hallwayStopId, a.present]),
  );

  return computeSchedule({ groupId, ...group[0] }, ref, attendanceByStopId);
}

// ============================================================
//  BATCHED SCHEDULE LOOKUP (read-only, no seeding)
//
//  For pages that need many groups' schedules at once (e.g. the
//  admin All Groups list). Fetches reference data + attendance for
//  every group in ONE round-trip each, instead of getGroupSchedule's
//  ~7 sequential queries repeated per group. Does not call
//  ensureGroupBlockAttendance — this is a pure read, so groups whose
//  attendance rows haven't been seeded yet (e.g. brand-new groups)
//  simply show "not reached" until an ambassador opens their route
//  page, which seeds them.
// ============================================================

export async function getGroupSchedulesForGroups(groupIds: number[]) {
  if (groupIds.length === 0) return new Map<number, ReturnType<typeof computeSchedule>>();

  const [groups, ref, attendanceRows] = await Promise.all([
    db
      .select({ groupId: groupData.groupId, name: groupData.name, eventOrder: groupData.eventOrder, routeNum: groupData.routeNum })
      .from(groupData)
      .where(inArray(groupData.groupId, groupIds)),
    getScheduleReferenceData(),
    db
      .select({
        groupId:       groupRouteAttendance.groupId,
        hallwayStopId: groupRouteAttendance.hallwayStopId,
        present:       groupRouteAttendance.present,
      })
      .from(groupRouteAttendance)
      .where(inArray(groupRouteAttendance.groupId, groupIds)),
  ]);

  const attendanceByGroup = new Map<number, Map<number, boolean>>();
  for (const row of attendanceRows) {
    let map = attendanceByGroup.get(row.groupId);
    if (!map) {
      map = new Map();
      attendanceByGroup.set(row.groupId, map);
    }
    map.set(row.hallwayStopId, row.present);
  }

  const result = new Map<number, ReturnType<typeof computeSchedule>>();
  for (const group of groups) {
    const attendanceByStopId = attendanceByGroup.get(group.groupId) ?? new Map();
    result.set(group.groupId, computeSchedule(group, ref, attendanceByStopId));
  }

  return result;
}
