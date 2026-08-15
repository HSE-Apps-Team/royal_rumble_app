"use client";

import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import InfoBox from "../../../components/infoBox";
import InfoTable from "../../../components/infoTable";
import NavButton from "../../../components/addButton";
import MobileNav from "../../../components/MobileNav";
import { formatEventDates } from "@/lib/formatEventDates";
import "../../../css/mentor.css";
import "../../../css/logo+login.css";
import "../../../css/mobile-nav.css";
import "../../../css/admin.css";
import { useRouter } from "next/navigation";

export default function NonUtilityJobPreview() {
  const router = useRouter();
  const events = [
    {
      eventId: 10,
      name: "Initial Training",
      date: "2026-07-24",
      time: "11:00 AM",
      date2: "2026-07-27",
      time2: "11:00 AM",
      description:
        "Training for all Royal Rumble mentors: choose one of the 2 available dates.",
    },
    {
      eventId: 6,
      name: "Rehearsal",
      date: "2026-07-29",
      time: "12:00 PM",
      date2: null,
      time2: null,
      description: "Job-specific rehearsal for Royal Rumble mentors",
    },
    {
      eventId: 7,
      name: "Royal Rumble",
      date: "2026-07-30",
      time: "08:30 AM",
      date2: null,
      time2: null,
      description: "The official Royal Rumble new student orientation",
    },
  ];
  return (
    <main className="mentor-container">
      <LogoButton />
      <LoginButton />
      <div className="nav-buttons">
        <NavButton
          href="/admin"
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
          href="/admin/mentor_preview"
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
      <MobileNav homeHref="/admin" dashboardHref="/admin/mentor_preview" />
      <header className="mentor-header">
        <h1 className="mentor-title">Welcome, Suki Sato!</h1>

        <div className="admin-container">
          <button
            className="back-button"
            onClick={() => router.push("/admin/mentor_preview")}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            margin: "20px 0px 0px",
          }}
        >
          <h3 className="mentor-subtitle1">Job:</h3>
          <h3 className="mentor-subtitle2">
            Utility Squad/CCA Convos/Hallway Host/Etc.
          </h3>
        </div>
      </header>
      <section className="mentor-info-box">
        <InfoBox headerText="Event Details">
          <InfoTable
            headers={["Event", "Date(s)", "Description"]}
            data={events.map((event) => [
              event.name ?? "N/A",
              formatEventDates(event),
              event.description ?? "N/A",
            ])}
          />
        </InfoBox>
      </section>

      <InfoBox headerText="Additional Instruction">
        <p>Hi Mentors!</p>
      </InfoBox>
    </main>
  );
}
