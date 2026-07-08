"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import ViewDropdown from "../../components/viewDropdown";
import InfoTable from "../../components/infoTable";
import AddButton from "../../components/addButton";
import ExportToExcelButton from "../../components/ExportToExcelButton";
import "../../css/admin.css";
import "../../css/logo+login.css";
import {
  addHallway,
  deleteGroupByGroupId,
  deleteHallwayByStopId,
} from "@/actions/group";
import ModalShell from "../../components/ModalShell";
import { useAlert } from "@/app/context/AlertContext";

interface FreshmenGroup {
  group_id: number | "Unassigned";
  name: string;
  route_num: number;
  event_order: string;
  freshmen: Array<{ freshman_id: string; name: string }>;
  mentors: Array<{ mentor_id: string; name: string }>;
}
interface HallwayGroup {
  hallwayStopId: number;
  location: string;
  mentors: Array<{ mentor_id: string; name: string }>;
}

export default function AdminAllGroups({
  freshmenGroups,
  hallwayGroups,
}: {
  freshmenGroups: FreshmenGroup[];
  hallwayGroups: HallwayGroup[];
}) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [displayFreshmenGroup, setDisplayFreshmenGroup] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newHallway, setNewHallway] = useState("");
  const [showHallwayModal, setShowHallwayModal] = useState(false);

  const handleLogoClick = () => router.push("/admin");

  const formatPeople = (
    people: { name: string; freshman_id?: string; mentor_id?: string }[],
  ) => {
    return people
      .map((p) => {
        const id = p.freshman_id ?? p.mentor_id ?? "";
        return `${p.name}:${id}`;
      })
      .join(", ");
  };

  const exportHeaders = displayFreshmenGroup
    ? ["Group Name", "Route #", "Event Order", "Freshmen", "Mentors"]
    : ["Group Name", "Mentors"];

  const exportData = displayFreshmenGroup
    ? freshmenGroups
        .filter(
          (group) =>
            selectedGroupId === "" || group.group_id.toString() === selectedGroupId,
        )
        .map((group) => [
          group.name,
          group.route_num,
          group.event_order,
          formatPeople(group.freshmen),
          formatPeople(group.mentors),
        ])
    : hallwayGroups
        .filter(
          (group) =>
            selectedGroupId === "" ||
            group.hallwayStopId === Number(selectedGroupId) + 1,
        )
        .map((group) => [group.location, formatPeople(group.mentors)]);

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title" style={{ marginBottom: "30px" }}>
          All Group Information
        </h1>
      </header>

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

              {displayFreshmenGroup &&
                freshmenGroups.map((group) => (
                  <option key={group.group_id} value={group.group_id.toString()}>
                    {group.name}
                  </option>
                ))}

              {!displayFreshmenGroup &&
                hallwayGroups.map((group) => (
                  <option
                    key={group.hallwayStopId}
                    value={group.hallwayStopId - 1}
                  >
                    {group.location}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Radio Buttons */}
      <div style={{ width: "85%", marginTop: "20px" }}>
        <div className="form-container" style={{ margin: "0px" }}>
          <form className="manual-add-form">
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="groupType"
                  className="checkbox-input"
                  checked={displayFreshmenGroup}
                  onChange={() => {
                    setDisplayFreshmenGroup(true);
                    setSelectedGroupId("");
                  }}
                />
                Freshmen Groups
              </label>

              <label className="checkbox-label">
                <input
                  type="radio"
                  name="groupType"
                  className="checkbox-input"
                  checked={!displayFreshmenGroup}
                  onChange={() => {
                    setDisplayFreshmenGroup(false);
                    setSelectedGroupId("");
                  }}
                />
                Hallway Groups
              </label>
            </div>
          </form>
        </div>
      </div>

      {/* Top Action Row */}
      <div
        style={{
          width: "87%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          fontSize: "15px",
        }}
      >
        {/* Add Buttons */}
        {displayFreshmenGroup ? (
          <>
            <AddButton
              onClick={() => router.push("/admin/add/freshman")}
              style={{
                fontSize: "21px",
                justifyContent: "flex-start",
                width: "270px",
              }}
            >
              Add Freshman
              <i
                className="bi bi-plus-circle"
                style={{ marginLeft: "30px", fontSize: "30px" }}
              />
            </AddButton>
            <ExportToExcelButton
              headers={exportHeaders}
              data={exportData}
              fileName={"Freshmen_Groups_Export"}
              style={{ fontSize: "21px", justifyContent: "flex-center" }}
            />

            <AddButton
              onClick={() => router.push("/admin/add/freshmen_group")}
              style={{ fontSize: "21px", justifyContent: "flex-end" }}
            >
              Add Group
              <i
                className="bi bi-plus-circle"
                style={{ marginLeft: "30px", fontSize: "30px" }}
              />
            </AddButton>
          </>
        ) : (
          <>
            <AddButton
              onClick={() => router.push("/admin/add/mentor")}
              style={{
                fontSize: "21px",
                justifyContent: "flex-start",
                width: "270px",
              }}
            >
              Add Mentor
              <i
                className="bi bi-plus-circle"
                style={{ marginLeft: "30px", fontSize: "30px" }}
              />
            </AddButton>

            <ExportToExcelButton
              headers={exportHeaders}
              data={exportData}
              fileName="Hallway_Groups_Export"
              style={{ fontSize: "21px", justifyContent: "flex-center" }}
            />

            <AddButton
              onClick={() => setShowHallwayModal(true)}
              style={{ fontSize: "21px", justifyContent: "flex-end" }}
            >
              Add Hallway
              <i
                className="bi bi-plus-circle"
                style={{ marginLeft: "30px", fontSize: "30px" }}
              />
            </AddButton>
          </>
        )}
      </div>

      {/* VIEW DROPDOWN SECTION */}
      {displayFreshmenGroup ? (
        <ViewDropdown
          header={`Freshmen Group ${selectedGroupId}`}
          editLink={`/admin/edit/freshmenGroup`}
          sections={freshmenGroups
            .filter(
              (group) =>
                selectedGroupId === "" || group.group_id.toString() === selectedGroupId,
            )
            .map((group) => ({
              title: `${group.name}${group.group_id !== "Unassigned" && group.mentors.length > 0 ? ` (${group.mentors.map((m) => m.name).join(", ")})` : ""}`,
              content: (
                <section>
                  <div className="info-pairs">
                    <div className="info-pair">
                      <div className="info-label">Route #:</div>
                      <div className="info-value">{group.route_num}</div>
                    </div>
                    <div className="info-pair">
                      <div className="info-label">Event Order:</div>
                      <div className="info-value">{group.event_order}</div>
                    </div>
                  </div>

                  <label className="info-label" style={{ marginTop: "30px" }}>
                    Mentors:
                  </label>
                  <InfoTable
                    headers={["Mentor Name", "Student ID"]}
                    data={group.mentors.map((m) => [m.name, m.mentor_id])}
                  />

                  <label className="info-label" style={{ marginTop: "30px" }}>
                    Freshmen:
                  </label>
                  <InfoTable
                    headers={["Freshman Name", "Student ID"]}
                    data={group.freshmen.map((f) => [f.name, f.freshman_id])}
                  />
                </section>
              ),
              sectionId: group.group_id,
            }))}
          deleteAction={async (id) => {
            if (id === "Unassigned") return { success: false };
            const result = await deleteGroupByGroupId(Number(id));
            return { success: result.success };
          }}
        />
      ) : (
        <ViewDropdown
          header={`Hallways`}
          editLink="/admin/edit/hallwayGroup"
          sections={hallwayGroups
            .filter(
              (group) =>
                selectedGroupId === "" ||
                group.hallwayStopId === Number(selectedGroupId) + 1,
            )
            .map((group) => ({
              title: group.location,
              content: (
                <section>
                  <label className="info-label">Mentors:</label>
                  <InfoTable
                    headers={["Mentor Name", "Student ID"]}
                    data={group.mentors.map((m) => [m.name, m.mentor_id])}
                  />
                </section>
              ),
              sectionId: group.hallwayStopId,
            }))}
          deleteAction={async (id) => {
            const result = await deleteHallwayByStopId(Number(id));
            return { success: result.success };
          }}
        />
      )}

      {showHallwayModal && (
        <ModalShell
          title="Create New Hallway"
          onClose={() => { setShowHallwayModal(false); setNewHallway(""); }}
          footer={
            <>
              <button
                style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", backgroundColor:"var(--secondarySilver)", color:"white", fontFamily:"Poppins, sans-serif", fontWeight:"bold", fontSize:"15px", border:"5px solid transparent", borderRadius:"14px", padding:"8px 18px", cursor:"pointer", minWidth:"100px" }}
                onClick={() => { setShowHallwayModal(false); setNewHallway(""); }}
              >
                Cancel
              </button>
              <button
                style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", backgroundColor:"var(--primaryBlue)", color:"white", fontFamily:"Poppins, sans-serif", fontWeight:"bold", fontSize:"15px", border:"5px solid transparent", borderRadius:"14px", padding:"8px 18px", cursor:"pointer", minWidth:"100px" }}
                onClick={async () => {
                  const result = await addHallway(newHallway);
                  if (result?.success) {
                    showAlert(`Successfully added hallway "${newHallway}"`, "success");
                  } else {
                    showAlert(`Failed to add hallway "${newHallway}"`, "danger");
                  }
                  setNewHallway("");
                  setShowHallwayModal(false);
                  router.refresh();
                }}
              >
                Add
              </button>
            </>
          }
        >
          <div className="form-row">
            <label className="form-label">New Hallway:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Hallway Name"
              onChange={(e) => setNewHallway(e.target.value)}
            />
          </div>
        </ModalShell>
      )}
    </main>
  );
}
