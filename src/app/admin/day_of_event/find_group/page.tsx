"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import GroupDetailAccordion, {
  type GroupDetail,
} from "../../../components/GroupDetailAccordion";
import { getAllGroups } from "../../../../actions/group";
import { getGroupSchedulesForGroups } from "../../../../actions/routes";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import { useAlert } from "@/app/context/AlertContext";

type GroupCandidate = Omit<GroupDetail, "schedule">;

// Group names always follow the convention "Group {N}" (see resolveGroupId in
// src/actions/group.tsx), so "the group number" the admin types maps to that
// N, not the internal group_id primary key.
const parseGroupNumber = (name: string): number | null => {
  const match = name.trim().match(/^Group (\d+)$/i);
  return match ? Number(match[1]) : null;
};

export default function FindGroup() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<GroupCandidate[] | null>(null);

  const [selected, setSelected] = useState<GroupCandidate | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);

  const latestRequestId = useRef(0);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    const requestId = ++latestRequestId.current;
    setSearching(true);

    const runSearch = async () => {
      try {
        const allGroups = await getAllGroups();
        if (requestId !== latestRequestId.current) return;

        const matches =
          query === ""
            ? allGroups
            : allGroups.filter((g) => {
                const groupNumber = parseGroupNumber(g.name);
                if (groupNumber !== null && groupNumber.toString().includes(query)) {
                  return true;
                }
                if (g.name.toLowerCase().includes(query)) return true;
                return g.mentors.some((m) => m.name.toLowerCase().includes(query));
              });

        matches.sort((a, b) => {
          const aNum = parseGroupNumber(a.name);
          const bNum = parseGroupNumber(b.name);
          if (aNum !== null && bNum !== null) return aNum - bNum;
          return a.name.localeCompare(b.name);
        });

        setResults(matches);
      } catch (error) {
        console.error(error);
        if (requestId === latestRequestId.current) {
          showAlert("Failed to search groups", "danger");
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

  const handleSelectCandidate = async (candidate: GroupCandidate) => {
    setSelected(candidate);
    setGroupDetail(null);
    setLoadingGroup(true);

    try {
      const schedulesByGroupId = await getGroupSchedulesForGroups([candidate.group_id]);

      setGroupDetail({
        ...candidate,
        schedule: schedulesByGroupId.get(candidate.group_id) ?? null,
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
        <h1 className="admin-title">Find Group</h1>
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
                placeholder="Search Group Number / Name..."
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
                  <p className="candidate-empty-state">No matching groups found.</p>
                ) : (
                  <div className="candidate-list">
                    {results.map((candidate) => (
                      <div className="candidate-card" key={candidate.group_id}>
                        <div className="candidate-card-info">
                          <div className="candidate-card-name">{candidate.name}</div>
                          <div className="candidate-card-meta">
                            {candidate.mentors.length > 0
                              ? candidate.mentors.map((m) => m.name).join(", ")
                              : "No mentors assigned"}
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
          {loadingGroup && (
            <p style={{ margin: "40px", fontSize: "18px", color: "var(--primaryBlue)" }}>
              Loading group information...
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
