"use server";

import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  mentorData,
  ambassadorData,
  hallwayHostData,
  mentorAttendanceData,
  eventsData,
  freshmenData,
  seminarData,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";
import * as XLSX from "xlsx";
import { encrypt } from "@/lib/crypto";
import { fixEmail } from "@/lib/fixEmail";

const requiredColumns: Record<string, string[]> = {
  mentor_data: ["mentor_id", "first_name", "last_name", "job", "email"],
  freshmen_data: ["freshmen_id", "first_name", "last_name", "email"],
  seminar_data: ["freshmen_id", "first_name", "last_name", "semester", "teacher_full_name", "period"],
};

function normalizeRows(rows: any[]) {
  return rows.map((row) => {
    const newRow: Record<string, any> = {};
    for (const key in row) {
      const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, "_");
      newRow[normalizedKey] = row[key];
    }
    return newRow;
  });
}

function validateColumns(table: string, rows: any[]) {
  if (!rows || rows.length === 0) return "The Excel file is empty.";
  const firstRow = rows[0];
  const missingCols = (requiredColumns[table] || []).filter((col) => !(col in firstRow));
  if (missingCols.length > 0) return `Missing required column(s): ${missingCols.join(", ")}`;
  return null;
}

function validateRows(table: string, rows: any[]) {
  const errors: string[] = [];
  rows.forEach((row, i) => {
    if (table === "mentor_data" && !row["mentor_id"]) errors.push(`Row ${i + 2}: Mentor ID is missing`);
    if (table === "mentor_data" && !row["email"]) errors.push(`Row ${i + 2}: Email is missing`);
    if (table === "freshmen_data" && !row["freshmen_id"]) errors.push(`Row ${i + 2}: Freshmen ID is missing`);
    if (table === "seminar_data" && !row["freshmen_id"]) errors.push(`Row ${i + 2}: Freshmen ID is missing`);
  });
  return errors.length ? errors.join("; ") : null;
}

async function insertData(table: string, rows: any[]) {
  switch (table) {
    case "mentor_data":
      for (const row of rows) {
        await db.insert(mentorData).values({
          mentorId: row["mentor_id"],
          fName: row["first_name"],
          lName: row["last_name"],
          gradYear: row["graduation_year"],
          job: row["job"],
          pizzaType: row["pizza"],
          languages: row["languages"],
          trainingDay: row["training_day"],
          tshirtSize: row["shirt_size"],
          phoneNum: row["phone_number"] ? encrypt(row["phone_number"]) : row["phone_number"],
          email: fixEmail(row["email"].trim()) as string,
          pastMentor: row["past_mentor"] ?? null,
          interestsInvolvement: row["interests_involvement"] ?? null,
        }).onConflictDoNothing();

        if (row["job"] === "AMBASSADOR") {
          await db.insert(ambassadorData).values({ mentorId: row["mentor_id"], groupId: null }).onConflictDoNothing();
        } else if (row["job"] === "HALLWAY HOST") {
          await db.insert(hallwayHostData).values({ mentorId: row["mentor_id"], hallwayStopId: null }).onConflictDoNothing();
        }

        const eventIds = await db.select({ eventId: eventsData.eventId })
          .from(eventsData)
          .where(or(eq(eventsData.job, row["job"]), eq(eventsData.job, "ALL")));
        for (const event of eventIds) {
          await db.insert(mentorAttendanceData).values({ mentorId: row["mentor_id"], eventId: event.eventId, status: false });
        }
      }
      break;

    case "freshmen_data":
      for (const row of rows) {
        const email = fixEmail(row["email"]?.trim?.() ?? row["email"]);
        await db.insert(freshmenData).values({
          freshmenId: row["freshmen_id"],
          fName: row["first_name"] ?? row["f_name"],
          lName: row["last_name"] ?? row["l_name"],
          tshirtSize: row["shirt_size"] ?? row["shirtsize"],
          email,
          primaryLanguage: row["primary_language"] || "English",
          interests: row["interests"],
          healthConcerns: row["health_concerns"] ? encrypt(row["health_concerns"]) : row["health_concerns"],
          present: false,
        }).onConflictDoUpdate({
          target: freshmenData.freshmenId,
          set: {
            fName: row["first_name"] ?? row["f_name"],
            lName: row["last_name"] ?? row["l_name"],
            tshirtSize: row["shirt_size"] ?? row["shirtsize"],
            email,
            primaryLanguage: row["primary_language"] || "English",
            interests: row["interests"],
            healthConcerns: row["health_concerns"] ? encrypt(row["health_concerns"]) : row["health_concerns"],
          },
        });
      }
      break;

    case "seminar_data":
      for (const row of rows) {
        await db.insert(seminarData).values({
          fName: row["f_name"] ?? row["first_name"],
          lName: row["l_name"] ?? row["last_name"],
          freshmenId: row["freshmen_id"],
          semester: row["semester"],
          teacherFullName: row["teacher_full_name"],
          period: row["period"],
          groupId: null,
        }).onConflictDoNothing();
      }
      break;

    default:
      throw new Error("Unknown table: " + table);
  }
}

export async function POST(req: Request) {
  try {
    // Client sends { fileData: base64string, table: string } as JSON
    const { fileData, table } = await req.json();

    if (!fileData || !table) {
      return NextResponse.json({ error: "File data or table name missing." }, { status: 400 });
    }

    const buffer = Buffer.from(fileData, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });

    if (!workbook.SheetNames.length) {
      return NextResponse.json({ error: "Excel file has no sheets." }, { status: 400 });
    }

    let rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });
    rows = normalizeRows(rows);

    const colError = validateColumns(table, rows);
    if (colError) return NextResponse.json({ error: colError }, { status: 400 });

    const rowError = validateRows(table, rows);
    if (rowError) return NextResponse.json({ error: rowError }, { status: 400 });

    await insertData(table, rows);

    return NextResponse.json({ message: `✅ Successfully inserted ${rows.length} rows into ${table}.` });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please check your file and try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method GET not allowed. Use POST." }, { status: 405 });
}
