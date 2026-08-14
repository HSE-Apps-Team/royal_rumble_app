import InfoBox from "../../components/infoBox";
import MentorButtons from "../../components/mentorButtons";
import NavButton from "../../components/addButton";
import MobileNav from "../../components/MobileNav";
import InfoTable from "../../components/infoTable";
import EditableContent from "../../components/EditableContent";
import { formatEventDates } from "@/lib/formatEventDates";
import "../../css/mentor.css";
import "../../css/logo+login.css";
import "../../css/mobile-nav.css";

export default function AmbassadorUI({
  mentorsData,
  ambassadorEvents,
  groupDetails,
  groupMentors,
  groupAttendees,
  possibleAttendees,
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
    date2?: string | null;
    time2?: string | null;
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
  groupAttendees: Array<{
    attendeeId: number;
    fName: string | null;
    lName: string | null;
    interests: string | null;
    tshirtSize: string | null;
  }>;
  possibleAttendees: Array<{
    freshmenId: number | null;
    fName: string | null;
    lName: string | null;
  }>;
}) {
  return (
    <>
      <div className="nav-buttons">
        <NavButton
          href="/"
          style={{
            width: "90px",
            height: "40px",
            padding: "5px 0px",
            fontSize: "15px",
          }}
        >
          Home
        </NavButton>
        <NavButton
          href="/mentor/ambassador"
          style={{
            width: "140px",
            height: "40px",
            padding: "5px 0px",
            fontSize: "15px",
          }}
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
            <MentorButtons link="/mentor/ambassador/route">Route</MentorButtons>
          </div>

          <section className="mentor-info-box">
            <InfoBox headerText="Group Details">
              <section>
                <div className="info-pairs">
                  <div className="info-pair">
                    <div className="info-label">Group:</div>
                    <div className="info-value">{groupDetails.name}</div>
                  </div>
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
                    <div className="info-label">Registered Attendees:</div>
                    <InfoTable
                      headers={["Name", "Interests", "T-Shirt Size"]}
                      data={groupAttendees.map((attendee) => [
                        `${attendee.fName} ${attendee.lName}`,
                        attendee.interests ?? "",
                        attendee.tshirtSize ?? "",
                      ])}
                    />
                  </div>
                  {possibleAttendees.length > 0 && (
                    <div className="info-pairs">
                      <div className="info-label">Possible Attendees:</div>
                      <InfoTable
                        headers={["Name"]}
                        data={possibleAttendees.map((attendee) => [
                          `${attendee.fName} ${attendee.lName}`,
                        ])}
                      />
                    </div>
                  )}
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
            headers={["Event", "Date(s)", "Description"]}
            data={ambassadorEvents.map((event) => [
              event.name ?? "N/A",
              formatEventDates(event),
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
