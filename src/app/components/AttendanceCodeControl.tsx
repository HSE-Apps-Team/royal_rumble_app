"use client";

import React, { useState } from "react";
import ModalShell from "./ModalShell";
import { useAlert } from "@/app/context/AlertContext";
import { setEventAttendanceCode, clearEventAttendanceCode } from "@/actions/other";

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

export default function AttendanceCodeControl({
  eventId,
  attendanceCode,
  attendanceCodeExpiresAt,
}: {
  eventId: number;
  attendanceCode: string | null;
  attendanceCodeExpiresAt: string | null;
}) {
  const { showAlert } = useAlert();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [duration, setDuration] = useState("30");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [current, setCurrent] = useState({ attendanceCode, attendanceCodeExpiresAt });

  const isActive = Boolean(
    current.attendanceCode &&
      current.attendanceCodeExpiresAt &&
      new Date(current.attendanceCodeExpiresAt).getTime() > Date.now(),
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    fontSize: "16px",
    border: "2px solid var(--primaryBlue)",
    borderRadius: "8px",
    fontFamily: "Poppins, sans-serif",
  };

  const openModal = () => {
    setCode(current.attendanceCode ?? "");
    setDuration("30");
    setError("");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    const trimmedCode = code.trim();
    const minutes = Number(duration);
    if (!trimmedCode) {
      setError("Please enter a code.");
      return;
    }
    if (!minutes || minutes <= 0) {
      setError("Please enter a valid duration in minutes.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await setEventAttendanceCode(eventId, trimmedCode, minutes);
      setCurrent({ attendanceCode: result.code, attendanceCodeExpiresAt: result.expiresAt });
      showAlert(`Attendance code set for this event.`, "success");
      setIsOpen(false);
    } catch {
      showAlert("Failed to set attendance code.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await clearEventAttendanceCode(eventId);
      setCurrent({ attendanceCode: null, attendanceCodeExpiresAt: null });
      showAlert("Attendance code cleared.", "success");
      setIsOpen(false);
    } catch {
      showAlert("Failed to clear attendance code.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <label className="info-label">Attendance Code:</label>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
        {isActive ? (
          <span style={{ color: "var(--primaryBlue)", fontWeight: "bold" }}>
            {current.attendanceCode} — expires{" "}
            {new Date(current.attendanceCodeExpiresAt as string).toLocaleString()}
          </span>
        ) : (
          <span style={{ color: "var(--secondarySilver)" }}>No active code</span>
        )}
        <button style={makeBtn("var(--primaryBlue)")} onClick={openModal}>
          {isActive ? "Update Code" : "Set Code"}
        </button>
      </div>

      {isOpen && (
        <ModalShell
          title="Set Attendance Code"
          onClose={() => !isSubmitting && setIsOpen(false)}
          footer={
            <>
              {isActive && (
                <button
                  style={makeBtn("var(--primaryRed)")}
                  onClick={handleClear}
                  disabled={isSubmitting}
                >
                  Clear Code
                </button>
              )}
              <button
                style={makeBtn("var(--secondarySilver)")}
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                style={makeBtn("var(--primaryBlue)")}
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </>
          }
        >
          <div style={{ marginBottom: "14px" }}>
            <label className="info-label">Code:</label>
            <input
              type="text"
              style={inputStyle}
              value={code}
              placeholder="e.g. RUMBLE26"
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="info-label">Expires after (minutes):</label>
            <input
              type="number"
              min={1}
              style={inputStyle}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          {error && (
            <div style={{ color: "var(--primaryRed)", marginTop: "10px", fontSize: "14px" }}>
              {error}
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}
