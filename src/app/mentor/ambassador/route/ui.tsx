"use client";

import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import InfoBox from "../../../components/infoBox";
import InfoTable from "../../../components/infoTable";
import BackButton from "../../../components/backButton";
import NavButton from "../../../components/addButton";
import MobileNav from "../../../components/MobileNav";
import "../../../css/mentor.css";
import "../../../css/logo+login.css";
import "../../../css/mobile-nav.css";

interface Stop {
  stopOrder: number;
  location: string | null;
  durationMinutes: number;
}

interface ScheduleBlock {
  blockName: string;
  startTime: string;
  durationMinutes?: number;
  stops: Stop[];
}

interface Schedule {
  groupId: number;
  groupName: string;
  routeNum: number | null;
  schedule: ScheduleBlock[];
}

export default function AmbassadorRouteUI({
  schedule,
}: {
  schedule: Schedule | null;
}) {
  if (!schedule) {
    return (
      <main className="mentor-container">
        <LogoButton />
                <div className="nav-buttons">
          <NavButton href="/"
          style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
          >
            Home
          </NavButton>
          <NavButton href="/mentor/ambassador"
          style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
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
          <NavButton href="/"
          style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
          >
            Home
          </NavButton>
          <NavButton href="/mentor/ambassador"
          style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
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
                {schedule.schedule.map((b) => b.blockName).join(" → ")}
              </div>
            </div>
          </div>
        </InfoBox>
      </section>

      {/* One InfoBox per block */}
      {schedule.schedule.map((block, index) => (
        <section key={index} className="mentor-info-box">
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

            {/* Tour block: show stop-by-stop itinerary */}
            {block.blockName.toLowerCase() === "tour" && (
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
                  <>
                    <div
                      className="info-label"
                      style={{ marginBottom: "10px" }}
                    >
                      Stops:
                    </div>
                    <InfoTable
                      headers={["#", "Location", "Duration"]}
                      data={block.stops.map((stop) => [
                        stop.stopOrder,
                        stop.location ?? "Unknown",
                        `${stop.durationMinutes} min`,
                      ])}
                    />
                  </>
                )}
              </>
            )}
          </InfoBox>
        </section>
      ))}
    </main>
  );
}
