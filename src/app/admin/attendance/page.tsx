"use client";
import type { Metadata } from "next";
import { useRouter} from "next/navigation";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import AdminButtons from "../../components/adminButtons";
import "../../css/admin.css";
import "../../css/logo+login.css";

export default function AdminAttendance() {

    const router = useRouter();
    const handleLogoClick = () => {
        router.push("/admin");
    };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Attendance</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <section className="admin-button-box" style={{ display: "flex", flexDirection: "column",
                                                     alignItems: "center", margin: "50px"}}>

        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
          <AdminButtons link="/admin/attendance/mentor">Mentor</AdminButtons>
          <AdminButtons link="/admin/attendance/all_groups">All Groups</AdminButtons>
          <AdminButtons link="/admin/attendance/attendees">Attendees</AdminButtons>
        </div>
      </section>
    </main>
  );
}