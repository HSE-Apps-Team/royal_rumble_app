// src/app/admin/edit/attendeeGroup/[id]/page.tsx

import EditAttendeeGroupUI from "./ui";
import {
  getGroupByGroupId,
  getMentorsByGroupId,
  getAttendeesByGroupId,
  getNullGroupAttendees,
  getNullGroupMentors,
} from "@/actions/group";
import { getEventOrderPatterns } from "@/actions/routes";

export default async function EditAttendeeGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rawPatterns = await getEventOrderPatterns();
  const orders = rawPatterns.map((p) => p.blockOrder);

  if (id.toLowerCase() === "unassigned") {
    const groupData = {
      groupId: null as number | null,
      name: "Unassigned",
      routeNum: null,
      eventOrder: null,
    };
    const attendeeData = await getNullGroupAttendees();
    const mentorData = await getNullGroupMentors();

    const sanitizedAttendeeData = attendeeData.map((attendee) => ({
      ...attendee,
      fName: attendee.fName ?? "",
      lName: attendee.lName ?? "",
    }));

    const sanitizedMentorData = mentorData.map((mentor) => ({
      ...mentor,
      mentor_id: mentor.mentorId ?? 0,
      fname: mentor.fName ?? "",
      lname: mentor.lName ?? "",
    }));

    return (
      <EditAttendeeGroupUI
        groupData={groupData}
        attendeeData={sanitizedAttendeeData}
        mentorData={sanitizedMentorData}
        orders={orders}
      />
    );
  }

  const numericId = Number(id);
  const groupData = await getGroupByGroupId(numericId);
  const attendeeData = await getAttendeesByGroupId(numericId);
  const mentorData = await getMentorsByGroupId(numericId);

  const sanitizedAttendeeData = attendeeData.map((attendee) => ({
    ...attendee,
    fName: attendee.fName ?? "",
    lName: attendee.lName ?? "",
    tshirtSize: attendee.tshirtSize ?? "",
    primaryLanguage: attendee.primaryLanguage ?? "",
    interests: attendee.interests ?? "",
    healthConcerns: attendee.healthConcerns ?? "",
  }));

  return (
    <EditAttendeeGroupUI
      groupData={groupData}
      attendeeData={sanitizedAttendeeData}
      mentorData={mentorData}
      orders={orders}
    />
  );
}
