"use client";

import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import InfoBox from "../../components/infoBox";
import ContentModal from "../../components/ContentModal";
import ModalShell from "../../components/ModalShell";
import "../../css/admin.css";
import "../../css/logo+login.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSeminarGroups,
  syncGroups,
  hasSeminarData,
  hasAttendeeData,
  hasGroupData,
} from "@/actions/group";
import { createGroupsFromDB, createEstimatedGroups } from "@/actions/routes";
import {
  getEventOptions,
  confirmMentorAttendanceOverrides,
} from "@/actions/other";
import { formatEventDates } from "@/lib/formatEventDates";
import CheckBoxTable from "../../components/checkBoxTable";
import { useAlert } from "../../context/AlertContext";

interface EventOption {
  eventId: number;
  name: string;
  date: string;
  time: string;
  date2: string | null;
  time2: string | null;
}

interface MentorAttendanceMismatch {
  mentorId: number;
  fName: string | null;
  lName: string | null;
  assignedJob: string | null;
  uploadedJob: string | null;
}

export const runtime = "nodejs";

export default function AdminUpload() {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [funnyText, setFunnyText] = useState<Record<string, string>>({});
  const [groupActionLoading, setGroupActionLoading] = useState<
    Record<string, boolean>
  >({});
  const [estimatedGroupCount, setEstimatedGroupCount] = useState<string>("");
  const [fileDetailsOpen, setFileDetailsOpen] = useState<string | null>(null);
  const [showCreateGroupsWarning, setShowCreateGroupsWarning] = useState(false);

  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [selectedAttendanceEvent, setSelectedAttendanceEvent] = useState<
    number | ""
  >("");
  const [attendanceUploading, setAttendanceUploading] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [mismatches, setMismatches] = useState<MentorAttendanceMismatch[]>(
    [],
  );
  const [mismatchSelection, setMismatchSelection] = useState<
    Record<number, boolean>
  >({});
  const [mismatchModalOpen, setMismatchModalOpen] = useState(false);
  const [mismatchEventId, setMismatchEventId] = useState<number | null>(null);
  const [confirmingOverrides, setConfirmingOverrides] = useState(false);

  const { showAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    getEventOptions().then((events) => {
      setEventOptions(events);
      if (events.length > 0) setSelectedAttendanceEvent(events[0].eventId);
    });
  }, []);

  const handleLogoClick = () => {
    router.push("/admin");
  };

  const handleMentorAttendanceUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (selectedAttendanceEvent === "") {
      showAlert("Please select an event first.", "danger");
      e.target.value = "";
      return;
    }

    setAttendanceUploading(true);
    setAttendanceMessage("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const res = await fetch("/api/upload/mentor-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: base64,
          eventId: selectedAttendanceEvent,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setAttendanceMessage(`❌ ${data.error}`);
        showAlert(data.error, "danger");
      } else {
        setAttendanceMessage(`✅ ${data.message}`);
        if (data.mismatches && data.mismatches.length > 0) {
          setMismatches(data.mismatches);
          setMismatchSelection({});
          setMismatchEventId(Number(selectedAttendanceEvent));
          setMismatchModalOpen(true);
        } else {
          showAlert(data.message, "success");
        }
      }
    } catch (err) {
      setAttendanceMessage("❌ Upload failed. Please try again.");
      showAlert("Upload failed. Please try again.", "danger");
    } finally {
      setAttendanceUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmOverrides = async () => {
    if (mismatchEventId === null) return;
    const selectedIds = mismatches
      .filter((m) => mismatchSelection[m.mentorId])
      .map((m) => m.mentorId);

    setConfirmingOverrides(true);
    try {
      await confirmMentorAttendanceOverrides(mismatchEventId, selectedIds);
      showAlert(
        selectedIds.length > 0
          ? `${selectedIds.length} mentor(s) marked present despite job mismatch.`
          : "No additional mentors marked present.",
        "success",
      );
      setMismatchModalOpen(false);
      setMismatches([]);
    } catch {
      showAlert("Failed to update attendance. Please try again.", "danger");
    } finally {
      setConfirmingOverrides(false);
    }
  };

  // Upload handler — identical to original
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    table: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading((prev) => ({ ...prev, [table]: true }));
    setProgress((prev) => ({ ...prev, [table]: 0 }));
    setMessages((prev) => ({ ...prev, [table]: "" }));
    setFunnyText((prev) => ({ ...prev, [table]: "" }));

    try {
      // Convert Excel to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // Smooth fake progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 0.65;
        if (currentProgress > 99) currentProgress = 99;
        setProgress((prev) => ({ ...prev, [table]: currentProgress }));

        if (currentProgress >= 20 && currentProgress < 40)
          setFunnyText((prev) => ({
            ...prev,
            [table]: "Just getting started...",
          }));
        else if (currentProgress >= 50 && currentProgress < 70)
          setFunnyText((prev) => ({
            ...prev,
            [table]: "Halfway there, keep calm!",
          }));
        else if (currentProgress >= 80 && currentProgress < 90)
          setFunnyText((prev) => ({
            ...prev,
            [table]: "Indian sweets are being cooked",
          }));
        else if (currentProgress >= 99)
          setFunnyText((prev) => ({
            ...prev,
            [table]:
              "This is a fake progress bar... but if you are seeing this, it is still working!",
          }));
        else setFunnyText((prev) => ({ ...prev, [table]: "" }));
      }, 100);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileData: base64, table }),
      });

      const data = await res.json();
      clearInterval(interval);
      setProgress((prev) => ({ ...prev, [table]: 100 }));
      setFunnyText((prev) => ({ ...prev, [table]: "" }));

      if (data.error) {
        setMessages((prev) => ({ ...prev, [table]: `❌ ${data.error}` }));
      } else {
        setMessages((prev) => ({ ...prev, [table]: data.message }));
      }
    } catch (err: any) {
      setMessages((prev) => ({
        ...prev,
        [table]: "❌ Upload failed. Please try again.",
      }));
      setProgress((prev) => ({ ...prev, [table]: 0 }));
      setFunnyText((prev) => ({ ...prev, [table]: "" }));
    } finally {
      setLoading((prev) => ({ ...prev, [table]: false }));
      e.target.value = "";
    }
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "bold",
    fontSize: "21px",
    border: "5px solid transparent",
    borderRadius: "14px",
    padding: "5px 5px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "300px",
  };

  const buttonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "var(--primaryBlue)";
    e.currentTarget.style.borderColor = "var(--primaryBlue)";
  };

  const buttonUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "var(--primaryBlue)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.borderColor = "transparent";
  };

  const buttonStyle2 = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--primaryRed)",
    color: "white",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "bold",
    fontSize: "21px",
    border: "5px solid transparent",
    borderRadius: "14px",
    padding: "7px 7px",
    margin: "10px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "270px",
  };

  const buttonHover2 = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "var(--primaryRed)";
    e.currentTarget.style.borderColor = "var(--primaryRed)";
  };

  const buttonUnhover2 = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "var(--primaryRed)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.borderColor = "transparent";
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Upload Data</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <div
        style={{
          width: "87%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          fontSize: "21px",
        }}
      >
        <>
          <button
            style={buttonStyle2}
            onMouseEnter={buttonHover2}
            onMouseLeave={buttonUnhover2}
            type="button"
          >
            Reset Tables
            <i
              className="bi bi-trash"
              style={{ marginLeft: "30px", fontSize: "30px" }}
            />
          </button>
        </>
        <div
          style={{
            width: "85%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <ContentModal title="Group Actions" icon="bi bi-plus-circle">
            <label
              className="form-label"
              style={{
                fontWeight: "bold",
                width: "100%",
                textAlign: "center",
                marginTop: "30px",
                marginBottom: "50px",
              }}
            >
              * Actions must be completed in top to bottom order *
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "50px",
                marginLeft: "15px",
                marginBottom: "50px",
              }}
            >
              {/* ── ESTIMATED GROUPS ── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "30px",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    placeholder="# of groups (e.g. 44)"
                    value={estimatedGroupCount}
                    onChange={(e) => setEstimatedGroupCount(e.target.value)}
                    style={{ width: "220px", fontSize: "18px" }}
                  />
                  <button
                    style={{
                      ...buttonStyle,
                      paddingLeft: "10px",
                      paddingRight: "10px",
                      width: "220px",
                      marginTop: "15px",
                    }}
                    onMouseEnter={buttonHover}
                    onMouseLeave={buttonUnhover}
                    type="button"
                    disabled={
                      groupActionLoading["estimatedGroups"] ||
                      !estimatedGroupCount
                    }
                    onClick={async () => {
                      const count = parseInt(estimatedGroupCount);
                      if (!count || count <= 0) {
                        showAlert(
                          "Please enter a valid group count.",
                          "danger",
                        );
                        return;
                      }
                      setGroupActionLoading((prev) => ({
                        ...prev,
                        estimatedGroups: true,
                      }));
                      try {
                        const total = await createEstimatedGroups(count);
                        showAlert(
                          `Created ${total} estimated groups with routes assigned. You can now assign mentors and rename groups.`,
                          "success",
                        );
                        setEstimatedGroupCount("");
                      } finally {
                        setGroupActionLoading((prev) => ({
                          ...prev,
                          estimatedGroups: false,
                        }));
                      }
                    }}
                  >
                    {groupActionLoading["estimatedGroups"] ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      "Create Estimated Groups"
                    )}
                  </button>
                </div>
                <div className="info-pair">
                  <i
                    className="bi bi-info-circle"
                    style={{
                      marginLeft: "30px",
                      fontSize: "30px",
                      marginBottom: "5px",
                      color: "var(--primaryBlue)",
                      fontWeight: "bold",
                    }}
                  ></i>
                  <div
                    className="info-value"
                    style={{ fontSize: "18px", textAlign: "left" }}
                  >
                    Pre-create groups before seminar data is uploaded. Enter
                    your estimated count and routes will be distributed
                    automatically. Run Assign Groups later to see if any extras
                    are needed. Get Freshmen Prep Class count from counselors
                    and double it for the estimate.
                  </div>
                </div>
              </div>

              {/* ── ASSIGN GROUPS ── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "30px",
                  justifyContent: "center",
                }}
              >
                <button
                  style={{
                    ...buttonStyle,
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    width: "340px",
                  }}
                  onMouseEnter={buttonHover}
                  onMouseLeave={buttonUnhover}
                  type="button"
                  disabled={groupActionLoading["assignGroups"]}
                  onClick={async () => {
                    setGroupActionLoading((prev) => ({
                      ...prev,
                      assignGroups: true,
                    }));
                    try {
                      const seminarExists = await hasSeminarData();
                      if (!seminarExists) {
                        showAlert(
                          "Seminar data has not been uploaded yet. Please upload seminar data before assigning groups.",
                          "danger",
                        );
                        return;
                      }
                      const groupingReturn = await createSeminarGroups();
                      const gapMsg =
                        groupingReturn.groupsStillNeeded > 0
                          ? ` ⚠️ ${groupingReturn.groupsStillNeeded} more group(s) still need to be created (seminar needs ${groupingReturn.finalGroupCount}, you have ${groupingReturn.existingGroupCount}).`
                          : ` All ${groupingReturn.finalGroupCount} groups are accounted for.`;
                      showAlert(
                        `Seminar groups assigned!${gapMsg}`,
                        groupingReturn.groupsStillNeeded > 0
                          ? "warning"
                          : "success",
                      );
                    } catch {
                      showAlert(
                        "Failed to assign groups. Please try again.",
                        "danger",
                      );
                    } finally {
                      setGroupActionLoading((prev) => ({
                        ...prev,
                        assignGroups: false,
                      }));
                    }
                  }}
                >
                  {groupActionLoading["assignGroups"] ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "Assign Groups"
                  )}
                </button>
                <div className="info-pair">
                  <i
                    className="bi bi-info-circle"
                    style={{
                      marginLeft: "30px",
                      fontSize: "30px",
                      marginBottom: "5px",
                      color: "var(--primaryBlue)",
                      fontWeight: "bold",
                    }}
                  ></i>
                  <div
                    className="info-value"
                    style={{ fontSize: "18px", textAlign: "left" }}
                  >
                    Splits each seminar class in half and assigns each half a
                    group number. Run after uploading seminar data. Reports how
                    many additional groups still need to be created if your
                    estimate was off.
                  </div>
                </div>
              </div>

              {/* ── CREATE GROUPS (from seminar data) ── */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "30px",
                  justifyContent: "center",
                }}
              >
                <button
                  style={buttonStyle2}
                  onMouseEnter={buttonHover2}
                  onMouseLeave={buttonUnhover2}
                  type="button"
                  disabled={groupActionLoading["createGroups"]}
                  onClick={async () => {
                    setGroupActionLoading((prev) => ({
                      ...prev,
                      createGroups: true,
                    }));
                    try {
                      const groupsExist = await hasGroupData();
                      if (groupsExist) {
                        setShowCreateGroupsWarning(true);
                        return;
                      }
                      const groupTotal = await createGroupsFromDB();
                      showAlert(
                        `Created ${groupTotal} groups from seminar data and seeded tour routes automatically.`,
                        "success",
                      );
                    } finally {
                      setGroupActionLoading((prev) => ({
                        ...prev,
                        createGroups: false,
                      }));
                    }
                  }}
                >
                  {groupActionLoading["createGroups"] ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "Create Groups"
                  )}
                </button>
                <div className="info-pair">
                  <i
                    className="bi bi-info-circle"
                    style={{
                      marginLeft: "30px",
                      fontSize: "30px",
                      marginBottom: "5px",
                      color: "var(--primaryBlue)",
                      fontWeight: "bold",
                    }}
                  ></i>
                  <div
                    className="info-value"
                    style={{ fontSize: "18px", textAlign: "left" }}
                  >
                    Builds groups from seminar data (skips pre-planning). Only
                    use this if you did NOT use Create Estimated Groups above.
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "30px",
                  justifyContent: "center",
                }}
              >
                <button
                  style={{ ...buttonStyle, width: "340px" }}
                  onMouseEnter={buttonHover}
                  onMouseLeave={buttonUnhover}
                  type="button"
                  disabled={groupActionLoading["syncGroups"]}
                  onClick={async () => {
                    setGroupActionLoading((prev) => ({
                      ...prev,
                      syncGroups: true,
                    }));
                    try {
                      const attendeesExist = await hasAttendeeData();
                      if (!attendeesExist) {
                        showAlert(
                          "Attendee data has not been uploaded yet. Please upload attendee data before syncing groups.",
                          "danger",
                        );
                        return;
                      }
                      const seminarExists = await hasSeminarData();
                      if (!seminarExists) {
                        showAlert(
                          "Seminar data has not been uploaded yet. Please upload seminar data before syncing groups.",
                          "danger",
                        );
                        return;
                      }
                      const syncResult = await syncGroups();
                      const unmatchedCount = syncResult.unmatched.length;
                      showAlert(
                        unmatchedCount > 0
                          ? `Groups synced! ${unmatchedCount} attendee(s) could not be matched.`
                          : "Groups synced successfully! All attendees matched.",
                        unmatchedCount > 0 ? "warning" : "success",
                      );
                    } catch {
                      showAlert(
                        "Failed to sync groups. Please try again.",
                        "danger",
                      );
                    } finally {
                      setGroupActionLoading((prev) => ({
                        ...prev,
                        syncGroups: false,
                      }));
                    }
                  }}
                >
                  {groupActionLoading["syncGroups"] ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    "Sync Groups"
                  )}
                </button>
                <div className="info-pair">
                  <i
                    className="bi bi-info-circle"
                    style={{
                      marginLeft: "30px",
                      fontSize: "30px",
                      marginBottom: "5px",
                      color: "var(--primaryBlue)",
                      fontWeight: "bold",
                    }}
                  ></i>
                  <div
                    className="info-value"
                    style={{ fontSize: "18px", textAlign: "left" }}
                  >
                    Matches each attendee from GoFan to their seminar group by
                    ID or name, and updates their group assignment.
                  </div>
                </div>
              </div>
            </div>
          </ContentModal>
        </div>
      </div>

      <section className="upload-section">
        <InfoBox headerText="">
          <div className="upload-form">
            {[
              {
                label: "Mentor Data",
                table: "mentor_data",
                columns: [
                  { name: "Mentor ID", required: true },
                  { name: "First Name", required: true },
                  { name: "Last Name", required: true },
                  { name: "Email", required: true },
                  { name: "Job", required: true },
                  { name: "Graduation Year", required: false },
                  { name: "Pizza", required: false },
                  { name: "Languages", required: false },
                  { name: "Training Day", required: false },
                  { name: "Shirt Size", required: false },
                  { name: "Phone Number", required: false },
                  { name: "Past Mentor", required: false },
                  { name: "Interests Involvement", required: false },
                ],
                examples: [
                  [
                    "262096",
                    "Katara",
                    "Waterbender",
                    "2026",
                    "AMBASSADOR",
                    "cheese",
                    "Vietnamese",
                    "Friday, July 10",
                    "Large",
                    "7195414357",
                    "waterkat096@hsestudents.org",
                  ],
                  [
                    "271469",
                    "Sokka",
                    "Boomerang",
                    "2027",
                    "AMBASSADOR",
                    "sausage",
                    "English",
                    "Friday, July 10",
                    "Medium",
                    "3472927192",
                    "boomesok469@hsestudents.org",
                  ],
                  [
                    "271261",
                    "Toph",
                    "Beifong",
                    "2027",
                    "AMBASSADOR",
                    "cheese",
                    "Mandarin",
                    "Friday, July 10",
                    "Medium",
                    "9548523834",
                    "beifotop261@hsestudents.org",
                  ],
                ],
              },
              {
                label: "GoFan → Attendee Data",
                table: "attendee_data",
                columns: [
                  { name: "Student ID", required: true },
                  { name: "First Name", required: true },
                  { name: "Last Name", required: true },
                  { name: "Shirt Size", required: false },
                  { name: "Email", required: true },
                  { name: "Primary Language", required: false },
                  { name: "Interests", required: false },
                  { name: "Health Concerns", required: false },
                ],
                examples: [
                  [
                    "290722",
                    "Aang",
                    "Airbender",
                    "MEDIUM",
                    "aang277@gmail.com",
                    "Personal Info",
                    "NA",
                  ],
                  [
                    "291675",
                    "Zuko",
                    "Firelord",
                    "SMALL",
                    "zuko_firelord@g...",
                    "Athletics",
                    "Peanut allergy",
                  ],
                  [
                    "290747",
                    "Suki",
                    "Kyoshi",
                    "SMALL",
                    "sukikyoshi166@...",
                    "Athletics",
                    "Celiac disease",
                  ],
                ],
              },
              {
                label: "Freshman Prep Classes → Seminar Data",
                table: "seminar_data",
                columns: [
                  { name: "Last Name", required: true },
                  { name: "First Name", required: true },
                  { name: "Freshmen ID", required: true },
                  { name: "Semester", required: true },
                  { name: "Teacher Full Name", required: true },
                  { name: "Period", required: true },
                ],
                examples: [
                  ["Airbender", "Aang", "300400", "S1", "AANG AIR", "1"],
                  ["Beifong", "Toph", "280420", "S1", "AANG AIR", "1"],
                  ["Waterbender", "Katara", "301365", "S1", "AANG AIR", "1"],
                ],
              },
            ].map((item) => (
              <div
                key={item.table}
                className="upload-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 2fr 2fr",
                  rowGap: "0.5rem",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <label style={{ gridColumn: "1 / 2" }}>
                  Upload {item.label}:
                </label>
                <div
                  className="file-input-wrapper d-flex align-items-center"
                  style={{ gridColumn: "2 / 4", gap: "0.5rem" }}
                >
                  <input
                    type="file"
                    className="file-input flex-grow-1"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleUpload(e, item.table)}
                    disabled={loading[item.table]}
                  />
                  {loading[item.table] ? (
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <button className="upload-icon" disabled>
                      <i className="bi bi-cloud-upload-fill"></i>
                    </button>
                  )}
                </div>

                <button
                  style={buttonStyle}
                  onMouseEnter={buttonHover}
                  onMouseLeave={buttonUnhover}
                  type="button"
                  onClick={() => setFileDetailsOpen(item.table)}
                >
                  File Details
                </button>

                <ContentModal
                  title="File Details"
                  icon="bi bi-info-circle"
                  show={fileDetailsOpen === item.table}
                  onClose={() => setFileDetailsOpen(null)}
                >
                  <label
                    className="form-label"
                    style={{
                      fontWeight: "bold",
                      width: "100%",
                      textAlign: "center",
                      marginBottom: "20px",
                    }}
                  >
                    {item.label} — Column Headers
                  </label>
                  <p
                    style={{
                      margin: "0 0 30px",
                      fontSize: "18px",
                    }}
                  >
                    {item.columns.map((col, i) => (
                      <span key={col.name}>
                        {col.name}
                        {!col.required && (
                          <span
                            style={{
                              color: "var(--secondarySilver)",
                              fontWeight: "normal",
                            }}
                          >
                            {" "}
                            (optional)
                          </span>
                        )}
                        {i < item.columns.length - 1 && ", "}
                      </span>
                    ))}
                  </p>

                  <label
                    className="form-label"
                    style={{
                      fontWeight: "bold",
                      width: "100%",
                      textAlign: "center",
                      marginBottom: "20px",
                    }}
                  >
                    Example Data:
                  </label>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        borderCollapse: "collapse",
                        fontSize: "15px",
                        width: "100%",
                      }}
                    >
                      <thead>
                        <tr>
                          {item.columns.map((col) => (
                            <th
                              key={col.name}
                              style={{
                                textAlign: "left",
                                padding: "6px 12px",
                                borderBottom: "2px solid var(--primaryBlue)",
                                color: "var(--primaryBlue)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.examples.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                style={{
                                  padding: "6px 12px",
                                  whiteSpace: "nowrap",
                                  borderBottom:
                                    i === item.examples.length - 1
                                      ? "none"
                                      : "1px solid #eee",
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ContentModal>

                <p
                  style={{
                    gridColumn: "1 / 2",
                    margin: 0,
                    color: messages[item.table]?.startsWith("❌")
                      ? "red"
                      : "green",
                    fontWeight: "bold",
                  }}
                >
                  {messages[item.table]}
                </p>

                {progress[item.table] !== undefined && (
                  <div style={{ gridColumn: "2 / 4" }}>
                    <div
                      className="progress"
                      style={{ height: "25px", width: "100%" }}
                    >
                      <div
                        className={`progress-bar ${progress[item.table] === 100 ? "bg-success" : "progress-bar-striped progress-bar-animated"}`}
                        role="progressbar"
                        style={{
                          width: `${progress[item.table]}%`,
                          transition: "width 0.2s",
                        }}
                        aria-valuenow={progress[item.table]}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        {Math.floor(progress[item.table])}%{" "}
                        {funnyText[item.table] && ` - ${funnyText[item.table]}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div
              className="upload-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 2fr 2fr",
                rowGap: "0.5rem",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <label style={{ gridColumn: "1 / 2" }}>
                Upload Mentor Attendance (QR Scan):
              </label>
              <div
                className="file-input-wrapper d-flex align-items-center"
                style={{ gridColumn: "2 / 4", gap: "0.5rem" }}
              >
                <select
                  className="form-select"
                  value={selectedAttendanceEvent}
                  onChange={(e) =>
                    setSelectedAttendanceEvent(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  style={{ maxWidth: "260px" }}
                  disabled={attendanceUploading || eventOptions.length === 0}
                >
                  {eventOptions.length === 0 && (
                    <option value="">No events available</option>
                  )}
                  {eventOptions.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.name} ({formatEventDates(event)})
                    </option>
                  ))}
                </select>
                <input
                  type="file"
                  className="file-input flex-grow-1"
                  accept=".xlsx,.xls"
                  onChange={handleMentorAttendanceUpload}
                  disabled={
                    attendanceUploading || selectedAttendanceEvent === ""
                  }
                />
                {attendanceUploading ? (
                  <div className="spinner-border text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <button className="upload-icon" disabled>
                    <i className="bi bi-cloud-upload-fill"></i>
                  </button>
                )}
              </div>

              <button
                style={buttonStyle}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonUnhover}
                type="button"
                onClick={() => setFileDetailsOpen("mentor_attendance")}
              >
                File Details
              </button>

              <ContentModal
                title="File Details"
                icon="bi bi-info-circle"
                show={fileDetailsOpen === "mentor_attendance"}
                onClose={() => setFileDetailsOpen(null)}
              >
                <label
                  className="form-label"
                  style={{
                    fontWeight: "bold",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  Mentor Attendance (QR Scan) — Column Headers
                </label>
                <p
                  style={{
                    margin: "0 0 30px",
                    fontSize: "18px",
                  }}
                >
                  Mentor ID
                  <span
                    style={{
                      color: "var(--secondarySilver)",
                      fontWeight: "normal",
                    }}
                  >
                    {" "}
                    (required)
                  </span>
                  , Job
                  <span
                    style={{
                      color: "var(--secondarySilver)",
                      fontWeight: "normal",
                    }}
                  >
                    {" "}
                    (optional — if included, it&apos;s checked against each
                    mentor&apos;s assigned job; if omitted, everyone scanned is
                    marked present)
                  </span>
                  . Extra columns are ignored.
                </p>

                <label
                  className="form-label"
                  style={{
                    fontWeight: "bold",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  Example Data:
                </label>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      borderCollapse: "collapse",
                      fontSize: "15px",
                      width: "100%",
                    }}
                  >
                    <thead>
                      <tr>
                        {["Mentor ID", "Job"].map((col) => (
                          <th
                            key={col}
                            style={{
                              textAlign: "left",
                              padding: "6px 12px",
                              borderBottom: "2px solid var(--primaryBlue)",
                              color: "var(--primaryBlue)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["262096", "AMBASSADOR"],
                        ["271469", "AMBASSADOR"],
                        ["271261", "HALLWAY HOST"],
                      ].map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              style={{
                                padding: "6px 12px",
                                whiteSpace: "nowrap",
                                borderBottom: i === 2 ? "none" : "1px solid #eee",
                              }}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ContentModal>

              <p
                style={{
                  gridColumn: "1 / 2",
                  margin: 0,
                  color: attendanceMessage.startsWith("❌") ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {attendanceMessage}
              </p>
            </div>
          </div>
        </InfoBox>
      </section>

      <ContentModal
        title="Mentor Attendance Mismatches"
        icon="bi bi-exclamation-triangle"
        show={mismatchModalOpen}
        onClose={() => setMismatchModalOpen(false)}
      >
        <label
          className="form-label"
          style={{
            fontWeight: "bold",
            width: "100%",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          These mentors scanned in with a job that doesn&apos;t match their
          assigned job. Check any you&apos;d like to mark present anyway.
        </label>
        <CheckBoxTable
          headers={[
            "Student ID",
            "First Name",
            "Last Name",
            "Assigned Job",
            "Scanned Job",
          ]}
          data={mismatches.map((m) => [
            m.mentorId.toString(),
            m.fName ?? "",
            m.lName ?? "",
            m.assignedJob ?? "",
            m.uploadedJob ?? "",
          ])}
          status={mismatches.map((m) => mismatchSelection[m.mentorId] ?? false)}
          rowIds={mismatches.map((m) => m.mentorId)}
          onStatusChange={(mentorId, newStatus) =>
            setMismatchSelection((prev) => ({
              ...prev,
              [mentorId]: newStatus,
            }))
          }
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            style={buttonStyle}
            onMouseEnter={buttonHover}
            onMouseLeave={buttonUnhover}
            type="button"
            disabled={confirmingOverrides}
            onClick={handleConfirmOverrides}
          >
            {confirmingOverrides ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </ContentModal>

      <div
        style={{
          margin: "40px 0 60px",
          textAlign: "center",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <p
          style={{
            color: "var(--primaryBlue)",
            fontWeight: 600,
            fontSize: "1rem",
            marginBottom: "12px",
          }}
        >
          Need to clear uploaded data?
        </p>
        <button
          style={{
            backgroundColor: "var(--primaryRed)",
            color: "white",
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            border: "3px solid var(--primaryRed)",
            borderRadius: "10px",
            padding: "10px 28px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
          onClick={() => router.push("/admin/reset")}
        >
          Go to Reset Tables
        </button>
      </div>

      {showCreateGroupsWarning && (
        <ModalShell
          title="Groups Already Exist"
          onClose={() => setShowCreateGroupsWarning(false)}
          footer={
            <>
              <button
                style={buttonStyle}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonUnhover}
                type="button"
                onClick={() => setShowCreateGroupsWarning(false)}
              >
                Cancel
              </button>
              <button
                style={buttonStyle2}
                onMouseEnter={buttonHover2}
                onMouseLeave={buttonUnhover2}
                type="button"
                disabled={groupActionLoading["createGroups"]}
                onClick={async () => {
                  setShowCreateGroupsWarning(false);
                  setGroupActionLoading((prev) => ({
                    ...prev,
                    createGroups: true,
                  }));
                  try {
                    const groupTotal = await createGroupsFromDB();
                    showAlert(
                      `Created ${groupTotal} groups from seminar data and seeded tour routes automatically.`,
                      "success",
                    );
                  } finally {
                    setGroupActionLoading((prev) => ({
                      ...prev,
                      createGroups: false,
                    }));
                  }
                }}
              >
                Continue Anyway
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: "17px" }}>
            Groups already exist in the database — likely from{" "}
            <strong>Create Estimated Groups</strong> or a previous run of{" "}
            <strong>Create Groups</strong>. Running this again will create a
            second, duplicate set of groups instead of replacing the existing
            ones. Clear the groups from{" "}
            <strong>Reset Tables</strong> first if you want a clean set, or
            continue only if you&apos;re sure you want duplicates.
          </p>
        </ModalShell>
      )}
    </main>
  );
}
