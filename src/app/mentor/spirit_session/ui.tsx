import InfoBox from "../../components/infoBox";
import InfoTable from "../../components/infoTable";
import EditableContent from "../../components/EditableContent";
import NavButton from "../../components/addButton";
import MobileNav from "../../components/MobileNav";
import "../../css/mentor.css";
import "../../css/logo+login.css";
import "../../css/mobile-nav.css";

export default function SpiritSessionUI({
  mentorsData,
  spiritSessionEvents,
}: {
  mentorsData: {
    mentorId: number;
    fName: string | null;
    lName: string | null;
    email: string | null;
    job: string | null;
    tshirtSize: string | null;
    gradYear: number | null;
    languages: string | null;
    phoneNum: string | null;
    trainingDay: string | null;
    pizzaType: string | null;
  };
  spiritSessionEvents: Array<{
    eventId: number;
    name: string | null;
    date: string | null;
    time: string | null;
    description: string | null;
  }>;
}) {
  return (
    <>
      <div className="nav-buttons">
        <NavButton href="/"
        style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Home
        </NavButton>
        <NavButton href="/mentor/spirit_session"
        style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Dashboard
        </NavButton>
      </div>
      <MobileNav homeHref="/" dashboardHref="/mentor/spirit_session" />
      <header className="mentor-header">
        <h1 className="mentor-title">
          Welcome, {mentorsData.fName} {mentorsData.lName}!
        </h1>

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
          <h3 className="mentor-subtitle2">{mentorsData.job}</h3>
        </div>
      </header>
      <section className="mentor-info-box">
        <InfoBox headerText="Event Details">
          <InfoTable
            headers={["Event", "Date", "Time", "Description"]}
            data={spiritSessionEvents.map((event) => [
              event.name ?? "N/A",
              event.date ?? "N/A",
              event.time ?? "N/A",
              event.description ?? "N/A",
            ])}
          />
        </InfoBox>
      </section>

      <InfoBox headerText="Additional Instruction">
        <EditableContent contentKey="spirit_session_more_details" />
      </InfoBox>
    </>
  );
}
