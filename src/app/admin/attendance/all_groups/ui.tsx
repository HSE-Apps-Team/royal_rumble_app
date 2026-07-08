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
import { updateFreshmanAttendanceById } from "../../../../actions/freshmen";
import { updateMentorAttendanceById } from "../../../../actions/other";

interface Freshman {
  freshman_id: string;
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
  freshmen: Freshman[];
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
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const handleLogoClick = () => {
    router.push("/admin/attendance");
  };

  const handleFreshmanStatusChange = async (
    groupId: number,
    freshmanId: number,
    newStatus: boolean,
  ) => {
    // Optimistic update
    setGroups((prev) =>
      prev.map((g) =>
        g.group_id !== groupId
          ? g
          : {
              ...g,
              freshmen: g.freshmen.map((f) =>
                f.freshman_id === freshmanId.toString()
                  ? { ...f, present: newStatus }
                  : f,
              ),
            },
      ),
    );

    const result = await updateFreshmanAttendanceById(freshmanId, newStatus);

    if (!result?.success) {
      alert("Failed to update freshman attendance");
      // Rollback
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id !== groupId
            ? g
            : {
                ...g,
                freshmen: g.freshmen.map((f) =>
                  f.freshman_id === freshmanId.toString()
                    ? { ...f, present: !newStatus }
                    : f,
                ),
              },
        ),
      );
    }
  };

  const handleMentorStatusChange = async (
    groupId: number,
    mentorId: number,
    newStatus: boolean,
  ) => {
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
      alert("Failed to update mentor attendance");
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
                Freshmen:
              </label>
              <div style={{ width: "100%" }}>
                <CheckBoxTable
                  headers={["Freshman Name", "Student ID"]}
                  data={group.freshmen.map((f) => [f.name, f.freshman_id])}
                  status={group.freshmen.map((f) => f.present)}
                  rowIds={group.freshmen.map((f) => Number(f.freshman_id))}
                  onStatusChange={(freshmanId, newStatus) =>
                    handleFreshmanStatusChange(
                      group.group_id as number,
                      freshmanId,
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
