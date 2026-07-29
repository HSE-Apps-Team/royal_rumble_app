"use server";

import { db } from "@/db";
import {
  seminarData,
  groupData,
  attendeeData,
  ambassadorData,
  mentorData,
  hallwayHostData,
  hallwayStopData,
  eventOrderPattern,
} from "@/db/schema";
import { eq, sql, isNull, inArray, asc } from "drizzle-orm";

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                         Read                                         //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export async function getGroupIds() {
  const groups = await db
    .select({
      groupId: groupData.groupId,
      name: groupData.name,
    })
    .from(groupData)
    .orderBy(asc(groupData.groupId));

  return groups;
}

export async function getAllGroups() {
  const groups = await db
    .select({
      groupId: groupData.groupId,
      name: groupData.name,
      routeNum: groupData.routeNum,
      eventOrder: groupData.eventOrder,
    })
    .from(groupData)
    .orderBy(asc(groupData.groupId));

  const attendees = await db
    .select({
      groupId: attendeeData.groupId,
      attendeeId: attendeeData.attendeeId,
      fName: attendeeData.fName,
      lName: attendeeData.lName,
    })
    .from(attendeeData);
  const mentors = await db
    .select({
      groupId: ambassadorData.groupId,
      mentorId: mentorData.mentorId,
      fName: mentorData.fName,
      lName: mentorData.lName,
    })
    .from(mentorData)
    .where(sql`upper(trim(${mentorData.job})) = 'AMBASSADOR'`)
    .leftJoin(ambassadorData, eq(ambassadorData.mentorId, mentorData.mentorId));

  interface GroupDetail {
    group_id: number;
    name: string;
    route_num: number;
    event_order: string;
    attendees: Array<{ attendee_id: string; name: string }>;
    mentors: Array<{ mentor_id: string; name: string }>;
  }

  const groupMap = new Map<number, GroupDetail>();

  for (const g of groups) {
    groupMap.set(g.groupId, {
      group_id: g.groupId,
      name: g.name,
      route_num: g.routeNum ?? 0,
      event_order: g.eventOrder ? JSON.parse(g.eventOrder).join(", ") : "",
      attendees: [],
      mentors: [],
    });
  }

  for (const f of attendees) {
    if (!f.groupId) continue;
    groupMap.get(f.groupId)?.attendees.push({
      attendee_id: f.attendeeId.toString(),
      name: f.fName + " " + f.lName,
    });
  }

  for (const m of mentors) {
    if (!m.groupId) continue;
    groupMap.get(m.groupId)?.mentors.push({
      mentor_id: m.mentorId.toString(),
      name: m.fName + " " + m.lName,
    });
  }

  return Array.from(groupMap.values());
}

