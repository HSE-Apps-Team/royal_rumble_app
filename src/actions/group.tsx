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
    .from(ambassadorData)
    .innerJoin(mentorData, eq(ambassadorData.mentorId, mentorData.mentorId));

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
    .from(ambassadorData)
    .where(isNull(ambassadorData.groupId))
    .innerJoin(mentorData, eq(ambassadorData.mentorId, mentorData.mentorId));
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
  // get seminar data — groupId is now an integer matching groupData.groupId
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

  // Get all groups so we can map seminar groupId → groupData.groupId
  // With the new schema, seminarData.groupId IS groupData.groupId (both int),
  // so we assign directly.
  const attendeeRows = await db.select().from(attendeeData);

  const unmatched: { attendeeId: string; fName: string; lName: string }[] = [];

  for (const student of attendeeRows) {
    let matched = false;

    // Attempt 1: match by ID
    if (student.attendeeId && seminarById.has(student.attendeeId)) {
      const match = seminarById.get(student.attendeeId)!;
      await db
        .update(attendeeData)
        .set({ groupId: match.groupId })
        .where(eq(attendeeData.attendeeId, student.attendeeId));
      matched = true;
    } else if (student.fName && student.lName) {
      // Attempt 2: match by unique name
      const nameKey = `${student.fName.toLowerCase()}|${student.lName.toLowerCase()}`;
      const possible = seminarByName.get(nameKey);

      if (possible && possible.length === 1) {
        const match = possible[0];
        if (match.freshmenId != null) {
          await db
            .update(attendeeData)
            .set({
              attendeeId: match.freshmenId,
              groupId: match.groupId,
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
