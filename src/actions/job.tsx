"use server";

import { db } from "@/db";
import { jobData, mentorData, eventsData, siteContent } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                         Read                                         //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export const getAllJobs = async () => {
  return db.select().from(jobData).orderBy(jobData.jobId);
};

export const getNonUtilityJobs = async () => {
  return db
    .select()
    .from(jobData)
    .where(eq(jobData.isNonUtility, true))
    .orderBy(jobData.jobId);
};

export const getJobBySlug = async (slug: string) => {
  const rows = await db.select().from(jobData).where(eq(jobData.slug, slug)).limit(1);
  return rows[0];
};

// Maps DB job name (e.g. "HALLWAY HOST") -> route, for job-based redirects.
export const getJobRoutes = async (): Promise<Record<string, string>> => {
  const jobs = await getAllJobs();
  return Object.fromEntries(jobs.map((job) => [job.dbJob, `/mentor/${job.slug}`]));
};

//--------------------------------------------------------------------------------------//
//                                     End of Read                                      //
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                         Add                                          //
//                                                                                      //
//--------------------------------------------------------------------------------------//

const slugify = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const addJob = async (label: string) => {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) {
    return { success: false, error: "Job name is required." };
  }

  const slug = slugify(trimmedLabel);
  if (!slug) {
    return { success: false, error: "Job name must contain letters or numbers." };
  }

  const dbJob = trimmedLabel.toUpperCase();
  const contentKey = `${slug}_more_details`;

  const existing = await db
    .select({ jobId: jobData.jobId })
    .from(jobData)
    .where(sql`upper(trim(${jobData.dbJob})) = ${dbJob}`)
    .limit(1);
  if (existing.length > 0) {
    return { success: false, error: "A job with that name already exists." };
  }

  const slugTaken = await db
    .select({ jobId: jobData.jobId })
    .from(jobData)
    .where(eq(jobData.slug, slug))
    .limit(1);
  if (slugTaken.length > 0) {
    return { success: false, error: "A job with a conflicting URL slug already exists." };
  }

  const result = await db
    .insert(jobData)
    .values({
      slug,
      dbJob,
      label: trimmedLabel,
      contentKey,
      isProtected: false,
      isNonUtility: true,
    })
    .returning();

  return { success: true, job: result[0] };
};

//--------------------------------------------------------------------------------------//
//                                      End of Add                                      //
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                                                                      //
//                                        Update                                        //
//                                                                                      //
//--------------------------------------------------------------------------------------//

export const renameJob = async (jobId: number, newLabel: string) => {
  const trimmedLabel = newLabel.trim();
  if (!trimmedLabel) {
    return { success: false, error: "Job name is required." };
  }

  const current = await db
    .select()
    .from(jobData)
    .where(eq(jobData.jobId, jobId))
    .limit(1);
  const job = current[0];
  if (!job) {
    return { success: false, error: "Job not found." };
  }

  const newDbJob = trimmedLabel.toUpperCase();
  if (newDbJob !== job.dbJob) {
    const conflict = await db
      .select({ jobId: jobData.jobId })
      .from(jobData)
      .where(sql`upper(trim(${jobData.dbJob})) = ${newDbJob}`)
      .limit(1);
    if (conflict.length > 0 && conflict[0].jobId !== jobId) {
      return { success: false, error: "A job with that name already exists." };
    }
  }

  // Protected jobs (Ambassador, Hallway Host) have dedicated static routes
  // and can't have their slug moved out from under those pages, so only
  // their label/dbJob change. Other jobs use the dynamic /mentor/[job]
  // route, so the slug (and its content key) can safely follow the rename.
  let newSlug = job.slug;
  let newContentKey = job.contentKey;
  if (!job.isProtected) {
    const slug = slugify(trimmedLabel);
    if (!slug) {
      return { success: false, error: "Job name must contain letters or numbers." };
    }
    if (slug !== job.slug) {
      const slugConflict = await db
        .select({ jobId: jobData.jobId })
        .from(jobData)
        .where(eq(jobData.slug, slug))
        .limit(1);
      if (slugConflict.length > 0 && slugConflict[0].jobId !== jobId) {
        return { success: false, error: "A job with a conflicting URL slug already exists." };
      }
      newSlug = slug;
      newContentKey = `${slug}_more_details`;
    }
  }

  await db
    .update(jobData)
    .set({ label: trimmedLabel, dbJob: newDbJob, slug: newSlug, contentKey: newContentKey })
    .where(eq(jobData.jobId, jobId));

  if (newContentKey !== job.contentKey) {
    await db
      .update(siteContent)
      .set({ key: newContentKey })
      .where(eq(siteContent.key, job.contentKey));
  }

  if (newDbJob !== job.dbJob) {
    await db
      .update(mentorData)
      .set({ job: newDbJob })
      .where(sql`upper(trim(${mentorData.job})) = ${job.dbJob}`);
    await db
      .update(eventsData)
      .set({ job: newDbJob })
      .where(sql`upper(trim(${eventsData.job})) = ${job.dbJob}`);
  }

  return {
    success: true,
    jobId,
    label: trimmedLabel,
    dbJob: newDbJob,
    slug: newSlug,
    slugChanged: newSlug !== job.slug,
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

export const deleteJob = async (jobId: number) => {
  const current = await db
    .select()
    .from(jobData)
    .where(eq(jobData.jobId, jobId))
    .limit(1);
  const job = current[0];
  if (!job) {
    return { success: false, error: "Job not found." };
  }

  if (job.isProtected) {
    return { success: false, error: `${job.label} cannot be deleted.` };
  }

  const assignedMentors = await db
    .select({ mentorId: mentorData.mentorId })
    .from(mentorData)
    .where(sql`upper(trim(${mentorData.job})) = ${job.dbJob}`);
  if (assignedMentors.length > 0) {
    return {
      success: false,
      error: `Cannot delete ${job.label}: ${assignedMentors.length} mentor(s) are still assigned to this job. Reassign them first.`,
    };
  }

  const assignedEvents = await db
    .select({ eventId: eventsData.eventId })
    .from(eventsData)
    .where(sql`upper(trim(${eventsData.job})) = ${job.dbJob}`);
  if (assignedEvents.length > 0) {
    return {
      success: false,
      error: `Cannot delete ${job.label}: ${assignedEvents.length} event(s) are still assigned to this job. Reassign them first.`,
    };
  }

  await db.delete(jobData).where(eq(jobData.jobId, jobId));
  await db.delete(siteContent).where(eq(siteContent.key, job.contentKey));

  return { success: true, jobId };
};

//--------------------------------------------------------------------------------------//
//                                    End of Delete                                     //
//--------------------------------------------------------------------------------------//
