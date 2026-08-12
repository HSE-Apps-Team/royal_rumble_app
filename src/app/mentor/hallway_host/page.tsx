import HallwayHostHomepageUI from "./ui";
import {
  getMentorById,
  getHallwayHostEvents,
} from "../../../../src/actions/mentor";
import {
  getHallwayIdByMentorId,
  getMentorsByHallwayId,
} from "../../../../src/actions/group";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
const DEV_MODE = process.env.DEV_MODE === "true";

export default async function HallwayHostHomepage() {
  const session = await auth();
  const studentId = !DEV_MODE ? session?.user?.id : "100002";

  const mentorsData = await getMentorById(Number(studentId));
  const hallwayHostEvents = await getHallwayHostEvents();

  const hallwayId = await getHallwayIdByMentorId(Number(studentId));
  const hallwayMentors = await getMentorsByHallwayId(Number(hallwayId));

  return (
    <HallwayHostHomepageUI
      mentorsData={mentorsData}
      hallwayHostEvents={hallwayHostEvents}
      hallwayMentors={hallwayMentors}
    />
  );
}
