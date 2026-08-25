"use client";

import React, { useState } from "react";
import ModalShell from "./ModalShell";
import { useToast } from "@/app/context/ToastContext";
import { checkMentorAttendanceCode } from "@/actions/other";
import { formatEventDates } from "@/lib/formatEventDates";

interface EventRow {
  eventId: number;
  name: string | null;
  date: string | null;
  time: string | null;
  date2?: string | null;
  time2?: string | null;
  description: string | null;
  attendanceCodeActive: boolean;
  attended: boolean;
}

const makeBtn = (bg: string) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bg,
  color: "white",
  fontFamily: "Poppins, sans-serif",
  fontWeight: "bold" as const,
  fontSize: "14px",
  border: "5px solid transparent",
  borderRadius: "14px",
  padding: "8px 16px",
  cursor: "pointer",
  transition: "background-color 0.2s",
  minWidth: "90px",
});

export default function EventCheckInTable({
  mentorId,
  events,
}: {
  mentorId: number;
  events: EventRow[];
}) {
  const { showToast } = useToast();
  const [rows, setRows] = useState(events);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse",
    width: "85%",
    margin: "20px auto",
    border: "4px solid var(--primaryBlue)",
    fontFamily: "Poppins, sans-serif",
    tableLayout: "fixed",
  };

  const headerCellStyle: React.CSSProperties = {
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    verticalAlign: "middle",
    padding: "12px",
    border: "2px solid var(--primaryBlue)",
  };

  const cellStyle: React.CSSProperties = {
    backgroundColor: "white",
    color: "var(--textBlack)",
    textAlign: "center",
    verticalAlign: "middle",
    padding: "12px",
    border: "2px solid var(--primaryBlue)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    fontSize: "18px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    border: `2px solid ${error ? "var(--primaryRed)" : "var(--primaryBlue)"}`,
    borderRadius: "8px",
    fontFamily: "Poppins, sans-serif",
  };

  const openModal = (eventId: number) => {
    setActiveEventId(eventId);
    setCode("");
    setError("");
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setActiveEventId(null);
    setCode("");
    setError("");
  };

  const submitCode = async () => {
    if (activeEventId === null || isSubmitting) return;
    if (!code.trim()) {
      setError("Please enter the attendance code.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const result = await checkMentorAttendanceCode(
        activeEventId,
        mentorId,
        code,
      );
      if (result.success) {
        setRows((prev) =>
          prev.map((r) =>
            r.eventId === activeEventId ? { ...r, attended: true } : r,
          ),
        );
        showToast("You're checked in!", "success");
        setActiveEventId(null);
        setCode("");
      } else {
        const messages: Record<string, string> = {
          invalid: "That code isn't correct. Please try again.",
          expired: "This code has expired. Ask an admin for a new one.",
          already_checked_in: "You're already checked in for this event.",
        };
        setError(messages[result.error] ?? "Something went wrong.");
        if (result.error === "already_checked_in") {
          setRows((prev) =>
            prev.map((r) =>
              r.eventId === activeEventId ? { ...r, attended: true } : r,
            ),
          );
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeEvent = rows.find((r) => r.eventId === activeEventId) ?? null;

  return (
    <>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCellStyle}>Event</th>
            <th style={headerCellStyle}>Date(s)</th>
            <th style={headerCellStyle}>Description</th>
            <th style={headerCellStyle}>Attendance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((event) => (
            <tr key={event.eventId}>
              <td style={cellStyle}>{event.name ?? "N/A"}</td>
              <td style={cellStyle}>{formatEventDates(event)}</td>
              <td style={cellStyle}>{event.description ?? "N/A"}</td>
              <td style={cellStyle}>
                {event.attended ? (
                  <span style={{ color: "var(--primaryBlue)", fontWeight: "bold" }}>
                    <i className="bi bi-check-circle-fill" style={{ marginRight: "6px" }} />
                    Checked In
                  </span>
                ) : event.attendanceCodeActive ? (
                  <button
                    style={makeBtn("var(--primaryBlue)")}
                    onClick={() => openModal(event.eventId)}
                  >
                    Check In
                  </button>
                ) : (
                  <span style={{ color: "var(--secondarySilver)" }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeEvent && (
        <ModalShell
          title={`Check In — ${activeEvent.name ?? "Event"}`}
          onClose={closeModal}
          footer={
            <>
              <button
                style={makeBtn("var(--secondarySilver)")}
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                style={makeBtn("var(--primaryBlue)")}
                onClick={submitCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Checking In..." : "Submit"}
              </button>
            </>
          }
        >
          <p style={{ margin: "0 0 12px" }}>
            Enter the attendance code given at this event.
          </p>
          <input
            type="text"
            style={inputStyle}
            value={code}
            placeholder="CODE"
            autoFocus
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitCode();
            }}
          />
          {error && (
            <div style={{ color: "var(--primaryRed)", marginTop: "8px", fontSize: "14px" }}>
              {error}
            </div>
          )}
        </ModalShell>
      )}
    </>
  );
}
