"use client";

import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import InfoBox from "../../../components/infoBox";
import CheckBoxTable from "../../../components/checkBoxTable";
import BackButton from "../../../components/backButton";
import NavButton from "../../../components/addButton";
import MobileNav from "../../../components/MobileNav";
import { updateAttendeeAttendanceById } from "../../../../actions/attendees";
import "../../../css/mentor.css";
import "../../../css/logo+login.css";
import "../../../css/mobile-nav.css";
import { useState } from "react";
import { useToast } from "../../../context/ToastContext";

interface Attendee {
  fName: string;
  lName: string;
  attendeeId: number;
  present: boolean;
}

export default function AttendeeAttendancePageUI({
  attendanceData,
}: {
  attendanceData: Array<{
    attendeeId: number;
    fName: string | null;
    lName: string | null;
    present: boolean | null;
  }>;
}) {
  const { showToast } = useToast();
  const [attendanceState, setAttendanceState] = useState<Attendee[]>(
    attendanceData.map((student) => ({
      fName: student.fName || "",
      lName: student.lName || "",
      attendeeId: student.attendeeId,
      present: student.present ?? false,
    })),
  );
  const handleStatusChange = async (attendeeId: number, newStatus: boolean) => {
    const student = attendanceState.find((s) => s.attendeeId === attendeeId);
    const studentName = student
      ? `${student.fName} ${student.lName}`
      : "Attendee";

    // optimistic UI update
    setAttendanceState((prev) =>
      prev.map((student) =>
        student.attendeeId === attendeeId
          ? { ...student, present: newStatus }
          : student,
      ),
    );

    const result = await updateAttendeeAttendanceById(attendeeId, newStatus);

    if (!result?.success) {
      showToast(`Failed to update attendance for ${studentName}`, "danger");

      // rollback on failure
      setAttendanceState((prev) =>
        prev.map((student) =>
          student.attendeeId === attendeeId
            ? { ...student, present: !newStatus }
            : student,
        ),
      );
    } else {
      showToast(
        `${studentName} marked as ${newStatus ? "present" : "absent"}`,
        newStatus ? "success" : "info",
      );
    }
  };
  return (
    <main className="mentor-container">
      <LogoButton />
            <div className="nav-buttons">
        <NavButton href="/"
        style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Home
        </NavButton>
        <NavButton href="/mentor/ambassador"
        style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Dashboard
        </NavButton>
      </div>
      <LoginButton />
      <MobileNav homeHref="/" dashboardHref="/mentor/ambassador" />

      <header className="mentor-header">
        <h1 className="mentor-title">Attendee Attendance</h1>
      </header>

      <BackButton href="/mentor/ambassador" />

      <section className="mentor-info-box">
        <InfoBox headerText="Present?">
          <CheckBoxTable
            headers={["Student Name"]}
            data={attendanceState.map((student) => [
              `${student.fName} ${student.lName}`,
            ])}
            status={attendanceState.map((student) => student.present)}
            rowIds={attendanceState.map((student) => student.attendeeId)}
            onStatusChange={handleStatusChange}
          />
        </InfoBox>
      </section>
    </main>
  );
}
