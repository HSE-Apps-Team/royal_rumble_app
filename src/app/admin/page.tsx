// src/app/admin/page.tsx

import LogoButton from "../components/logoButton";
import LoginButton from "../components/loginButton";
import AdminButtons from "../components/adminButtons";
import "../css/admin.css";
import "../css/logo+login.css";
import { auth } from "@/auth";
import { getAdminById } from "@/src/actions/admin";

export const dynamic = "force-dynamic";
const DEV_MODE = process.env.DEV_MODE === "true";

export default async function AdminHomepage() {
  const session = await auth();
  const adminId = !DEV_MODE ? session?.user?.id : "10000";
  const admin = await getAdminById(Number(adminId));

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">
          Welcome, {admin?.fName} {admin?.lName}!
        </h1>
      </header>

      <section className="admin-button-box admin-button-box-spaced admin-sections">
        {/* Mobile: Day of Event pinned to the very top, Mentor Preview
            directly under it, ahead of everything else. */}
        <div className="admin-mobile-only">
          <div className="admin-section-grid admin-single-col">
            <AdminButtons
              link="/admin/day_of_event"
              className="admin-section-button admin-day-of-event-button"
              staticStyle
            >
              Day of Event
            </AdminButtons>
          </div>
          <div className="admin-section-grid admin-single-col">
            <AdminButtons
              link="/admin/mentor_preview"
              className="admin-section-button admin-mentor-preview-button"
              staticStyle
            >
              Mentor Preview
            </AdminButtons>
          </div>
          <div>
            <div className="admin-section-head">Daily Operations</div>
            <div className="admin-section-grid">
              <AdminButtons link="/admin/attendees" className="admin-section-button">Attendees</AdminButtons>
              <AdminButtons link="/admin/mentor" className="admin-section-button">Mentor</AdminButtons>
              <AdminButtons link="/admin/all_groups" className="admin-section-button">All Groups</AdminButtons>
              <AdminButtons link="/admin/ghost_groups" className="admin-section-button">Ghost Groups</AdminButtons>
              <AdminButtons link="/admin/attendance" className="admin-section-button">Attendance</AdminButtons>
              <AdminButtons link="/admin/events" className="admin-section-button">Events</AdminButtons>
            </div>
          </div>
          <div>
            <div className="admin-section-head">Setup &amp; Configuration</div>
            <div className="admin-section-grid">
              <AdminButtons link="/admin/admin" className="admin-section-button">Admin</AdminButtons>
              <AdminButtons link="/admin/upload" className="admin-section-button">Upload</AdminButtons>
              <AdminButtons link="/admin/routes" className="admin-section-button">Routes</AdminButtons>
              <AdminButtons link="/admin/editContent" className="admin-section-button">Edit Content</AdminButtons>
            </div>
          </div>
          <div className="admin-section-grid admin-single-col">
            <AdminButtons
              link="/admin/reset"
              className="admin-section-button"
              backgroundColor="var(--primaryRed)"
            >
              Reset Tables
            </AdminButtons>
          </div>
        </div>

        {/* Desktop: Day of Event, Mentor Preview, and Reset Tables share one
            "Other" row — quiet the other 90% of the time, still findable. */}
        <div className="admin-desktop-only">
          <div>
            <div className="admin-section-head">Daily Operations</div>
            <div className="admin-section-grid">
              <AdminButtons link="/admin/attendees" className="admin-section-button">Attendees</AdminButtons>
              <AdminButtons link="/admin/mentor" className="admin-section-button">Mentor</AdminButtons>
              <AdminButtons link="/admin/all_groups" className="admin-section-button">All Groups</AdminButtons>
              <AdminButtons link="/admin/ghost_groups" className="admin-section-button">Ghost Groups</AdminButtons>
              <AdminButtons link="/admin/attendance" className="admin-section-button">Attendance</AdminButtons>
              <AdminButtons link="/admin/events" className="admin-section-button">Events</AdminButtons>
            </div>
          </div>
          <div>
            <div className="admin-section-head">Setup &amp; Configuration</div>
            <div className="admin-section-grid">
              <AdminButtons link="/admin/admin" className="admin-section-button">Admin</AdminButtons>
              <AdminButtons link="/admin/upload" className="admin-section-button">Upload</AdminButtons>
              <AdminButtons link="/admin/routes" className="admin-section-button">Routes</AdminButtons>
              <AdminButtons link="/admin/editContent" className="admin-section-button">Edit Content</AdminButtons>
            </div>
          </div>
          <div>
            <div className="admin-section-head">Other</div>
            <div className="admin-section-grid admin-cols-3">
              <AdminButtons
                link="/admin/day_of_event"
                className="admin-section-button admin-day-of-event-button"
                staticStyle
              >
                Day of Event
              </AdminButtons>
              <AdminButtons
                link="/admin/mentor_preview"
                className="admin-section-button admin-mentor-preview-button"
                staticStyle
              >
                Mentor Preview
              </AdminButtons>
              <AdminButtons
                link="/admin/reset"
                className="admin-section-button"
                backgroundColor="var(--primaryRed)"
              >
                Reset Tables
              </AdminButtons>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
