"use server";

import { db } from "@/db";
import { attendeeData, seminarData, groupData } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";
import { toTitleCase } from "@/lib/toTitleCase";

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Read                                          //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export const getAttendeeById = async (attendeeId: number) => {
  const attendee = await db
    .select()
    .from(attendeeData)
    .where(eq(attendeeData.attendeeId, attendeeId))
    .limit(1);
  const row = attendee[0];
  if (!row) return row;
  return {
    ...row,
    healthConcerns: row.healthConcerns ? decrypt(row.healthConcerns) : row.healthConcerns,
  };
};

export const getAttendees = async () => {
  const attendees = await db.select().from(attendeeData);
  return attendees.map((row) => ({
    ...row,
    healthConcerns: row.healthConcerns ? decrypt(row.healthConcerns) : row.healthConcerns,
  }));
};

export const getAttendeesAttendance = async () => {
  const attendees = await db
    .select({
      fName: attendeeData.fName,
      lName: attendeeData.lName,
      attendeeId: attendeeData.attendeeId,
      present: attendeeData.present,
    })
    .from(attendeeData)
    .orderBy(asc(attendeeData.attendeeId));

  return attendees;
};

export const getAttendeeByIdFromSchoolData = async (freshmenId: number) => {
  const freshman = await db
    .select()
    .from(seminarData)
    .where(eq(seminarData.freshmenId, freshmenId))
    .limit(1);
  return freshman[0];
};

// Searches the seminar (Freshmen Prep) roster by name or student ID, for
// picking a student to onboard as an attendee. Excludes anyone already in
// attendee_data so the same student can't be added twice. An empty query
// returns every eligible student (unfiltered, unlimited), so the picker can
// show the full roster by default.
export const searchSeminarCandidates = async (query: string) => {
  const trimmed = query.trim();

  const [seminarRows, existingAttendeeIds, groupRows] = await Promise.all([
    db.select().from(seminarData),
    db.select({ attendeeId: attendeeData.attendeeId }).from(attendeeData),
    db.select({ groupId: groupData.groupId, name: groupData.name }).from(groupData),
  ]);

  const alreadyAdded = new Set(existingAttendeeIds.map((a) => a.attendeeId));

  const groupIdByName = new Map<string, number>();
  for (const g of groupRows) {
    groupIdByName.set(g.name.trim().toLowerCase(), g.groupId);
  }
  const resolveGroupName = (seminarGroupId: number | null) => {
    if (seminarGroupId === null) return null;
    return groupIdByName.has(`group ${seminarGroupId}`.toLowerCase())
      ? `Group ${seminarGroupId}`
      : null;
  };

  const lowerQuery = trimmed.toLowerCase();
  const isNumeric = /^\d+$/.test(trimmed);

  const eligible = seminarRows.filter(
    (row) => row.freshmenId && !alreadyAdded.has(row.freshmenId),
  );

  const matches =
    trimmed === ""
      ? eligible
      : eligible.filter((row) => {
          if (isNumeric) {
            return row.freshmenId!.toString().includes(trimmed);
          }

          const fName = (row.fName ?? "").toLowerCase();
          const lName = (row.lName ?? "").toLowerCase();
          const parts = lowerQuery.split(" ").filter(Boolean);
          if (parts.length === 2) {
            const [firstPart, lastPart] = parts;
            return fName.includes(firstPart) && lName.includes(lastPart);
          }
          return fName.includes(lowerQuery) || lName.includes(lowerQuery);
        });

  const limited = trimmed === "" ? matches : matches.slice(0, 25);

  return limited
    .map((row) => ({
      freshmenId: row.freshmenId as number,
      fName: row.fName ?? "",
      lName: row.lName ?? "",
      teacherFullName: row.teacherFullName,
      period: row.period,
      groupName: resolveGroupName(row.groupId),
    }))
    .sort(
      (a, b) =>
        a.lName.localeCompare(b.lName) || a.fName.localeCompare(b.fName),
    );
};

