"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import AddButton from "../../../components/addButton";
import { addMentor } from "../../../../actions/mentor";
import { getGroupIds } from "../../../../actions/group";
import { getAllHallways } from "../../../../actions/group";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import BackButton from "@/app/components/backButton";
import { useAlert } from "@/app/context/AlertContext";

export default function AdminAddMentor() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [f_name, setf_name] = useState("");
  const [l_name, setl_name] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [job, setJob] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [hallwayStopId, setHallwayStopId] = useState<string>("");

  const [groups, setGroups] = useState<Array<{ groupId: number; name: string }>>([]);
  const [hallways, setHallways] = useState<Array<{ hallwayStopId: number; location: string | null }>>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getGroupIds().then(setGroups);
    getAllHallways().then(setHallways);
  }, []);

  // Reset assignment when job changes
  useEffect(() => {
    setGroupId("");
    setHallwayStopId("");
  }, [job]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!f_name.trim()) newErrors.f_name = "First name is required.";
    if (!l_name.trim()) newErrors.l_name = "Last name is required.";
    if (!mentorId.trim()) {
      newErrors.mentorId = "Student ID is required.";
    } else if (!/^\d+$/.test(mentorId) || parseInt(mentorId) <= 0) {
      newErrors.mentorId = "Student ID must be a positive integer.";
    }
    if (!graduationYear.trim()) {
      newErrors.graduationYear = "Graduation year is required.";
    } else if (!/^\d{4}$/.test(graduationYear)) {
      newErrors.graduationYear = "Enter a valid 4-digit graduation year.";
    }
    if (!job) newErrors.job = "Job is required.";
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;

    try {
      const mentor_return = await addMentor({
        f_name,
        l_name,
        mentor_id: Number(mentorId),
        graduation_year: Number(graduationYear),
        job,
        email,
        phone_number: phoneNumber,
        group_id: job === "AMBASSADOR" && groupId ? Number(groupId) : null,
        hallway_stop_id: job === "HALLWAY HOST" && hallwayStopId ? Number(hallwayStopId) : null,
      });
      if (!mentor_return.success) {
        throw new Error("Failed to add mentor");
      }
      showAlert(
        `Mentor ${mentor_return.f_name} ${mentor_return.l_name} added successfully!`,
        "success",
      );
      router.push("/admin/mentor");
    } catch {
      showAlert(`Failed to add mentor: ${f_name} ${l_name}`, "danger");
    }
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Add New Mentor</h1>
      </header>

      <BackButton href="/admin/mentor" />

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
                className={`form-input${errors.mentorId ? " is-invalid" : ""}`}
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
              />
              {errors.mentorId && (
                <div className="invalid-feedback d-block">
                  {errors.mentorId}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Graduation Year:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.graduationYear ? " is-invalid" : ""}`}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              />
              {errors.graduationYear && (
                <div className="invalid-feedback d-block">
                  {errors.graduationYear}
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
                <option value="AMBASSADOR">AMBASSADOR</option>
                <option value="HALLWAY HOST">HALLWAY HOST</option>
                <option value="CCA CONVOS">CCA CONVOS</option>
                <option value="UTILITY SQUAD">UTILITY SQUAD</option>
              </select>
              {errors.job && (
                <div className="invalid-feedback d-block">{errors.job}</div>
              )}
            </div>
          </div>

          {/* Conditional group assignment for AMBASSADOR */}
          {job === "AMBASSADOR" && (
            <div className="form-row add-mentor-conditional-row">
              <label className="form-label">Assign to Group:</label>
              <div>
                <select
                  className="form-input"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                >
                  <option value="">— Unassigned —</option>
                  {groups.map((g) => (
                    <option key={g.groupId} value={g.groupId}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Conditional hallway assignment for HALLWAY HOST */}
          {job === "HALLWAY HOST" && (
            <div className="form-row add-mentor-conditional-row">
              <label className="form-label">Assign to Hallway:</label>
              <div>
                <select
                  className="form-input"
                  value={hallwayStopId}
                  onChange={(e) => setHallwayStopId(e.target.value)}
                >
                  <option value="">— Unassigned —</option>
                  {hallways.map((h) => (
                    <option key={h.hallwayStopId} value={h.hallwayStopId}>
                      {h.location ?? `Stop ${h.hallwayStopId}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
          <div className="form-row">
            <label className="form-label">Phone Number:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.phoneNumber ? " is-invalid" : ""}`}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {errors.phoneNumber && (
                <div className="invalid-feedback d-block">
                  {errors.phoneNumber}
                </div>
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
    </main>
  );
}
