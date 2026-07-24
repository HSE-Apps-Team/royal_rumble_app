"use server";

import { db } from "@/db";
import {
  attendeeData,
  seminarData,
  mentorData,
  ambassadorData,
  hallwayHostData,
  mentorAttendanceData,
  eventsData,
  groupData,
  groupRouteAttendance,
  tourRoute,
  tourRouteStop,
  hallwayStopData,
  eventOrderPattern,
  blockSchedule,
} from "@/db/schema";

// ── Attendees ─────────────────────────────────────────────────────────────────

export async function resetAttendeeData() {
  await db.delete(seminarData);
  await db.delete(attendeeData);
  return { success: true };
}

// ── Mentors ───────────────────────────────────────────────────────────────────

export async function resetMentorData() {
  await db.delete(mentorAttendanceData);
  await db.delete(hallwayHostData);
  await db.delete(ambassadorData);
  await db.delete(mentorData);
  return { success: true };
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function resetEventData() {
  await db.delete(mentorAttendanceData);
  await db.delete(eventsData);
  return { success: true };
}

// ── Groups ────────────────────────────────────────────────────────────────────

export async function resetGroupData() {
  await db.delete(groupRouteAttendance);
  await db.delete(seminarData);
  // Null out foreign keys before deleting attendee rows tied to groups
  await db.delete(attendeeData);
  await db.delete(ambassadorData);
  await db.delete(groupData);
  return { success: true };
}

// ── Routes ────────────────────────────────────────────────────────────────────

export async function resetRouteData() {
  await db.delete(groupRouteAttendance);
  await db.delete(tourRouteStop);
  await db.delete(tourRoute);
  await db.delete(hallwayHostData);
  await db.delete(hallwayStopData);
  await db.delete(eventOrderPattern);
  await db.delete(blockSchedule);
  return { success: true };
}

// ── Individual tables ─────────────────────────────────────────────────────────

export async function resetSeminarData() {
  await db.delete(seminarData);
  return { success: true };
}

export async function resetAmbassadorData() {
  await db.delete(ambassadorData);
  return { success: true };
}

export async function resetHallwayHostData() {
  await db.delete(hallwayHostData);
  return { success: true };
}

export async function resetMentorAttendanceData() {
  await db.delete(mentorAttendanceData);
  return { success: true };
}

export async function resetGroupRouteAttendanceData() {
  await db.delete(groupRouteAttendance);
  return { success: true };
}

export async function resetTourRouteData() {
  await db.delete(tourRouteStop);
  await db.delete(tourRoute);
  return { success: true };
}

export async function resetHallwayStopData() {
  await db.delete(groupRouteAttendance);
  await db.delete(tourRouteStop);
  await db.delete(hallwayHostData);
  await db.delete(hallwayStopData);
  return { success: true };
}

export async function resetEventOrderPatternData() {
  await db.delete(eventOrderPattern);
  return { success: true };
}

export async function resetBlockScheduleData() {
  await db.delete(blockSchedule);
  return { success: true };
}

// ── Reset Everything ──────────────────────────────────────────────────────────

export async function resetAllData() {
  // Delete in dependency order: junction/attendance tables first, then leaves, then roots
  await db.delete(mentorAttendanceData);
  await db.delete(groupRouteAttendance);
  await db.delete(tourRouteStop);
  await db.delete(tourRoute);
  await db.delete(hallwayHostData);
  await db.delete(hallwayStopData);
  await db.delete(ambassadorData);
  await db.delete(seminarData);
  await db.delete(attendeeData);
  await db.delete(mentorData);
  await db.delete(eventsData);
  await db.delete(groupData);
  await db.delete(eventOrderPattern);
  await db.delete(blockSchedule);
  return { success: true };
}
