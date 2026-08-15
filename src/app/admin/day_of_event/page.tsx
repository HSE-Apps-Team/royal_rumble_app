import BackButton from "../../components/backButton";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import AdminButtons from "../../components/adminButtons";
import "../../css/admin.css";
import "../../css/logo+login.css";
import { getDayOfEventStats } from "@/src/actions/other";

export const dynamic = "force-dynamic";

export default async function DayOfEventHomepage() {
  const stats = await getDayOfEventStats();

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Day of Event</h1>
      </header>

      <BackButton href="/admin" />

      <section
        className="admin-button-box"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "50px",
        }}
      >
        <div className="doe-stat-row">
          <div className="doe-stat">
            <span className="doe-stat-num">
              {stats.attendeesCheckedIn}{" "}
              <span className="doe-stat-of">/ {stats.attendeesTotal}</span>
            </span>
            <span className="doe-stat-label">Attendees checked in</span>
          </div>
          <div className="doe-stat">
            <span className="doe-stat-num">{stats.mentorsTotal}</span>
            <span className="doe-stat-label">Total mentors</span>
          </div>
          <div className="doe-stat">
            <span className="doe-stat-num">
              {stats.groupsOnTour}{" "}
              <span className="doe-stat-of">/ {stats.groupsWithRoute}</span>
            </span>
            <span className="doe-stat-label">Groups on tour</span>
          </div>
        </div>

        <div className="admin-button-row">
          <AdminButtons link="/admin/day_of_event/attendee_lost">
            Attendee Lost?
          </AdminButtons>
          <AdminButtons link="/admin/day_of_event/find_group">
            Find Group
          </AdminButtons>
          <AdminButtons link="/admin/day_of_event/add_walk_in">
            Add Walk-in
          </AdminButtons>
        </div>
      </section>
    </main>
  );
}
