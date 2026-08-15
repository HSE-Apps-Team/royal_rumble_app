"use client";

import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import InfoBox from "../../../components/infoBox";
import MentorButtons from "../../../components/mentorButtons";
import NavButton from "../../../components/addButton";
import MobileNav from "../../../components/MobileNav";
import InfoTable from "../../../components/infoTable";
import { formatEventDates } from "@/lib/formatEventDates";
import "../../../css/mentor.css";
import "../../../css/logo+login.css";
import "../../../css/mobile-nav.css";
import "../../../css/admin.css";
import { useRouter } from "next/navigation";

export default function AmbassadorPreview() {
  const router = useRouter();
  const ambassadorEvents = [
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

  const groupAttendees = [
    {
      attendeeId: 100005,
      fName: "Zuko",
      lName: "Smith",
      tshirtSize: "M",
      primaryLanguage: "English",
      interests: "Media (Sports Media, Newspaper,  Yearbook, PR, etc)",
      healthConcerns: null,
      present: null,
      groupId: 68,
    },
    {
      attendeeId: 302426,
      fName: "Iroh",
      lName: "Johnson",
      tshirtSize: "XS",
      primaryLanguage: "Spanish",
      interests:
        "Performing Arts (Band, Choir, Orchestra, Drama, & Musical Theater, etc)",
      healthConcerns: null,
      present: null,
      groupId: 68,
    },
    {
      attendeeId: 123456,
      fName: "Azula",
      lName: "Brown",
      tshirtSize: "L",
      primaryLanguage: "English",
      interests: "Athletics",
      healthConcerns: "Wool Allergy",
      present: true,
      groupId: 68,
    },
    {
      attendeeId: 500123,
      fName: "Mai",
      lName: "Davis",
      tshirtSize: "S",
      primaryLanguage: null,
      interests:
        "Personal Interest Clubs (Pickleball, Robotics, Esports, Bring Change to Mind, etc)",
      healthConcerns: null,
      present: null,
      groupId: 68,
    },
    {
      attendeeId: 654321,
      fName: "Sokka",
      lName: "Beifong",
      tshirtSize: "S",
      primaryLanguage: null,
      interests: "Best Buddies & Unified Sports",
      healthConcerns: null,
      present: null,
      groupId: 68,
    },
    {
      attendeeId: 302409,
      fName: "Bumi",
      lName: "Anderson",
      tshirtSize: null,
      primaryLanguage: "Greek",
      interests: "",
      healthConcerns: null,
      present: null,
      groupId: 68,
    },
  ];

  const possibleAttendees = [
    { freshmenId: 1, fName: "Yue", lName: "Taylor" },
    { freshmenId: 2, fName: "Zhao", lName: "Martinez" },
    { freshmenId: 3, fName: "Pakku", lName: "Thomas" },
    { freshmenId: 4, fName: "Piandao", lName: "Clark" },
    { freshmenId: 5, fName: "Ozai", lName: "Rodriguez" },
    { freshmenId: 6, fName: "Ursa", lName: "Lewis" },
    { freshmenId: 7, fName: "Kuruk", lName: "Harris" },
    { freshmenId: 8, fName: "Roku", lName: "Mitchell" },
    { freshmenId: 9, fName: "Hakoda", lName: "Turner" },
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
        <h1 className="mentor-title">Welcome, Avatar Aang!</h1>
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
          <h3 className="mentor-subtitle2">AMBASSADOR</h3>
        </div>
      </header>

      <div
        className="mentor-info-box mentor-action-buttons"
        style={{ flexDirection: "row", gap: "20px" }}
      >
        <MentorButtons link="/admin/mentor_preview/ambassador/attendance">
          Attendance
        </MentorButtons>
        <MentorButtons link="/admin/mentor_preview/ambassador/route">
          Route
        </MentorButtons>
      </div>

      <section className="mentor-info-box">
        <InfoBox headerText="Group Details">
          <div className="info-pairs">
            <div className="info-pair">
              <div className="info-label">Group:</div>
              <div className="info-value">Group 1</div>
            </div>
            <div className="info-pair">
              <div className="info-label">Route #:</div>
              <div className="info-value">1</div>
            </div>
            <div className="info-pair">
              <div className="info-label">Event Order:</div>
              <div className="info-value">Tour, Gym, Leonard</div>
            </div>
          </div>
          <div className="info-pairs">
            <div className="info-label">Mentors:</div>
            <div className="info-value">
              <ol className="list-group list-group-numbered list-group-horizontal">
                <li className="list-group-item" key="mentor1">
                  Avatar Aang
                </li>
                <li className="list-group-item" key="mentor2">
                  Nithik Sajja
                </li>
                <li className="list-group-item" key="mentor3">
                  Nico Suriano
                </li>
              </ol>
            </div>
          </div>
          <div className="info-pairs">
            <div className="info-label">Registered Attendees:</div>
            <InfoTable
              headers={["Name", "Interests", "T-Shirt Size"]}
              data={groupAttendees.map((attendee) => [
                `${attendee.fName} ${attendee.lName}`,
                attendee.interests ?? "",
                attendee.tshirtSize ?? "",
              ])}
            />
          </div>
          {possibleAttendees.length > 0 && (
            <div className="info-pairs">
              <div className="info-label">Possible Attendees:</div>
              <InfoTable
                headers={["Name"]}
                data={possibleAttendees.map((attendee) => [
                  `${attendee.fName} ${attendee.lName}`,
                ])}
              />
            </div>
          )}
        </InfoBox>
      </section>

      <section className="mentor-info-box">
        <InfoBox headerText="Event Details">
          <div
            style={{
              color: "var(--primaryBlue)",
              fontWeight: "bold",
              fontSize: "30px",
              margin: "10px 0px",
            }}
          >
            Dates:
          </div>

          <InfoTable
            headers={["Event", "Date(s)", "Description"]}
            data={ambassadorEvents.map((event) => [
              event.name ?? "N/A",
              formatEventDates(event),
              event.description ?? "N/A",
            ])}
          />
        </InfoBox>
      </section>

      <InfoBox headerText="Additional Instruction">Hi Ambassadors!</InfoBox>
    </main>
  );
}
