"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import AddButton from "../../../components/addButton";
import ContentModal from "../../../components/ContentModal";
import { addFreshman } from "../../../../actions/freshmen";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import { useAlert } from "@/app/context/AlertContext";

interface AddedFreshmanInfo {
  name: string;
  teacher: string | null;
  groupName: string | null;
}

export default function AdminAddFreshman() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [f_name, setf_name] = useState("");
  const [l_name, setl_name] = useState("");
  const [freshmenId, setFreshmenId] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addedInfo, setAddedInfo] = useState<AddedFreshmanInfo | null>(null);

  const handleLogoClick = () => {
    router.push("/admin/freshmen");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!f_name.trim()) newErrors.f_name = "First name is required.";
    if (!l_name.trim()) newErrors.l_name = "Last name is required.";
    if (!freshmenId.trim()) {
      newErrors.freshmenId = "Student ID is required.";
    } else if (!/^\d+$/.test(freshmenId) || parseInt(freshmenId) <= 0) {
      newErrors.freshmenId = "Student ID must be a positive integer.";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;

    try {
      const freshmen_return = await addFreshman({
        f_name: f_name,
        l_name: l_name,
        freshmen_id: Number(freshmenId),
        email,
      });
      if (!freshmen_return.success) {
        throw new Error("Failed to add freshman");
      }
      setAddedInfo({
        name: `${freshmen_return.f_name} ${freshmen_return.l_name}`,
        teacher: freshmen_return.teacher,
        groupName: freshmen_return.groupName,
      });
    } catch (error) {
      console.error(error);
      showAlert(`Failed to add freshman: ${f_name} ${l_name}`, "danger");
    }
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Add New Freshman</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <section className="add-form">
        <div className="edit-user-form">
          <div className="form-row">
            <label className="form-label">First Name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.f_name ? " is-invalid" : ""}`}
                value={f_name}
                onChange={(e) => setf_name(e.target.value)}
              />
              {errors.f_name && (
                <div className="invalid-feedback d-block">{errors.f_name}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Last Name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.l_name ? " is-invalid" : ""}`}
                value={l_name}
                onChange={(e) => setl_name(e.target.value)}
              />
              {errors.l_name && (
                <div className="invalid-feedback d-block">{errors.l_name}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Student ID:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.freshmenId ? " is-invalid" : ""}`}
                value={freshmenId}
                onChange={(e) => setFreshmenId(e.target.value)}
              />
              {errors.freshmenId && (
                <div className="invalid-feedback d-block">
                  {errors.freshmenId}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Email:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.email ? " is-invalid" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="invalid-feedback d-block">{errors.email}</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="add-button-align">
        <AddButton onClick={handleAdd} style={{ fontSize: "30px" }}>
          Add
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "30px", fontSize: "30px" }}
          ></i>
        </AddButton>
      </div>

      <ContentModal
        title="Freshman Added"
        icon="bi bi-check-circle"
        show={!!addedInfo}
        onClose={() => router.push("/admin/freshmen")}
      >
        {addedInfo && (
          <div style={{ fontSize: "18px", lineHeight: "2" }}>
            <div><strong>Name:</strong> {addedInfo.name}</div>
            <div><strong>Teacher:</strong> {addedInfo.teacher ?? "Not found in seminar data"}</div>
            <div><strong>Group:</strong> {addedInfo.groupName ?? "No group assigned"}</div>
          </div>
        )}
      </ContentModal>
    </main>
  );
}
