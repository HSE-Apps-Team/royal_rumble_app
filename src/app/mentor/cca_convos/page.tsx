import CCAConvosUI from "./ui";
import {
  getMentorById,
  getCCAConvosEvents,
} from "../../../../src/actions/mentor";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
const DEV_MODE = process.env.DEV_MODE === "true";

export default async function CCAConvosHomepage() {
  const session = await auth();
  const studentId = !DEV_MODE ? session?.user?.id : "100004";

  const mentorsData = await getMentorById(Number(studentId));
  const ccaConvosEvents = await getCCAConvosEvents();

  return (
    <CCAConvosUI
      mentorsData={mentorsData}
      ccaConvosEvents={ccaConvosEvents}
    />
  );
}