// Searches checked-in attendees (attendee_data) by name or student ID, for the
// "Attendee Lost?" day-of-event lookup. Mirrors searchSeminarCandidates but
// searches the actual attendee roster instead of the seminar roster, and
// includes each attendee's current group so results are useful at a glance.
export const searchCheckedInAttendees = async (query: string) => {
  const trimmed = query.trim();

  const [attendees, groupRows] = await Promise.all([
    db
      .select({
        attendeeId: attendeeData.attendeeId,
        fName: attendeeData.fName,
        lName: attendeeData.lName,
        groupId: attendeeData.groupId,
        present: attendeeData.present,
      })
      .from(attendeeData),
    db.select({ groupId: groupData.groupId, name: groupData.name }).from(groupData),
  ]);

  const groupNameById = new Map<number, string>();
  for (const g of groupRows) {
    groupNameById.set(g.groupId, g.name);
  }

  const lowerQuery = trimmed.toLowerCase();
  const isNumeric = /^\d+$/.test(trimmed);

  const matches =
    trimmed === ""
      ? attendees
      : attendees.filter((row) => {
          if (isNumeric) {
            return row.attendeeId.toString().includes(trimmed);
          }

          const fName = (row.fName ?? "").toLowerCase();
          const lName = (row.lName ?? "").toLowerCase();
          const parts = lowerQuery.split(" ").filter(Boolean);
          if (parts.length === 2) {
            const [firstPart, lastPart] = parts;
            return fName.includes(firstPart) && lName.includes(lastPart);
          }
          return fName.includes(lowerQuery) || lName.includes(lowerQuery);
        });

  const limited = trimmed === "" ? matches : matches.slice(0, 25);

  return limited
    .map((row) => ({
      attendeeId: row.attendeeId,
      fName: row.fName ?? "",
      lName: row.lName ?? "",
      groupId: row.groupId,
      groupName: row.groupId != null ? groupNameById.get(row.groupId) ?? null : null,
      present: row.present ?? false,
    }))
    .sort(
      (a, b) =>
        a.lName.localeCompare(b.lName) || a.fName.localeCompare(b.fName),
    );
};

