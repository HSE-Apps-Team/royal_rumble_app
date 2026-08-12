"use client";

import { useRouter } from "next/navigation";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import AdminButtons from "../../components/adminButtons";
import "../../css/admin.css";
import "../../css/logo+login.css";

export default function DayOfEventHomepage() {
  const router = useRouter();

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Day of Event</h1>
      </header>

      <button className="back-button" onClick={() => router.push("/admin")}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <section
        className="admin-button-box"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "50px",
        }}
      >
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
