import {
  getMentors,
  getAmbassadorAssignments,
  getHallwayHostAssignments,
} from "@/actions/mentor";
import AdminMentors from "./ui";

export default async function MentorPage() {
  const mentors = await getMentors(); // fetch from DB
  const ambassadorAssignments = await getAmbassadorAssignments();
  const hallwayHostAssignments = await getHallwayHostAssignments();

  const groupNameByMentorId = new Map<number, string>();
  for (const a of ambassadorAssignments) {
    if (a.mentorId != null && a.groupName) {
      groupNameByMentorId.set(a.mentorId, a.groupName);
    }
  }

  const hallwayLocationByMentorId = new Map<number, string>();
  for (const h of hallwayHostAssignments) {
    if (h.mentorId != null && h.location) {
      hallwayLocationByMentorId.set(h.mentorId, h.location);
    }
  }

  // Build "other mentors in the same group" for ambassadors (grouped by groupId)
  // and for hallway hosts (grouped by hallwayStopId).
  const buildCoMentorMap = <T extends { mentorId: number | null }>(
    assignments: T[],
    keyOf: (a: T) => number | null,
  ) => {
    const byKey = new Map<number, Array<{ mentorId: number; name: string }>>();
    for (const a of assignments) {
      const key = keyOf(a);
      if (key == null || a.mentorId == null) continue;
      const name = `${(a as any).fName ?? ""} ${(a as any).lName ?? ""}`.trim();
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push({ mentorId: a.mentorId, name });
    }

    const coMentorsByMentorId = new Map<number, string>();
    for (const members of byKey.values()) {
      for (const member of members) {
        const others = members
          .filter((m) => m.mentorId !== member.mentorId)
          .map((m) => m.name)
          .filter(Boolean);
        coMentorsByMentorId.set(member.mentorId, others.join(", "));
      }
    }
    return coMentorsByMentorId;
  };

  const ambassadorCoMentorsByMentorId = buildCoMentorMap(
    ambassadorAssignments,
    (a) => a.groupId,
  );
  const hallwayHostCoMentorsByMentorId = buildCoMentorMap(
    hallwayHostAssignments,
    (a) => a.hallwayStopId,
  );

  const transformedMentors = mentors.map((mentor) => ({
    ...mentor,
    language: mentor.languages || "",
    fName: mentor.fName || "",
    lName: mentor.lName || "",
    email: mentor.email || "",
    job: mentor.job || "",
    tshirtSize: mentor.tshirtSize || "",
    gradYear: mentor.gradYear || 0,
    phoneNum: mentor.phoneNum || "",
    trainingDay: mentor.trainingDay || "",
    pizzaType: mentor.pizzaType || "",
    pastMentor: mentor.pastMentor ?? null,
    interestsInvolvement: mentor.interestsInvolvement ?? null,
    assignedGroup: groupNameByMentorId.get(mentor.mentorId) ?? "",
    assignedHallway: hallwayLocationByMentorId.get(mentor.mentorId) ?? "",
    otherMentorsInGroup:
      ambassadorCoMentorsByMentorId.get(mentor.mentorId) ??
      hallwayHostCoMentorsByMentorId.get(mentor.mentorId) ??
      "",
  }));
  return <AdminMentors mentorsData={transformedMentors} />;
}
