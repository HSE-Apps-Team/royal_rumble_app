"use client";

import LogoButton from "../../../../components/logoButton";
import LoginButton from "../../../../components/loginButton";
import InfoBox from "../../../../components/infoBox";
import CheckBoxTable from "../../../../components/checkBoxTable";
import BackButton from "../../../../components/backButton";
import MobileNav from "../../../../components/MobileNav";
import "../../../../css/mentor.css";
import "../../../../css/logo+login.css";
import "../../../../css/mobile-nav.css";
import { useState } from "react";
import { useToast } from "../../../../context/ToastContext";

interface Attendee {
  fName: string;
  lName: string;
  attendeeId: number;
  present: boolean;
}

const attendanceData: Attendee[] = [
  { attendeeId: 100005, fName: "Zuko", lName: "Smith", present: false },
  { attendeeId: 302426, fName: "Iroh", lName: "Johnson", present: false },
  { attendeeId: 123456, fName: "Azula", lName: "Brown", present: false },
  { attendeeId: 500123, fName: "Mai", lName: "Davis", present: false },
  { attendeeId: 654321, fName: "Sokka", lName: "Beifong", present: false },
  { attendeeId: 302409, fName: "Bumi", lName: "Anderson", present: false },
];

export default function AttendeeAttendancePreview() {
  const { showToast } = useToast();
  const [attendanceState, setAttendanceState] =
    useState<Attendee[]>(attendanceData);

  const handleStatusChange = (attendeeId: number, newStatus: boolean) => {
    const student = attendanceState.find((s) => s.attendeeId === attendeeId);
    const studentName = student
      ? `${student.fName} ${student.lName}`
      : "Attendee";

    setAttendanceState((prev) =>
      prev.map((student) =>
        student.attendeeId === attendeeId
          ? { ...student, present: newStatus }
          : student,
      ),
    );

    showToast(
      `${studentName} marked as ${newStatus ? "present" : "absent"}`,
      newStatus ? "success" : "info",
    );
  };

  return (
    <main className="mentor-container">
      <LogoButton />
      <LoginButton />
      <MobileNav homeHref="/admin" dashboardHref="/admin/mentor_preview" />

      <header className="mentor-header">
        <h1 className="mentor-title">Attendee Attendance</h1>
      </header>

      <BackButton href="/admin/mentor_preview/ambassador" />

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
