"use client";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import EditTable from "../../components/editTable";
import AddButton from "../../components/addButton";
import "../../css/admin.css";
import "../../css/logo+login.css";
import BackButton from "@/app/components/backButton";
import { deleteMentorById } from "@/actions/mentor";

export default function AdminMentors({
  mentorsData,
}: {
  mentorsData: Array<{
    mentorId: number;
    fName: string;
    lName: string;
    email: string;
    job: string;
    tshirtSize: string;
    gradYear: number;
    language: string;
    phoneNum: string;
    trainingDay: string;
    pizzaType: string;
    pastMentor: boolean | null;
    interestsInvolvement: string | null;
  }>;
}) {
  //   Column toggle states
  const [IDSelected, setIDSelected] = useState(false);
  const [firstNameSelected, setFirstNameSelected] = useState(true);
  const [lastNameSelected, setLastNameSelected] = useState(true);
  const [emailSelected, setEmailSelected] = useState(false);
  const [jobSelected, setJobSelected] = useState(false);
  const [shirtSelected, setShirtSelected] = useState(false);
  const [gradYearSelected, setGradYearSelected] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const [phoneSelected, setPhoneSelected] = useState(false);
  const [trainingSelected, setTrainingSelected] = useState(false);
  const [pizzaSelected, setPizzaSelected] = useState(false);
  const [pastMentorSelected, setPastMentorSelected] = useState(false);
  const [interestsSelected, setInterestsSelected] = useState(false);

  // Search & filter state
  const [searchText, setSearchText] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedTrainingDay, setSelectedTrainingDay] = useState("");
  const [selectedGradYear, setSelectedGradYear] = useState("");
  const [selectedPastMentor, setSelectedPastMentor] = useState("");
  const [selectedInterests, setSelectedInterests] = useState("");

  // Table headers
  const ALL_HEADERS = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Job",
    "Shirt Size",
    "Grad Year",
    "Language",
    "Phone #",
    "Training Day",
    "Pizza Type",
    "Past Mentor",
    "Interests / Involvement",
  ];

  // Convert data to the format EditTable expects
  const tableData = mentorsData.map((m) => [
    m.mentorId,
    m.fName,
    m.lName,
    m.email.toLowerCase(),
    m.job,
    m.tshirtSize,
    m.gradYear,
    m.language,
    m.phoneNum,
    m.trainingDay,
    m.pizzaType,
    m.pastMentor ? "Yes" : "No",
    m.interestsInvolvement ?? "",
  ]);

  // Dynamic dropdown options derived from actual data
  const EXCLUDED_LANGUAGES = ["english", "no", "none", "na", "n/a"];
  const jobOptions = [...new Set(mentorsData.map((m) => m.job))]
    .filter(Boolean)
    .sort();
  const languageOptions = [...new Set(mentorsData.map((m) => m.language))]
    .filter(
      (lang) =>
        Boolean(lang) && !EXCLUDED_LANGUAGES.includes(lang.toLowerCase()),
    )
    .sort();
  const trainingDayOptions = [...new Set(mentorsData.map((m) => m.trainingDay))]
    .filter(Boolean)
    .sort();
  const gradYearOptions = [...new Set(mentorsData.map((m) => m.gradYear))]
    .filter(Boolean)
    .sort((a, b) => a - b);
  const interestsOptions = [...new Set(mentorsData.map((m) => m.interestsInvolvement ?? ""))]
    .filter(Boolean)
    .sort();

  // --- SEARCH FILTER LOGIC ---
  const filteredData = tableData.filter((row) => {
    const id = row[0].toString();
    const fName = String(row[1]).toLowerCase();
    const lName = String(row[2]).toLowerCase();

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

    if (selectedJob !== "" && String(row[4]) !== selectedJob) return false;
    if (selectedLanguage !== "" && String(row[7]) !== selectedLanguage)
      return false;
    if (selectedTrainingDay !== "" && String(row[9]) !== selectedTrainingDay)
      return false;
    if (selectedGradYear !== "" && String(row[6]) !== selectedGradYear)
      return false;
    if (selectedPastMentor !== "" && String(row[11]) !== selectedPastMentor)
      return false;
    if (selectedInterests !== "" && String(row[12]) !== selectedInterests)
      return false;

    return true;
  });

  //   Generate visible columns
  const visibleColumns: number[] = [];
  if (IDSelected) visibleColumns.push(0);
  if (firstNameSelected) visibleColumns.push(1);
  if (lastNameSelected) visibleColumns.push(2);
  if (emailSelected) visibleColumns.push(3);
  if (jobSelected) visibleColumns.push(4);
  if (shirtSelected) visibleColumns.push(5);
  if (gradYearSelected) visibleColumns.push(6);
  if (languageSelected) visibleColumns.push(7);
  if (phoneSelected) visibleColumns.push(8);
  if (trainingSelected) visibleColumns.push(9);
  if (pizzaSelected) visibleColumns.push(10);
  if (pastMentorSelected) visibleColumns.push(11);
  if (interestsSelected) visibleColumns.push(12);

  // If none selected → default to first + last name
  if (visibleColumns.length === 0) visibleColumns.push(1, 2);

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Mentor Information</h1>
      </header>

      <BackButton href="/admin" />

      {/* --- ADD MENTOR BUTTON --- */}
      <div
        style={{ display: "flex", justifyContent: "center", margin: "20px" }}
      >
        <AddButton href="/admin/add/mentor"
                   style={{ fontSize: "30px", width: "240px" }} 
        >
          Add
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "30px", fontSize: "30px" }}
          ></i>
        </AddButton>
        <AddButton
          href="/admin/mentor/assignGroup"
          style={{ fontSize: "30px", width: "340px" }}
        >
          Assign Groups
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "30px", fontSize: "30px" }}
          ></i>
        </AddButton>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="search-container" style={{ marginLeft: "15%" }}>
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

      {/* --- FILTER DROPDOWNS --- */}
      <div className="search-container" style={{ marginLeft: "15%" }}>
        <div className="search-row" style={{ width: "auto" }}>
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
          >
            <option value="">Job</option>
            {jobOptions.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>
        <div className="search-row" style={{ width: "auto" }}>
          <select
            className="form-select"
            style={{ width: "200px" }}
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
        <div className="search-row" style={{ width: "auto" }}>
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={selectedTrainingDay}
            onChange={(e) => setSelectedTrainingDay(e.target.value)}
          >
            <option value="">Training Date</option>
            {trainingDayOptions.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="search-row" style={{ width: "auto" }}>
          <select
            className="form-select"
            style={{ width: "250px" }}
            value={selectedGradYear}
            onChange={(e) => setSelectedGradYear(e.target.value)}
          >
            <option value="">Graduation Year</option>
            {gradYearOptions.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="search-container" style={{ marginLeft: "15%" }}>
        <div className="search-row" style={{ width: "auto" }}>
          <select
            className="form-select"
            style={{ width: "180px" }}
            value={selectedPastMentor}
            onChange={(e) => setSelectedPastMentor(e.target.value)}
          >
            <option value="">Past Mentor</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div className="search-row" style={{ width: "auto" }}>
          <select
            className="form-select"
            style={{ width: "220px" }}
            value={selectedInterests}
            onChange={(e) => setSelectedInterests(e.target.value)}
          >
            <option value="">Interests</option>
            {interestsOptions.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- CHECKBOXES FOR COLUMN VISIBILITY --- */}
      <div style={{ width: "85%", marginTop: "20px" }}>
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
                  checked={jobSelected}
                  onChange={(e) => setJobSelected(e.target.checked)}
                />
                Job
              </label>
            </div>
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={gradYearSelected}
                  onChange={(e) => setGradYearSelected(e.target.checked)}
                />
                Grad Year
              </label>
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
                  checked={phoneSelected}
                  onChange={(e) => setPhoneSelected(e.target.checked)}
                />
                Phone #
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
                  checked={trainingSelected}
                  onChange={(e) => setTrainingSelected(e.target.checked)}
                />
                Training Day
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={pizzaSelected}
                  onChange={(e) => setPizzaSelected(e.target.checked)}
                />
                Pizza
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={pastMentorSelected}
                  onChange={(e) => setPastMentorSelected(e.target.checked)}
                />
                Past Mentor
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
            </div>
          </form>
        </div>
      </div>
      {/* --- TABLE --- */}
      <div style={{ width: "85%", marginTop: "50px" }}>
        <EditTable
          headers={ALL_HEADERS}
          data={filteredData}
          visibleColumns={visibleColumns}
          editLink="/admin/edit/mentor"
          deleteAction={async (id) => {
            const result = await deleteMentorById(Number(id));
            return { success: result.success };
          }}
          idIndex={0}
          fileName="mentors-data"
        />
      </div>
    </main>
  );
}
