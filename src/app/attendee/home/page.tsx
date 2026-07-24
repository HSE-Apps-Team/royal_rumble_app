import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import InfoBox from "../../components/infoBox";
import NavButton from "../../components/addButton";
import MobileNav from "../../components/MobileNav";
import "../../css/attendees.css";
import "../../css/logo+login.css";
import "../../css/mobile-nav.css";
import {
  getAttendeeById,
  getAttendeeByIdFromSchoolData,
} from "../../../../src/actions/attendees";
import { getMentorsByGroupId, getGroupByGroupId } from "@/src/actions/group";
import EditableContent from "../../components/EditableContent";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

const DEV_MODE = process.env.DEV_MODE === "true";

export default async function AttendeeHomepage() {
  let studentId: string | undefined;

  if (!DEV_MODE) {
    const session = await auth();
    const job = session?.user?.job;
    if (job === "UNREGISTERED" || !job) {
      return (
        <main className="attendees-container">
          <LogoButton />
          <LoginButton />
          <MobileNav homeHref="/" dashboardHref="/attendee/home" />
          <header className="attendees-header">
            <h1 className="attendees-title">Welcome!</h1>
            <h3 className="check-registration">
              We couldn&apos;t find your registration details.
              <br /> To register <a>Click Here!</a> <br />
              If this is an error, please contact support at
              royalrumble@university.edu
            </h3>
          </header>
        </main>
      );
    }
    studentId = session?.user?.id;
  } else {
    // Fake ID for development
    studentId = "100005";
  }

  if (!studentId) {
    return null;
  }

  const attendeeDetails = await getAttendeeById(Number(studentId));
  const groupMentors = attendeeDetails?.groupId != null
    ? await getMentorsByGroupId(attendeeDetails.groupId)
    : [];
  const groupInfo = attendeeDetails?.groupId != null
    ? await getGroupByGroupId(attendeeDetails.groupId)
    : null;

  if (!attendeeDetails) {
    const attendeeDetailsFromSchoolData = await getAttendeeByIdFromSchoolData(
      Number(studentId),
    );

    return (
      <main className="attendees-container">
        <LogoButton />
         <div className="nav-buttons">
          <NavButton href="/"
          style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
          >
            Home
          </NavButton>
          <NavButton href="/attendee/home"
          style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
          >
            Dashboard
          </NavButton>
        </div>
        <LoginButton />
        <MobileNav homeHref="/" dashboardHref="/attendee/home" />

        <header className="attendees-header">
          <h1 className="attendees-title">
            Welcome {attendeeDetailsFromSchoolData?.fName}{" "}
            {attendeeDetailsFromSchoolData?.lName}!
          </h1>
          <h3 className="check-registration">
            We couldn&apos;t find your registration details.
            <br /> To register <a>Click Here!</a> <br />
            If this is an error, please contact support at
            royalrumble@university.edu
          </h3>
        </header>
      </main>
    );
  }

  return (
    <main className="attendees-container">
      <LogoButton />
      <div className="nav-buttons">
        <NavButton href="/"
        style={{ width: "90px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Home
        </NavButton>
        <NavButton href="/attendee/home"
        style={{ width: "140px", height: "40px", padding: "5px 0px", fontSize: "15px" }}
        >
          Dashboard
        </NavButton>
      </div>
      <LoginButton />
      <MobileNav homeHref="/" dashboardHref="/attendee/home" />

      <header className="attendees-header">
        <h1 className="attendees-title">
          Welcome, {attendeeDetails?.fName} {attendeeDetails?.lName}!
        </h1>
        <h3 className="check-registration">
          You have successfully been registered for Royal Rumble.
        </h3>
      </header>

      <section className="attendees-info-box">
        <InfoBox headerText="Event Information">
          <div
            style={{
              display: "flex",
              color: "var(--primaryBlue)",
              fontWeight: "bold",
              fontSize: "30px",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div>Group:</div>
            <div style={{ color: "var(--textBlack)", fontWeight: "normal" }}>
              {groupInfo ? groupInfo.name : "Unassigned"}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: "var(--primaryBlue)",
              fontWeight: "bold",
              fontSize: "30px",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <div className="info-pair">
              <div className="info-label">Mentors:</div>
              <div className="info-value">
                <ol className="list-group  list-group-horizontal">
                  {groupMentors.map((mentor) => (
                    <li className="list-group-item" key={mentor.mentor_id}>
                      {mentor.fname} {mentor.lname}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div
            style={{
              color: "var(--primaryBlue)",
              fontWeight: "bold",
              fontSize: "30px",
              margin: "20px 0px",
            }}
          >
            General Information:
          </div>

          <div
            style={{
              color: "var(--textBlack)",
              fontWeight: "normal",
              fontSize: "20px",
              margin: "5px 0px 10px",
            }}
          >
            <EditableContent contentKey="freshmen_more_details" />
          </div>
        </InfoBox>
      </section>
    </main>
  );
}
