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
import { eq, asc, sql, and } from "drizzle-orm";

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

// Block start times are now derived (chained from the overall event start
// time using each block's duration), so callers only supply duration.
// startTime is still persisted internally as a placeholder to satisfy the
// existing NOT NULL column without requiring a schema migration.
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
      .values({ blockName, startTime: "—", durationMinutes })
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

export async function getAttendanceByStop(hallwayStopId: number) {
  return db
    .select({
      attendanceId: groupRouteAttendance.attendanceId,
      groupId:      groupRouteAttendance.groupId,
      groupName:    groupData.name,
      present:      groupRouteAttendance.present,
      markedAt:     groupRouteAttendance.markedAt,
      routeNum:     groupData.routeNum,
    })
    .from(groupRouteAttendance)
    .innerJoin(groupData, eq(groupRouteAttendance.groupId, groupData.groupId))
    .where(eq(groupRouteAttendance.hallwayStopId, hallwayStopId))
    .orderBy(asc(groupData.groupId));
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
// ============================================================

export async function getGroupSchedule(groupId: number) {
  const group = await db
    .select({ name: groupData.name, eventOrder: groupData.eventOrder, routeNum: groupData.routeNum })
    .from(groupData)
    .where(eq(groupData.groupId, groupId))
    .limit(1);

  if (!group[0]) return null;

  const eventOrder: string[] = JSON.parse(group[0].eventOrder ?? "[]");
  const routeNum = group[0].routeNum;

  const blocks = await db.select().from(blockSchedule);
  const blockMap = new Map(blocks.map((b) => [b.blockName, b]));

  const eventStartTime = await getEventStartTime();
  let totalMinutes = parseTimeToMinutes(eventStartTime);

  const route = await db
    .select()
    .from(tourRoute)
    .where(eq(tourRoute.routeNum, routeNum ?? 0))
    .limit(1);

  const stops = route[0]
    ? await db
        .select({
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
        .orderBy(asc(tourRouteStop.stopOrder))
    : [];

  const schedule = eventOrder.map((blockName) => {
    const block = blockMap.get(blockName);
    if (!block) {
      return { blockName, startTime: "TBD", stops: [] };
    }

    const startTime = totalMinutes === null ? "TBD" : formatMinutesToTime(totalMinutes);
    if (totalMinutes !== null) totalMinutes += block.durationMinutes;

    return {
      blockName,
      startTime,
      durationMinutes: block.durationMinutes,
      stops: blockName === "Tour" ? stops : [],
    };
  });

  return { groupId, groupName: group[0].name, routeNum, schedule };
}
