"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import LogoButton from "../../../../components/logoButton";
import LoginButton from "../../../../components/loginButton";
import SaveButton from "../../../../components/saveButton";
import BackButton from "@/app/components/backButton";
import "../../../../css/admin.css";
import "../../../../css/logo+login.css";
import { useAlert } from "@/app/context/AlertContext";

import { getEventById, updateEventByID } from "@/actions/other";
import { getAllJobs } from "@/actions/job";

export default function AdminEditEventsUI({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const eventId = Number(params.id);
  const { showAlert } = useAlert();

  const [job, setJob] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [hasSecondDate, setHasSecondDate] = useState(false);
  const [date2, setDate2] = useState("");
  const [time2, setTime2] = useState("");
  const [location, setLocation] = useState("");

  const [currentJob, setCurrentJob] = useState("");
  const [jobs, setJobs] = useState<Array<{ dbJob: string; label: string }>>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAllJobs().then(setJobs);
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      const event = await getEventById(eventId);
      setName(event.name ?? "");
      setDate(event.date ?? "");
      setTime(event.time ?? "");
      setDate2(event.date2 ?? "");
      setTime2(event.time2 ?? "");
      setHasSecondDate(Boolean(event.date2));
      setLocation(event.location ?? "");
      setJob(event.job ?? "");
      setDescription(event.description ?? "");
      setCurrentJob(event.job ?? "");
    };
    loadEvent();
  }, [eventId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Event name is required.";
    if (!date) newErrors.date = "Date is required.";
    if (!time.trim()) {
      newErrors.time = "Time is required.";
    } else if (!/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i.test(time.trim())) {
      newErrors.time = "Time must be in HH:MM AM/PM format.";
    }
    if (hasSecondDate) {
      if (!date2) newErrors.date2 = "Second date is required.";
      if (!time2.trim()) {
        newErrors.time2 = "Second time is required.";
      } else if (!/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i.test(time2.trim())) {
        newErrors.time2 = "Time must be in HH:MM AM/PM format.";
      }
    }
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!job) newErrors.job = "Please select a job.";
    if (!description.trim()) newErrors.description = "Description is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await updateEventByID(
        eventId,
        {
          name: name,
          date: date,
          time: time,
          date2: hasSecondDate ? date2 : null,
          time2: hasSecondDate ? time2 : null,
          location: location,
          job: job,
          description: description,
        },
        currentJob,
      );
      showAlert(`Event ${name} updated successfully!`, "success");
      router.push("/admin/events");
    } catch (error) {
      showAlert(`Error updating event: ${name}`, "danger");
      setIsSubmitting(false);
    }
  };

  const contentBoxStyle = {
    border: "5px solid var(--primaryRed)",
    padding: "16px",
    margin: "15px 50px",
    height: "auto",
    color: "var(--textBlack)",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    textAlign: "left" as const,
    overflow: "auto" as const,
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Edit Event - {name}</h1>
      </header>

      <BackButton href="/admin/events" />

      <div style={contentBoxStyle}>
        <div className="edit-user-form">
          <div className="form-row">
            <label className="form-label">Event name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.name ? " is-invalid" : ""}`}
                placeholder="Event Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <div className="invalid-feedback d-block">{errors.name}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Date:</label>
            <div>
              <input
                type="date"
                className={`form-input${errors.date ? " is-invalid" : ""}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <div className="invalid-feedback d-block">{errors.date}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Time:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.time ? " is-invalid" : ""}`}
                placeholder="HH:MM AM/PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              {errors.time && (
                <div className="invalid-feedback d-block">{errors.time}</div>
              )}
            </div>
          </div>
          <div className="form-row checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={hasSecondDate}
                onChange={(e) => {
                  setHasSecondDate(e.target.checked);
                  if (!e.target.checked) {
                    setDate2("");
                    setTime2("");
                  }
                }}
              />
              Offer a second date/time (students pick either one; same event, same attendance)
            </label>
          </div>
          {hasSecondDate && (
            <>
              <div className="form-row">
                <label className="form-label">Date (option 2):</label>
                <div>
                  <input
                    type="date"
                    className={`form-input${errors.date2 ? " is-invalid" : ""}`}
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                  />
                  {errors.date2 && (
                    <div className="invalid-feedback d-block">{errors.date2}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label className="form-label">Time (option 2):</label>
                <div>
                  <input
                    type="text"
                    className={`form-input${errors.time2 ? " is-invalid" : ""}`}
                    placeholder="HH:MM AM/PM"
                    value={time2}
                    onChange={(e) => setTime2(e.target.value)}
                  />
                  {errors.time2 && (
                    <div className="invalid-feedback d-block">{errors.time2}</div>
                  )}
                </div>
              </div>
            </>
          )}
          <div className="form-row">
            <label className="form-label">Location:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.location ? " is-invalid" : ""}`}
                placeholder="Event Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              {errors.location && (
                <div className="invalid-feedback d-block">
                  {errors.location}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Job:</label>
            <div>
              <select
                className={`form-input${errors.job ? " is-invalid" : ""}`}
                aria-label="Default select example"
                onChange={(e) => setJob(e.target.value)}
                value={job || ""}
              >
                {job === "" ? (
                  <option disabled value="">
                    Select Job
                  </option>
                ) : null}
                <option value="ALL">ALL</option>
                {jobs.map((j) => (
                  <option key={j.dbJob} value={j.dbJob}>
                    {j.label}
                  </option>
                ))}
              </select>
              {errors.job && (
                <div className="invalid-feedback d-block">{errors.job}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Description:</label>
            <div>
              <textarea
                className={`form-input-large${errors.description ? " is-invalid" : ""}`}
                rows={2}
                onInput={(e) => {
                  const textarea = e.currentTarget;
                  textarea.style.height = "auto";
                  textarea.style.height = textarea.scrollHeight + "px";
                }}
                placeholder="Event Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <div className="invalid-feedback d-block">
                  {errors.description}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <SaveButton onClick={handleSave} disabled={isSubmitting}>
          Save
        </SaveButton>
      </div>
    </main>
  );
}
