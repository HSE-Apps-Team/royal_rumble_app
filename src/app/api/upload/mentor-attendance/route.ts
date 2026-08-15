"use server";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { mentorData, mentorAttendanceData } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import * as XLSX from "xlsx";

const ID_HEADER_CANDIDATES = [
  "mentor_id",
  "id",
  "student_id",
  "mentorid",
  "studentid",
  "attendee_id",
  "attendeeid",
];

const JOB_HEADER_CANDIDATES = ["job", "role", "position", "assigned_job", "job_title"];

function normalizeHeader(key: string) {
  return key.toLowerCase().trim().replace(/\s+/g, "_");
}

function findColumn(headers: string[], candidates: string[]) {
  for (const candidate of candidates) {
    if (headers.includes(candidate)) return candidate;
  }
  return null;
}

export interface MentorAttendanceMismatch {
  mentorId: number;
  fName: string | null;
  lName: string | null;
  assignedJob: string | null;
  uploadedJob: string | null;
}

export async function POST(req: Request) {
  try {
    const { fileData, eventId } = await req.json();

    if (!fileData || eventId === undefined || eventId === null) {
      return NextResponse.json(
        { error: "File data or event missing." },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "The Excel file has no sheets." },
        { status: 400 },
      );
    }

    const rawRows = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      { defval: null },
    ) as Record<string, any>[];

    if (!rawRows.length) {
      return NextResponse.json(
        { error: "The Excel file is empty." },
        { status: 400 },
      );
    }

    const rows = rawRows.map((row) => {
      const newRow: Record<string, any> = {};
      for (const key in row) {
        newRow[normalizeHeader(key)] = row[key];
      }
      return newRow;
    });

    const headers = Object.keys(rows[0]);
    const idCol = findColumn(headers, ID_HEADER_CANDIDATES);
    const jobCol = findColumn(headers, JOB_HEADER_CANDIDATES);

    if (!idCol) {
      return NextResponse.json(
        {
          error: `Could not find an ID column in the uploaded file. Expected one of these headers: ${ID_HEADER_CANDIDATES.join(", ")}. Found: ${headers.join(", ") || "(no columns detected)"}.`,
        },
        { status: 400 },
      );
    }

    const scanned = rows
      .map((row) => {
        const idRaw = row[idCol];
        const mentorId = idRaw === null || idRaw === "" ? NaN : Number(idRaw);
        const uploadedJob = jobCol
          ? typeof row[jobCol] === "string"
            ? row[jobCol].trim().toUpperCase()
            : row[jobCol]
          : null;
        return { mentorId, uploadedJob };
      })
      .filter((row) => !Number.isNaN(row.mentorId));

    if (!scanned.length) {
      return NextResponse.json(
        {
          error: `No valid mentor IDs found in the "${idCol}" column. Values must be numeric — check that the column isn't blank or contains non-numeric text.`,
        },
        { status: 400 },
      );
    }

    const mentorIds = scanned.map((row) => row.mentorId);
    const mentors = await db
      .select({
        mentorId: mentorData.mentorId,
        fName: mentorData.fName,
        lName: mentorData.lName,
        job: mentorData.job,
      })
      .from(mentorData)
      .where(inArray(mentorData.mentorId, mentorIds));

    const mentorById = new Map(mentors.map((m) => [m.mentorId, m]));

    const matchedIds: number[] = [];
    const mismatches: MentorAttendanceMismatch[] = [];
    const notFound: number[] = [];

    for (const { mentorId, uploadedJob } of scanned) {
      const mentor = mentorById.get(mentorId);
      if (!mentor) {
        notFound.push(mentorId);
        continue;
      }
      if (!jobCol || (mentor.job ?? null) === (uploadedJob ?? null)) {
        matchedIds.push(mentorId);
      } else {
        mismatches.push({
          mentorId,
          fName: mentor.fName,
          lName: mentor.lName,
          assignedJob: mentor.job,
          uploadedJob: uploadedJob ?? null,
        });
      }
    }

    if (matchedIds.length) {
      await db
        .update(mentorAttendanceData)
        .set({ status: true })
        .where(
          and(
            eq(mentorAttendanceData.eventId, Number(eventId)),
            inArray(mentorAttendanceData.mentorId, matchedIds),
          ),
        );
    }

    const notFoundSuffix =
      notFound.length > 0
        ? ` Not found in mentor list: ${notFound.slice(0, 15).join(", ")}${notFound.length > 15 ? `, +${notFound.length - 15} more` : ""}.`
        : "";

    return NextResponse.json({
      message: `Processed ${scanned.length} scan(s): ${matchedIds.length} marked present, ${mismatches.length} mismatched, ${notFound.length} not found.${notFoundSuffix}`,
      matchedCount: matchedIds.length,
      mismatches,
      notFound,
    });
  } catch (err: any) {
    console.error("Mentor attendance upload failed:", err);
    const detail = err?.message ? String(err.message) : "An unexpected error occurred.";
    return NextResponse.json(
      { error: `Upload failed: ${detail}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method GET not allowed. Use POST." },
    { status: 405 },
  );
}
