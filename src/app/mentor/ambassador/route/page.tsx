// src/app/mentor/ambassador/route/page.tsx

import AmbassadorRouteUI from "./ui";
import { getGroupIdByMentorId } from "@/actions/group";
import { getGroupSchedule } from "@/actions/routes";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
const DEV_MODE = process.env.DEV_MODE === "true";

export default async function AmbassadorRoutePage() {
  const session = await auth();
  const studentId = !DEV_MODE ? session?.user?.id : "100001";

  const groupId = await getGroupIdByMentorId(Number(studentId));
  const schedule = groupId != null ? await getGroupSchedule(groupId) : null;

  return <AmbassadorRouteUI schedule={schedule} groupId={groupId} />;
}