export async function getAllGhostGroups() {
  const students = await db
    .select({
      groupId: seminarData.groupId,
      freshmenId: seminarData.freshmenId,
      fName: seminarData.fName,
      lName: seminarData.lName,
      teacherFullName: seminarData.teacherFullName,
      period: seminarData.period,
    })
    .from(seminarData);

  interface GhostGroupDetail {
    group_id: number | "Unassigned";
    name: string;
    teacher: string;
    period: string;
    section: "A" | "B" | "";
    freshmen: Array<{ freshmen_id: string; name: string }>;
  }

  // seminar_data.group_id has no reliable correspondence to group_data.group_id
  // (group_data's serial keys are unrelated and can contain duplicate "Group N"
  // names from being regenerated), so ghost groups are keyed purely off
  // seminar_data.group_id rather than joined against group_data.
  const groupMap = new Map<
    number,
    GhostGroupDetail & { teacherCounts: Map<string, number> }
  >();

  const unassigned: GhostGroupDetail = {
    group_id: "Unassigned",
    name: "Unassigned",
    teacher: "",
    period: "",
    section: "",
    freshmen: [],
  };

  for (const s of students) {
    let target: (GhostGroupDetail & { teacherCounts: Map<string, number> }) | GhostGroupDetail;
    if (s.groupId === null) {
      target = unassigned;
    } else {
      target = groupMap.get(s.groupId) ?? {
        group_id: s.groupId,
        name: `Group ${s.groupId}`,
        teacher: "",
        period: "",
        section: "",
        freshmen: [],
        teacherCounts: new Map<string, number>(),
      };
      groupMap.set(s.groupId, target as GhostGroupDetail & { teacherCounts: Map<string, number> });

      const key = `${s.teacherFullName ?? ""}|${s.period ?? ""}`;
      const counts = (target as GhostGroupDetail & { teacherCounts: Map<string, number> }).teacherCounts;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    target.freshmen.push({
      freshmen_id: (s.freshmenId ?? "").toString(),
      name: `${s.fName ?? ""} ${s.lName ?? ""}`.trim(),
    });
  }

  // Determine the dominant teacher/period for each group (majority of its freshmen).
  for (const group of groupMap.values()) {
    let bestKey = "";
    let bestCount = -1;
    for (const [key, count] of group.teacherCounts.entries()) {
      if (count > bestCount) {
        bestKey = key;
        bestCount = count;
      }
    }
    const [teacher, period] = bestKey.split("|");
    group.teacher = teacher ?? "";
    group.period = period ?? "";
  }

  // Groups sharing the same teacher/period are paired A (lower group_id) / B (higher).
  const byTeacherPeriod = new Map<string, number[]>();
  for (const group of groupMap.values()) {
    const key = `${group.teacher}|${group.period}`;
    if (!key.trim().replace("|", "")) continue;
    const arr = byTeacherPeriod.get(key) ?? [];
    arr.push(group.group_id as number);
    byTeacherPeriod.set(key, arr);
  }

  for (const ids of byTeacherPeriod.values()) {
    ids.sort((a, b) => a - b);
    ids.forEach((id, index) => {
      const group = groupMap.get(id);
      if (!group) return;
      group.section = index % 2 === 0 ? "A" : "B";
    });
  }

  for (const group of groupMap.values()) {
    const label = [group.teacher, group.period, group.section]
      .filter((part) => part && part.trim() !== "")
      .join(" ");
    group.name = label
      ? `Group ${group.group_id}: ${label}`
      : `Group ${group.group_id}`;
  }

  const sortedGroups = Array.from(groupMap.values())
    .sort((a, b) => (a.group_id as number) - (b.group_id as number))
    .map(({ teacherCounts: _teacherCounts, ...rest }) => rest);

  return [unassigned, ...sortedGroups];
}

// Real (event-day) groups from group_data that have no corresponding ghost
// group number in seminar_data — i.e. groups that exist for the actual event
// but aren't reflected in the Freshmen Prep roster projection.
export async function getNonGhostGroups() {
  const ghostGroups = await getAllGhostGroups();
  const ghostNumbers = new Set(
    ghostGroups
      .filter((g) => g.group_id !== "Unassigned")
      .map((g) => g.group_id as number),
  );

  const groups = await db
    .select({
      groupId: groupData.groupId,
      name: groupData.name,
    })
    .from(groupData)
    .orderBy(asc(groupData.groupId));

  // groupData.groupId is an unrelated serial id (see comment in
  // getAllGhostGroups); the real group number is encoded in the name, which
  // is always created as `Group {seminarGroupId}` (see resolveGroupId above).
  const parseGroupNumber = (name: string) => {
    const match = name.trim().match(/^Group (\d+)$/i);
    return match ? Number(match[1]) : null;
  };

  const nonGhostGroups = groups
    .map((g) => ({ ...g, groupNumber: parseGroupNumber(g.name) }))
    .filter((g) => g.groupNumber !== null && !ghostNumbers.has(g.groupNumber));

  const attendees = await db
    .select({
      groupId: attendeeData.groupId,
      attendeeId: attendeeData.attendeeId,
      fName: attendeeData.fName,
      lName: attendeeData.lName,
    })
    .from(attendeeData)
    .where(inArray(attendeeData.groupId, nonGhostGroups.map((g) => g.groupId)));

  const attendeesByGroup = new Map<number, Array<{ attendee_id: string; name: string }>>();
  for (const a of attendees) {
    if (a.groupId === null) continue;
    const list = attendeesByGroup.get(a.groupId) ?? [];
    list.push({
      attendee_id: a.attendeeId.toString(),
      name: `${a.fName ?? ""} ${a.lName ?? ""}`.trim(),
    });
    attendeesByGroup.set(a.groupId, list);
  }

  return nonGhostGroups.map((g) => ({
    group_id: g.groupNumber as number,
    name: g.name,
    attendees: attendeesByGroup.get(g.groupId) ?? [],
  }));
}

export async function getSeminarGroupIds() {
  const ghostGroups = await getAllGhostGroups();
  return ghostGroups
    .filter((g) => g.group_id !== "Unassigned")
    .map((g) => ({ groupId: g.group_id as number, name: g.name }));
}

export async function getGroupByGroupId(groupId: number) {
  const group = await db
    .select()
    .from(groupData)
    .where(eq(groupData.groupId, groupId))
    .limit(1);
  return group[0];
}

export async function getAttendeesByGroupId(groupId: number) {
  const attendees = await db
    .select()
    .from(attendeeData)
    .where(eq(attendeeData.groupId, groupId));
  return attendees;
}

export async function getMentorsByGroupId(groupId: number) {
  const mentorsId = await db
    .select()
    .from(ambassadorData)
    .where(eq(ambassadorData.groupId, groupId));

  const mentors = Array<{ mentor_id: number; fname: string; lname: string }>();

  for (const id of mentorsId) {
    if (id.mentorId === null) continue;
    const mentor = await db
      .select()
      .from(mentorData)
      .where(eq(mentorData.mentorId, id.mentorId));
    mentors.push({
      mentor_id: mentor[0].mentorId,
      fname: mentor[0].fName ?? "",
      lname: mentor[0].lName ?? "",
    });
  }

  return mentors;
}

export async function getNullGroupAttendees() {
  const attendees = await db
    .select({
      groupId: attendeeData.groupId,
      attendeeId: attendeeData.attendeeId,
      fName: attendeeData.fName,
      lName: attendeeData.lName,
    })
    .from(attendeeData)
    .where(isNull(attendeeData.groupId));
  return attendees;
}

export async function getNullGroupMentors() {
  const groupLeaders = await db
    .select({
      groupId: ambassadorData.groupId,
      mentorId: mentorData.mentorId,
      fName: mentorData.fName,
      lName: mentorData.lName,
    })
    .from(mentorData)
    .where(
      sql`upper(trim(${mentorData.job})) = 'AMBASSADOR' AND (${ambassadorData.groupId} IS NULL OR ${ambassadorData.mentorId} IS NULL)`,
    )
    .leftJoin(ambassadorData, eq(ambassadorData.mentorId, mentorData.mentorId));
  return groupLeaders;
}

export async function getGroupIdByMentorId(mentorId: number) {
  const groupLeader = await db
    .select({
      groupId: ambassadorData.groupId,
    })
    .from(ambassadorData)
    .where(eq(ambassadorData.mentorId, mentorId))
    .limit(1);
  return groupLeader[0]?.groupId ?? null;
}

export async function getAttendeesAttendanceByGroupId(groupId: number) {
  const attendance = await db
    .select({
      attendeeId: attendeeData.attendeeId,
      fName: attendeeData.fName,
      lName: attendeeData.lName,
      present: attendeeData.present,
    })
    .from(attendeeData)
    .where(eq(attendeeData.groupId, groupId));
  return attendance;
}

{
  /* ====================================
=               Hallways Read                =
==================================== */
}

export async function getNullHallwayMentors() {
  const hallwayHosts = await db
    .select({
      hallwayStopId: hallwayHostData.hallwayStopId,
      mentorId: mentorData.mentorId,
      fName: mentorData.fName,
      lName: mentorData.lName,
    })
    .from(hallwayHostData)
    .where(isNull(hallwayHostData.hallwayStopId))
    .innerJoin(mentorData, eq(hallwayHostData.mentorId, mentorData.mentorId));
  return hallwayHosts;
}

export async function getHallwayByHallwayId(hallwayId: number) {
  const hallway = await db
    .select()
    .from(hallwayStopData)
    .where(eq(hallwayStopData.hallwayStopId, hallwayId));
  return hallway[0];
}

export async function getMentorsByHallwayId(hallwayId: number) {
  const mentorsId = await db
    .select()
    .from(hallwayHostData)
    .where(eq(hallwayHostData.hallwayStopId, hallwayId));

  const mentors = Array<{ mentor_id: number; fname: string; lname: string }>();

  for (const id of mentorsId) {
    if (id.mentorId === null) continue;
    const mentor = await db
      .select()
      .from(mentorData)
      .where(eq(mentorData.mentorId, id.mentorId));
    mentors.push({
      mentor_id: mentor[0].mentorId,
      fname: mentor[0].fName ?? "",
      lname: mentor[0].lName ?? "",
    });
  }

  return mentors;
}

export async function getAllHallways() {
  const hallways = await db
    .select()
    .from(hallwayStopData)
    .orderBy(hallwayStopData.hallwayStopId);
  return hallways;
}

export async function getHallwayIdByMentorId(mentorId: number) {
  const hallwayHost = await db
    .select({
      hallwayStopId: hallwayHostData.hallwayStopId,
    })
    .from(hallwayHostData)
    .where(eq(hallwayHostData.mentorId, mentorId))
    .limit(1);
  return hallwayHost[0]?.hallwayStopId ?? null;
}

{
  /* ======== End of Hallways Read ======== */
}

//--------------------------------------------------------------------------------------//
//                                     End of Read                                      //
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                         Add                                          //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export async function createGroups() {
  const patternRows = await db
    .select()
    .from(eventOrderPattern)
    .orderBy(asc(eventOrderPattern.patternNum));

  if (patternRows.length === 0) {
    throw new Error(
      "No event order patterns found. Please seed the event_order_pattern table first.",
    );
  }

  const orders: string[][] = patternRows.map(
    (p) => JSON.parse(p.blockOrder) as string[],
  );

  const groupRows = await db
    .selectDistinct({ id: seminarData.groupId })
    .from(seminarData)
    .orderBy(seminarData.groupId);

  const groupIds = groupRows.map((g) => g.id).filter((id): id is number => id !== null);
  const groupCount = groupIds.length;

  const patternCount = orders.length;
  const countPerOrder = Math.floor(groupCount / patternCount);
  const remainder = groupCount % patternCount;

  const distribution = orders.map((order, index) => ({
    order: order,
    count: index < remainder ? countPerOrder + 1 : countPerOrder,
  }));

  interface InsertRow {
    name: string;
    eventOrder: string;
    routeNum: number;
  }

  const insertRows: InsertRow[] = [];
  let currentIndex = 0;

  distribution.forEach((dist) => {
    const { order, count } = dist;

    for (let i = 0; i < count; i++) {
      const gId = groupIds[currentIndex++];
      const routeNum = i + 1;

      insertRows.push({
        name: gId !== undefined ? `Group ${gId}` : "",
        eventOrder: JSON.stringify(order),
        routeNum,
      });
    }
  });

  const result = await db.insert(groupData).values(insertRows).returning();
  return result.length;
}

