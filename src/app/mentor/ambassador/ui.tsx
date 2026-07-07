import InfoBox from "../../components/infoBox";
import MentorButtons from "../../components/mentorButtons";
import NavButton from "../../components/addButton";
import MobileNav from "../../components/MobileNav";
import InfoTable from "../../components/infoTable";
import EditableContent from "../../components/EditableContent";
import "../../css/mentor.css";
import "../../css/logo+login.css";
import "../../css/mobile-nav.css";

export default function AmbassadorUI({
  mentorsData,
  ambassadorEvents,
  groupDetails,
  groupMentors,
  groupFreshmen,
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
  ambassadorEvents: Array<{
    eventId: number;
    name: string | null;
    date: string | null;
    time: string | null;
    description: string | null;
  }>;
  groupDetails: {
    groupId: number;
    name: string;
    routeNum: number | null;
    eventOrder: string | null;
  } | null;
  groupMentors: Array<{
    mentorId: number;
    fName: string | null;
    lName: string | null;
  }>;
  groupFreshmen: Array<{
    freshmenId: number;
    fName: string | null;
    lName: string | null;
    interests: string | null;
    tshirtSize: string | null;
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
        <NavButton href="/mentor/ambassador"
        style = {{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px"}}
        >
          Dashboard
        </NavButton>
      </div>
      <MobileNav homeHref="/" dashboardHref="/mentor/ambassador" />
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

      {groupDetails != null && (
        <>
          <div
            className="mentor-info-box mentor-action-buttons"
            style={{ flexDirection: "row", gap: "20px" }}
          >
            <MentorButtons link="/mentor/ambassador/attendance">
              Attendance
            </MentorButtons>
            <MentorButtons link="/mentor/ambassador/route">
              Route
            </MentorButtons>
          </div>

          <section className="mentor-info-box">
            <InfoBox headerText="Group Details">
              <section>
                <div className="info-pairs">
                  <div className="info-pair">
                    <div className="info-label">Route #:</div>
                    <div className="info-value">{groupDetails.routeNum}</div>
                  </div>
                  <div className="info-pair">
                    <div className="info-label">Event Order:</div>
                    <div className="info-value">
                      {JSON.parse(groupDetails.eventOrder || "[]").join(", ")}
                    </div>
                  </div>
                </div>
                <div className="info-pairs">
                  {/* <div className="info-pair"> */}
                    <div className="info-label">Mentors:</div>
                    <div className="info-value">
                      <ol className="list-group list-group-numbered list-group-horizontal">
                        {groupMentors.map((mentor) => (
                          <li className="list-group-item" key={mentor.mentorId}>
                            {mentor.fName} {mentor.lName}
                          </li>
                        ))}
                      </ol>
                    {/* </div> */}
                  </div>
                  <div className="info-pairs">
                    <div className="info-label">Freshmen:</div>
                    <InfoTable
                      headers={["Name", "Interests", "T-Shirt Size"]}
                      data={groupFreshmen.map((freshman) => [
                        `${freshman.fName} ${freshman.lName}`,
                        freshman.interests ?? "",
                        freshman.tshirtSize ?? "",
                      ])}
                    />
                  </div>
                </div>
              </section>
            </InfoBox>
          </section>
        </>
      )}

      <section className="mentor-info-box">
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
            data={ambassadorEvents.map((event) => [
              event.name ?? "N/A",
              event.date ?? "N/A",
              event.time ?? "N/A",
              event.description ?? "N/A",
            ])}
          />
        </InfoBox>
      </section>

      <InfoBox headerText="Additional Instruction">
        <EditableContent contentKey="ambassador_more_details" />
      </InfoBox>
    </>
  );
}
