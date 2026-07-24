"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import ViewDropdown from "../../../components/viewDropdown";
import CheckBoxTable from "../../../components/checkBoxTable";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import { updateAttendeeAttendanceById } from "../../../../actions/attendees";
import { updateMentorAttendanceById } from "../../../../actions/other";
import { useToast } from "../../../context/ToastContext";

interface Attendee {
  attendee_id: string;
  name: string;
  present: boolean;
}

interface Mentor {
  mentor_id: string;
  name: string;
  status: boolean | null;
}

interface Group {
  group_id: number;
  name: string;
  route_num: number;
  event_order: string;
  attendees: Attendee[];
  mentors: Mentor[];
}

interface AdminAttendanceAllGroupsUIProps {
  groups: Group[];
  royalRumbleEventId: number;
}

export default function AdminAttendanceAllGroupsUI({
  groups: initialGroups,
  royalRumbleEventId,
}: AdminAttendanceAllGroupsUIProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const handleLogoClick = () => {
    router.push("/admin/attendance");
  };

  const handleAttendeeStatusChange = async (
    groupId: number,
    attendeeId: number,
    newStatus: boolean,
  ) => {
    const attendeeName =
      groups
        .find((g) => g.group_id === groupId)
        ?.attendees.find((f) => f.attendee_id === attendeeId.toString())
        ?.name ?? "Attendee";

    // Optimistic update
    setGroups((prev) =>
      prev.map((g) =>
        g.group_id !== groupId
          ? g
          : {
              ...g,
              attendees: g.attendees.map((f) =>
                f.attendee_id === attendeeId.toString()
                  ? { ...f, present: newStatus }
                  : f,
              ),
            },
      ),
    );

    const result = await updateAttendeeAttendanceById(attendeeId, newStatus);

    if (!result?.success) {
      showToast(
        `Failed to update attendance for ${attendeeName}`,
        "danger",
      );
      // Rollback
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id !== groupId
            ? g
            : {
                ...g,
                attendees: g.attendees.map((f) =>
                  f.attendee_id === attendeeId.toString()
                    ? { ...f, present: !newStatus }
                    : f,
                ),
              },
        ),
      );
    } else {
      showToast(
        `${attendeeName} marked as ${newStatus ? "present" : "absent"}`,
        newStatus ? "success" : "info",
      );
    }
  };

  const handleMentorStatusChange = async (
    groupId: number,
    mentorId: number,
    newStatus: boolean,
  ) => {
    const mentorName =
      groups
        .find((g) => g.group_id === groupId)
        ?.mentors.find((m) => m.mentor_id === mentorId.toString())?.name ??
      "Mentor";

    // Optimistic update
    setGroups((prev) =>
      prev.map((g) =>
        g.group_id !== groupId
          ? g
          : {
              ...g,
              mentors: g.mentors.map((m) =>
                m.mentor_id === mentorId.toString()
                  ? { ...m, status: newStatus }
                  : m,
              ),
            },
      ),
    );

    const result = await updateMentorAttendanceById(
      royalRumbleEventId,
      mentorId,
      newStatus,
    );

    if (!result?.success) {
      showToast(`Failed to update attendance for ${mentorName}`, "danger");
      // Rollback
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id !== groupId
            ? g
            : {
                ...g,
                mentors: g.mentors.map((m) =>
                  m.mentor_id === mentorId.toString()
                    ? { ...m, status: !newStatus }
                    : m,
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

  const filteredGroups =
    selectedGroupId === ""
      ? groups
      : groups.filter((g) => g.group_id.toString() === selectedGroupId);

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Group Attendance</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      {/* Group Dropdown */}
      <div className="search-container" style={{ marginLeft: "15%" }}>
        <div className="search-row">
          <div className="form-row">
            <select
              className="form-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.group_id} value={group.group_id.toString()}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ViewDropdown
        header="Groups"
        sections={filteredGroups.map((group) => ({
          title: `${group.name} (${group.mentors.map((m) => m.name).join(", ") || ""})`,
          sectionId: group.group_id,
          content: (
            <section>
              <label
                className="info-label"
                style={{ marginLeft: "20px", marginBottom: "30px" }}
              >
                Mentor:
              </label>
              <div style={{ width: "100%" }}>
                <CheckBoxTable
                  headers={["Mentor Name", "Student ID"]}
                  data={group.mentors.map((m) => [m.name, m.mentor_id])}
                  status={group.mentors.map((m) => m.status ?? false)}
                  rowIds={group.mentors.map((m) => Number(m.mentor_id))}
                  onStatusChange={(mentorId, newStatus) =>
                    handleMentorStatusChange(
                      group.group_id as number,
                      mentorId,
                      newStatus,
                    )
                  }
                />
              </div>

              <label
                className="info-label"
                style={{ marginLeft: "20px", marginBottom: "30px" }}
              >
                Attendees:
              </label>
              <div style={{ width: "100%" }}>
                <CheckBoxTable
                  headers={["Attendee Name", "Student ID"]}
                  data={group.attendees.map((f) => [f.name, f.attendee_id])}
                  status={group.attendees.map((f) => f.present)}
                  rowIds={group.attendees.map((f) => Number(f.attendee_id))}
                  onStatusChange={(attendeeId, newStatus) =>
                    handleAttendeeStatusChange(
                      group.group_id as number,
                      attendeeId,
                      newStatus,
                    )
                  }
                />
              </div>
            </section>
          ),
        }))}
      />
    </main>
  );
}
