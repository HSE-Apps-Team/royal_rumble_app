import React from "react";
import AdminEventsUI from "./ui";
import { getAllEvents } from "../../../actions/other";

async function AdminEvents() {
  const allEvents = await getAllEvents();
  const ambassadorEvents = await getAllEvents("AMBASSADOR");
  const hallwayHostEvents = await getAllEvents("HALLWAY HOST");
  const ccaConvosEvents = await getAllEvents("CCA CONVOS");
  const utilityEvents = await getAllEvents("UTILITY SQUAD");
  return (
    <AdminEventsUI
      allEvents={{ events: allEvents }}
      ambassadorEvents={{ events: ambassadorEvents }}
      hallwayHostEvents={{ events: hallwayHostEvents }}
      ccaConvosEvents={{ events: ccaConvosEvents }}
      utilityEvents={{ events: utilityEvents }}
    />
  );
}

export default AdminEvents;
