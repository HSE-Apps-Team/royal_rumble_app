"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import ViewDropdown from "../../components/viewDropdown";
import CheckBoxTable from "../../components/checkBoxTable";
import AddButton from "../../components/addButton";
import "../../css/admin.css";
import "../../css/logo+login.css";
import { deleteEvent } from "../../../../src/actions/other";
import { formatEventDates } from "@/lib/formatEventDates";

interface Events {
  events: Array<{
    eventId: number;
    name: string;
    date: string;
    time: string;
    date2: string | null;
    time2: string | null;
    location: string;
    job: string;
    description: string | null;
    mentors: Array<{
      fName: string;
      lName: string;
      mentor_id: number;
      status: boolean;
    }>;
  }>;
}

interface AdminEventsUIProps {
  allEvents: Events;
  eventsByJob: Record<string, Events["events"]>;
  jobs: Array<{ dbJob: string; label: string }>;
}

export default function AdminEventsUI({
  allEvents,
  eventsByJob,
  jobs,
}: AdminEventsUIProps) {
  const router = useRouter();

  const [events, setEvents] = useState(allEvents);

  useEffect(() => {
    setEvents(allEvents);
  }, [allEvents]);

  const handleLogoClick = () => {
    router.push("/admin");
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title" style={{ marginBottom: "30px" }}>
          All Event Information
        </h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      {/* --- FILTER RADIOS --- */}
      <div style={{ width: "85%", marginTop: "20px" }}>
        <div className="form-container" style={{ margin: "0px" }}>
          <form className="manual-add-form">
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="groupType"
                  value="all"
                  className="checkbox-input"
                  onClick={() => setEvents(allEvents)}
                  defaultChecked
                />
                All
              </label>

              {jobs.map((job) => (
                <label className="checkbox-label" key={job.dbJob}>
                  <input
                    type="radio"
                    name="groupType"
                    value={job.dbJob}
                    className="checkbox-input"
                    onClick={() =>
                      setEvents({ events: eventsByJob[job.dbJob] ?? [] })
                    }
                  />
                  {job.label}
                </label>
              ))}
            </div>
          </form>
        </div>
      </div>

      <div
        style={{
          width: "87%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: "20px",
          fontSize: "15px",
        }}
      >
        <AddButton
          onClick={() => router.push("/admin/add/event")}
          style={{ fontSize: "25px" }}
        >
          Add Event
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "30px", fontSize: "30px" }}
          />
        </AddButton>
      </div>

      <ViewDropdown
        header="Event Information"
        editLink="/admin/edit/event"
        sections={events.events.map((event) => ({
          title: event.name + " - (" + event.job + ")",
          sectionId: event.eventId,
          content: (
            <section key={event.eventId} className="info-section">
              <div className="info-pairs">
                <div className="info-pair">
                  <div className="info-label">Date(s):</div>
                  <div className="info-value">{formatEventDates(event)}</div>
                </div>

                <div className="info-pair">
                  <div className="info-label">Location:</div>
                  <div className="info-value">{event.location}</div>
                </div>

                <div className="info-pair">
                  <div className="info-label">Assigned to:</div>
                  <div className="info-value">{event.job}</div>
                </div>
              </div>

              <label className="info-label">Description:</label>
              <div className="info-value">
                {event.description || "No description"}
              </div>

              <label className="info-label" style={{ marginTop: "30px" }}>
                Mentors:
              </label>

              <CheckBoxTable
                headers={["Mentor Name", "Student ID"]}
                data={event.mentors.map(
                  (m: { fName: string; lName: string; mentor_id: number }) => [
                    `${m.fName} ${m.lName}`,
                    String(m.mentor_id),
                  ],
                )}
                status={event.mentors.map((m: { status: boolean }) => m.status)}
                rowIds={event.mentors.map(
                  (m: { mentor_id: number }) => m.mentor_id,
                )}
              />
            </section>
          ),
        }))}
        deleteAction={async (id) => {
          const result = await deleteEvent(Number(id));

          if (result.success) {
            router.refresh();
          }

          return { success: result.success };
        }}
      />
    </main>
  );
}
