import React from "react";
import AdminEventsUI from "./ui";
import { getAllEvents } from "../../../actions/other";
import { getAllJobs } from "@/actions/job";

async function AdminEvents() {
  const jobs = await getAllJobs();
  const allEvents = await getAllEvents();
  const eventsByJob = Object.fromEntries(
    await Promise.all(
      jobs.map(async (job) => [job.dbJob, await getAllEvents(job.dbJob)]),
    ),
  );
  return (
    <AdminEventsUI
      allEvents={{ events: allEvents }}
      eventsByJob={eventsByJob}
      jobs={jobs.map((job) => ({ dbJob: job.dbJob, label: job.label }))}
    />
  );
}

export default AdminEvents;
