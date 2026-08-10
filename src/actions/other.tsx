"use server";

import { db } from "@/db";
import {
  adminData,
  eventsData,
  attendeeData,
  mentorAttendanceData,
  mentorData,
  groupData,
  ambassadorData,
  faqContentData,
} from "@/db/schema";
import { eq, asc, and, sql, inArray } from "drizzle-orm";

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                   Other Functions                                    //
//                                                                                      //
//--------------------------------------------------------------------------------------//

const assignMentorsToEvent = async (
  eventId: number,
  job: string,
): Promise<void> => {
  if (job.trim().toUpperCase() === "ALL") {
    const allMentors = await db.select().from(mentorData);
    for (const mentor of allMentors) {
      await db
        .insert(mentorAttendanceData)
        .values({
          eventId: eventId,
          mentorId: mentor.mentorId,
          status: false,
        })
        .onConflictDoNothing();
    }
  } else {
    const specificMentors = await db
      .select()
      .from(mentorData)
      .where(sql`upper(trim(${mentorData.job})) = ${job.trim().toUpperCase()}`);
    for (const mentor of specificMentors) {
      await db
        .insert(mentorAttendanceData)
        .values({
          eventId: eventId,
          mentorId: mentor.mentorId,
          status: false,
        })
        .onConflictDoNothing();
    }
  }
};

//--------------------------------------------------------------------------------------//
//                                End of Other Functions                                //
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                         Read                                         //
//                                                                                      //
//--------------------------------------------------------------------------------------//
export const getAllEvents = async (job?: string) => {
  interface EventWithMentors {
    eventId: number;
    name: string;
    date: string;
    time: string;
    date2: string | null;
    time2: string | null;
    location: string;
    job: string;
    description: string | null;
    mentors: Array<{
      fName: string;
      lName: string;
      mentor_id: number;
      status: boolean;
    }>;
  }

  const allEventsWithMentors: EventWithMentors[] = [];

  let events = await db.select().from(eventsData).orderBy(asc(eventsData.date));
  if (job) {
    const normalizedJob = job.trim().toUpperCase();
    events = events.filter(
      (event) => (event.job ?? "").trim().toUpperCase() === normalizedJob,
    );
  }
  for (const event of events) {
    const attendance = await db
      .select({
        mentor_id: mentorAttendanceData.mentorId,
        status: mentorAttendanceData.status,
        fName: mentorData.fName,
        lName: mentorData.lName,
      })
      .from(mentorAttendanceData)
      .innerJoin(
        mentorData,
        eq(mentorAttendanceData.mentorId, mentorData.mentorId),
      )
      .where(eq(mentorAttendanceData.eventId, event.eventId));
    allEventsWithMentors.push({
      eventId: event.eventId,
      name: String(event.name),
      date: String(event.date),
      job: String(event.job),
      time: String(event.time),
      date2: event.date2 ? String(event.date2) : null,
      time2: event.time2 ?? null,
      location: String(event.location),
      description: event.description,
      mentors: attendance as Array<{
        fName: string;
        lName: string;
        mentor_id: number;
        status: boolean;
      }>,
    });
  }
  return allEventsWithMentors;
};

export const getEventOptions = async () => {
  const events = await db
    .select({
      eventId: eventsData.eventId,
      name: eventsData.name,
      date: eventsData.date,
      time: eventsData.time,
      date2: eventsData.date2,
      time2: eventsData.time2,
    })
    .from(eventsData)
    .orderBy(asc(eventsData.date));

  return events.map((event) => ({
    eventId: event.eventId,
    name: String(event.name),
    date: String(event.date),
    time: String(event.time),
    date2: event.date2 ? String(event.date2) : null,
    time2: event.time2 ?? null,
  }));
};

export const getEventById = async (eventId: number) => {
  const event = await db
    .select()
    .from(eventsData)
    .where(eq(eventsData.eventId, eventId));
  return event[0];
};

export const getMentorAttendanceAllEvents = async () => {
  interface EventWithMentorsAttendance {
    eventId: number;
    name: string;
    date: string;
    time: string;
    date2: string | null;
    time2: string | null;
    mentors: Array<{
      fName: string;
      lName: string;
      mentor_id: number;
      job: string;
      status: boolean;
    }>;
  }

  const allEventsWithMentorsAttendance: EventWithMentorsAttendance[] = [];

  const events = await db
    .select()
    .from(eventsData)
    .orderBy(asc(eventsData.date));

  for (const event of events) {
    const attendance = await db
      .select({
        mentor_id: mentorAttendanceData.mentorId,
        status: mentorAttendanceData.status,
        fName: mentorData.fName,
        lName: mentorData.lName,
        job: mentorData.job,
      })
      .from(mentorAttendanceData)
      .innerJoin(
        mentorData,
        eq(mentorAttendanceData.mentorId, mentorData.mentorId),
      )
      .where(eq(mentorAttendanceData.eventId, event.eventId));
    allEventsWithMentorsAttendance.push({
      eventId: event.eventId,
      name: String(event.name),
      date: String(event.date),
      time: String(event.time),
      date2: event.date2 ? String(event.date2) : null,
      time2: event.time2 ?? null,
      mentors: attendance as Array<{
        fName: string;
        lName: string;
        mentor_id: number;
        job: string;
        status: boolean;
      }>,
    });
  }
  return allEventsWithMentorsAttendance;
};