// Add Single Group
export async function addCustomGroup(
  groupName: string,
  eventOrder: string[],
  routeNumber: number,
): Promise<{ groupId: number; name: string; eventOrder: string; routeNum: number }[]> {
  const result = await db
    .insert(groupData)
    .values({
      name: groupName,
      eventOrder: JSON.stringify(eventOrder),
      routeNum: routeNumber,
    })
    .returning();

  return result as { groupId: number; name: string; eventOrder: string; routeNum: number }[];
}

{
  /* ====================================
=               Hallways add           =
==================================== */
}

export async function addHallway(
  hallwayName: string,
): Promise<{ success: boolean; hallwayName: string }> {
  await db.insert(hallwayStopData).values({
    location: hallwayName,
  });
  return { success: true, hallwayName };
}

{
  /* ======== End of Hallways add ======== */
}

//--------------------------------------------------------------------------------------//
//                                      End of Add                                      //
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Update                                        //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export async function hasSeminarData(): Promise<boolean> {
  const rows = await db.select({ freshmenId: seminarData.freshmenId }).from(seminarData).limit(1);
  return rows.length > 0;
}

export async function hasAttendeeData(): Promise<boolean> {
  const rows = await db.select({ attendeeId: attendeeData.attendeeId }).from(attendeeData).limit(2);
  return rows.length > 1;
}

