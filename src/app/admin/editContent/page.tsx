import AdminEditContentPageUI from "./ui";
import { getFAQContent, getRoyalRumbleTicketLink } from "@/src/actions/other";
import { getAllJobs } from "@/actions/job";

export default async function AdminEditContentPage() {
  const faqData = await getFAQContent();
  const royalRumbleTicketLink = await getRoyalRumbleTicketLink();
  const jobs = await getAllJobs();
  return (
    <AdminEditContentPageUI
      faqData={faqData}
      royalRumbleTicketLinkCurrent={royalRumbleTicketLink}
      jobs={jobs.map((job) => ({ slug: job.slug, label: job.label, contentKey: job.contentKey }))}
    />
  );
}
