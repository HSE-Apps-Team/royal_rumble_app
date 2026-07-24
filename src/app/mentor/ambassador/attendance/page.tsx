import AttendeeAttendancePageUI from "./ui";
import {
  getGroupIdByMentorId,
  getAttendeesAttendanceByGroupId,
} from "../../../../actions/group";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
const DEV_MODE = process.env.DEV_MODE === "true";

export default async function AttendeeAttendancePage() {
  const session = await auth();
  const studentId = !DEV_MODE ? session?.user?.id : "100001";
  const groupId = await getGroupIdByMentorId(Number(studentId));
  const attendanceData = groupId != null
    ? await getAttendeesAttendanceByGroupId(groupId)
    : [];

  return <AttendeeAttendancePageUI attendanceData={attendanceData} />;
}
