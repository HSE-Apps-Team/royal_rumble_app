"use client";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import AddButton from "../../../components/addButton";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import { addEvent } from "@/actions/other";
import { useState } from "react";
import { useAlert } from "@/app/context/AlertContext";

export default function AdminAddEvent() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [job, setJob] = useState("");
  const [description, setDescription] = useState("");
  const [isRoyalRumble, setIsRoyalRumble] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogoClick = () => {
    router.push("/admin/events");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Event name is required.";
    if (!date) newErrors.date = "Date is required.";
    if (!time.trim()) {
      newErrors.time = "Time is required.";
    } else if (!/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i.test(time.trim())) {
      newErrors.time = "Time must be in HH:MM AM/PM format.";
    }
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!job) newErrors.job = "Please select who this event is assigned to.";
    if (!description.trim()) newErrors.description = "Description is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClick = async () => {
    if (!validate()) return;

    try {
      const event_return = await addEvent({
        name,
        date,
        time,
        location,
        job,
        description,
        isRoyalRumble,
      });

      if (!event_return.success) {
        throw new Error("Failed to add event");
      } else {
        showAlert(
          `Event ${event_return.name} on ${event_return.date} for ${event_return.job} added successfully!`,
          "success",
        );
        router.push("/admin/events");
      }
    } catch (error) {
      showAlert(`Error adding event: ${name}`, "danger");
    }
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Add New Event</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <section className="add-form">
        <div className="edit-user-form">
          <div className="form-row">
            <label className="form-label">Event Name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.name ? " is-invalid" : ""}`}
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
          <div className="form-row">
            <label className="form-label">Location:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.location ? " is-invalid" : ""}`}
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
          <div className="form-row checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={isRoyalRumble}
                onChange={(e) => setIsRoyalRumble(e.target.checked)}
              />
              Official Royal Rumble Event?
            </label>
          </div>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <div className="invalid-feedback d-block">
                {errors.description}
              </div>
            )}
          </div>
          <label className="form-label">Assign To:</label>

          <div style={{ width: "90%", marginTop: "20px" }}>
            <div className="form-container" style={{ margin: "0px" }}>
              <form className="manual-add-form">
                <div className="form-row checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="mentorType"
                      value="ambassador"
                      className="checkbox-input"
                      onChange={() => setJob("AMBASSADOR")}
                    />
                    Ambassador
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="mentorType"
                      value="hallwayHost"
                      className="checkbox-input"
                      onChange={() => setJob("HALLWAY HOST")}
                    />
                    Hallway Host
                  </label>
                </div>
                <div className="form-row checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="mentorType"
                      value="all"
                      className="checkbox-input"
                      onChange={() => setJob("ALL")}
                    />
                    All
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="mentorType"
                      value="spirit"
                      className="checkbox-input"
                      onChange={() => setJob("CCA CONVOS")}
                    />
                    CCA Convos
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="mentorType"
                      value="utility"
                      className="checkbox-input"
                      onChange={() => setJob("UTILITY SQUAD")}
                    />
                    Utility
                  </label>
                </div>
              </form>
              {errors.job && (
                <div className="invalid-feedback d-block">{errors.job}</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="add-button-align">
        <AddButton onClick={handleAddClick} style={{ fontSize: "30px" }}>
          Add
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "30px", fontSize: "30px" }}
          ></i>
        </AddButton>
      </div>
    </main>
  );
}
