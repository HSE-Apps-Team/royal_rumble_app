"use client";

import { useState } from "react";
import React from "react";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import InfoBox from "../../../components/infoBox";
import BackButton from "../../../components/backButton";
import NavButton from "../../../components/addButton";
import MobileNav from "../../../components/MobileNav";
import "../../../css/mentor.css";
import "../../../css/logo+login.css";
import "../../../css/mobile-nav.css";
import { markGroupPresent } from "@/actions/routes";
import { useToast } from "../../../context/ToastContext";

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
  textAlign: "left",
  verticalAlign: "middle",
  padding: "12px",
  border: "2px solid var(--primaryBlue)",
};

const checkboxCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: "center",
  width: "110px",
};

const checkboxStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  cursor: "pointer",
};

interface Stop {
  stopOrder: number;
  location: string | null;
  durationMinutes: number;
  hallwayStopId: number;
  present: boolean;
}

interface ScheduleBlock {
  blockName: string;
  startTime: string;
  durationMinutes?: number;
  stops: Stop[];
  hallwayStopId: number | null;
  present: boolean;
}

interface Schedule {
  groupId: number;
  groupName: string;
  routeNum: number | null;
  schedule: ScheduleBlock[];
}

export default function AmbassadorRouteUI({
  schedule,
  groupId,
}: {
  schedule: Schedule | null;
  groupId: number | null;
}) {
  const { showToast } = useToast();
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(
    schedule?.schedule ?? [],
  );

  const setStopPresent = (
    blockIndex: number,
    stopIndex: number | null,
    present: boolean,
  ) => {
    setBlocks((prev) =>
      prev.map((block, bIdx) => {
        if (bIdx !== blockIndex) return block;
        if (stopIndex === null) return { ...block, present };
        return {
          ...block,
          stops: block.stops.map((stop, sIdx) =>
            sIdx === stopIndex ? { ...stop, present } : stop,
          ),
        };
      }),
    );
  };

  const handleToggle = async (
    blockIndex: number,
    stopIndex: number | null,
    hallwayStopId: number,
    label: string,
    newStatus: boolean,
  ) => {
    if (groupId == null) return;

    setStopPresent(blockIndex, stopIndex, newStatus);

    const result = await markGroupPresent(groupId, hallwayStopId, newStatus);

    if (!result?.success) {
      showToast(`Failed to update ${label}`, "danger");
      setStopPresent(blockIndex, stopIndex, !newStatus);
    } else {
      showToast(
        `${label} marked as ${newStatus ? "reached" : "not reached"}`,
        newStatus ? "success" : "info",
      );
    }
  };

  if (!schedule) {
    return (
      <main className="mentor-container">
        <LogoButton />
        <div className="nav-buttons">
          <NavButton
            href="/"
            style={{
              width: "90px",
              height: "40px",
              padding: "5px 0px",
              fontSize: "15px",
            }}
          >
            Home
          </NavButton>
          <NavButton
            href="/mentor/ambassador"
            style={{
              width: "140px",
              height: "40px",
              padding: "5px 0px",
              fontSize: "15px",
            }}
          >
            Dashboard
          </NavButton>
        </div>
        <LoginButton />
        <MobileNav homeHref="/" dashboardHref="/mentor/ambassador" />

        <header className="mentor-header">
          <h1 className="mentor-title">Route</h1>
        </header>

        <BackButton href="/mentor/ambassador" />

        <section className="mentor-info-box">
          <InfoBox headerText="No Route Assigned">
            <p
              style={{
                color: "var(--textBlack)",
                fontWeight: "normal",
                fontSize: "20px",
              }}
            >
              Your group has not been assigned a route yet. Please check back
              later.
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
        <NavButton
          href="/"
          style={{
            width: "90px",
            height: "40px",
            padding: "5px 0px",
            fontSize: "15px",
          }}
        >
          Home
        </NavButton>
        <NavButton
          href="/mentor/ambassador"
          style={{
            width: "140px",
            height: "40px",
            padding: "5px 0px",
            fontSize: "15px",
          }}
        >
          Dashboard
        </NavButton>
      </div>
      <LoginButton />
      <MobileNav homeHref="/" dashboardHref="/mentor/ambassador" />

      <header className="mentor-header">
        <h1 className="mentor-title">Your Route</h1>
      </header>

      <BackButton href="/mentor/ambassador" />

      {/* Group + Route summary */}
      <section className="mentor-info-box">
        <InfoBox headerText="Group Details">
          <div className="info-pairs">
            <div className="info-pair">
              <div className="info-label">Group:</div>
              <div className="info-value">{schedule.groupName}</div>
            </div>
            <div className="info-pair">
              <div className="info-label">Route #:</div>
              <div className="info-value">{schedule.routeNum ?? "—"}</div>
            </div>
            <div className="info-pair">
              <div className="info-label">Event Order:</div>
              <div className="info-value">
                {blocks.map((b) => b.blockName).join(" → ")}
              </div>
            </div>
          </div>
        </InfoBox>
      </section>

      {/* One InfoBox per block */}
      {blocks.map((block, blockIndex) => (
        <section key={blockIndex} className="mentor-info-box">
          <InfoBox headerText={block.blockName}>
            <div className="info-pairs" style={{ marginBottom: "20px" }}>
              <div className="info-pair">
                <div className="info-label">Start Time:</div>
                <div className="info-value">
                  {block.startTime === "TBD" ? (
                    <span style={{ color: "var(--primaryRed)" }}>
                      TBD — block schedule not set
                    </span>
                  ) : (
                    block.startTime
                  )}
                </div>
              </div>
              {block.durationMinutes !== undefined && (
                <div className="info-pair">
                  <div className="info-label">Duration:</div>
                  <div className="info-value">{block.durationMinutes} min</div>
                </div>
              )}
            </div>

            {/* Tour block: show stop-by-stop itinerary with reached checkboxes */}
            {block.blockName.toLowerCase() === "tour" ? (
              <>
                {block.stops.length === 0 ? (
                  <p
                    style={{
                      color: "var(--textBlack)",
                      fontWeight: "normal",
                      fontSize: "18px",
                    }}
                  >
                    No stops have been added to this route yet.
                  </p>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={headerCellStyle}>Stop</th>
                        <th style={headerCellStyle}>Duration</th>
                        <th style={headerCellStyle}>Reached?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {block.stops.map((stop, stopIndex) => (
                        <tr key={stop.hallwayStopId}>
                          <td style={cellStyle}>
                            {stop.location ?? "Unknown"}
                          </td>
                          <td style={cellStyle}>{stop.durationMinutes} min</td>
                          <td style={checkboxCellStyle}>
                            <input
                              type="checkbox"
                              checked={stop.present}
                              onChange={(e) =>
                                handleToggle(
                                  blockIndex,
                                  stopIndex,
                                  stop.hallwayStopId,
                                  `Stop ${stop.stopOrder} (${stop.location ?? "Unknown"})`,
                                  e.target.checked,
                                )
                              }
                              style={checkboxStyle}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              block.hallwayStopId != null && (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={headerCellStyle}>Block</th>
                      <th style={headerCellStyle}>Reached?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={cellStyle}>{block.blockName}</td>
                      <td style={checkboxCellStyle}>
                        <input
                          type="checkbox"
                          checked={block.present}
                          onChange={(e) =>
                            handleToggle(
                              blockIndex,
                              null,
                              block.hallwayStopId as number,
                              `Reached ${block.blockName}`,
                              e.target.checked,
                            )
                          }
                          style={checkboxStyle}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              )
            )}
          </InfoBox>
        </section>
      ))}
    </main>
  );
}
