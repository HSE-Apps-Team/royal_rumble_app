import React from "react";
import AdminAttendanceAttendeesUI from "./ui";
import { getAttendeesAttendance } from "../../../../actions/attendees";

export default async function AdminAttendanceAttendeesPage() {
  const data = await getAttendeesAttendance();
  const attendeesAttendance = data.map((item) => ({
    fName: item.fName || "",
    lName: item.lName || "",
    attendeeId: item.attendeeId,
    present: item.present ?? false,
  }));
  return <AdminAttendanceAttendeesUI attendeesAttendance={attendeesAttendance} />;
}
