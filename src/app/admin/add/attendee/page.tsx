"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import AddButton from "../../../components/addButton";
import ContentModal from "../../../components/ContentModal";
import { addAttendee, searchSeminarCandidates } from "../../../../actions/attendees";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import { useAlert } from "@/app/context/AlertContext";

interface AddedAttendeeInfo {
  name: string;
  teacher: string | null;
  groupName: string | null;
}

interface SeminarCandidate {
  freshmenId: number;
  fName: string;
  lName: string;
  teacherFullName: string | null;
  period: string | null;
  groupName: string | null;
}

export default function AdminAddAttendee() {
  const router = useRouter();
  const { showAlert } = useAlert();

  // Step 1: search the seminar roster for a student to add
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SeminarCandidate[] | null>(null);

  // Step 2: confirm & add the selected student
  const [selected, setSelected] = useState<SeminarCandidate | null>(null);
  const [f_name, setf_name] = useState("");
  const [l_name, setl_name] = useState("");
  const [attendeeId, setAttendeeId] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addedInfo, setAddedInfo] = useState<AddedAttendeeInfo | null>(null);

  const handleLogoClick = () => {
    router.push("/admin/attendees");
  };

  // Live search: shows the full eligible roster on load, then debounces
  // keystrokes and ignores stale responses that resolve after a newer
  // query has already been typed.
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

    // Load the full roster immediately on mount; debounce actual typing.
    if (query === "") {
      runSearch();
      return;
    }

    const timeoutId = setTimeout(runSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectCandidate = (candidate: SeminarCandidate) => {
    setSelected(candidate);
    setf_name(candidate.fName);
    setl_name(candidate.lName);
    setAttendeeId(candidate.freshmenId.toString());
    setErrors({});
  };

  const handleBackToSearch = () => {
    setSelected(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!f_name.trim()) newErrors.f_name = "First name is required.";
    if (!l_name.trim()) newErrors.l_name = "Last name is required.";
    if (!attendeeId.trim()) {
      newErrors.attendeeId = "Student ID is required.";
    } else if (!/^\d+$/.test(attendeeId) || parseInt(attendeeId) <= 0) {
      newErrors.attendeeId = "Student ID must be a positive integer.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;

    try {
      const attendee_return = await addAttendee({
        f_name: f_name,
        l_name: l_name,
        freshmen_id: Number(attendeeId),
      });
      if (!attendee_return.success) {
        throw new Error("Failed to add attendee");
      }
      setAddedInfo({
        name: `${attendee_return.f_name} ${attendee_return.l_name}`,
        teacher: attendee_return.teacher,
        groupName: attendee_return.groupName,
      });
    } catch (error) {
      console.error(error);
      showAlert(`Failed to add attendee: ${f_name} ${l_name}`, "danger");
    }
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Add New Attendee</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      {!selected && (
        <>
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
                          onClick={() => handleSelectCandidate(candidate)}
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
        </>
      )}

      {selected && (
        <>
          <section className="add-form">
            <div className="edit-user-form">
              <div className="form-row">
                <label className="form-label">First Name:</label>
                <div>
                  <input
                    type="text"
                    className={`form-input${errors.f_name ? " is-invalid" : ""}`}
                    value={f_name}
                    onChange={(e) => setf_name(e.target.value)}
                  />
                  {errors.f_name && (
                    <div className="invalid-feedback d-block">{errors.f_name}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Last Name:</label>
                <div>
                  <input
                    type="text"
                    className={`form-input${errors.l_name ? " is-invalid" : ""}`}
                    value={l_name}
                    onChange={(e) => setl_name(e.target.value)}
                  />
                  {errors.l_name && (
                    <div className="invalid-feedback d-block">{errors.l_name}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Student ID:</label>
                <div>
                  <input
                    type="text"
                    className={`form-input${errors.attendeeId ? " is-invalid" : ""}`}
                    value={attendeeId}
                    onChange={(e) => setAttendeeId(e.target.value)}
                  />
                  {errors.attendeeId && (
                    <div className="invalid-feedback d-block">
                      {errors.attendeeId}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Group:</label>
                <div>{selected.groupName ?? "No group assigned"}</div>
              </div>
            </div>
          </section>
          <div
            className="add-button-align"
            style={{ display: "flex", gap: "20px", alignItems: "center" }}
          >
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--secondarySilver)",
                color: "white",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "bold",
                fontSize: "18px",
                border: "3px solid var(--textBlack)",
                borderRadius: "14px",
                padding: "10px 22px",
                cursor: "pointer",
              }}
              onClick={handleBackToSearch}
            >
              Back
            </button>
            <AddButton onClick={handleAdd} style={{ fontSize: "30px" }}>
              Add
              <i
                className="bi bi-plus-circle"
                style={{ marginLeft: "30px", fontSize: "30px" }}
              ></i>
            </AddButton>
          </div>
        </>
      )}

      <ContentModal
        title="Attendee Added"
        icon="bi bi-check-circle"
        show={!!addedInfo}
        onClose={() => router.push("/admin/attendees")}
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
