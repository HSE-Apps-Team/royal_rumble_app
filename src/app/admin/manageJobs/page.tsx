import ManageJobsUI from "./ui";
import { getAllJobs } from "@/actions/job";

export const dynamic = "force-dynamic";

export default async function ManageJobsPage() {
  const jobs = await getAllJobs();
  return <ManageJobsUI jobsData={jobs} />;
}