export const getUserByEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check mentor
  const mentor = await db
    .select({
      id: mentorData.mentorId,
      job: mentorData.job,
    })
    .from(mentorData)
    .where(sql`lower(${mentorData.email}) = ${normalizedEmail}`);

  if (mentor.length > 0) {
    return {
      id: mentor[0].id,
      job: mentor[0].job, // already stored in DB
    };
  }

  // Check admin
  const admin = await db
    .select({
      id: adminData.adminId,
    })
    .from(adminData)
    .where(sql`lower(${adminData.email}) = ${normalizedEmail}`);

  if (admin.length > 0) {
    return {
      id: admin[0].id,
      job: "ADMIN",
    };
  }
  return null;
};

export const getRoyalRumbleGroupAttendance = async () => {
  // Interfaces inside the function
  interface Attendee {
    attendee_id: string;
    name: string;
    present: boolean;
  }

  interface Mentor {
    mentor_id: string;
    name: string;
    status: boolean | null;
  }

  interface GroupDetail {
    group_id: number;
    name: string;
    route_num: number;
    event_order: string;
    attendees: Attendee[];
    mentors: Mentor[];
  }

  // 1️⃣ Fetch all groups ordered by integer groupId
  const groups = await db
    .select({
      groupId: groupData.groupId,
      name: groupData.name,
      routeNum: groupData.routeNum,
      eventOrder: groupData.eventOrder,
    })
    .from(groupData)
    .orderBy(sql`${groupData.groupId} ASC`);

  // 2️⃣ Fetch all attendees
  const attendees = await db
    .select({
      groupId: attendeeData.groupId,
      attendeeId: attendeeData.attendeeId,
      fName: attendeeData.fName,
      lName: attendeeData.lName,
      present: attendeeData.present,
    })
    .from(attendeeData);

  // 3️⃣ Get the Royal Rumble event ID
  const royalRumbleEvent = await db
    .select({ eventId: eventsData.eventId })
    .from(eventsData)
    .where(eq(eventsData.isRoyalRumble, true))
    .limit(1);

  const royalRumbleEventId = royalRumbleEvent[0]?.eventId;

  // 4️⃣ Fetch mentors and their attendance for the Royal Rumble
  const mentors = await db
    .select({
      groupId: ambassadorData.groupId,
      mentorId: mentorData.mentorId,
      fName: mentorData.fName,
      lName: mentorData.lName,
      status: mentorAttendanceData.status,
    })
    .from(ambassadorData)
    .innerJoin(mentorData, eq(ambassadorData.mentorId, mentorData.mentorId))
    .leftJoin(
      mentorAttendanceData,
      and(
        eq(ambassadorData.mentorId, mentorAttendanceData.mentorId),
        eq(mentorAttendanceData.eventId, royalRumbleEventId),
      ),
    );

  // 5️⃣ Build group map
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

  // 6️⃣ Attach attendees to their groups
  for (const f of attendees) {
    if (f.groupId === null) continue;
    const group = groupMap.get(f.groupId);
    if (group) {
      group.attendees.push({
        attendee_id: f.attendeeId.toString(),
        name: `${f.fName} ${f.lName}`,
        present: f.present ?? false,
      });
    }
  }

  // 7️⃣ Attach mentors to their groups
  for (const m of mentors) {
    if (m.groupId === null) continue;
    const group = groupMap.get(m.groupId);
    if (group) {
      group.mentors.push({
        mentor_id: m.mentorId.toString(),
        name: `${m.fName} ${m.lName}`,
        status: m.status ?? false,
      });
    }
  }

  // 8️⃣ Return the array of groups
  return Array.from(groupMap.values());
};

export const getRoyalRumbleEventId = async (): Promise<number | null> => {
  const royalRumbleEvent = await db
    .select({ eventId: eventsData.eventId })
    .from(eventsData)
    .where(eq(eventsData.isRoyalRumble, true))
    .limit(1);
  return royalRumbleEvent[0]?.eventId ?? null;
};

export const getFAQContent = async () => {
  const faqContent = await db
    .select({
      id: faqContentData.id,
      question: faqContentData.question,
      answer: faqContentData.answer,
    })
    .from(faqContentData)
    .orderBy(asc(faqContentData.id));
  return faqContent;
};

export const getRoyalRumbleTicketLink = async (): Promise<string> => {
  const royalRumbleEvent = await db
    .select({ content: siteContent.content })
    .from(siteContent)
    .where(eq(siteContent.key, "royalRumbleTicketLink"))
    .limit(1);
  return royalRumbleEvent[0]?.content ?? "";
};

