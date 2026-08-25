import InfoBox from "../../components/infoBox";
import EventCheckInTable from "../../components/EventCheckInTable";
import EditableContent from "../../components/EditableContent";
import NavButton from "../../components/addButton";
import MobileNav from "../../components/MobileNav";
import "../../css/mentor.css";
import "../../css/logo+login.css";
import "../../css/mobile-nav.css";

export default function NonUtilityJobUI({
  homeHref,
  dashboardHref,
  contentKey,
  mentorsData,
  events,
}: {
  homeHref: string;
  dashboardHref: string;
  contentKey: string;
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
  events: Array<{
    eventId: number;
    name: string | null;
    date: string | null;
    time: string | null;
    date2?: string | null;
    time2?: string | null;
    description: string | null;
    attendanceCodeActive: boolean;
    attended: boolean;
  }>;
}) {
  return (
    <>
      <div className="nav-buttons">
        <NavButton
          href={homeHref}
          style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Home
        </NavButton>
        <NavButton
          href={dashboardHref}
          style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Dashboard
        </NavButton>
      </div>
      <MobileNav homeHref={homeHref} dashboardHref={dashboardHref} />
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
          <EventCheckInTable mentorId={mentorsData.mentorId} events={events} />
        </InfoBox>
      </section>

      <InfoBox headerText="Additional Instruction">
        <EditableContent contentKey={contentKey} />
      </InfoBox>
    </>
  );
}
