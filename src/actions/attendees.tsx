"use server";

import { db } from "@/db";
import { freshmenData, seminarData, groupData } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Read                                          //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export const getFreshmanById = async (freshmenId: number) => {
  const freshman = await db
    .select()
    .from(freshmenData)
    .where(eq(freshmenData.freshmenId, freshmenId))
    .limit(1);
  const row = freshman[0];
  if (!row) return row;
  return {
    ...row,
    healthConcerns: row.healthConcerns ? decrypt(row.healthConcerns) : row.healthConcerns,
  };
};

export const getFreshmen = async () => {
  const freshmen = await db.select().from(freshmenData);
  return freshmen.map((row) => ({
    ...row,
    healthConcerns: row.healthConcerns ? decrypt(row.healthConcerns) : row.healthConcerns,
  }));
};

export const getFreshmenAttendance = async () => {
  const freshmen = await db
    .select({
      fName: freshmenData.fName,
      lName: freshmenData.lName,
      freshmenId: freshmenData.freshmenId,
      present: freshmenData.present,
    })
    .from(freshmenData)
    .orderBy(asc(freshmenData.freshmenId));

  return freshmen;
};

export const getFreshmanByIdFromSchoolData = async (freshmenId: number) => {
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

export const addFreshman = async (data: {
  f_name: string;
  l_name: string;
  freshmen_id: number;
  email: string;
  primary_language?: string;
}) => {
  // Check seminar data for this freshman
  const seminarRecord = await db
    .select()
    .from(seminarData)
    .where(eq(seminarData.freshmenId, data.freshmen_id))
    .limit(1);

  const seminar = seminarRecord[0] ?? null;
  const groupId = seminar?.groupId ?? null;

  await db.insert(freshmenData).values({
    fName: data.f_name,
    lName: data.l_name,
    freshmenId: data.freshmen_id,
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
export const updateFreshmanByID = async (
  freshmenId: number,
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
    .update(freshmenData)
    .set({
      fName: data.f_name,
      lName: data.l_name,
      tshirtSize: data.tshirt_size,
      email: data.email,
      primaryLanguage: data.primary_language,
      interests: data.interests,
      healthConcerns: data.health_concerns ? encrypt(data.health_concerns) : data.health_concerns,
    })
    .where(eq(freshmenData.freshmenId, freshmenId));
  return { success: true, id: freshmenId };
};

export const reassignFreshmenGroup = async (
  freshmenId: number,
  newGroupId: number | null,
) => {
  await db
    .update(freshmenData)
    .set({
      groupId: newGroupId,
    })
    .where(eq(freshmenData.freshmenId, freshmenId));
  return { success: true, id: freshmenId };
};

export const updateFreshmanAttendanceById = async (
  freshmenId: number,
  newStatus: boolean,
) => {
  await db
    .update(freshmenData)
    .set({
      present: newStatus,
    })
    .where(eq(freshmenData.freshmenId, freshmenId));
  return { success: true, id: freshmenId };
};
//                                    End of Update                                     //
//--------------------------------------------------------------------------------------//
//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Delete                                        //
//                                                                                      //
//--------------------------------------------------------------------------------------//
export const deleteFreshmanById = async (freshmenId: number) => {
  await db.delete(freshmenData).where(eq(freshmenData.freshmenId, freshmenId));
  return { success: true, id: freshmenId };
};
//--------------------------------------------------------------------------------------//
//                                    End of Delete                                     //
//--------------------------------------------------------------------------------------//