export async function hasGroupData(): Promise<boolean> {
  const rows = await db.select({ groupId: groupData.groupId }).from(groupData).limit(1);
  return rows.length > 0;
}

export async function createSeminarGroups() {
  const allStudents = await db.select().from(seminarData);

  // Group by teacher + period + semester
  const groups = new Map<string, typeof allStudents>();

  for (const student of allStudents) {
    const key = `${student.teacherFullName}-${student.period}-${student.semester}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(student);
  }

  // Get existing group_data count to calculate the gap
  const existingGroups = await db.select({ groupId: groupData.groupId }).from(groupData);
  const existingCount = existingGroups.length;

  let currentGroupA = 1;
  let currentGroupB = 2;
  let finalGroup = 2;

  for (const [, students] of groups.entries()) {
    const total = students.length;
    const half = Math.floor(total / 2);

    const groupAStudents = students.slice(0, half);
    const groupBStudents = students.slice(half);

    const groupAIds = groupAStudents
      .map((s) => s.freshmenId)
      .filter((id): id is number => id !== null);

    const groupBIds = groupBStudents
      .map((s) => s.freshmenId)
      .filter((id): id is number => id !== null);

    if (groupAIds.length > 0) {
      await db
        .update(seminarData)
        .set({ groupId: currentGroupA })
        .where(inArray(seminarData.freshmenId, groupAIds));
    }

    if (groupBIds.length > 0) {
      await db
        .update(seminarData)
        .set({ groupId: currentGroupB })
        .where(inArray(seminarData.freshmenId, groupBIds));
    }

    finalGroup = currentGroupB;
    currentGroupA += 2;
    currentGroupB += 2;
  }

  const seminarGroupCount = finalGroup;
  const gap = seminarGroupCount - existingCount;

  return {
    success: true,
    finalGroupCount: seminarGroupCount,
    existingGroupCount: existingCount,
    groupsStillNeeded: gap > 0 ? gap : 0,
  };
}

export async function syncGroups() {
  // get seminar data — groupId here is the ghost-group number, not groupData.groupId
  const seminarRows = await db
    .select({
      freshmenId: seminarData.freshmenId,
      fName: seminarData.fName,
      lName: seminarData.lName,
      groupId: seminarData.groupId,
    })
    .from(seminarData);

  // Build lookup maps
  const seminarById = new Map<number, (typeof seminarRows)[0]>();
  const seminarByName = new Map<string, typeof seminarRows>();

  for (const row of seminarRows) {
    if (row.freshmenId) {
      seminarById.set(row.freshmenId, row);
    }

    if (row.fName && row.lName) {
      const nameKey = `${row.fName.toLowerCase()}|${row.lName.toLowerCase()}`;
      const arr = seminarByName.get(nameKey) ?? [];
      arr.push(row);
      seminarByName.set(nameKey, arr);
    }
  }

  // seminarData.groupId is only the ghost-group number (e.g. 1, 2, 3…), while
  // groupData.groupId is a separate serial id that gets regenerated whenever
  // groups are (re)created. Groups are created with name `Group {seminarGroupId}`,
  // so resolve through that name to get the real groupData.groupId to assign.
  const groupRows = await db
    .select({ groupId: groupData.groupId, name: groupData.name })
    .from(groupData);
  const groupIdByName = new Map<string, number>();
  for (const g of groupRows) {
    groupIdByName.set(g.name.trim().toLowerCase(), g.groupId);
  }
  const resolveGroupId = (seminarGroupId: number | null) => {
    if (seminarGroupId === null) return null;
    return groupIdByName.get(`group ${seminarGroupId}`.toLowerCase()) ?? null;
  };

  const attendeeRows = await db.select().from(attendeeData);

  const unmatched: { attendeeId: string; fName: string; lName: string }[] = [];

  for (const student of attendeeRows) {
    let matched = false;

    // Attempt 1: match by ID
    if (student.attendeeId && seminarById.has(student.attendeeId)) {
      const match = seminarById.get(student.attendeeId)!;
      const resolvedGroupId = resolveGroupId(match.groupId);
      if (resolvedGroupId !== null) {
        await db
          .update(attendeeData)
          .set({ groupId: resolvedGroupId })
          .where(eq(attendeeData.attendeeId, student.attendeeId));
        matched = true;
      }
    } else if (student.fName && student.lName) {
      // Attempt 2: match by unique name
      const nameKey = `${student.fName.toLowerCase()}|${student.lName.toLowerCase()}`;
      const possible = seminarByName.get(nameKey);

      if (possible && possible.length === 1) {
        const match = possible[0];
        const resolvedGroupId = resolveGroupId(match.groupId);
        if (match.freshmenId != null && resolvedGroupId !== null) {
          await db
            .update(attendeeData)
            .set({
              attendeeId: match.freshmenId,
              groupId: resolvedGroupId,
            })
            .where(eq(attendeeData.attendeeId, student.attendeeId));
          matched = true;
        }
      }
    }

    if (!matched) {
      unmatched.push({
        attendeeId: student.attendeeId.toString(),
        fName: student.fName ?? "",
        lName: student.lName ?? "",
      });
    }
  }

  return {
    success: true,
    unmatched,
  };
}

export async function updateGroupByGroupId(
  groupId: number,
  name: string,
  event_order: string[],
  route_num: number,
) {
  await db
    .update(groupData)
    .set({
      name,
      eventOrder: JSON.stringify(event_order),
      routeNum: route_num,
    })
    .where(eq(groupData.groupId, groupId));
  return { success: true, groupId, name };
}

{
  /* Hallway Update
==================================== */
}

export async function updateHallwayByID(hallwayId: number, location: string) {
  await db
    .update(hallwayStopData)
    .set({
      location: location,
    })
    .where(eq(hallwayStopData.hallwayStopId, hallwayId));
  return { success: true, hallwayId };
}

{
  /* End of Hallway Update
==================================== */
}

{
  /* Ghost Group (seminar_data) Update
==================================== */
}

export async function reassignSeminarFreshman(
  freshmenId: number,
  newGroupId: number | null,
) {
  await db
    .update(seminarData)
    .set({ groupId: newGroupId })
    .where(eq(seminarData.freshmenId, freshmenId));
  return { success: true, freshmenId };
}

// Adds a freshman not currently in the seminar roster directly into a ghost
// group, so admins can fix rostering gaps without re-uploading seminar data.
export async function addSeminarFreshman(data: {
  freshmenId: number;
  fName: string;
  lName: string;
  teacherFullName?: string;
  period?: string;
  semester?: string;
  groupId: number | null;
}) {
  const existing = await db
    .select({ freshmenId: seminarData.freshmenId })
    .from(seminarData)
    .where(eq(seminarData.freshmenId, data.freshmenId))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "duplicate" as const };
  }

  await db.insert(seminarData).values({
    freshmenId: data.freshmenId,
    fName: data.fName,
    lName: data.lName,
    teacherFullName: data.teacherFullName ?? "",
    period: data.period ?? "",
    semester: data.semester ?? "",
    groupId: data.groupId,
  });

  return { success: true, freshmenId: data.freshmenId };
}

// Renumbers seminar_data.group_id to consecutive integers starting at 1,
// preserving relative order, so gaps left by emptying/deleting a group
// (e.g. moving everyone out of group 2) collapse instead of leaving a hole.
export async function compactSeminarGroupNumbers() {
  const rows = await db
    .selectDistinct({ groupId: seminarData.groupId })
    .from(seminarData)
    .orderBy(asc(seminarData.groupId));

  const oldIds = rows
    .map((r) => r.groupId)
    .filter((id): id is number => id !== null);

  // Renumber via a temporary offset first so intermediate updates can never
  // collide with an existing (not-yet-renumbered) group_id.
  const offset = 1_000_000;
  for (let i = 0; i < oldIds.length; i++) {
    await db
      .update(seminarData)
      .set({ groupId: offset + i + 1 })
      .where(eq(seminarData.groupId, oldIds[i]));
  }

  for (let i = 0; i < oldIds.length; i++) {
    await db
      .update(seminarData)
      .set({ groupId: i + 1 })
      .where(eq(seminarData.groupId, offset + i + 1));
  }

  return { success: true, groupCount: oldIds.length };
}

{
  /* End of Ghost Group (seminar_data) Update
==================================== */
}

//--------------------------------------------------------------------------------------//
//                                    End of Update                                     //
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Delete                                        //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export async function deleteGroupByGroupId(groupId: number) {
  await db
    .update(attendeeData)
    .set({ groupId: null })
    .where(eq(attendeeData.groupId, groupId));
  await db
    .update(ambassadorData)
    .set({ groupId: null })
    .where(eq(ambassadorData.groupId, groupId));
  const result = await db
    .delete(groupData)
    .where(eq(groupData.groupId, groupId))
    .returning();
  return { success: result.length > 0 };
}

{
  /* ====================================
=               Hallway Delete                =
==================================== */
}

export async function deleteHallwayByStopId(stopId: number) {
  await db
    .update(hallwayHostData)
    .set({ hallwayStopId: null })
    .where(eq(hallwayHostData.hallwayStopId, stopId));
  const result = await db
    .delete(hallwayStopData)
    .where(eq(hallwayStopData.hallwayStopId, stopId))
    .returning();
  return { success: result.length > 0 };
}

{
  /* ======== End of Hallway Delete ======== */
}

//--------------------------------------------------------------------------------------//
//                                        End of Delete                                 //
//--------------------------------------------------------------------------------------//
