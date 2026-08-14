"use server";

import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  attendeeData,
  seminarData,
  jobData,
} from "@/db/schema";
import * as XLSX from "xlsx";
import { encrypt } from "@/lib/crypto";
import { toTitleCase } from "@/lib/toTitleCase";
import { insertMentorRow, MentorJobMismatch } from "@/lib/mentorUpload";

const requiredColumns: Record<string, string[]> = {
  mentor_data: ["mentor_id", "first_name", "last_name", "job", "email"],
  attendee_data: ["freshmen_id", "first_name", "last_name"],
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
  if (missingCols.length > 0) {
    const foundCols = Object.keys(firstRow).join(", ") || "(no columns detected)";
    return `Missing required column(s): ${missingCols.join(", ")}. Found these columns instead: ${foundCols}. Check that your header row matches the expected column names (see "File Details").`;
  }
  return null;
}

function validateRows(table: string, rows: any[]) {
  const errors: string[] = [];
  const isBlank = (v: any) => v === null || v === undefined || (typeof v === "string" && v.trim() === "");

  rows.forEach((row, i) => {
    const rowNum = i + 2; // +1 for header row, +1 for 1-indexing
    if (table === "mentor_data") {
      if (isBlank(row["mentor_id"])) errors.push(`Row ${rowNum}: Mentor ID is missing.`);
      if (isBlank(row["first_name"])) errors.push(`Row ${rowNum}: First Name is missing.`);
      if (isBlank(row["last_name"])) errors.push(`Row ${rowNum}: Last Name is missing.`);
      if (isBlank(row["email"])) errors.push(`Row ${rowNum}: Email is missing.`);
      if (isBlank(row["job"])) errors.push(`Row ${rowNum}: Job is missing.`);
      if (!isBlank(row["mentor_id"]) && isNaN(Number(row["mentor_id"])))
        errors.push(`Row ${rowNum}: Mentor ID "${row["mentor_id"]}" is not a number.`);
    }
    if (table === "attendee_data") {
      if (isBlank(row["freshmen_id"])) errors.push(`Row ${rowNum}: Student ID is missing.`);
      if (!isBlank(row["freshmen_id"]) && isNaN(Number(row["freshmen_id"])))
        errors.push(`Row ${rowNum}: Student ID "${row["freshmen_id"]}" is not a number.`);
      if (isBlank(row["first_name"])) errors.push(`Row ${rowNum}: First Name is missing.`);
      if (isBlank(row["last_name"])) errors.push(`Row ${rowNum}: Last Name is missing.`);
    }
    if (table === "seminar_data") {
      if (isBlank(row["freshmen_id"])) errors.push(`Row ${rowNum}: Freshmen ID is missing.`);
      if (!isBlank(row["freshmen_id"]) && isNaN(Number(row["freshmen_id"])))
        errors.push(`Row ${rowNum}: Freshmen ID "${row["freshmen_id"]}" is not a number.`);
      if (isBlank(row["first_name"])) errors.push(`Row ${rowNum}: First Name is missing.`);
      if (isBlank(row["last_name"])) errors.push(`Row ${rowNum}: Last Name is missing.`);
      if (isBlank(row["semester"])) errors.push(`Row ${rowNum}: Semester is missing.`);
      if (isBlank(row["teacher_full_name"])) errors.push(`Row ${rowNum}: Teacher Full Name is missing.`);
      if (isBlank(row["period"])) errors.push(`Row ${rowNum}: Period is missing.`);
    }
  });

  if (!errors.length) return null;

  const MAX_SHOWN = 10;
  const shown = errors.slice(0, MAX_SHOWN);
  const remaining = errors.length - shown.length;
  return (
    shown.join(" ") +
    (remaining > 0 ? ` (+${remaining} more error${remaining === 1 ? "" : "s"})` : "")
  );
}

async function insertMentorData(rows: any[]): Promise<MentorJobMismatch[]> {
  const knownJobs = await db.select({ dbJob: jobData.dbJob }).from(jobData);
  const knownJobSet = new Set(knownJobs.map((j) => j.dbJob));

  const mismatchesByJob = new Map<string, MentorJobMismatch>();

  for (const [i, row] of rows.entries()) {
    const job = typeof row["job"] === "string" ? row["job"].trim().toUpperCase() : row["job"];

    if (!knownJobSet.has(job)) {
      const group: MentorJobMismatch =
        mismatchesByJob.get(job) ?? { job, mentors: [] };
      group.mentors.push({
        mentorId: row["mentor_id"],
        fName: toTitleCase(row["first_name"]) ?? null,
        lName: toTitleCase(row["last_name"]) ?? null,
        row,
      });
      mismatchesByJob.set(job, group);
      continue;
    }

    try {
      await insertMentorRow(row, job);
    } catch (err: any) {
      throw new Error(`Row ${i + 2}: ${err?.message ?? "failed to save mentor row."}`);
    }
  }

  return Array.from(mismatchesByJob.values());
}

