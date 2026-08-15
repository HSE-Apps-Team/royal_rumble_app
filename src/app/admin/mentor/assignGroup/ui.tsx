"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import DropdownTable from "../../../components/dropdownTable";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import BackButton from "@/app/components/backButton";
import {
  reassignMentorGroup,
  reassignMentorHallway,
} from "@/src/actions/mentor";
import { useAlert } from "@/app/context/AlertContext";

interface MentorAssignGroupUIProps {
  ambassadorAssignments: {
    groupId: number | null;
    groupName: string | null;
    mentorId: number | null;
    fName: string | null;
    lName: string | null;
  }[];
  groupIds: { groupId: number; name: string }[];
  hallwayHostAssignments: {
    hallwayStopId: number | null;
    mentorId: number | null;
    fName: string | null;
    lName: string | null;
  }[];
  hallwayStops: { hallwayStopId: number; location: string | null }[];
}

export default function MentorAssignGroupUI({
  ambassadorAssignments,
  groupIds,
  hallwayHostAssignments,
  hallwayStops,
}: MentorAssignGroupUIProps) {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [ambassadors, setAmbassadors] = useState(ambassadorAssignments);
  const [hallwayHosts, setHallwayHosts] = useState(hallwayHostAssignments);

  const [searchText, setSearchText] = useState("");
  const [showAssigned, setShowAssigned] = useState(true);
  const [showAmbassador, setShowAmbassador] = useState(true);
  const [ambassadorInputMode, setAmbassadorInputMode] = useState<
    "dropdown" | "text"
  >("dropdown");

  // Group names are created as "Group {N}" (see resolveGroupId), but admins
  // may type just the number or the full name — accept either.
  const resolveGroupNumber = (text: string): number | null => {
    const match = text.trim().match(/^(?:group\s*)?(\d+)$/i);
    if (!match) return null;
    return Number(match[1]);
  };

  const resolveGroupIdFromText = (text: string): string | null => {
    const groupNumber = resolveGroupNumber(text);
    if (groupNumber === null) return null;

    const exact = groupIds.find(
      (g) => g.name.trim().toLowerCase() === `group ${groupNumber}`,
    );
    if (exact) return String(exact.groupId);

    // Fall back to a group literally named just the number, or matching the
    // raw groupId itself, in case names don't follow the "Group N" pattern.
    const byName = groupIds.find(
      (g) => g.name.trim() === String(groupNumber),
    );
    if (byName) return String(byName.groupId);

    const byId = groupIds.find((g) => g.groupId === groupNumber);
    if (byId) return String(byId.groupId);

    return null;
  };

  const normalizedSearch = searchText.toLowerCase().trim();

  const filteredAmbassadors = ambassadors
    .filter((assignment) => (showAssigned ? true : assignment.groupId === null))
    .filter((assignment) => {
      if (!normalizedSearch) return true;
      return (
        assignment.fName?.toLowerCase().includes(normalizedSearch) ||
        assignment.lName?.toLowerCase().includes(normalizedSearch) ||
        assignment.mentorId?.toString().includes(normalizedSearch)
      );
    });

  const filteredHallwayHosts = hallwayHosts
    .filter((assignment) =>
      showAssigned ? true : assignment.hallwayStopId === null,
    )
    .filter((assignment) => {
      if (!normalizedSearch) return true;
      return (
        assignment.fName?.toLowerCase().includes(normalizedSearch) ||
        assignment.lName?.toLowerCase().includes(normalizedSearch) ||
        assignment.mentorId?.toString().includes(normalizedSearch)
      );
    });

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Assign Mentor Groups</h1>
      </header>

      <BackButton href="/admin/mentor" />

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

      <div style={{ width: "85%", marginTop: "20px" }}>
        <div className="form-container" style={{ margin: "0px" }}>
          <form className="manual-add-form">
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="groupType"
                  value="ambassador"
                  className="checkbox-input"
                  defaultChecked
                  onChange={() => setShowAmbassador(true)}
                />
                Ambassador
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="groupType"
                  value="hallway"
                  className="checkbox-input"
                  onChange={() => setShowAmbassador(false)}
                />
                Hallway Host
              </label>
            </div>
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={showAssigned}
                  onChange={(e) => setShowAssigned(e.target.checked)}
                />
                Show assigned mentors?
              </label>
            </div>
            {showAmbassador && (
              <div className="form-row checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="ambassadorInputMode"
                    value="dropdown"
                    className="checkbox-input"
                    checked={ambassadorInputMode === "dropdown"}
                    onChange={() => setAmbassadorInputMode("dropdown")}
                  />
                  Assign via dropdown
                </label>
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="ambassadorInputMode"
                    value="text"
                    className="checkbox-input"
                    checked={ambassadorInputMode === "text"}
                    onChange={() => setAmbassadorInputMode("text")}
                  />
                  Assign via typed group number
                </label>
              </div>
            )}
          </form>
        </div>
      </div>

      <div style={{ width: "85%", marginTop: "50px" }}>
        {showAmbassador ? (
          <DropdownTable
            headers={["Group", "ID", "First Name", "Last Name"]}
            data={filteredAmbassadors.map((m) => [
              m.groupId,
              m.mentorId,
              m.fName,
              m.lName,
            ])}
            visibleColumns={[1, 2, 3]}
            idIndex={1}
            dropdownValues={groupIds.map((g) => String(g.groupId))}
            dropdownDisplayTexts={groupIds.map((g) => g.name)}
            currentDropdownColumnIndex={0}
            useTextInput={ambassadorInputMode === "text"}
            resolveTextValue={resolveGroupIdFromText}
            textInputPlaceholder='e.g. "1" or "Group 1"'
            reassignAction={async (mentorId, newGroupId) => {
              const parsed =
                newGroupId === "unassigned" ? null : Number(newGroupId);
              const result = await reassignMentorGroup(
                Number(mentorId),
                parsed,
              );

              if (result.success) {
                setAmbassadors((prev) =>
                  prev.map((mentor) =>
                    mentor.mentorId === Number(mentorId)
                      ? {
                          ...mentor,
                          groupId: parsed,
                          groupName:
                            parsed !== null
                              ? (groupIds.find((g) => g.groupId === parsed)
                                  ?.name ?? null)
                              : null,
                        }
                      : mentor,
                  ),
                );
                router.refresh();
                showAlert(
                  `Successfully reassigned mentor ${mentorId}`,
                  "success",
                );
              } else {
                showAlert(`Failed to reassign mentor ${mentorId}`, "danger");
              }
            }}
          />
        ) : (
          <DropdownTable
            headers={["Hallway Stop ID", "ID", "First Name", "Last Name"]}
            data={filteredHallwayHosts.map((m) => [
              m.hallwayStopId,
              m.mentorId,
              m.fName,
              m.lName,
            ])}
            visibleColumns={[1, 2, 3]}
            idIndex={1}
            currentDropdownColumnIndex={0}
            dropdownValues={hallwayStops.map((h) => String(h.hallwayStopId))}
            dropdownDisplayTexts={hallwayStops.map(
              (h) => h.location ?? "Unknown Location",
            )}
            reassignAction={async (mentorId, newHallwayId) => {
              const result = await reassignMentorHallway(
                Number(mentorId),
                String(newHallwayId),
              );

              if (result.success) {
                setHallwayHosts((prev) =>
                  prev.map((mentor) =>
                    mentor.mentorId === Number(mentorId)
                      ? {
                          ...mentor,
                          hallwayStopId:
                            newHallwayId === "unassigned"
                              ? null
                              : Number(newHallwayId),
                        }
                      : mentor,
                  ),
                );
                router.refresh();
                showAlert(
                  `Successfully reassigned mentor ${mentorId}`,
                  "success",
                );
              } else {
                showAlert(`Failed to reassign mentor ${mentorId}`, "danger");
              }
            }}
          />
        )}
      </div>
    </main>
  );
}
