import React from "react";
import AdminAttendanceFreshmenUI from "./ui";
import { getFreshmenAttendance } from "../../../../actions/freshmen";

export default async function AdminAttendanceFreshmenPage() {
  const data = await getFreshmenAttendance();
  const freshmenAttendance = data.map((item) => ({
    fName: item.fName || "",
    lName: item.lName || "",
    freshmenId: item.freshmenId,
    present: item.present ?? false,
  }));
  return <AdminAttendanceFreshmenUI freshmenAttendance={freshmenAttendance} />;
}
