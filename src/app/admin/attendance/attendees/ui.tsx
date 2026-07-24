"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import InfoBox from "../../../components/infoBox";
import CheckBoxTable from "../../../components/checkBoxTable";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import { updateAttendeeAttendanceById } from "../../../../actions/attendees";
import ExportToExcelButton from "@/app/components/ExportToExcelButton";
import { useToast } from "../../../context/ToastContext";

interface Attendee {
  fName: string;
  lName: string;
  attendeeId: number;
  present: boolean;
}

interface AdminAttendanceAttendeesUIProps {
  attendeesAttendance: Attendee[];
}

export default function AdminAttendanceAttendeesUI({
  attendeesAttendance,
}: AdminAttendanceAttendeesUIProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [attendanceState, setAttendanceState] =
    useState<Attendee[]>(attendeesAttendance);

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setAttendanceState(attendeesAttendance);
  }, [attendeesAttendance]);

  const handleLogoClick = () => {
    router.push("/admin/attendance");
  };

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

  const filteredAttendees = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return attendanceState;

    return attendanceState.filter((student) => {
      const fullName = `${student.fName} ${student.lName}`.toLowerCase();
      const id = student.attendeeId.toString();

      return fullName.includes(term) || id.includes(term);
    });
  }, [attendanceState, searchText]);

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Attendee Attendance</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <div className="search-container">
        <div className="search-row">
          <input
            type="text"
            placeholder="Search Name/ ID..."
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <InfoBox headerText="All Attendees">
        <section style={{ display: "flex", justifyContent: "right",
                          marginBottom: "10px", width: "92%" }}
        >
          <ExportToExcelButton
            headers={["First Name", "Last Name", "Student ID", "Status"]}
            data={filteredAttendees.map((student) => [
              student.fName,
              student.lName,
              student.attendeeId.toString(),
              student.present ? "Present" : "Absent",
            ])}
            fileName="attendees-attendance"
            style={{ width: "150px" }}
          />
        </section>
        <CheckBoxTable
          headers={["Attendee Name", "Student ID"]}
          data={filteredAttendees.map((student) => [
            `${student.fName} ${student.lName}`,
            student.attendeeId.toString(),
          ])}
          status={filteredAttendees.map((student) => student.present)}
          rowIds={filteredAttendees.map((student) => student.attendeeId)}
          onStatusChange={handleStatusChange}
        />
      </InfoBox>
    </main>
  );
}
