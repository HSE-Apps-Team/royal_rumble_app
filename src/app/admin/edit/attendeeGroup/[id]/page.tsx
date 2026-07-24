// src/app/admin/edit/freshmenGroup/[id]/page.tsx

import EditFreshmenGroupUI from "./ui";
import {
  getGroupByGroupId,
  getMentorsByGroupId,
  getFreshmenByGroupId,
  getNullGroupFreshmen,
  getNullGroupMentors,
} from "@/actions/group";
import { getEventOrderPatterns } from "@/actions/routes";

export default async function EditFreshmenGroupPage({
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
    const freshmenData = await getNullGroupFreshmen();
    const mentorData = await getNullGroupMentors();

    const sanitizedFreshmenData = freshmenData.map((freshman) => ({
      ...freshman,
      fName: freshman.fName ?? "",
      lName: freshman.lName ?? "",
    }));

    const sanitizedMentorData = mentorData.map((mentor) => ({
      ...mentor,
      mentor_id: mentor.mentorId ?? 0,
      fname: mentor.fName ?? "",
      lname: mentor.lName ?? "",
    }));

    return (
      <EditFreshmenGroupUI
        groupData={groupData}
        freshmenData={sanitizedFreshmenData}
        mentorData={sanitizedMentorData}
        orders={orders}
      />
    );
  }

  const numericId = Number(id);
  const groupData = await getGroupByGroupId(numericId);
  const freshmenData = await getFreshmenByGroupId(numericId);
  const mentorData = await getMentorsByGroupId(numericId);

  const sanitizedFreshmenData = freshmenData.map((freshman) => ({
    ...freshman,
    fName: freshman.fName ?? "",
    lName: freshman.lName ?? "",
    tshirtSize: freshman.tshirtSize ?? "",
    email: freshman.email ?? "",
    primaryLanguage: freshman.primaryLanguage ?? "",
    interests: freshman.interests ?? "",
    healthConcerns: freshman.healthConcerns ?? "",
  }));

  return (
    <EditFreshmenGroupUI
      groupData={groupData}
      freshmenData={sanitizedFreshmenData}
      mentorData={mentorData}
      orders={orders}
    />
  );
}
