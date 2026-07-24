import AdminAllGroups from "./ui";
import {
  getAllGroups,
  getNullGroupAttendees,
  getNullGroupMentors,
  getNullHallwayMentors,
} from "@/actions/group";
import { getAllHallways } from "@/actions/mentor";
import { get } from "http";

export default async function AdminPage() {
  const attendeeGroups = await getAllGroups(); // fetch from DB
  const transformedAttendeeGroups = attendeeGroups.map((group) => ({
    group_id: group.group_id,
    name: group.name,
    route_num: group.route_num,
    event_order: String(group.event_order),
    attendees: group.attendees.map((f) => ({
      attendee_id: f.attendee_id,
      name: f.name,
    })),
    mentors: group.mentors.map((m) => ({
      mentor_id: m.mentor_id,
      name: m.name,
    })),
  }));

  const hallwayGroupsData = await getAllHallways(); // fetch from DB
  const hallwayGroups = hallwayGroupsData.map((group) => ({
    ...group,
    location: group.location ?? "",
  }));

  {
    /* Unassigned Attendee Group
  ==================================== */
  }
  interface GroupDetail {
    group_id: number | "Unassigned";
    name: string;
    route_num: number;
    event_order: string;
    attendees: Array<{ attendee_id: string; name: string }>;
    mentors: Array<{ mentor_id: string; name: string }>;
  }

  const nullGroupAttendees = await getNullGroupAttendees();
  const nullGroupMentors = await getNullGroupMentors();

  const unassignedGroup: GroupDetail[] = [{
    group_id: "Unassigned",
    name: "Unassigned",
    route_num: 0,
    event_order: "",
    attendees: nullGroupAttendees.map((f) => ({
      attendee_id: f.attendeeId.toString(),
      name: `${f.fName || ""} ${f.lName || ""}`.trim(),
    })),
    mentors: nullGroupMentors.map((m) => ({
      mentor_id: m.mentorId.toString(),
      name: `${m.fName || ""} ${m.lName || ""}`.trim(),
    })),
  }];

  {
    /* End of Unassigned Attendee Group
==================================== */
  }
  {
    /* Unassigned Hallway Group
  ==================================== */
  }
  interface hallwayDetail {
    hallwayStopId: number;
    location: string;
    mentors: Array<{ mentor_id: string; name: string }>;
  }

  const nullHallwayMentors = await getNullHallwayMentors();
  const hallwayMap = new Map<string, hallwayDetail>();

  // initialize group
  hallwayMap.set("Unassigned", {
    hallwayStopId: -1,
    location: "Unassigned",
    mentors: nullHallwayMentors.map((m) => ({
      mentor_id: m.mentorId.toString(),
      name: `${m.fName || ""} ${m.lName || ""}`.trim(),
    })),
  });

  const unassignedHallway = Array.from(hallwayMap.values());
  {
    /* End of Unassigned Hallway Group
==================================== */
  }
  return (
    <AdminAllGroups
      attendeeGroups={[...unassignedGroup, ...transformedAttendeeGroups]}
      hallwayGroups={[...unassignedHallway, ...hallwayGroups]}
    />
  );
}
