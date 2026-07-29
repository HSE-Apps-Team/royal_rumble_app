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
import "../../css/admin.css";
import "../../css/logo+login.css";
import {
  reassignSeminarFreshman,
  compactSeminarGroupNumbers,
} from "@/actions/group";
import { useAlert } from "@/app/context/AlertContext";

interface GhostGroup {
  group_id: number | "Unassigned";
  name: string;
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
    </main>
  );
}
