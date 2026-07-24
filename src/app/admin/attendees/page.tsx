// /admin/attendees/page.tsx (server component)
import { getAttendees } from "@/actions/attendees";
import AdminAttendees from "./ui";

export default async function AttendeesPage() {
  const attendees = await getAttendees(); // fetch from DB
  const sanitizedAttendees = attendees.map((f) => ({
    attendeeId: f.attendeeId,
    fName: f.fName ?? "",
    lName: f.lName ?? "",
    email: f.email ?? "",
    tshirtSize: f.tshirtSize ?? "",
    primaryLanguage: f.primaryLanguage ?? "",
    interests: f.interests ?? "",
    healthConcerns: f.healthConcerns ?? "",
    present: f.present ?? false,
  }));
  return <AdminAttendees attendeeData={sanitizedAttendees} />;
}
