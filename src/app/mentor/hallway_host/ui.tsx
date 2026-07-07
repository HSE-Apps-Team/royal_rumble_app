import InfoBox from "../../components/infoBox";
import MentorButtons from "../../components/mentorButtons";
import NavButton from "../../components/addButton";
import MobileNav from "../../components/MobileNav";
import InfoTable from "../../components/infoTable";
import EditableContent from "../../components/EditableContent";
import "../../css/mentor.css";
import "../../css/logo+login.css";
import "../../css/mobile-nav.css";

export default function HallwayHostUI({
  mentorsData,
  hallwayHostEvents,
  hallwayData,
  hallwayMentors,
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
  hallwayHostEvents: Array<{
    eventId: number;
    name: string | null;
    date: string | null;
    time: string | null;
    description: string | null;
  }>;
  hallwayData: {
    hallwayStopId: number;
    location: string | null;
  };
  hallwayMentors: Array<{
    mentor_id: number;
    fname: string | null;
    lname: string | null;
  }>;
}) {
  return (
    <>
     <div className= "nav-buttons">
        <NavButton href="/"
        style = {{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px"}}
        >
          Home
        </NavButton>
        <NavButton href="/mentor/hallway_host"
        style = {{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px"}}
        >
          Dashboard
        </NavButton>
      </div>
      <MobileNav homeHref="/" dashboardHref="/mentor/hallway_host" />
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
      </header>{" "}
      <div className="mentor-info-box">
        <MentorButtons link="/mentor/hallway_host/group_attendance">
          Attendance
        </MentorButtons>
      </div>

      <section className="mentor-info-box" style={{display: "flex", flexDirection: "column",}}>
        <InfoBox headerText="Group Details">
          <section>
            <label className="info-label">Mentors:</label>
            <InfoTable
              headers={["First Name", "Last Name"]}
              data={hallwayMentors.map((m) => [
                String(m.fname),
                String(m.lname),
              ])}
            />
          </section>
        </InfoBox>

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
            headers={["Event", "Date", "Time", "Description"]}
            data={hallwayHostEvents.map((event) => [
              event.name ?? "N/A",
              event.date ?? "N/A",
              event.time ?? "N/A",
              event.description ?? "N/A",
            ])}
          />
        </InfoBox>
      </section>
      <InfoBox headerText="Additional Instruction">
        <EditableContent contentKey="hallway_host_more_details" />
      </InfoBox>
    </>
  );
}
