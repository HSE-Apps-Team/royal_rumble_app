"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoButton from "../../../../components/logoButton";
import LoginButton from "../../../../components/loginButton";
import AddButton from "../../../../components/addButton";
import ContentModal from "../../../../components/ContentModal";
import { addWalkInAttendee } from "../../../../../actions/attendees";
import { getGroupIds } from "../../../../../actions/group";
import "../../../../css/admin.css";
import "../../../../css/logo+login.css";
import { useAlert } from "@/app/context/AlertContext";

interface GroupOption {
  groupId: number;
  name: string;
}

interface AddedInfo {
  name: string;
  groupName: string;
}

export default function AddSophomorePlus() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [attendeeId, setAttendeeId] = useState("");
  const [groupId, setGroupId] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [addedInfo, setAddedInfo] = useState<AddedInfo | null>(null);

  useEffect(() => {
    getGroupIds()
      .then(setGroupOptions)
      .catch((error) => {
        console.error(error);
        showAlert("Failed to load groups", "danger");
      })
      .finally(() => setLoadingGroups(false));
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fName.trim()) newErrors.fName = "First name is required.";
    if (!lName.trim()) newErrors.lName = "Last name is required.";
    if (!attendeeId.trim()) {
      newErrors.attendeeId = "Student ID is required.";
    } else if (!/^\d+$/.test(attendeeId) || parseInt(attendeeId) <= 0) {
      newErrors.attendeeId = "Student ID must be a positive integer.";
    }
    if (!groupId) newErrors.groupId = "Please select a group.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;

    setAdding(true);
    try {
      const result = await addWalkInAttendee({
        f_name: fName,
        l_name: lName,
        attendee_id: Number(attendeeId),
        group_id: Number(groupId),
      });

      if (result.success === true) {
        setAddedInfo({
          name: `${result.f_name} ${result.l_name}`,
          groupName: result.groupName,
        });
      } else if (result.error === "duplicate") {
        showAlert(`Student ID ${attendeeId} is already registered`, "danger");
      } else {
        showAlert("Failed to add attendee", "danger");
      }
    } catch (error) {
      console.error(error);
      showAlert(`Failed to add ${fName} ${lName}`, "danger");
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Add Sophomore and Above</h1>
      </header>

      <button
        className="back-button"
        onClick={() => router.push("/admin/day_of_event/add_walk_in")}
      >
        <i className="bi bi-arrow-left"></i>
      </button>

      <section className="add-form">
        <div className="edit-user-form">
          <div className="form-row">
            <label className="form-label">First Name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.fName ? " is-invalid" : ""}`}
                value={fName}
                onChange={(e) => setFName(e.target.value)}
              />
              {errors.fName && (
                <div className="invalid-feedback d-block">{errors.fName}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Last Name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.lName ? " is-invalid" : ""}`}
                value={lName}
                onChange={(e) => setLName(e.target.value)}
              />
              {errors.lName && (
                <div className="invalid-feedback d-block">{errors.lName}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Student ID:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.attendeeId ? " is-invalid" : ""}`}
                value={attendeeId}
                onChange={(e) => setAttendeeId(e.target.value)}
              />
              {errors.attendeeId && (
                <div className="invalid-feedback d-block">{errors.attendeeId}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Group:</label>
            <div>
              <select
                className={`form-select${errors.groupId ? " is-invalid" : ""}`}
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={loadingGroups}
              >
                <option value="">
                  {loadingGroups ? "Loading groups..." : "Select a group"}
                </option>
                {groupOptions.map((g) => (
                  <option key={g.groupId} value={g.groupId.toString()}>
                    {g.name}
                  </option>
                ))}
              </select>
              {errors.groupId && (
                <div className="invalid-feedback d-block">{errors.groupId}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div
        className="add-button-align"
        style={{ display: "flex", gap: "20px", alignItems: "center", justifyContent: "center" }}
      >
        <AddButton onClick={handleAdd} style={{ fontSize: "30px" }} disabled={adding}>
          {adding ? "Adding..." : "Add"}
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "30px", fontSize: "30px" }}
          ></i>
        </AddButton>
      </div>

      <ContentModal
        title="Attendee Added"
        icon="bi bi-check-circle"
        show={!!addedInfo}
        onClose={() => router.push("/admin/day_of_event/add_walk_in")}
      >
        {addedInfo && (
          <div style={{ fontSize: "18px", lineHeight: "2" }}>
            <div><strong>Name:</strong> {addedInfo.name}</div>
            <div><strong>Group:</strong> {addedInfo.groupName}</div>
          </div>
        )}
      </ContentModal>
    </main>
  );
}