async function insertData(table: string, rows: any[]): Promise<MentorJobMismatch[] | void> {
  switch (table) {
    case "mentor_data":
      return insertMentorData(rows);

    case "attendee_data":
      for (const [i, row] of rows.entries()) {
        try {
          await db.insert(attendeeData).values({
            attendeeId: row["freshmen_id"],
            fName: toTitleCase(row["first_name"] ?? row["f_name"]),
            lName: toTitleCase(row["last_name"] ?? row["l_name"]),
            tshirtSize: row["shirt_size"] ?? row["shirtsize"],
            primaryLanguage: row["primary_language"] || "English",
            interests: row["interests"],
            healthConcerns: row["health_concerns"] ? encrypt(row["health_concerns"]) : row["health_concerns"],
            present: false,
          }).onConflictDoUpdate({
            target: attendeeData.attendeeId,
            set: {
              fName: toTitleCase(row["first_name"] ?? row["f_name"]),
              lName: toTitleCase(row["last_name"] ?? row["l_name"]),
              tshirtSize: row["shirt_size"] ?? row["shirtsize"],
              primaryLanguage: row["primary_language"] || "English",
              interests: row["interests"],
              healthConcerns: row["health_concerns"] ? encrypt(row["health_concerns"]) : row["health_concerns"],
            },
          });
        } catch (err: any) {
          throw new Error(
            `Row ${i + 2} (Student ID ${row["freshmen_id"] ?? "missing"}): ${err?.message ?? "failed to save row."}`,
          );
        }
      }
      break;

    case "seminar_data":
      for (const [i, row] of rows.entries()) {
        try {
          await db.insert(seminarData).values({
            fName: toTitleCase(row["f_name"] ?? row["first_name"]),
            lName: toTitleCase(row["l_name"] ?? row["last_name"]),
            freshmenId: row["freshmen_id"],
            semester: row["semester"],
            teacherFullName: row["teacher_full_name"],
            period: row["period"],
            groupId: null,
          }).onConflictDoNothing();
        } catch (err: any) {
          throw new Error(
            `Row ${i + 2} (Freshmen ID ${row["freshmen_id"] ?? "missing"}): ${err?.message ?? "failed to save row."}`,
          );
        }
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

    let workbook;
    try {
      const buffer = Buffer.from(fileData, "base64");
      workbook = XLSX.read(buffer, { type: "buffer" });
    } catch (err: any) {
      return NextResponse.json(
        { error: `Could not read the file as an Excel spreadsheet (${err?.message ?? "unknown parsing error"}). Make sure it's a valid .xlsx or .xls file.` },
        { status: 400 },
      );
    }

    if (!workbook.SheetNames.length) {
      return NextResponse.json({ error: "The Excel file has no sheets." }, { status: 400 });
    }

    let rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null });
    rows = normalizeRows(rows);

    if (!rows.length) {
      return NextResponse.json(
        { error: `The "${workbook.SheetNames[0]}" sheet has no data rows (only a header row, or the sheet is empty).` },
        { status: 400 },
      );
    }

    const colError = validateColumns(table, rows);
    if (colError) return NextResponse.json({ error: colError }, { status: 400 });

    const rowError = validateRows(table, rows);
    if (rowError) return NextResponse.json({ error: rowError }, { status: 400 });

    const result = await insertData(table, rows);
    const mismatches = (result ?? []) as MentorJobMismatch[];
    const unmatchedCount = mismatches.reduce((sum, m) => sum + m.mentors.length, 0);
    const insertedCount = rows.length - unmatchedCount;

    return NextResponse.json({
      message:
        unmatchedCount > 0
          ? `✅ Inserted ${insertedCount} row(s) into ${table}. ${unmatchedCount} mentor(s) have an unrecognized job and need to be resolved.`
          : `✅ Successfully inserted ${rows.length} rows into ${table}.`,
      mismatches: table === "mentor_data" ? mismatches : undefined,
    });
  } catch (err: any) {
    console.error("Upload failed:", err);
    const detail = err?.message ? String(err.message) : "An unexpected error occurred.";
    return NextResponse.json(
      { error: `Upload failed: ${detail}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method GET not allowed. Use POST." }, { status: 405 });
}
