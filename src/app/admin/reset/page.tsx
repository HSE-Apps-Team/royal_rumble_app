"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LogoButton from "@/src/app/components/logoButton";
import LoginButton from "@/src/app/components/loginButton";
import { useAlert } from "@/src/app/context/AlertContext";
import "@/src/app/css/admin.css";
import "@/src/app/css/logo+login.css";
import {
  resetFreshmenData,
  resetMentorData,
  resetEventData,
  resetGroupData,
  resetRouteData,
  resetAllData,
  resetSeminarData,
  resetAmbassadorData,
  resetHallwayHostData,
  resetMentorAttendanceData,
  resetGroupRouteAttendanceData,
  resetTourRouteData,
  resetHallwayStopData,
  resetEventOrderPatternData,
  resetBlockScheduleData,
} from "@/src/actions/reset";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResetAction = () => Promise<{ success: boolean }>;

interface ResetTarget {
  label: string;
  description: string;  // shown in first confirmation
  action: ResetAction;
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

function ConfirmModal({
  target,
  step,
  onConfirm,
  onCancel,
  loading,
}: {
  target: ResetTarget;
  step: 1 | 2;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const boxStyle: React.CSSProperties = {
    backgroundColor: "white",
    border: `5px solid var(--primaryRed)`,
    borderRadius: "14px",
    padding: "40px 50px",
    maxWidth: "520px",
    width: "90%",
    fontFamily: "Poppins, sans-serif",
    textAlign: "center",
  };

  const titleStyle: React.CSSProperties = {
    color: "var(--primaryRed)",
    fontWeight: 700,
    fontSize: "1.8rem",
    marginBottom: "16px",
  };

  const bodyStyle: React.CSSProperties = {
    color: "var(--textBlack)",
    fontSize: "1.1rem",
    marginBottom: "30px",
    lineHeight: 1.6,
  };

  const affectedStyle: React.CSSProperties = {
    backgroundColor: "#fff3f5",
    border: "2px solid var(--primaryRed)",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "28px",
    textAlign: "left",
    fontSize: "0.95rem",
    color: "var(--textBlack)",
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  };

  const cancelBtnStyle: React.CSSProperties = {
    backgroundColor: "var(--secondarySilver)",
    color: "white",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "bold",
    border: "3px solid transparent",
    borderRadius: "10px",
    padding: "10px 28px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const confirmBtnStyle: React.CSSProperties = {
    backgroundColor: loading ? "var(--secondarySilver)" : "var(--primaryRed)",
    color: "white",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "bold",
    border: "3px solid transparent",
    borderRadius: "10px",
    padding: "10px 28px",
    fontSize: "1rem",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.2s",
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        {step === 1 ? (
          <>
            <p style={titleStyle}>Delete {target.label}?</p>
            <p style={bodyStyle}>
              This will permanently delete the following data. This action{" "}
              <strong>cannot be undone.</strong>
            </p>
            <div style={affectedStyle}>
              {target.description}
            </div>
          </>
        ) : (
          <>
            <p style={titleStyle}>Are you absolutely sure?</p>
            <p style={bodyStyle}>
              You are about to permanently wipe{" "}
              <strong>{target.label}</strong>. There is no way to recover this
              data after deletion.
            </p>
          </>
        )}
        <div style={btnRow}>
          <button style={cancelBtnStyle} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            style={confirmBtnStyle}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting…" : step === 1 ? "Yes, continue" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reset Section ────────────────────────────────────────────────────────────

function ResetSection({
  title,
  groupTarget,
  individualTargets,
  onTrigger,
}: {
  title: string;
  groupTarget: ResetTarget;
  individualTargets: ResetTarget[];
  onTrigger: (target: ResetTarget) => void;
}) {
  const sectionStyle: React.CSSProperties = {
    border: "4px solid var(--primaryBlue)",
    borderRadius: "12px",
    padding: "28px 32px",
    marginBottom: "32px",
    width: "100%",
    maxWidth: "800px",
    backgroundColor: "white",
  };

  const headerRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  };

  const sectionTitle: React.CSSProperties = {
    color: "var(--primaryBlue)",
    fontWeight: 700,
    fontSize: "1.6rem",
    margin: 0,
  };

  const divider: React.CSSProperties = {
    border: "none",
    borderTop: "2px solid #eee",
    margin: "16px 0",
  };

  const indivGrid: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "8px",
  };

  const subLabel: React.CSSProperties = {
    color: "var(--primaryBlue)",
    fontWeight: 600,
    fontSize: "0.95rem",
    marginBottom: "6px",
  };

  return (
    <div style={sectionStyle}>
      <div style={headerRow}>
        <h2 style={sectionTitle}>{title}</h2>
        <ResetButton target={groupTarget} onTrigger={onTrigger} size="group" />
      </div>
      <p style={{ color: "#555", fontSize: "0.9rem", margin: "0 0 12px" }}>
        {groupTarget.description}
      </p>
      <hr style={divider} />
      <p style={subLabel}>Delete individual tables:</p>
      <div style={indivGrid}>
        {individualTargets.map((t) => (
          <ResetButton key={t.label} target={t} onTrigger={onTrigger} size="small" />
        ))}
      </div>
    </div>
  );
}

// ─── Reset Button ─────────────────────────────────────────────────────────────

function ResetButton({
  target,
  onTrigger,
  size,
}: {
  target: ResetTarget;
  onTrigger: (target: ResetTarget) => void;
  size: "group" | "small";
}) {
  const [hovered, setHovered] = useState(false);

  const style: React.CSSProperties =
    size === "group"
      ? {
          backgroundColor: hovered ? "white" : "var(--primaryRed)",
          color: hovered ? "var(--primaryRed)" : "white",
          border: `3px solid var(--primaryRed)`,
          borderRadius: "10px",
          padding: "10px 24px",
          fontFamily: "Poppins, sans-serif",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }
      : {
          backgroundColor: hovered ? "white" : "var(--primaryRed)",
          color: hovered ? "var(--primaryRed)" : "white",
          border: `2px solid var(--primaryRed)`,
          borderRadius: "8px",
          padding: "6px 16px",
          fontFamily: "Poppins, sans-serif",
          fontWeight: "bold",
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        };

  return (
    <button
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onTrigger(target)}
    >
      {size === "group" ? `Reset ${target.label}` : target.label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [pendingTarget, setPendingTarget] = useState<ResetTarget | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  function triggerReset(target: ResetTarget) {
    setPendingTarget(target);
    setConfirmStep(1);
  }

  function handleFirstConfirm() {
    setConfirmStep(2);
  }

  async function handleFinalConfirm() {
    if (!pendingTarget) return;
    setLoading(true);
    try {
      await pendingTarget.action();
      showAlert(`${pendingTarget.label} has been reset successfully.`, "success");
    } catch {
      showAlert(`Failed to reset ${pendingTarget.label}. Please try again.`, "danger");
    } finally {
      setLoading(false);
      setPendingTarget(null);
    }
  }

  function handleCancel() {
    if (!loading) setPendingTarget(null);
  }

  // ── Section definitions ──────────────────────────────────────────────────

  const freshmenSection = {
    groupTarget: {
      label: "Freshmen Data",
      description: "Deletes all rows in: freshmen_data, seminar_data",
      action: resetFreshmenData,
    },
    individualTargets: [
      {
        label: "seminar_data",
        description: "Deletes all rows in: seminar_data",
        action: resetSeminarData,
      },
    ],
  };

  const mentorSection = {
    groupTarget: {
      label: "Mentor Data",
      description:
        "Deletes all rows in: mentor_data, ambassador_data, hallway_host_data, mentor_attendance_data",
      action: resetMentorData,
    },
    individualTargets: [
      {
        label: "ambassador_data",
        description: "Deletes all rows in: ambassador_data",
        action: resetAmbassadorData,
      },
      {
        label: "hallway_host_data",
        description: "Deletes all rows in: hallway_host_data",
        action: resetHallwayHostData,
      },
      {
        label: "mentor_attendance_data",
        description: "Deletes all rows in: mentor_attendance_data",
        action: resetMentorAttendanceData,
      },
    ],
  };

  const eventSection = {
    groupTarget: {
      label: "Event Data",
      description: "Deletes all rows in: events_data, mentor_attendance_data",
      action: resetEventData,
    },
    individualTargets: [
      {
        label: "mentor_attendance_data",
        description: "Deletes all rows in: mentor_attendance_data",
        action: resetMentorAttendanceData,
      },
    ],
  };

  const groupSection = {
    groupTarget: {
      label: "Group Data",
      description:
        "Deletes all rows in: group_data, freshmen_data, seminar_data, ambassador_data, group_route_attendance",
      action: resetGroupData,
    },
    individualTargets: [
      {
        label: "group_route_attendance",
        description: "Deletes all rows in: group_route_attendance",
        action: resetGroupRouteAttendanceData,
      },
    ],
  };

  const routeSection = {
    groupTarget: {
      label: "Route Data",
      description:
        "Deletes all rows in: tour_route, tour_route_stop, hallway_stop_data, hallway_host_data, group_route_attendance, event_order_pattern, block_schedule",
      action: resetRouteData,
    },
    individualTargets: [
      {
        label: "tour_route + stops",
        description: "Deletes all rows in: tour_route_stop, tour_route",
        action: resetTourRouteData,
      },
      {
        label: "hallway_stop_data",
        description:
          "Deletes all rows in: hallway_stop_data (also clears tour_route_stop, hallway_host_data, group_route_attendance)",
        action: resetHallwayStopData,
      },
      {
        label: "event_order_pattern",
        description: "Deletes all rows in: event_order_pattern",
        action: resetEventOrderPatternData,
      },
      {
        label: "block_schedule",
        description: "Deletes all rows in: block_schedule",
        action: resetBlockScheduleData,
      },
    ],
  };

  const resetAllTarget: ResetTarget = {
    label: "All Data",
    description:
      "Deletes ALL rows in every table: freshmen_data, seminar_data, mentor_data, ambassador_data, hallway_host_data, mentor_attendance_data, events_data, group_data, group_route_attendance, tour_route, tour_route_stop, hallway_stop_data, event_order_pattern, block_schedule",
    action: resetAllData,
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Reset Tables</h1>
      </header>

      <button className="back-button" onClick={() => router.push("/admin")}>
        <i className="bi bi-arrow-left"></i>
      </button>

      {/* Warning banner */}
      <div
        style={{
          backgroundColor: "#fff3f5",
          border: "3px solid var(--primaryRed)",
          borderRadius: "10px",
          padding: "16px 24px",
          maxWidth: "800px",
          width: "100%",
          marginBottom: "32px",
          fontFamily: "Poppins, sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <i
          className="bi bi-exclamation-triangle-fill"
          style={{ color: "var(--primaryRed)", fontSize: "1.6rem", flexShrink: 0 }}
        ></i>
        <span style={{ color: "var(--primaryRed)", fontWeight: 600, fontSize: "1rem" }}>
          Deletions are permanent and cannot be undone. Each action requires two
          confirmations.
        </span>
      </div>

      {/* Sections */}
      <ResetSection
        title="Freshmen"
        groupTarget={freshmenSection.groupTarget}
        individualTargets={freshmenSection.individualTargets}
        onTrigger={triggerReset}
      />

      <ResetSection
        title="Mentors"
        groupTarget={mentorSection.groupTarget}
        individualTargets={mentorSection.individualTargets}
        onTrigger={triggerReset}
      />

      <ResetSection
        title="Events"
        groupTarget={eventSection.groupTarget}
        individualTargets={eventSection.individualTargets}
        onTrigger={triggerReset}
      />

      <ResetSection
        title="Groups"
        groupTarget={groupSection.groupTarget}
        individualTargets={groupSection.individualTargets}
        onTrigger={triggerReset}
      />

      <ResetSection
        title="Routes"
        groupTarget={routeSection.groupTarget}
        individualTargets={routeSection.individualTargets}
        onTrigger={triggerReset}
      />

      {/* Reset Everything */}
      <div
        style={{
          border: "4px solid var(--primaryRed)",
          borderRadius: "12px",
          padding: "28px 32px",
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#fff3f5",
          marginBottom: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div>
          <h2
            style={{
              color: "var(--primaryRed)",
              fontWeight: 700,
              fontSize: "1.6rem",
              margin: "0 0 6px",
            }}
          >
            Reset Everything
          </h2>
          <p style={{ color: "#555", fontSize: "0.9rem", margin: 0 }}>
            Wipes all tables listed above in a single operation.
          </p>
        </div>
        <ResetButton
          target={resetAllTarget}
          onTrigger={triggerReset}
          size="group"
        />
      </div>

      {/* Double-confirm modal */}
      {pendingTarget && (
        <ConfirmModal
          target={pendingTarget}
          step={confirmStep}
          onConfirm={confirmStep === 1 ? handleFirstConfirm : handleFinalConfirm}
          onCancel={handleCancel}
          loading={loading}
        />
      )}
    </main>
  );
}
