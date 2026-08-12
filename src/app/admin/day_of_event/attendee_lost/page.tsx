"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import GroupDetailAccordion, {
  type GroupDetail,
} from "../../../components/GroupDetailAccordion";
import { searchCheckedInAttendees } from "../../../../actions/attendees";
import { getGroupDetailForAttendee } from "../../../../actions/group";
import { getGroupSchedulesForGroups } from "../../../../actions/routes";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import { useAlert } from "@/app/context/AlertContext";

interface AttendeeCandidate {
  attendeeId: number;
  fName: string;
  lName: string;
  groupId: number | null;
  groupName: string | null;
  present: boolean;
}

export default function AttendeeLost() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AttendeeCandidate[] | null>(null);

  const [selected, setSelected] = useState<AttendeeCandidate | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);

  const latestRequestId = useRef(0);

  useEffect(() => {
    const query = searchQuery.trim();
    const requestId = ++latestRequestId.current;
    setSearching(true);

    const runSearch = async () => {
      try {
        const matches = await searchCheckedInAttendees(query);
        if (requestId === latestRequestId.current) {
          setResults(matches);
        }
      } catch (error) {
        console.error(error);
        if (requestId === latestRequestId.current) {
          showAlert("Failed to search attendees", "danger");
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

  const handleSelectCandidate = async (candidate: AttendeeCandidate) => {
    setSelected(candidate);
    setGroupDetail(null);
    setLoadingGroup(true);

    try {
      const detail = await getGroupDetailForAttendee(candidate.attendeeId);
      if (!detail) {
        setGroupDetail(null);
        return;
      }

      const schedulesByGroupId = await getGroupSchedulesForGroups([detail.group_id]);

      setGroupDetail({
        group_id: detail.group_id,
        name: detail.name,
        route_num: detail.route_num,
        event_order: String(detail.event_order),
        attendees: detail.attendees,
        mentors: detail.mentors,
        schedule: schedulesByGroupId.get(detail.group_id) ?? null,
      });
    } catch (error) {
      console.error(error);
      showAlert("Failed to load group information", "danger");
    } finally {
      setLoadingGroup(false);
    }
  };

  const handleBackToSearch = () => {
    setSelected(null);
    setGroupDetail(null);
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Attendee Lost?</h1>
      </header>

      <button
        className="back-button"
        onClick={() =>
          selected ? handleBackToSearch() : router.push("/admin/day_of_event")
        }
      >
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
                    No matching attendees found.
                  </p>
                ) : (
                  <div className="candidate-list">
                    {results.map((candidate) => (
                      <div className="candidate-card" key={candidate.attendeeId}>
                        <div className="candidate-card-info">
                          <div className="candidate-card-name">
                            {candidate.fName} {candidate.lName}{" "}
                            <span className="candidate-card-id">
                              (ID: {candidate.attendeeId})
                            </span>
                          </div>
                          <div className="candidate-card-meta">
                            {candidate.groupName ?? "No group assigned"}
                            {" · "}
                            {candidate.present ? "Checked in" : "Not checked in"}
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
          <div style={{ width: "85%", margin: "20px auto 0", textAlign: "left" }}>
            <div className="info-pairs">
              <div className="info-pair">
                <div className="info-label">Attendee:</div>
                <div className="info-value">
                  {selected.fName} {selected.lName} (ID: {selected.attendeeId})
                </div>
              </div>
            </div>
          </div>

          {loadingGroup && (
            <p style={{ margin: "40px", fontSize: "18px", color: "var(--primaryBlue)" }}>
              Loading group information...
            </p>
          )}

          {!loadingGroup && !groupDetail && (
            <p className="candidate-empty-state">
              This attendee is not currently assigned to a group.
            </p>
          )}

          {!loadingGroup && groupDetail && (
            <GroupDetailAccordion groupDetail={groupDetail} />
          )}

          <div
            className="add-button-align"
            style={{ display: "flex", gap: "20px", alignItems: "center", justifyContent: "center" }}
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
              Back to Search
            </button>
          </div>
        </>
      )}
    </main>
  );
}
