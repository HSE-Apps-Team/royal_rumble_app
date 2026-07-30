"use client";
import { useState, ReactElement } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import EditTable from "../../components/editTable";
import AddButton from "../../components/addButton";
import "../../css/admin.css";
import "../../css/logo+login.css";
import BackButton from "@/app/components/backButton";
import { deleteAttendeeById } from "@/actions/attendees";
import ExportToExcelButton from "../../components/ExportToExcelButton";

export default function AdminAttendees({
  attendeeData,
}: {
  attendeeData: Array<{
    attendeeId: number;
    fName: string;
    lName: string;
    email: string;
    tshirtSize: string;
    primaryLanguage: string;
    interests: string;
    healthConcerns: string;
    present: boolean;
    assignedGroup: string;
  }>;
}) {
  // Column toggle states
  const [IDSelected, setIDSelected] = useState(false);
  const [firstNameSelected, setFirstNameSelected] = useState(true);
  const [lastNameSelected, setLastNameSelected] = useState(true);
  const [shirtSelected, setShirtSelected] = useState(false);
  const [emailSelected, setEmailSelected] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const [interestsSelected, setInterestsSelected] = useState(false);
  const [healthConcernsSelected, setHealthConcernsSelected] = useState(false);
  const [presentSelected, setPresentSelected] = useState(false);
  const [assignedGroupSelected, setAssignedGroupSelected] = useState(false);

  // Search & filter state
  const [searchText, setSearchText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [presentStatus, setPresentStatus] = useState("");

  // Table headers
  const ALL_HEADERS = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "T-Shirt",
    "Language",
    "Interests",
    "Health Concerns",
    "Present",
    "Assigned Group",
  ];

  // Convert attendee data to the format EditTable expects
  const tableData = attendeeData.map((f) => [
    f.attendeeId,
    f.fName,
    f.lName,
    f.email,
    f.tshirtSize,
    f.primaryLanguage,
    f.interests,
    f.healthConcerns,
    f.present ? (
      <i
        className="bi bi-check-lg"
        style={{ color: "var(--primaryBlue)", fontSize: "24px" }}
      />
    ) : (
      <i
        className="bi bi-x-lg"
        style={{ color: "var(--primaryRed)", fontSize: "24px" }}
      />
    ),
    f.assignedGroup ?? "",
  ]);

  // Export-friendly version (plain text instead of icons)
  const exportTableData = attendeeData.map((f) => [
    f.attendeeId,
    f.fName,
    f.lName,
    f.email,
    f.tshirtSize,
    f.primaryLanguage,
    f.interests,
    f.healthConcerns,
    f.present ? "Yes" : "No",
    f.assignedGroup ?? "",
  ]);

  // Unique languages from data (excluding English, sorted)
  const languageOptions = [
    ...new Set(attendeeData.map((f) => f.primaryLanguage)),
  ]
    .filter((lang) => Boolean(lang) && lang?.trim().toLowerCase() !== "english")
    .sort((a, b) =>
      (a ?? "").localeCompare(b ?? "", undefined, { sensitivity: "base" }),
    );

  // --- FILTER LOGIC ---
  const presentById = new Map(
    attendeeData.map((f) => [f.attendeeId, f.present]),
  );

  const matchesFilters = (row: (string | number | ReactElement)[]) => {
    const id = row[0].toString();
    const fName = String(row[1]).toLowerCase();
    const lName = String(row[2]).toLowerCase();

    // Search filter
    const query = searchText.trim().toLowerCase();
    if (query !== "") {
      if (!isNaN(Number(query))) {
        if (!id.includes(query)) return false;
      } else {
        const parts = query.split(" ");
        if (parts.length === 2) {
          const [firstPart, lastPart] = parts;
          if (!(fName.includes(firstPart) && lName.includes(lastPart)))
            return false;
        } else {
          if (!(fName.includes(query) || lName.includes(query))) return false;
        }
      }
    }

    // Language filter (row[5] = primaryLanguage)
    if (
      selectedLanguage !== "" &&
      String(row[5]).trim().toLowerCase() !==
        selectedLanguage.trim().toLowerCase()
    )
      return false;

    // Present status filter
    if (presentStatus !== "") {
      const isPresent = presentById.get(row[0] as number) ?? false;
      if (presentStatus === "present" && !isPresent) return false;
      if (presentStatus === "not-present" && isPresent) return false;
    }

    return true;
  };

  const filteredData = tableData.filter(matchesFilters);
  const filteredExportData = exportTableData.filter(matchesFilters);

  // Generate visible columns
  const visibleColumns: number[] = [];
  if (IDSelected) visibleColumns.push(0);
  if (firstNameSelected) visibleColumns.push(1);
  if (lastNameSelected) visibleColumns.push(2);
  if (emailSelected) visibleColumns.push(3);
  if (shirtSelected) visibleColumns.push(4);
  if (languageSelected) visibleColumns.push(5);
  if (interestsSelected) visibleColumns.push(6);
  if (healthConcernsSelected) visibleColumns.push(7);
  if (presentSelected) visibleColumns.push(8);
  if (assignedGroupSelected) visibleColumns.push(9);

  // If none selected → default to first + last name
  if (visibleColumns.length === 0) visibleColumns.push(1, 2);

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Attendee Information</h1>
      </header>

      <BackButton href="/admin" />

      {/* --- SEARCH BAR --- */}
      <div
        className="search-container"
        style={{ marginLeft: "15%", marginBottom: "0px" }}
      >
        <div className="search-row">
          <input
            type="text"
            placeholder="Search Name/ ID..."
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* --- SELECT LANGUAGE DROPDOWN --- */}
      <div className="search-container" style={{ marginLeft: "15%" }}>
        <div className="search-row">
          <div className="form-row">
            <select
              className="form-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="">Language</option>
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* --- PRESENT STATUS DROPDOWN --- */}
          <div className="form-row" style={{ marginLeft: "10px" }}>
            <select
              className="form-select"
              value={presentStatus}
              onChange={(e) => setPresentStatus(e.target.value)}
            >
              <option value="">Present Status</option>
              <option value="present">Present</option>
              <option value="not-present">Not Present</option>
            </select>
          </div>
        </div>
        {/* --- ADD ATTENDEE BUTTON --- */}
        <div style={{ marginLeft: "16%" }}>
          <AddButton href="/admin/add/attendee"
            style={{ fontSize: "30px", width: "230px" }}>
            Add
            <i
              className="bi bi-plus-circle"
              style={{ marginLeft: "30px", fontSize: "30px" }}
            ></i>
          </AddButton>
        </div>
      </div>

      {/* --- CHECKBOXES FOR COLUMN VISIBILITY --- */}
      <div style={{ width: "85%" }}>
        <div className="form-container" style={{ margin: "0px" }}>
          <form className="manual-add-form">
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={IDSelected}
                  onChange={(e) => setIDSelected(e.target.checked)}
                />
                ID
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={firstNameSelected}
                  onChange={(e) => setFirstNameSelected(e.target.checked)}
                />
                First Name
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={lastNameSelected}
                  onChange={(e) => setLastNameSelected(e.target.checked)}
                />
                Last Name
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={emailSelected}
                  onChange={(e) => setEmailSelected(e.target.checked)}
                />
                Email
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={shirtSelected}
                  onChange={(e) => setShirtSelected(e.target.checked)}
                />
                T-Shirt
              </label>
            </div>

            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={languageSelected}
                  onChange={(e) => setLanguageSelected(e.target.checked)}
                />
                Language
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={interestsSelected}
                  onChange={(e) => setInterestsSelected(e.target.checked)}
                />
                Interests
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={healthConcernsSelected}
                  onChange={(e) => setHealthConcernsSelected(e.target.checked)}
                />
                Health Concerns
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={presentSelected}
                  onChange={(e) => setPresentSelected(e.target.checked)}
                />
                Present
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={assignedGroupSelected}
                  onChange={(e) => setAssignedGroupSelected(e.target.checked)}
                />
                Assigned Group
              </label>
            </div>
          </form>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div style={{ width: "85%", marginTop: "25px" }}>
        <EditTable
          headers={ALL_HEADERS}
          data={filteredData}
          exportData={filteredExportData}
          visibleColumns={visibleColumns}
          editLink="/admin/edit/attendee"
          deleteAction={async (id) => {
            const result = await deleteAttendeeById(Number(id));
            return { success: result.success };
          }}
          idIndex={0}
          fileName="attendee-data"
        />
      </div>
    </main>
  );
}
