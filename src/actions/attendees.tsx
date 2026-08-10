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
