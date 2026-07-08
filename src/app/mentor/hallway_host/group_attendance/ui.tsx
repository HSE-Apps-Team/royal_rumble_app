"use client";

// src/app/mentor/hallway_host/group_attendance/ui.tsx

import { useState } from "react";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import InfoBox from "../../../components/infoBox";
import CheckBoxTable from "../../../components/checkBoxTable";
import BackButton from "../../../components/backButton";
import NavButton from "../../../components/addButton";
import MobileNav from "../../../components/MobileNav";
import "../../../css/mentor.css";
import "../../../css/logo+login.css";
import "../../../css/mobile-nav.css";
import { markGroupPresent } from "@/actions/routes";
import { useToast } from "../../../context/ToastContext";

interface AttendanceRow {
  groupId: number;
  groupName: string;
  routeNum: number | null;
  present: boolean;
}

export default function HallwayHostAttendanceUI({
  hallwayStopId,
  hallwayLocation,
  attendanceRows,
}: {
  hallwayStopId: number;
  hallwayLocation: string;
  attendanceRows: AttendanceRow[];
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState<AttendanceRow[]>(attendanceRows);

  const handleStatusChange = async (rowIndex: number, newStatus: boolean) => {
    const row = rows[rowIndex];

    // Optimistic update
    setRows((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, present: newStatus } : r)),
    );

    const result = await markGroupPresent(
      row.groupId,
      hallwayStopId,
      newStatus,
    );

    if (!result?.success) {
      showToast(`Failed to update attendance for ${row.groupName}`, "danger");
      // Rollback
      setRows((prev) =>
        prev.map((r, i) =>
          i === rowIndex ? { ...r, present: !newStatus } : r,
        ),
      );
    } else {
      showToast(
        `${row.groupName} marked as ${newStatus ? "present" : "absent"}`,
        newStatus ? "success" : "info",
      );
    }
  };

  if (rows.length === 0) {
    return (
      <main className="mentor-container">
        <LogoButton />
        <div className="nav-buttons">
          <NavButton href="/"
          style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
          >
            Home
          </NavButton>
          <NavButton href="/mentor/hallway_host"
          style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
          >
            Dashboard
          </NavButton>
        </div>
        <LoginButton />
        <MobileNav homeHref="/" dashboardHref="/mentor/hallway_host" />
        <header className="mentor-header">
          <h1 className="mentor-title">Group Attendance</h1>
        </header>
        <BackButton href="/mentor/hallway_host" />
        <section className="mentor-info-box">
          <InfoBox headerText={hallwayLocation}>
            <p
              style={{
                color: "var(--textBlack)",
                fontWeight: "normal",
                fontSize: "20px",
              }}
            >
              No groups are assigned to this stop yet. Routes must be built on
              the admin Routes page first.
            </p>
          </InfoBox>
        </section>
      </main>
    );
  }

  return (
    <main className="mentor-container">
      <LogoButton />
      <div className="nav-buttons">
        <NavButton href="/"
        style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Home
        </NavButton>
        <NavButton href="/mentor/hallway_host"
        style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Dashboard
        </NavButton>
      </div>
      <LoginButton />
      <MobileNav homeHref="/" dashboardHref="/mentor/hallway_host" />

      <header className="mentor-header">
        <h1 className="mentor-title">Group Attendance</h1>
      </header>

      <BackButton href="/mentor/hallway_host" />

      <section className="mentor-info-box">
        <InfoBox headerText={hallwayLocation}>
          <CheckBoxTable
            headers={["Group"]}
            data={rows.map((row) => [row.groupName])}
            status={rows.map((row) => row.present)}
            rowIds={rows.map((_, i) => i)}
            onStatusChange={(rowIndex, newStatus) =>
              handleStatusChange(rowIndex, newStatus)
            }
          />
        </InfoBox>
      </section>
    </main>
  );
}