//--------------------------------------------------------------------------------------//
//                                     End of Read                                      //
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                         Add                                          //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export const addAttendee = async (data: {
  f_name: string;
  l_name: string;
  freshmen_id: number;
  primary_language?: string;
}) => {
  // Check seminar data for this attendee
  const seminarRecord = await db
    .select()
    .from(seminarData)
    .where(eq(seminarData.freshmenId, data.freshmen_id))
    .limit(1);

  const seminar = seminarRecord[0] ?? null;

  // seminarData.groupId is only the ghost-group number (e.g. 1, 2, 3…), while
  // groupData.groupId is the real event-day group id. Groups are created with
  // name `Group {seminarGroupId}`, so resolve through that name (see syncGroups).
  let groupId: number | null = null;
  let groupName: string | null = null;
  if (seminar?.groupId != null) {
    const groupRecord = await db
      .select({ groupId: groupData.groupId, name: groupData.name })
      .from(groupData)
      .where(sql`lower(${groupData.name}) = ${`group ${seminar.groupId}`.toLowerCase()}`)
      .limit(1);
    groupId = groupRecord[0]?.groupId ?? null;
    groupName = groupRecord[0]?.name ?? null;
  }

  await db.insert(attendeeData).values({
    fName: toTitleCase(data.f_name),
    lName: toTitleCase(data.l_name),
    attendeeId: data.freshmen_id,
    primaryLanguage: data.primary_language,
    groupId,
  });

  return {
    success: true,
    f_name: data.f_name,
    l_name: data.l_name,
    freshmen_id: data.freshmen_id,
    teacher: seminar?.teacherFullName ?? null,
    groupName,
  };
};
// Registers a walk-in sophomore-or-above attendee. Unlike addAttendee (which
// onboards a student already present in the seminar/"Freshmen Prep" roster),
// these students were never in seminar_data, so this creates both the
// attendee_data row (their real event-day registration) and a matching
// seminar_data row (so they also show up in Ghost Groups / group rosters that
// are keyed off the ghost-group number, same as everyone else). The admin
// picks a real event-day group directly; the ghost-group number is derived
// from that group's name, which is always "Group {N}" (see resolveGroupId in
// src/actions/group.tsx).
export const addWalkInAttendee = async (data: {
  f_name: string;
  l_name: string;
  attendee_id: number;
  group_id: number;
}) => {
  const existing = await db
    .select({ attendeeId: attendeeData.attendeeId })
    .from(attendeeData)
    .where(eq(attendeeData.attendeeId, data.attendee_id))
    .limit(1);

  if (existing.length > 0) {
    return { success: false as const, error: "duplicate" as const };
  }

  const groupRecord = await db
    .select({ groupId: groupData.groupId, name: groupData.name })
    .from(groupData)
    .where(eq(groupData.groupId, data.group_id))
    .limit(1);

  const group = groupRecord[0];
  if (!group) {
    return { success: false as const, error: "invalid_group" as const };
  }

  const ghostGroupMatch = group.name.trim().match(/^Group (\d+)$/i);
  const ghostGroupNumber = ghostGroupMatch ? Number(ghostGroupMatch[1]) : null;

  await db.insert(attendeeData).values({
    fName: toTitleCase(data.f_name),
    lName: toTitleCase(data.l_name),
    attendeeId: data.attendee_id,
    groupId: group.groupId,
  });

  const existingSeminarRow = await db
    .select({ freshmenId: seminarData.freshmenId })
    .from(seminarData)
    .where(eq(seminarData.freshmenId, data.attendee_id))
    .limit(1);

  if (existingSeminarRow.length === 0) {
    await db.insert(seminarData).values({
      freshmenId: data.attendee_id,
      fName: toTitleCase(data.f_name),
      lName: toTitleCase(data.l_name),
      groupId: ghostGroupNumber,
    });
  }

  return {
    success: true as const,
    f_name: data.f_name,
    l_name: data.l_name,
    attendee_id: data.attendee_id,
    groupName: group.name,
  };
};
//--------------------------------------------------------------------------------------//
//                                      End of Add                                      //
//--------------------------------------------------------------------------------------//
//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                       Update                                         //
//                                                                                      //
//--------------------------------------------------------------------------------------//
export const updateAttendeeByID = async (
  attendeeId: number,
  data: {
    f_name?: string;
    l_name?: string;
    tshirt_size?: string;
    primary_language?: string;
    interests?: string;
    health_concerns?: string;
  },
) => {
  await db
    .update(attendeeData)
    .set({
      fName: toTitleCase(data.f_name),
      lName: toTitleCase(data.l_name),
      tshirtSize: data.tshirt_size,
      primaryLanguage: data.primary_language,
      interests: data.interests,
      healthConcerns: data.health_concerns ? encrypt(data.health_concerns) : data.health_concerns,
    })
    .where(eq(attendeeData.attendeeId, attendeeId));
  return { success: true, id: attendeeId };
};

export const reassignAttendeeGroup = async (
  attendeeId: number,
  newGroupId: number | null,
) => {
  await db
    .update(attendeeData)
    .set({
      groupId: newGroupId,
    })
    .where(eq(attendeeData.attendeeId, attendeeId));
  return { success: true, id: attendeeId };
};

export const updateAttendeeAttendanceById = async (
  attendeeId: number,
  newStatus: boolean,
) => {
  await db
    .update(attendeeData)
    .set({
      present: newStatus,
    })
    .where(eq(attendeeData.attendeeId, attendeeId));
  return { success: true, id: attendeeId };
};
//                                    End of Update                                     //
//--------------------------------------------------------------------------------------//
//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Delete                                        //
//                                                                                      //
//--------------------------------------------------------------------------------------//
export const deleteAttendeeById = async (attendeeId: number) => {
  await db.delete(attendeeData).where(eq(attendeeData.attendeeId, attendeeId));
  return { success: true, id: attendeeId };
};
//--------------------------------------------------------------------------------------//
//                                    End of Delete                                     //
//--------------------------------------------------------------------------------------//
