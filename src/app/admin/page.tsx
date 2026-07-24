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

      <section
        className="admin-button-box"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "50px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", gap: "20px", margin: "20px" }}>
          <AdminButtons link="/admin/admin">Admin</AdminButtons>
          <AdminButtons link="/admin/mentor">Mentor</AdminButtons>
          <AdminButtons link="/admin/attendees">Attendees</AdminButtons>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "20px", margin: "20px" }}>
          <AdminButtons link="/admin/upload">Upload</AdminButtons>
          <AdminButtons link="/admin/attendance">Attendance</AdminButtons>
          <AdminButtons link="/admin/events">Events</AdminButtons>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "20px", margin: "20px" }}>
          <AdminButtons link="/admin/all_groups">All Groups</AdminButtons>
          <AdminButtons link="/admin/routes">Routes</AdminButtons>
          <AdminButtons link="/admin/editContent">Edit Content</AdminButtons>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "20px", margin: "20px" }}>
          <AdminButtons link="/admin/reset">Reset Tables</AdminButtons>
        </div>
      </section>
    </main>
  );
}
