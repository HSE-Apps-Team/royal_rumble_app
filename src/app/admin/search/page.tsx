import { getAttendees } from "@/actions/attendees";
import { getMentors } from "@/actions/mentor";
import AdminSearchUI from "./ui";

export default async function AdminSearchPage() {
  const [attendees, mentors] = await Promise.all([getAttendees(), getMentors()]);
  return <AdminSearchUI attendees={attendees} mentors={mentors} />;
}
