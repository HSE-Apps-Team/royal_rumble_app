"use client";
import type { Metadata } from "next";
import { useRouter} from "next/navigation";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import AdminButtons from "../../components/adminButtons";
import "../../css/admin.css";
import "../../css/logo+login.css";

export default function AdminAdd() {

  const router = useRouter();
      const handleLogoClick = () => {
          router.push("/admin");
      };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Add New</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <section className="admin-button-box" style={{ display: "flex", flexDirection: "column",
                                                     alignItems: "center", margin: "30px" }}>

        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
          <AdminButtons link="/admin/add/admin">Admin</AdminButtons>
          <AdminButtons link="/admin/add/mentor">Mentor</AdminButtons>
          <AdminButtons link="/admin/add/attendee">Attendees</AdminButtons>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "20px", margin: "30px" }}>
          <AdminButtons link="/admin/add/custom_group">Custom Group</AdminButtons>
          <AdminButtons link="/admin/add/event">Event</AdminButtons>
        </div>
      </section>
    </main>
  );
}
