"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import ViewDropdown from "../../components/viewDropdown";
import DropdownTable from "../../components/dropdownTable";
import ExportToExcelButton from "../../components/ExportToExcelButton";
import ModalShell from "../../components/ModalShell";
import AddButton from "../../components/addButton";
import "../../css/admin.css";
import "../../css/logo+login.css";
import {
  reassignSeminarFreshman,
  compactSeminarGroupNumbers,
  addSeminarFreshman,
} from "@/actions/group";
import { useAlert } from "@/app/context/AlertContext";

interface GhostGroup {
  group_id: number | "Unassigned";
  name: string;
  teacher: string;
  period: string;
  section: "A" | "B" | "";
  freshmen: Array<{ freshmen_id: string; name: string }>;
}

export default function AdminGhostGroups({
  ghostGroups,
  groupIds,
}: {
  ghostGroups: GhostGroup[];
  groupIds: { groupId: number; name: string }[];
}) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [showFixModal, setShowFixModal] = useState(false);
  const [fixing, setFixing] = useState(false);

  // Add Attendee modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newFreshmanId, setNewFreshmanId] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newGroupId, setNewGroupId] = useState("");

  const resetAddForm = () => {
    setNewFreshmanId("");
    setNewFirstName("");
    setNewLastName("");
    setNewGroupId("");
  };

  // Freshman search (by first/last name or ID)
  const [freshmanSearch, setFreshmanSearch] = useState("");

  // Teacher/Period filter
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [appliedTeacher, setAppliedTeacher] = useState("");
  const [appliedPeriod, setAppliedPeriod] = useState("");

  const handleLogoClick = () => router.push("/admin");

  const formatPeople = (people: { name: string; freshmen_id: string }[]) => {
    return people.map((p) => `${p.name}:${p.freshmen_id}`).join(", ");
  };

  const teacherOptions = Array.from(
    new Set(ghostGroups.map((g) => g.teacher).filter((t) => t && t.trim() !== "")),
  ).sort((a, b) => a.localeCompare(b));

  // Period dropdown is scoped to the selected teacher, since period values
  // are only meaningful within that teacher's own set of class periods.
  const periodOptions = Array.from(
    new Set(
      ghostGroups
        .filter(
          (g) =>
            selectedTeacher === "" ||
            g.teacher.toLowerCase() === selectedTeacher.toLowerCase(),
        )
        .map((g) => g.period)
        .filter((p) => p && p.trim() !== ""),
    ),
  ).sort((a, b) => Number(a) - Number(b));

  const freshmanQuery = freshmanSearch.trim().toLowerCase();

  const matchesFreshmanSearch = (f: { freshmen_id: string; name: string }) => {
    if (freshmanQuery === "") return true;
    const [fName, ...rest] = f.name.toLowerCase().split(" ");
    const lName = rest.join(" ");
    if (!isNaN(Number(freshmanQuery))) {
      return f.freshmen_id.toLowerCase().includes(freshmanQuery);
    }
    const parts = freshmanQuery.split(" ");
    if (parts.length === 2) {
      const [firstPart, lastPart] = parts;
      return fName.includes(firstPart) && lName.includes(lastPart);
    }
    return fName.includes(freshmanQuery) || lName.includes(freshmanQuery);
  };

  const filteredGroups = ghostGroups
    .filter(
      (group) =>
        selectedGroupId === "" || group.group_id.toString() === selectedGroupId,
    )
    .filter(
      (group) =>
        appliedTeacher === "" ||
        group.teacher.toLowerCase() === appliedTeacher.toLowerCase(),
    )
    .filter(
      (group) =>
        appliedPeriod === "" ||
        group.period.toLowerCase() === appliedPeriod.toLowerCase(),
    )
    .filter(
      (group) =>
        freshmanQuery === "" || group.freshmen.some(matchesFreshmanSearch),
    );

  const exportHeaders = ["Group Name", "Freshmen"];

  const exportData = filteredGroups.map((group) => [
    group.name,
    formatPeople(group.freshmen),
  ]);

  const handleReassign = async (
    freshmenId: string | number,
    newGroupId: string | number,
  ) => {
    const parsed = newGroupId === "unassigned" ? null : Number(newGroupId);
    const result = await reassignSeminarFreshman(Number(freshmenId), parsed);

    if (result.success) {
      showAlert(`Successfully reassigned freshman ${freshmenId}`, "success");
      router.refresh();
    } else {
      showAlert(`Failed to reassign freshman ${freshmenId}`, "danger");
    }
  };

  const handleAddAttendee = async () => {
    const parsedId = Number(newFreshmanId);
    if (!newFreshmanId.trim() || isNaN(parsedId)) {
      showAlert("Please enter a valid Freshman ID", "danger");
      return;
    }
    if (!newFirstName.trim() || !newLastName.trim()) {
      showAlert("Please enter a first and last name", "danger");
      return;
    }

    const isUnassigned = newGroupId === "" || newGroupId === "unassigned";
    const selectedGroup = isUnassigned
      ? null
      : ghostGroups.find((g) => g.group_id.toString() === newGroupId);

    setAdding(true);
    const result = await addSeminarFreshman({
      freshmenId: parsedId,
      fName: newFirstName.trim(),
      lName: newLastName.trim(),
      teacherFullName: selectedGroup?.teacher ?? "",
      period: selectedGroup?.period ?? "",
      groupId: isUnassigned ? null : Number(newGroupId),
    });
    setAdding(false);

    if (result.success) {
      showAlert(`Successfully added ${newFirstName} ${newLastName}`, "success");
      resetAddForm();
      setShowAddModal(false);
      router.refresh();
    } else if (result.error === "duplicate") {
      showAlert(`Freshman ID ${newFreshmanId} is already in the roster`, "danger");
    } else {
      showAlert("Failed to add attendee", "danger");
    }
  };

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
        <i
          className="bi bi-exclamation-triangle-fill"
          style={{ marginRight: "10px" }}
        ></i>
        These are ghost groups — this is what the groups would look like if
        every freshman in the Freshmen Prep roster were attending Royal Rumble,
        not just those currently registered.
      </div>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      {/* Freshman Search Bar */}
      <div
        className="search-container"
        style={{ marginLeft: "15%", marginBottom: "0px" }}
      >
        <div className="search-row">
          <input
            type="text"
            placeholder="Search Freshman Name / ID..."
            className="search-input"
            value={freshmanSearch}
            onChange={(e) => setFreshmanSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Teacher / Period Filter */}
      <div className="search-container" style={{ marginLeft: "15%" }}>
        <div className="search-row">
          <div className="form-row">
            <select
              className="form-select"
              value={selectedTeacher}
              onChange={(e) => {
                setSelectedTeacher(e.target.value);
                setSelectedPeriod("");
              }}
            >
              <option value="">Teacher</option>
              {teacherOptions.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <select
              className="form-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="">Period</option>
              {periodOptions.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--primaryBlue)",
              color: "white",
              fontFamily: "Poppins, sans-serif",
              fontWeight: "bold",
              fontSize: "15px",
              border: "3px solid var(--textBlack)",
              borderRadius: "14px",
              padding: "8px 18px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => {
              setAppliedTeacher(selectedTeacher);
              setAppliedPeriod(selectedPeriod);
            }}
          >
            <i className="bi bi-search" style={{ marginRight: "8px" }} />
            Search
          </button>
        </div>
      </div>

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
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          fontSize: "15px",
        }}
      >
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--secondarySilver)",
            color: "white",
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            fontSize: "15px",
            border: "3px solid var(--textBlack)",
            borderRadius: "14px",
            padding: "8px 18px",
            cursor: "pointer",
          }}
          onClick={() => setShowFixModal(true)}
        >
          <i className="bi bi-tools" style={{ marginRight: "8px" }} />
          Emptied a group? Click here to fix the group numbers
        </button>

        <ExportToExcelButton
          headers={exportHeaders}
          data={exportData}
          fileName={"Ghost_Groups_Export"}
          style={{ fontSize: "21px", justifyContent: "flex-center" }}
        />

        <AddButton
          onClick={() => {
            resetAddForm();
            if (selectedGroupId !== "") setNewGroupId(selectedGroupId);
            setShowAddModal(true);
          }}
          style={{ fontSize: "15px", width: "auto", height: "auto", padding: "8px 18px", margin: 0 }}
        >
          Add Attendee
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "10px", fontSize: "18px" }}
          />
        </AddButton>
      </div>

      {/* VIEW DROPDOWN SECTION */}
      <ViewDropdown
        header={`Ghost Group ${selectedGroupId}`}
        sections={filteredGroups.map((group) => ({
          title: group.name,
          content: (
            <section style={{ width: "100%" }}>
              <label className="info-label">Freshmen:</label>
              <DropdownTable
                headers={["Freshman Name", "Freshmen ID"]}
                data={group.freshmen.map((f) => [
                  f.freshmen_id,
                  f.name,
                  group.group_id === "Unassigned" ? null : group.group_id,
                ])}
                idIndex={0}
                visibleColumns={[1, 0]}
                currentDropdownColumnIndex={2}
                dropdownHeader="Reassign"
                dropdownValues={groupIds.map((g) => g.groupId)}
                dropdownDisplayTexts={groupIds.map((g) => g.name)}
                reassignAction={handleReassign}
              />
            </section>
          ),
          sectionId: group.group_id,
        }))}
      />

      {showFixModal && (
        <ModalShell
          title="Fix Group Numbers"
          onClose={() => setShowFixModal(false)}
          footer={
            <>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--secondarySilver)",
                  color: "white",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "5px solid transparent",
                  borderRadius: "14px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  minWidth: "100px",
                }}
                onClick={() => setShowFixModal(false)}
                disabled={fixing}
              >
                Cancel
              </button>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--primaryBlue)",
                  color: "white",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "5px solid transparent",
                  borderRadius: "14px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  minWidth: "100px",
                  opacity: fixing ? 0.6 : 1,
                }}
                onClick={async () => {
                  setFixing(true);
                  const result = await compactSeminarGroupNumbers();
                  setFixing(false);
                  if (result?.success) {
                    showAlert(
                      `Successfully renumbered groups 1-${result.groupCount}`,
                      "success",
                    );
                  } else {
                    showAlert("Failed to fix group numbers", "danger");
                  }
                  setShowFixModal(false);
                  router.refresh();
                }}
                disabled={fixing}
              >
                {fixing ? "Fixing..." : "Fix Numbers"}
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: "16px" }}>
            This will renumber every ghost group so there are no gaps — e.g. if
            group 2 is empty, group 3 becomes group 2, group 4 becomes group 3,
            and so on. Use this after emptying a group (moving everyone out of
            it via reassign) so the numbering stays consecutive.
            <br />
            <br />
            <strong>This affects all freshmen in the seminar roster and cannot be undone.</strong>
          </p>
        </ModalShell>
      )}

      {showAddModal && (
        <ModalShell
          title="Add Attendee to Ghost Group"
          width="700px"
          onClose={() => {
            setShowAddModal(false);
            resetAddForm();
          }}
          footer={
            <>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--secondarySilver)",
                  color: "white",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "5px solid transparent",
                  borderRadius: "14px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  minWidth: "100px",
                }}
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                disabled={adding}
              >
                Cancel
              </button>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--primaryBlue)",
                  color: "white",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bold",
                  fontSize: "15px",
                  border: "5px solid transparent",
                  borderRadius: "14px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  minWidth: "100px",
                  opacity: adding ? 0.6 : 1,
                }}
                onClick={handleAddAttendee}
                disabled={adding}
              >
                {adding ? "Adding..." : "Add"}
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div className="form-row">
              <label className="form-label">Freshman ID:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Freshman ID"
                value={newFreshmanId}
                onChange={(e) => setNewFreshmanId(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="form-label">First Name:</label>
              <input
                type="text"
                className="form-input"
                placeholder="First Name"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Last Name:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Last Name"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Ghost Group:</label>
              <select
                className="form-select"
                value={newGroupId}
                onChange={(e) => setNewGroupId(e.target.value)}
              >
                <option value="unassigned">Unassigned</option>
                {groupIds.map((g) => (
                  <option key={g.groupId} value={g.groupId.toString()}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ModalShell>
      )}
    </main>
  );
}
