"use server";

import { db } from "@/db";
import { attendeeData, seminarData, groupData } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
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
  email: string;
  primary_language?: string;
}) => {
  // Check seminar data for this attendee
  const seminarRecord = await db
    .select()
    .from(seminarData)
    .where(eq(seminarData.freshmenId, data.freshmen_id))
    .limit(1);

  const seminar = seminarRecord[0] ?? null;
  const groupId = seminar?.groupId ?? null;

  await db.insert(attendeeData).values({
    fName: toTitleCase(data.f_name),
    lName: toTitleCase(data.l_name),
    attendeeId: data.freshmen_id,
    email: data.email,
    primaryLanguage: data.primary_language,
    groupId,
  });

  // If a group was found, fetch the group name
  let groupName: string | null = null;
  if (groupId !== null) {
    const groupRecord = await db
      .select({ name: groupData.name })
      .from(groupData)
      .where(eq(groupData.groupId, groupId))
      .limit(1);
    groupName = groupRecord[0]?.name ?? null;
  }

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
    email?: string;
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
      email: data.email,
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
