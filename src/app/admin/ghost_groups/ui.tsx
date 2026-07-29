"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import ViewDropdown from "../../components/viewDropdown";
import InfoTable from "../../components/infoTable";
import ExportToExcelButton from "../../components/ExportToExcelButton";
import "../../css/admin.css";
import "../../css/logo+login.css";

interface GhostGroup {
  group_id: number | "Unassigned";
  name: string;
  freshmen: Array<{ freshmen_id: string; name: string }>;
}

export default function AdminGhostGroups({
  ghostGroups,
}: {
  ghostGroups: GhostGroup[];
}) {
  const router = useRouter();

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const handleLogoClick = () => router.push("/admin");

  const formatPeople = (people: { name: string; freshmen_id: string }[]) => {
    return people.map((p) => `${p.name}:${p.freshmen_id}`).join(", ");
  };

  const filteredGroups = ghostGroups.filter(
    (group) =>
      selectedGroupId === "" || group.group_id.toString() === selectedGroupId,
  );

  const exportHeaders = ["Group Name", "Freshmen"];

  const exportData = filteredGroups.map((group) => [
    group.name,
    formatPeople(group.freshmen),
  ]);

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title" style={{ marginBottom: "30px" }}>
          Ghost Group Information
        </h1>
      </header>

      <div
        style={{
          width: "85%",
          margin: "0 auto 20px",
          backgroundColor: "var(--primaryRed)",
          color: "white",
          border: "5px solid var(--primaryRed)",
          borderRadius: "10px",
          padding: "16px 20px",
          fontFamily: "Poppins, sans-serif",
          fontWeight: "bold",
          fontSize: "17px",
          textAlign: "center",
        }}
      >
        <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: "10px" }}></i>
        These are ghost groups — this is what the groups would look like if every
        freshman in the seminar roster were attending Royal Rumble, not just those
        currently registered.
      </div>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      {/* Group Dropdown */}
      <div className="search-container" style={{ marginLeft: "15%" }}>
        <div className="search-row">
          <div className="form-row">
            <select
              className="form-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">All Groups</option>

              {ghostGroups.map((group) => (
                <option key={group.group_id} value={group.group_id.toString()}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Action Row */}
      <div
        style={{
          width: "87%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: "20px",
          fontSize: "15px",
        }}
      >
        <ExportToExcelButton
          headers={exportHeaders}
          data={exportData}
          fileName={"Ghost_Groups_Export"}
          style={{ fontSize: "21px", justifyContent: "flex-center" }}
        />
      </div>

      {/* VIEW DROPDOWN SECTION */}
      <ViewDropdown
        header={`Ghost Group ${selectedGroupId}`}
        sections={filteredGroups.map((group) => ({
          title: group.name,
          content: (
            <section>
              <label className="info-label">
                Freshmen:
              </label>
              <InfoTable
                headers={["Freshman Name", "Freshmen ID"]}
                data={group.freshmen.map((f) => [f.name, f.freshmen_id])}
              />
            </section>
          ),
          sectionId: group.group_id,
        }))}
      />
    </main>
  );
}
