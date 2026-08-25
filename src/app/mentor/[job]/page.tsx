import { notFound } from "next/navigation";
import NonUtilityJobUI from "./ui";
import { getMentorById, getEventsForJob } from "../../../actions/mentor";
import { getJobBySlug } from "@/actions/job";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
const DEV_MODE = process.env.DEV_MODE === "true";
const DEV_STUDENT_ID = "100002";

export default async function NonUtilityJobHomepage({
  params,
}: {
  params: Promise<{ job: string }>;
}) {
  const { job } = await params;
  const jobConfig = await getJobBySlug(job);
  if (!jobConfig || !jobConfig.isNonUtility) notFound();

  const session = await auth();
  const studentId = !DEV_MODE ? session?.user?.id : DEV_STUDENT_ID;

  const mentorsData = await getMentorById(Number(studentId));
  const events = await getEventsForJob(jobConfig.dbJob, Number(studentId));

  return (
    <NonUtilityJobUI
      homeHref="/"
      dashboardHref={`/mentor/${jobConfig.slug}`}
      contentKey={jobConfig.contentKey}
      mentorsData={mentorsData}
      events={events}
    />
  );
}
