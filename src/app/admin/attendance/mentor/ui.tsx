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
import { updateMentorAttendanceById } from "../../../../actions/other";
import ExportToExcelButton from "@/src/app/components/ExportToExcelButton";
import { useToast } from "../../../context/ToastContext";
import { formatEventDates } from "@/lib/formatEventDates";

interface Mentor {
  fName: string;
  lName: string;
  mentor_id: number;
  job: string;
  status: boolean;
}

interface EventWithMentorsAttendance {
  eventId: number;
  name: string;
  date: string;
  time: string;
  date2: string | null;
  time2: string | null;
  mentors: Mentor[];
}

interface AdminAttendanceMentorUIProps {
  mentorAttendance: EventWithMentorsAttendance[];
}

export default function AdminAttendanceMentorUI({
  mentorAttendance,
}: AdminAttendanceMentorUIProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [attendanceState, setAttendanceState] =
    useState<EventWithMentorsAttendance[]>(mentorAttendance);

  const [selectedEvent, setSelectedEvent] = useState<number>(-1);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setAttendanceState(mentorAttendance);
    if (mentorAttendance.length > 0) {
      setSelectedEvent(mentorAttendance[0].eventId);
    }
  }, [mentorAttendance]);

  const handleLogoClick = () => {
    router.push("/admin/attendance");
  };

  const handleStatusChange = async (mentorId: number, newStatus: boolean) => {
    const mentor = selectedEventData?.mentors.find(
      (m) => m.mentor_id === mentorId,
    );
    const mentorName = mentor ? `${mentor.fName} ${mentor.lName}` : "Mentor";

    setAttendanceState((prev) =>
      prev.map((event) =>
        event.eventId !== selectedEvent
          ? event
          : {
              ...event,
              mentors: event.mentors.map((mentor) =>
                mentor.mentor_id === mentorId
                  ? { ...mentor, status: newStatus }
                  : mentor,
              ),
            },
      ),
    );

    const result = await updateMentorAttendanceById(
      selectedEvent,
      mentorId,
      newStatus,
    );

    if (!result.success) {
      showToast(`Failed to update attendance for ${mentorName}`, "danger");

      setAttendanceState((prev) =>
        prev.map((event) =>
          event.eventId !== selectedEvent
            ? event
            : {
                ...event,
                mentors: event.mentors.map((mentor) =>
                  mentor.mentor_id === mentorId
                    ? { ...mentor, status: !newStatus }
                    : mentor,
                ),
              },
        ),
      );
    } else {
      showToast(
        `${mentorName} marked as ${newStatus ? "present" : "absent"}`,
        newStatus ? "success" : "info",
      );
    }
  };

  const selectedEventData = attendanceState.find(
    (event) => event.eventId === selectedEvent,
  );

  const filteredMentors = useMemo(() => {
    if (!selectedEventData) return [];

    const term = searchText.trim().toLowerCase();
    if (!term) return selectedEventData.mentors;

    return selectedEventData.mentors.filter((mentor) => {
      const fullName = `${mentor.fName} ${mentor.lName}`.toLowerCase();
      const mentorId = mentor.mentor_id.toString();

      return fullName.includes(term) || mentorId.includes(term);
    });
  }, [selectedEventData, searchText]);

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Mentor Attendance</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <div className="search-container"
           style={{ width: "100%", display: "flex", alignItems: "center", gap: "100px" }}
      >
        <div className="search-row">
          <input
            type="text"
            placeholder="Search Name/ ID..."
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="search-dropdown">
          <select
            className="form-select"
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(Number(e.target.value));
              setSearchText("");
            }}
          >
            {attendanceState.map((event) => (
              <option key={event.eventId} value={event.eventId}>
                {event.name} ({formatEventDates(event)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <InfoBox headerText="Mentors">
        <section style={{ display: "flex", justifyContent: "right", marginBottom: "10px", width: "92%" }}>
          <ExportToExcelButton
            headers={["First Name", "Last Name", "Student ID", "Job", "Status"]}
            data={filteredMentors.map((mentor) => [
              mentor.fName,
              mentor.lName,
              mentor.mentor_id.toString(),
              mentor.job,
              mentor.status ? "Present" : "Absent",
            ])}
            fileName="mentor-attendance"
            style={{ width: "150px" }}
          />
        </section>
        <CheckBoxTable
          headers={["Mentor Name", "Student ID", "Job"]}
          data={filteredMentors.map((mentor) => [
            `${mentor.fName} ${mentor.lName}`,
            mentor.mentor_id.toString(),
            mentor.job,
          ])}
          status={filteredMentors.map((mentor) => mentor.status)}
          rowIds={filteredMentors.map((mentor) => mentor.mentor_id)}
          onStatusChange={handleStatusChange}
        />
      </InfoBox>
    </main>
  );
}
