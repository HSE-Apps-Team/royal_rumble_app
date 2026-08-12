"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "@/app/components/logoButton";
import LoginButton from "@/app/components/loginButton";
import SaveButton from "@/app/components/saveButton";
import "@/app/css/admin.css";
import "@/app/css/logo+login.css";
import BackButton from "@/app/components/backButton";
import { getMentorById, updateMentorByID } from "@/actions/mentor";
import { getAllJobs } from "@/actions/job";
import { useAlert } from "@/app/context/AlertContext";

export default function AdminEditMentorUI({
  params,
}: {
  params: { id: string };
}) {
  const mentorId = Number(params.id);
  const { showAlert } = useAlert();

  const router = useRouter();
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [job, setJob] = useState("");
  const [pizzaType, setPizzaType] = useState("");
  const [languages, setLanguages] = useState("");
  const [trainingDay, setTrainingDay] = useState("");
  const [tshirtSize, setTshirtSize] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [pastMentor, setPastMentor] = useState(false);
  const [interestsInvolvement, setInterestsInvolvement] = useState("");

  const [jobs, setJobs] = useState<Array<{ dbJob: string; label: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAllJobs().then(setJobs);
  }, []);

  useEffect(() => {
    const loadMentor = async () => {
      const mentor = await getMentorById(mentorId);
      setFName(mentor.fName ?? "");
      setLName(mentor.lName ?? "");
      setTshirtSize(mentor.tshirtSize ?? "");
      setEmail(mentor.email ?? "");
      setGradYear(mentor.gradYear?.toString() ?? "");
      setJob(mentor.job ?? "");
      setPizzaType(mentor.pizzaType ?? "");
      setLanguages(mentor.languages ?? "");
      setTrainingDay(mentor.trainingDay ?? "");
      setPhoneNum(mentor.phoneNum ?? "");
      setPastMentor(mentor.pastMentor ?? false);
      setInterestsInvolvement(mentor.interestsInvolvement ?? "");
    };
    loadMentor();
  }, [mentorId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fName.trim()) newErrors.fName = "First name is required.";
    if (!lName.trim()) newErrors.lName = "Last name is required.";
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!phoneNum.trim()) {
      newErrors.phoneNum = "Phone number is required.";
    } else if (!/^\d{10}$/.test(phoneNum)) {
      newErrors.phoneNum = "Phone number must be exactly 10 digits.";
    }
    if (!gradYear.trim()) {
      newErrors.gradYear = "Graduation year is required.";
    } else if (!/^\d{4}$/.test(gradYear)) {
      newErrors.gradYear = "Enter a valid 4-digit graduation year.";
    }
    if (!job) newErrors.job = "Please select a job.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await updateMentorByID(mentorId, {
        f_name: fName,
        l_name: lName,
        tshirt_size: tshirtSize,
        email: email,
        grad_year: Number(gradYear),
        job: job,
        pizza_type: pizzaType,
        languages: languages,
        training_day: trainingDay,
        phone_num: phoneNum,
        past_mentor: pastMentor,
        interests_involvement: interestsInvolvement,
      });
      showAlert(`Mentor ${fName} ${lName} updated successfully!`, "success");
      router.push("/admin/mentor");
    } catch (error) {
      showAlert(`Error updating mentor: ${fName} ${lName}`, "danger");
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
        <h1 className="admin-title">
          Edit Mentor - {fName} {lName}
        </h1>
      </header>

      <BackButton href="/admin/mentor" />
      <div style={contentBoxStyle}>
        <div className="edit-user-form">
          <div className="form-row">
            <label className="form-label">First Name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.fName ? " is-invalid" : ""}`}
                placeholder="Mentor First Name"
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
                placeholder="Mentor Last Name"
                value={lName}
                onChange={(e) => setLName(e.target.value)}
              />
              {errors.lName && (
                <div className="invalid-feedback d-block">{errors.lName}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Email:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.email ? " is-invalid" : ""}`}
                placeholder="Mentor Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="invalid-feedback d-block">{errors.email}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Phone:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.phoneNum ? " is-invalid" : ""}`}
                placeholder="Mentor Phone"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
              />
              {errors.phoneNum && (
                <div className="invalid-feedback d-block">
                  {errors.phoneNum}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Grad Year:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.gradYear ? " is-invalid" : ""}`}
                placeholder="Mentor Grad Year"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
              />
              {errors.gradYear && (
                <div className="invalid-feedback d-block">
                  {errors.gradYear}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Job:</label>
            <div>
              <select
                className={`form-select${errors.job ? " is-invalid" : ""}`}
                aria-label="Default select example"
                onChange={(e) => setJob(e.target.value)}
                value={job || ""}
              >
                {job === "" ? (
                  <option disabled value="">
                    Select Job
                  </option>
                ) : null}
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
            <label className="form-label">T-Shirt Size:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Mentor T-Shirt Size"
              value={tshirtSize}
              onChange={(e) => setTshirtSize(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Past Mentor?</label>
            <input
              type="checkbox"
              className="checkbox-input"
              checked={pastMentor}
              onChange={(e) => setPastMentor(e.target.checked)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Interests / Involvement:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Interests / Involvement"
              value={interestsInvolvement}
              onChange={(e) => setInterestsInvolvement(e.target.value)}
            />
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
