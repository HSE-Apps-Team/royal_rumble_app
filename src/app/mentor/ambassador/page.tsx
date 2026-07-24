import { getMentorById, getAmbassadorEvents } from "@/src/actions/mentor";
import {
  getGroupByGroupId,
  getGroupIdByMentorId,
  getMentorsByGroupId,
  getAttendeesByGroupId,
} from "@/src/actions/group";
import AmbassadorHomepageUI from "./ui";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
const DEV_MODE = process.env.DEV_MODE === "true";

export default async function AmbassadorHomepage() {
  const session = await auth();
  const studentId = !DEV_MODE ? session?.user?.id : "100001";

  const mentorsData = await getMentorById(Number(studentId));
  const ambassadorEvents = await getAmbassadorEvents();

  const groupId = await getGroupIdByMentorId(Number(studentId));
  const groupDetails = groupId != null ? await getGroupByGroupId(groupId) : null;
  const groupMentorsData = groupId != null ? await getMentorsByGroupId(groupId) : [];
  const groupAttendees = groupId != null ? await getAttendeesByGroupId(groupId) : [];

  const groupMentors = groupMentorsData.map((mentor) => ({
    mentorId: mentor.mentor_id,
    fName: mentor.fname,
    lName: mentor.lname,
  }));

  return (
    <AmbassadorHomepageUI
      mentorsData={mentorsData}
      ambassadorEvents={ambassadorEvents}
      groupDetails={groupDetails}
      groupMentors={groupMentors}
      groupAttendees={groupAttendees}
    />
  );
}
