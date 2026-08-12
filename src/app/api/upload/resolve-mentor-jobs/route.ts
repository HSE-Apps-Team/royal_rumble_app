"use server";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobData } from "@/db/schema";
import { eq } from "drizzle-orm";
import { insertMentorRow } from "@/lib/mentorUpload";
import { addJob } from "@/actions/job";

interface Resolution {
  uploadedJob: string;
  action: "add" | "override";
  newJobLabel?: string;
  overrideDbJob?: string;
  rows: any[];
}

export async function POST(req: Request) {
  try {
    const { resolutions } = (await req.json()) as { resolutions: Resolution[] };

    if (!Array.isArray(resolutions) || resolutions.length === 0) {
      return NextResponse.json({ error: "No resolutions provided." }, { status: 400 });
    }

    let insertedCount = 0;
    const errors: string[] = [];

    for (const resolution of resolutions) {
      let targetDbJob: string;

      if (resolution.action === "add") {
        const label = resolution.newJobLabel?.trim();
        if (!label) {
          errors.push(`${resolution.uploadedJob}: job name is required to add a new job.`);
          continue;
        }
        const result = await addJob(label);
        if (!result.success || !result.job) {
          errors.push(`${resolution.uploadedJob}: ${result.error ?? "failed to add job."}`);
          continue;
        }
        targetDbJob = result.job.dbJob;
      } else {
        const overrideDbJob = resolution.overrideDbJob?.trim().toUpperCase();
        if (!overrideDbJob) {
          errors.push(`${resolution.uploadedJob}: please select a job to override with.`);
          continue;
        }
        const existing = await db
          .select({ dbJob: jobData.dbJob })
          .from(jobData)
          .where(eq(jobData.dbJob, overrideDbJob))
          .limit(1);
        if (existing.length === 0) {
          errors.push(`${resolution.uploadedJob}: selected job no longer exists.`);
          continue;
        }
        targetDbJob = existing[0].dbJob;
      }

      for (const row of resolution.rows) {
        await insertMentorRow(row, targetDbJob);
        insertedCount++;
      }
    }

    return NextResponse.json({
      message:
        errors.length > 0
          ? `Inserted ${insertedCount} mentor(s). ${errors.length} group(s) failed: ${errors.join(" ")}`
          : `Inserted ${insertedCount} mentor(s) successfully.`,
      insertedCount,
      errors,
    });
  } catch (err: any) {
    console.error("Resolve mentor jobs failed:", err);
    return NextResponse.json(
      { error: "Failed to resolve mentor jobs. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method GET not allowed. Use POST." }, { status: 405 });
}
