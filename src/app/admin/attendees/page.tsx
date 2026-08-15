// /admin/attendees/page.tsx (server component)
import { getAttendees } from "@/actions/attendees";
import { getGroupIds } from "@/actions/group";
import AdminAttendees from "./ui";

export default async function AttendeesPage() {
  const attendees = await getAttendees(); // fetch from DB
  const groups = await getGroupIds();

  const groupNameByGroupId = new Map<number, string>();
  for (const g of groups) {
    if (g.groupId != null && g.name) {
      groupNameByGroupId.set(g.groupId, g.name);
    }
  }

  const sanitizedAttendees = attendees.map((f) => ({
    attendeeId: f.attendeeId,
    fName: f.fName ?? "",
    lName: f.lName ?? "",
    tshirtSize: f.tshirtSize ?? "",
    primaryLanguage: f.primaryLanguage ?? "",
    interests: f.interests ?? "",
    healthConcerns: f.healthConcerns ?? "",
    present: f.present ?? false,
    assignedGroup:
      f.groupId != null ? (groupNameByGroupId.get(f.groupId) ?? "") : "",
  }));
  return <AdminAttendees attendeeData={sanitizedAttendees} />;
}
