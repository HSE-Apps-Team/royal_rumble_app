// src/app/admin/add/attendee_group/page.tsx

import AdminAddAttendeeGroupPage from "./ui";
import { getEventOrderPatterns } from "@/actions/routes";

export default async function AdminAddCustomGroup() {
  const rawPatterns = await getEventOrderPatterns();
  // Convert to string[][] — same shape the existing UI already expects
  const orders = rawPatterns.map((p) => p.blockOrder);
  return <AdminAddAttendeeGroupPage orders={orders} />;
}
