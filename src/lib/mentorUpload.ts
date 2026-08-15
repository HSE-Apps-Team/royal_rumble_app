import { db } from "@/db";
import {
  mentorData,
  ambassadorData,
  hallwayHostData,
  mentorAttendanceData,
  eventsData,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { encrypt } from "@/lib/crypto";
import { fixEmail } from "@/lib/fixEmail";
import { toTitleCase } from "@/lib/toTitleCase";

export interface MentorJobMismatch {
  job: string;
  mentors: Array<{
    mentorId: number;
    fName: string | null;
    lName: string | null;
    row: any;
  }>;
}

export async function insertMentorRow(row: any, job: string) {
  const rawEmail = typeof row["email"] === "string" ? row["email"].trim() : row["email"];
  if (!rawEmail) {
    throw new Error(
      `Mentor ID ${row["mentor_id"] ?? "(missing)"}: Email is blank or missing.`,
    );
  }

  try {
    await db.insert(mentorData).values({
      mentorId: row["mentor_id"],
      fName: toTitleCase(row["first_name"]),
      lName: toTitleCase(row["last_name"]),
      gradYear: row["graduation_year"],
      job,
      pizzaType: row["pizza"],
      languages: row["languages"],
      trainingDay: row["training_day"],
      tshirtSize: row["shirt_size"],
      phoneNum: row["phone_number"] ? encrypt(row["phone_number"]) : row["phone_number"],
      email: fixEmail(rawEmail) as string,
      pastMentor: row["past_mentor"] ?? null,
      interestsInvolvement: row["interests_involvement"] ?? null,
    }).onConflictDoNothing();
  } catch (err: any) {
    throw new Error(
      `Mentor ID ${row["mentor_id"] ?? "(missing)"}: ${err?.message ?? "failed to save mentor row."}`,
    );
  }

  if (job === "AMBASSADOR") {
    await db.insert(ambassadorData).values({ mentorId: row["mentor_id"], groupId: null }).onConflictDoNothing();
  } else if (job === "HALLWAY HOST") {
    await db.insert(hallwayHostData).values({ mentorId: row["mentor_id"], hallwayStopId: null }).onConflictDoNothing();
  }

  const eventIds = await db.select({ eventId: eventsData.eventId })
    .from(eventsData)
    .where(or(eq(eventsData.job, job), eq(eventsData.job, "ALL")));
  for (const event of eventIds) {
    await db.insert(mentorAttendanceData).values({ mentorId: row["mentor_id"], eventId: event.eventId, status: false }).onConflictDoNothing();
  }
}
