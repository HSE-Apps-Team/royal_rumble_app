"use client";

import React from "react";
import ViewDropdown from "./viewDropdown";
import InfoTable from "./infoTable";
import RouteProgress from "./routeProgress";

export interface ScheduleStop {
  stopOrder: number;
  location: string | null;
  durationMinutes: number;
  hallwayStopId: number;
  present: boolean;
}

export interface ScheduleBlock {
  blockName: string;
  startTime: string;
  durationMinutes?: number;
  stops: ScheduleStop[];
  hallwayStopId: number | null;
  present: boolean;
}

export interface GroupSchedule {
  groupId: number;
  groupName: string;
  routeNum: number | null;
  schedule: ScheduleBlock[];
}

export interface GroupDetail {
  group_id: number;
  name: string;
  route_num: number;
  event_order: string;
  attendees: Array<{ attendee_id: string; name: string }>;
  mentors: Array<{ mentor_id: string; name: string }>;
  schedule?: GroupSchedule | null;
}

// Renders one group's full info (route #, event order, live route/tour
// progress, mentors + attendees tables) inside a single always-expanded
// ViewDropdown accordion. Shared by the day-of-event "Attendee Lost?" and
// "Find Group" lookups so both stay in sync with how group detail is
// displayed and computed.
export default function GroupDetailAccordion({ groupDetail }: { groupDetail: GroupDetail }) {
  return (
    <ViewDropdown
      key={groupDetail.group_id}
      header={`Group: ${groupDetail.name}`}
      defaultOpenAll
      sections={[
        {
          sectionId: groupDetail.group_id,
          title: `${groupDetail.name}${
            groupDetail.mentors.length > 0
              ? ` (${groupDetail.mentors.map((m) => m.name).join(", ")})`
              : ""
          }`,
          content: (
            <section>
              <div className="info-pairs">
                <div className="info-pair">
                  <div className="info-label">Route #:</div>
                  <div className="info-value">{groupDetail.route_num}</div>
                </div>
                <div className="info-pair">
                  <div className="info-label">Event Order:</div>
                  <div className="info-value">{groupDetail.event_order}</div>
                </div>
              </div>

              {groupDetail.schedule && groupDetail.schedule.schedule.length > 0 && (
                <>
                  <label className="info-label" style={{ marginTop: "30px" }}>
                    Route Progress:
                  </label>
                  <RouteProgress
                    bordered={false}
                    blocks={groupDetail.schedule.schedule.map((block, blockIndex) => ({
                      key: String(blockIndex),
                      label: block.blockName,
                      present:
                        block.blockName.toLowerCase() === "tour"
                          ? block.stops.length > 0 && block.stops.every((s) => s.present)
                          : block.present,
                      isTour: block.blockName.toLowerCase() === "tour",
                      stops: block.stops.map((stop) => ({
                        key: String(stop.hallwayStopId),
                        label: stop.location ?? "Unknown",
                        present: stop.present,
                      })),
                    }))}
                  />
                </>
              )}

              <label className="info-label" style={{ marginTop: "30px" }}>
                Mentors:
              </label>
              <InfoTable
                headers={["Mentor Name", "Student ID"]}
                data={groupDetail.mentors.map((m) => [m.name, m.mentor_id])}
              />

              <label className="info-label" style={{ marginTop: "30px" }}>
                Attendees:
              </label>
              <InfoTable
                headers={["Attendee Name", "Student ID"]}
                data={groupDetail.attendees.map((f) => [f.name, f.attendee_id])}
              />
            </section>
          ),
        },
      ]}
    />
  );
}
