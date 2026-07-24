// src/app/admin/routes/page.tsx

import AdminRoutesUI from "./ui";
import {
  getEventOrderPatterns,
  getBlockSchedule,
  getAllTourRoutesWithStops,
  getEventStartTime,
} from "@/actions/routes";
import { getAllHallways } from "@/actions/group";

export default async function AdminRoutesPage() {
  const patterns = await getEventOrderPatterns();
  const blocks = await getBlockSchedule();
  const routes = await getAllTourRoutesWithStops();
  const hallways = await getAllHallways();
  const eventStartTime = await getEventStartTime();

  return (
    <AdminRoutesUI
      patterns={patterns}
      blocks={blocks}
      routes={routes}
      eventStartTime={eventStartTime}
      hallways={hallways.map((h) => ({
        hallwayStopId: h.hallwayStopId,
        location: h.location ?? "",
      }))}
    />
  );
}
