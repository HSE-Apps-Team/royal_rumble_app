"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LogoButton from "../../../../components/logoButton";
import LoginButton from "../../../../components/loginButton";
import ModalShell from "../../../../components/ModalShell";
import ContentModal from "../../../../components/ContentModal";
import { addAttendee, searchSeminarCandidates } from "../../../../../actions/attendees";
import "../../../../css/admin.css";
import "../../../../css/logo+login.css";
import { useAlert } from "@/app/context/AlertContext";

interface SeminarCandidate {
  freshmenId: number;
  fName: string;
  lName: string;
  teacherFullName: string | null;
  period: string | null;
  groupName: string | null;
}

interface AddedAttendeeInfo {
  name: string;
  teacher: string | null;
  groupName: string | null;
}

export default function AddFreshman() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SeminarCandidate[] | null>(null);

  const [selected, setSelected] = useState<SeminarCandidate | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [addedInfo, setAddedInfo] = useState<AddedAttendeeInfo | null>(null);

  const latestRequestId = useRef(0);

  useEffect(() => {
    const query = searchQuery.trim();
    const requestId = ++latestRequestId.current;
    setSearching(true);

    const runSearch = async () => {
      try {
        const matches = await searchSeminarCandidates(query);
        if (requestId === latestRequestId.current) {
          setResults(matches);
        }
      } catch (error) {
        console.error(error);
        if (requestId === latestRequestId.current) {
          showAlert("Failed to search the seminar roster", "danger");
        }
      } finally {
        if (requestId === latestRequestId.current) {
          setSearching(false);
        }
      }
    };

    if (query === "") {
      runSearch();
      return;
    }

    const timeoutId = setTimeout(runSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleConfirm = async () => {
    if (!selected) return;

    setConfirming(true);
    try {
      const result = await addAttendee({
        f_name: selected.fName,
        l_name: selected.lName,
        freshmen_id: selected.freshmenId,
      });
      if (!result.success) {
        throw new Error("Failed to add attendee");
      }
      setSelected(null);
      setAddedInfo({
        name: `${result.f_name} ${result.l_name}`,
        teacher: result.teacher,
        groupName: result.groupName,
      });
    } catch (error) {
      console.error(error);
      showAlert(`Failed to add ${selected.fName} ${selected.lName}`, "danger");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Add Freshman</h1>
      </header>

      <button
        className="back-button"
        onClick={() => router.push("/admin/day_of_event/add_walk_in")}
      >
        <i className="bi bi-arrow-left"></i>
      </button>

      <div
        className="search-container"
        style={{ margin: "60px auto 0px", justifyContent: "center" }}
      >
        <div className="search-row" style={{ justifyContent: "center" }}>
          <input
            type="text"
            placeholder="Search Name / Student ID..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searching && (
            <i
              className="bi bi-arrow-repeat"
              style={{ color: "var(--primaryBlue)", fontSize: "20px" }}
            />
          )}
        </div>
      </div>

      {searching && results === null ? (
        <div className="candidate-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-card-info">
                <div className="skeleton-bar skeleton-bar-title" />
                <div className="skeleton-bar skeleton-bar-subtitle" />
              </div>
              <div className="skeleton-bar skeleton-bar-button" />
            </div>
          ))}
        </div>
      ) : (
        results !== null && (
          <>
            {results.length === 0 ? (
              <p className="candidate-empty-state">
                No matching students found in the seminar roster (or
                they&apos;ve already been added as an attendee).
              </p>
            ) : (
              <div className="candidate-list">
                {results.map((candidate) => (
                  <div className="candidate-card" key={candidate.freshmenId}>
                    <div className="candidate-card-info">
                      <div className="candidate-card-name">
                        {candidate.fName} {candidate.lName}{" "}
                        <span className="candidate-card-id">
                          (ID: {candidate.freshmenId})
                        </span>
                      </div>
                      <div className="candidate-card-meta">
                        {candidate.teacherFullName || "No teacher"}
                        {candidate.period ? ` — Period ${candidate.period}` : ""}
                        {" · "}
                        {candidate.groupName ?? "No group assigned"}
                      </div>
                    </div>
                    <button
                      className="candidate-select-button"
                      onClick={() => setSelected(candidate)}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      )}

      {selected && (
        <ModalShell
          title="Confirm Freshman Details"
          onClose={() => !confirming && setSelected(null)}
          footer={
            <>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--secondarySilver)",
                  color: "white",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "5px solid transparent",
                  borderRadius: "14px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  minWidth: "100px",
                }}
                onClick={() => setSelected(null)}
                disabled={confirming}
              >
                Cancel
              </button>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--primaryBlue)",
                  color: "white",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "5px solid transparent",
                  borderRadius: "14px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  minWidth: "100px",
                  opacity: confirming ? 0.6 : 1,
                }}
                onClick={handleConfirm}
                disabled={confirming}
              >
                {confirming ? "Confirming..." : "Confirm"}
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--primaryBlue)", fontWeight: "bold" }}>
                Name:
              </span>
              <span>
                {selected.fName} {selected.lName}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--primaryBlue)", fontWeight: "bold" }}>
                Student ID:
              </span>
              <span>{selected.freshmenId}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--primaryBlue)", fontWeight: "bold" }}>
                Teacher:
              </span>
              <span>{selected.teacherFullName || "Not found in seminar data"}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--primaryBlue)", fontWeight: "bold" }}>
                Period:
              </span>
              <span>{selected.period || "N/A"}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "var(--primaryBlue)", fontWeight: "bold" }}>
                Group:
              </span>
              <span>{selected.groupName ?? "No group assigned"}</span>
            </div>
          </div>
        </ModalShell>
      )}

      <ContentModal
        title="Attendee Added"
        icon="bi bi-check-circle"
        show={!!addedInfo}
        onClose={() => router.push("/admin/day_of_event/add_walk_in")}
      >
        {addedInfo && (
          <div style={{ fontSize: "18px", lineHeight: "2" }}>
            <div><strong>Name:</strong> {addedInfo.name}</div>
            <div><strong>Teacher:</strong> {addedInfo.teacher ?? "Not found in seminar data"}</div>
            <div><strong>Group:</strong> {addedInfo.groupName ?? "No group assigned"}</div>
          </div>
        )}
      </ContentModal>
    </main>
  );
}
