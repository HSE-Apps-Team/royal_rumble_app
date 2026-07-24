import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import AdminButtons from "../../components/adminButtons";
import "../../css/admin.css";
import "../../css/logo+login.css";

export default function AdminEdit() {
  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Edit Information</h1>
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
        <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
          <AdminButtons link="/admin/edit/admin">Admin</AdminButtons>
          <AdminButtons link="/admin/edit/mentor">Mentor</AdminButtons>
          <AdminButtons link="/admin/edit/attendee">Attendees</AdminButtons>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            margin: "30px",
          }}
        >
          <AdminButtons link="/admin/edit/general_info">
            General Information
          </AdminButtons>
          <AdminButtons link="/admin/edit/training">Events</AdminButtons>
          <AdminButtons link="/admin/edit/all_groups">All Groups</AdminButtons>
        </div>
      </section>
    </main>
  );
}