//--------------------------------------------------------------------------------------//
//                                     End of Read                                      //
//--------------------------------------------------------------------------------------//
//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                         Add                                          //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export const addEvent = async (data: {
  name: string;
  job: string;
  date: string;
  time: string;
  date2?: string | null;
  time2?: string | null;
  location: string;
  description: string;
  isRoyalRumble?: boolean;
}) => {
  const eventResult = await db
    .insert(eventsData)
    .values({
      name: data.name,
      job: data.job,
      date: data.date,
      time: data.time,
      date2: data.date2 || null,
      time2: data.time2 || null,
      location: data.location,
      description: data.description,
      isRoyalRumble: data.isRoyalRumble ?? false,
    })
    .returning();

  await assignMentorsToEvent(Number(eventResult[0].eventId), data.job);

  return {
    success: true,
    name: data.name,
    job: data.job,
    date: data.date,
    eventId: Number(eventResult[0].eventId),
  };
};

export const addFAQEntry = async (question: string, answer: string) => {
  const result = await db
    .insert(faqContentData)
    .values({ question, answer })
    .returning();
  return {
    success: true,
    id: result[0].id,
    question,
    answer,
  };
};

//--------------------------------------------------------------------------------------//
//                                      End of Add                                      //
//--------------------------------------------------------------------------------------//
//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Update                                        //
//                                                                                      //
//--------------------------------------------------------------------------------------//
export const updateEventByID = async (
  eventId: number,
  data: {
    name: string;
    job: string;
    date: string;
    time: string;
    date2?: string | null;
    time2?: string | null;
    location: string;
    description: string;
  },
  currentJob?: string,
) => {
  await db
    .update(eventsData)
    .set({
      name: data.name,
      job: data.job,
      date: data.date,
      time: data.time,
      date2: data.date2 || null,
      time2: data.time2 || null,
      location: data.location,
      description: data.description,
    })
    .where(eq(eventsData.eventId, eventId));

  if (currentJob !== data.job) {
    await db
      .delete(mentorAttendanceData)
      .where(eq(mentorAttendanceData.eventId, eventId));
    await assignMentorsToEvent(eventId, data.job);
    console.log("Job changed, mentors reassigned");
  }

  return { success: true, eventId: eventId };
};

export const updateMentorAttendanceById = async (
  eventId: number,
  mentorId: number,
  status: boolean,
) => {
  await db
    .update(mentorAttendanceData)
    .set({ status: status })
    .where(
      and(
        eq(mentorAttendanceData.eventId, eventId),
        eq(mentorAttendanceData.mentorId, mentorId),
      ),
    );
  return {
    success: true,
    eventId: eventId,
    mentorId: mentorId,
    status: status,
  };
};

export const confirmMentorAttendanceOverrides = async (
  eventId: number,
  mentorIds: number[],
) => {
  if (mentorIds.length > 0) {
    await db
      .update(mentorAttendanceData)
      .set({ status: true })
      .where(
        and(
          eq(mentorAttendanceData.eventId, eventId),
          inArray(mentorAttendanceData.mentorId, mentorIds),
        ),
      );
  }
  return { success: true, eventId, mentorIds };
};

export const updateFAQEntryById = async (
  id: number,
  question: string,
  answer: string,
) => {
  await db
    .update(faqContentData)
    .set({ question, answer })
    .where(eq(faqContentData.id, id));
  return {
    success: true,
    id,
    question,
    answer,
  };
};

export const updateRoyalRumbleTicketLink = async (link: string) => {
  const existing = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.key, "royalRumbleTicketLink"));

  if (existing.length > 0) {
    await db
      .update(siteContent)
      .set({ content: link })
      .where(eq(siteContent.key, "royalRumbleTicketLink"));
  } else {
    await db
      .insert(siteContent)
      .values({ key: "royalRumbleTicketLink", content: link });
  }
  return {
    success: true,
    link,
  };
};

//--------------------------------------------------------------------------------------//
//                                    End of Update                                     //
//--------------------------------------------------------------------------------------//
//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Delete                                        //
//                                                                                      //
//--------------------------------------------------------------------------------------//
export const deleteEvent = async (eventId: number) => {
  await db.delete(eventsData).where(eq(eventsData.eventId, eventId));

  await db
    .delete(mentorAttendanceData)
    .where(eq(mentorAttendanceData.eventId, eventId));
  return { success: true, eventId: eventId };
};

export const deleteFAQEntry = async (id: number) => {
  await db.delete(faqContentData).where(eq(faqContentData.id, id));
  return { success: true, id };
};

//--------------------------------------------------------------------------------------//
//                                    End of Delete                                     //
//--------------------------------------------------------------------------------------//

{
  /* ====================================
=               editable content                =
==================================== */
}
import { siteContent } from "@/db/schema";

export async function getContent(key: string) {
  const result = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.key, key));

  return result[0]?.content ?? "";
}

export async function saveContent(key: string, content: string) {
  const existing = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.key, key));

  if (existing.length > 0) {
    await db
      .update(siteContent)
      .set({ content })
      .where(eq(siteContent.key, key));
  } else {
    await db.insert(siteContent).values({ key, content });
  }
}

{
  /* ======== End of editable content ======== */
}
