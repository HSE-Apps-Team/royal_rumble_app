"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import SaveButton from "../../components/saveButton";
import InfoBox from "../../components/infoBox";
import InfoTable from "../../components/infoTable";
import "../../css/admin.css";
import "../../css/logo+login.css";

interface Freshman {
  freshmenId: number;
  fName: string | null;
  lName: string | null;
  primaryLanguage: string | null;
  groupId: number | null;
  tshirtSize: string | null;
  interests: string | null;
}

interface Mentor {
  mentorId: number;
  fName: string | null;
  lName: string | null;
  job: string | null;
  primaryLanguage?: string | null;
  languages: string | null;
  gradYear: number | null;
}

interface Props {
  freshmen: Freshman[];
  mentors: Mentor[];
}

export default function AdminSearchUI({ freshmen, mentors }: Props) {
  const router = useRouter();

  const [nameQuery, setNameQuery] = useState("");
  const [showFreshmen, setShowFreshmen] = useState(false);
  const [showMentors, setShowMentors] = useState(false);
  const [filterJob, setFilterJob] = useState<string[]>([]);

  const toggleJob = (job: string) =>
    setFilterJob((prev) =>
      prev.includes(job) ? prev.filter((j) => j !== job) : [...prev, job],
    );

  const results = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();

    const rows: string[][] = [];
    const headers: string[] = ["Name", "Type"];

    if (showFreshmen || (!showFreshmen && !showMentors)) {
      for (const f of freshmen) {
        const name = `${f.fName ?? ""} ${f.lName ?? ""}`.trim();
        if (q && !name.toLowerCase().includes(q)) continue;
        rows.push([name, "Freshmen"]);
      }
    }

    if (showMentors || (!showFreshmen && !showMentors)) {
      for (const m of mentors) {
        const name = `${m.fName ?? ""} ${m.lName ?? ""}`.trim();
        if (q && !name.toLowerCase().includes(q)) continue;
        if (filterJob.length > 0 && !filterJob.includes(m.job ?? "")) continue;
        rows.push([name, m.job ?? "Mentor"]);
      }
    }

    return { headers, rows };
  }, [nameQuery, showFreshmen, showMentors, filterJob, freshmen, mentors]);

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Search Information</h1>
      </header>

      <button className="back-button" onClick={() => router.push("/admin")}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <div className="search-container" style={{ marginLeft: "15%" }}>
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by name..."
            className="search-input"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ width: "85%" }}>
        <div className="form-container" style={{ margin: "0px" }}>
          <form className="manual-add-form">
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={showFreshmen}
                  onChange={(e) => setShowFreshmen(e.target.checked)}
                />
                Freshmen only
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={showMentors}
                  onChange={(e) => setShowMentors(e.target.checked)}
                />
                Mentors only
              </label>
            </div>

            {(showMentors || (!showFreshmen && !showMentors)) && (
              <div className="form-row checkbox-row">
                {["AMBASSADOR", "HALLWAY HOST", "SPIRIT SESSION", "UTILITY SQUAD"].map((job) => (
                  <label key={job} className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={filterJob.includes(job)}
                      onChange={() => toggleJob(job)}
                    />
                    {job.charAt(0) + job.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      <section className="info-box">
        <InfoBox headerText={`Results (${results.rows.length})`}>
          {results.rows.length === 0 ? (
            <p style={{ color: "var(--textBlack)", fontSize: "18px", padding: "10px 0" }}>
              No results found.
            </p>
          ) : (
            <InfoTable headers={results.headers} data={results.rows} />
          )}
        </InfoBox>
      </section>
    </main>
  );
}
