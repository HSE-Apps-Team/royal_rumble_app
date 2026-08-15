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

  // hallway_stop_data also holds one row per non-Tour block name (e.g.
  // "Leonard", "Gym"), auto-created so ambassadors can mark those blocks
  // reached the same way they mark Tour stops. Those aren't real Tour
  // stops, so exclude them from the "select a stop" dropdown here.
  const blockNames = new Set(blocks.map((b) => b.blockName.toLowerCase()));

  return (
    <AdminRoutesUI
      patterns={patterns}
      blocks={blocks}
      routes={routes}
      eventStartTime={eventStartTime}
      hallways={hallways
        .filter((h) => !blockNames.has((h.location ?? "").toLowerCase()))
        .map((h) => ({
          hallwayStopId: h.hallwayStopId,
          location: h.location ?? "",
        }))}
    />
  );
}
