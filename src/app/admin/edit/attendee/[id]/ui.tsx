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
import { getFreshmanById, updateFreshmanByID } from "@/actions/freshmen";
import { useAlert } from "@/app/context/AlertContext";

export default function AdminEditFreshmenUI({
  params,
}: {
  params: { id: string };
}) {
  const freshmanId = Number(params.id);

  const router = useRouter();
  const { showAlert } = useAlert();
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [tshirtSize, setTshirtSize] = useState("");
  const [email, setEmail] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("");
  const [interests, setInterests] = useState("");
  const [healthConcerns, setHealthConcerns] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadFreshman = async () => {
      const freshman = await getFreshmanById(freshmanId);
      setFName(freshman.fName ?? "");
      setLName(freshman.lName ?? "");
      setTshirtSize(freshman.tshirtSize ?? "");
      setEmail(freshman.email ?? "");
      setPrimaryLanguage(freshman.primaryLanguage ?? "");
      setInterests(freshman.interests ?? "");
      setHealthConcerns(freshman.healthConcerns ?? "");
    };
    loadFreshman();
  }, [freshmanId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fName.trim()) newErrors.fName = "First name is required.";
    if (!lName.trim()) newErrors.lName = "Last name is required.";
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!primaryLanguage.trim())
      newErrors.primaryLanguage = "Primary language is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await updateFreshmanByID(freshmanId, {
      f_name: fName,
      l_name: lName,
      tshirt_size: tshirtSize,
      email: email,
      primary_language: primaryLanguage,
      interests: interests,
      health_concerns: healthConcerns,
    });
    showAlert(`Freshman ${fName} ${lName} updated successfully!`, "success");
    router.push("/admin/freshmen");
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
          Edit Freshmen - {fName} {lName}
        </h1>
      </header>

      <BackButton href="/admin/freshmen" />

      <div style={contentBoxStyle}>
        <div className="edit-user-form">
          <div className="form-row">
            <label className="form-label">First Name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.fName ? " is-invalid" : ""}`}
                placeholder="Freshman First Name"
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
                placeholder="Freshman Last Name"
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
                placeholder="Freshman Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="invalid-feedback d-block">{errors.email}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">T-Shirt Size:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Freshman T-Shirt Size"
              value={tshirtSize}
              onChange={(e) => setTshirtSize(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Primary Language:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.primaryLanguage ? " is-invalid" : ""}`}
                placeholder="Freshman Primary Language"
                value={primaryLanguage}
                onChange={(e) => setPrimaryLanguage(e.target.value)}
              />
              {errors.primaryLanguage && (
                <div className="invalid-feedback d-block">
                  {errors.primaryLanguage}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Interests:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Freshman Interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Health Concerns:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Freshman Health Concerns"
              value={healthConcerns}
              onChange={(e) => setHealthConcerns(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <SaveButton onClick={handleSave}>Save</SaveButton>
      </div>
    </main>
  );
}
