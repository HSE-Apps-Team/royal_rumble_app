"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import ModalShell from "../../components/ModalShell";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import BackButton from "../../components/backButton";
import AddButton from "../../components/addButton";
import SaveButton from "../../components/saveButton";
import ViewDropdown from "../../components/viewDropdown";
import InfoBox from "../../components/infoBox";
import { addHallway } from "@/actions/group";
import "../../css/admin.css";
import "../../css/logo+login.css";
import { useAlert } from "../../context/AlertContext";
import {
  updateEventOrderPattern,
  addEventOrderPattern,
  deleteEventOrderPattern,
  upsertBlockSchedule,
  deleteBlockSchedule,
  addTourRouteStop,
  deleteTourRouteStop,
  setEventStartTime,
} from "@/actions/routes";

interface Pattern {
  patternId: number;
  patternNum: number;
  blockOrder: string[];
}

interface Block {
  blockScheduleId: number;
  blockName: string;
  durationMinutes: number;
}

interface RouteStop {
  routeStopId: number;
  stopOrder: number;
  durationMinutes: number;
  hallwayStopId: number;
  location: string | null;
}

interface Route {
  routeId: number;
  routeNum: number;
  stops: RouteStop[];
}

interface Hallway {
  hallwayStopId: number;
  location: string;
}

interface Props {
  patterns: Pattern[];
  blocks: Block[];
  routes: Route[];
  hallways: Hallway[];
  eventStartTime: string;
}

const makeModalBtn = (bg: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bg,
  color: "white",
  fontFamily: "Poppins, sans-serif",
  fontWeight: "bold",
  fontSize: "15px",
  border: "5px solid transparent",
  borderRadius: "14px",
  padding: "8px 18px",
  cursor: "pointer",
  minWidth: "100px",
});
const cancelBtnStyle = makeModalBtn("var(--secondarySilver)");
const deleteBtnStyle = makeModalBtn("var(--primaryRed)");
const saveBtnStyle = makeModalBtn("var(--primaryBlue)");

const inputStyle: React.CSSProperties = {
  border: "4px solid var(--primaryBlue)",
  padding: "10px",
  fontSize: "18px",
  fontFamily: "Poppins, sans-serif",
  color: "var(--textBlack)",
  fontWeight: 400,
  minWidth: "260px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "22px",
  color: "var(--primaryBlue)",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "28px",
  color: "var(--primaryBlue)",
  transition: "color 0.2s",
};

export default function AdminRoutesUI({
  patterns,
  blocks,
  routes,
  hallways,
  eventStartTime,
}: Props) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [activeSection, setActiveSection] = useState<
    "orders" | "schedule" | "routes"
  >("orders");

  const [newHallway, setNewHallway] = useState("");
  const [showHallwayModal, setShowHallwayModal] = useState(false);

  const [patternsState, setPatternsState] = useState<Pattern[]>(patterns);

  const [patternEdits, setPatternEdits] = useState<Record<number, string>>(
    Object.fromEntries(
      patterns.map((p) => [p.patternId, p.blockOrder.join(", ")]),
    ),
  );

  // New pattern input
  const [newPatternInput, setNewPatternInput] = useState("");

  const handleSavePattern = async (patternId: number) => {
    const raw = patternEdits[patternId] ?? "";
    const blockOrder = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (blockOrder.length === 0) {
      showAlert("Pattern cannot be empty.", "danger");
      return;
    }
    await updateEventOrderPattern(patternId, blockOrder);
    setPatternsState((prev) =>
      prev.map((p) => (p.patternId === patternId ? { ...p, blockOrder } : p)),
    );
    showAlert("Pattern saved!", "success");
  };

  const handleDeletePattern = async (patternId: number) => {
    await deleteEventOrderPattern(patternId);
    setPatternsState((prev) => prev.filter((p) => p.patternId !== patternId));
    showAlert("Pattern deleted.", "success");
    return { success: true };
  };

  const handleAddPattern = async () => {
    const blockOrder = newPatternInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (blockOrder.length === 0) {
      showAlert("Please enter at least one block name.", "danger");
      return;
    }
    const result = await addEventOrderPattern(blockOrder);
    setPatternsState((prev) => [...prev, result]);
    setPatternEdits((prev) => ({
      ...prev,
      [result.patternId]: blockOrder.join(", "),
    }));
    setNewPatternInput("");
    showAlert(`Pattern ${result.patternNum} added!`, "success");
  };

  const [blocksState, setBlocksState] = useState<Block[]>(blocks);
  const [blockEdits, setBlockEdits] = useState<
    Record<number, { durationMinutes: string }>
  >(
    Object.fromEntries(
      blocks.map((b) => [
        b.blockScheduleId,
        {
          durationMinutes: b.durationMinutes.toString(),
        },
      ]),
    ),
  );
  const [newBlockName, setNewBlockName] = useState("");
  const [newBlockDuration, setNewBlockDuration] = useState("");

  const [eventStartTimeInput, setEventStartTimeInput] =
    useState(eventStartTime);

  const handleSaveEventStartTime = async () => {
    if (!eventStartTimeInput.trim()) {
      showAlert("Please enter an event start time.", "danger");
      return;
    }
    await setEventStartTime(eventStartTimeInput.trim());
    showAlert("Event start time saved!", "success");
  };

  // Block delete modal state
  const [blockDeleteModal, setBlockDeleteModal] = useState<{
    blockScheduleId: number;
    blockName: string;
  } | null>(null);

  // Stop delete modal state
  const [stopDeleteModal, setStopDeleteModal] = useState<{
    routeId: number;
    routeStopId: number;
    stopOrder: number;
    location: string | null;
  } | null>(null);

  const handleSaveBlock = async (block: Block) => {
    const edit = blockEdits[block.blockScheduleId];
    const duration = parseInt(edit?.durationMinutes ?? "");
    if (isNaN(duration)) {
      showAlert("Please enter a valid duration.", "danger");
      return;
    }
    await upsertBlockSchedule(block.blockName, duration);
    setBlocksState((prev) =>
      prev.map((b) =>
        b.blockScheduleId === block.blockScheduleId
          ? { ...b, durationMinutes: duration }
          : b,
      ),
    );
    showAlert(`Block "${block.blockName}" saved!`, "success");
  };

  const handleDeleteBlock = async (
    blockScheduleId: number,
    blockName: string,
  ) => {
    await deleteBlockSchedule(blockScheduleId);
    setBlocksState((prev) =>
      prev.filter((b) => b.blockScheduleId !== blockScheduleId),
    );
    showAlert(`Block "${blockName}" deleted.`, "success");
  };

  const handleAddBlock = async () => {
    const duration = parseInt(newBlockDuration);
    if (!newBlockName || isNaN(duration)) {
      showAlert("Please fill in all fields for the new block.", "danger");
      return;
    }
    const result = await upsertBlockSchedule(newBlockName.trim(), duration);
    if (result.action === "created" && result.inserted) {
      setBlocksState((prev) => [...prev, result.inserted]);
      setBlockEdits((prev) => ({
        ...prev,
        [result.inserted.blockScheduleId]: {
          durationMinutes: result.inserted.durationMinutes.toString(),
        },
      }));
    }
    showAlert(`Block "${newBlockName}" added!`, "success");
    setNewBlockName("");
    setNewBlockDuration("");
  };

  const [routesState, setRoutesState] = useState<Route[]>(routes);
  const [newStopHallway, setNewStopHallway] = useState<Record<number, string>>(
    {},
  );
  const [newStopDuration, setNewStopDuration] = useState<
    Record<number, string>
  >({});

  const handleAddStop = async (routeId: number) => {
    const hallwayId = parseInt(newStopHallway[routeId] ?? "");
    const duration = parseInt(newStopDuration[routeId] ?? "");
    if (isNaN(hallwayId) || isNaN(duration) || duration < 1) {
      showAlert("Please select a stop and enter a valid duration.", "danger");
      return;
    }
    let result;
    try {
      result = await addTourRouteStop(routeId, hallwayId, duration);
    } catch (err) {
      showAlert(
        err instanceof Error ? err.message : "Failed to add stop.",
        "danger",
      );
      return;
    }
    const hallway = hallways.find((h) => h.hallwayStopId === hallwayId);
    setRoutesState((prev) =>
      prev.map((r) =>
        r.routeId !== routeId
          ? r
          : {
              ...r,
              stops: [
                ...r.stops,
                {
                  routeStopId: result.routeStopId,
                  stopOrder: result.stopOrder,
                  durationMinutes: result.durationMinutes,
                  hallwayStopId: result.hallwayStopId,
                  location: hallway?.location ?? "",
                },
              ],
            },
      ),
    );
    setNewStopHallway((prev) => ({ ...prev, [routeId]: "" }));
    setNewStopDuration((prev) => ({ ...prev, [routeId]: "" }));
    showAlert("Stop added!", "success");
  };

  const handleDeleteStop = async (routeId: number, routeStopId: number) => {
    await deleteTourRouteStop(routeStopId);
    setRoutesState((prev) =>
      prev.map((r) =>
        r.routeId !== routeId
          ? r
          : {
              ...r,
              stops: r.stops
                .filter((s) => s.routeStopId !== routeStopId)
                .map((s, i) => ({ ...s, stopOrder: i + 1 })),
            },
      ),
    );
    showAlert("Stop removed.", "success");
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Route Management</h1>
      </header>

      <BackButton href="/admin" />

      {/* ── Section Toggle ─────────────────────────────────────── */}
      <div style={{ width: "85%", marginTop: "20px" }}>
        <div className="form-container" style={{ margin: "0px" }}>
          <form className="manual-add-form">
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="routeSection"
                  className="checkbox-input"
                  checked={activeSection === "orders"}
                  onChange={() => setActiveSection("orders")}
                />
                Event Orders
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="routeSection"
                  className="checkbox-input"
                  checked={activeSection === "schedule"}
                  onChange={() => setActiveSection("schedule")}
                />
                Block Schedule
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="routeSection"
                  className="checkbox-input"
                  checked={activeSection === "routes"}
                  onChange={() => setActiveSection("routes")}
                />
                Tour Routes
              </label>
            </div>
          </form>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 1 — EVENT ORDER PATTERNS
      ══════════════════════════════════════════════ */}
      {activeSection === "orders" && (
        <>
          <ViewDropdown
            header="Event Order Patterns"
            sections={patternsState.map((pattern) => ({
              title: `Pattern ${pattern.patternNum}: ${pattern.blockOrder.join(" → ")}`,
              sectionId: pattern.patternId,
              content: (
                <section>
                  <p
                    style={{
                      color: "var(--textBlack)",
                      fontWeight: "normal",
                      fontSize: "18px",
                      marginBottom: "20px",
                    }}
                  >
                    Enter block names separated by commas in the order groups
                    should visit them.
                    <br />
                    Example: <strong>Tour, Leonard, Gym</strong>
                  </p>
                  <div className="form-row">
                    <label style={labelStyle}>Block Order:</label>
                    <input
                      type="text"
                      style={{ ...inputStyle, width: "500px" }}
                      placeholder="e.g. Tour, Leonard, Gym"
                      value={patternEdits[pattern.patternId] ?? ""}
                      onChange={(e) =>
                        setPatternEdits((prev) => ({
                          ...prev,
                          [pattern.patternId]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "20px",
                    }}
                  >
                    <SaveButton
                      onClick={() => handleSavePattern(pattern.patternId)}
                      style={{
                        width: "150px",
                        fontSize: "20px",
                        height: "50px",
                      }}
                    >
                      Save
                    </SaveButton>
                  </div>
                </section>
              ),
            }))}
            deleteAction={async (id) => handleDeletePattern(Number(id))}
          />

          {/* Add New Pattern */}
          <InfoBox headerText="Add New Pattern">
            <p
              style={{
                color: "var(--textBlack)",
                fontWeight: "normal",
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              Enter block names separated by commas. Example:{" "}
              <strong>Gym, Tour, Leonard</strong>
            </p>
            <div className="form-row" style={{ flexWrap: "wrap", gap: "20px" }}>
              <label style={labelStyle}>Block Order:</label>
              <input
                type="text"
                style={{ ...inputStyle, width: "500px" }}
                placeholder="e.g. Gym, Tour, Leonard"
                value={newPatternInput}
                onChange={(e) => setNewPatternInput(e.target.value)}
              />
              <AddButton
                onClick={handleAddPattern}
                style={{ width: "160px", fontSize: "20px", height: "50px" }}
              >
                Add
                <i
                  className="bi bi-plus-circle"
                  style={{ marginLeft: "10px", fontSize: "22px" }}
                />
              </AddButton>
            </div>
          </InfoBox>
        </>
      )}

      {/* ══════════════════════════════════════════════
          SECTION 2 — BLOCK SCHEDULE
      ══════════════════════════════════════════════ */}
      {activeSection === "schedule" && (
        <InfoBox headerText="Block Schedule">
          <p
            style={{
              color: "var(--textBlack)",
              fontWeight: "normal",
              fontSize: "18px",
              marginBottom: "20px",
            }}
          >
            Set the overall event start time and each block's duration. Block
            start times are calculated automatically by chaining durations in
            each group's event order. Block names must match exactly what is
            used in the Event Order Patterns (e.g. Tour, Leonard, Gym).
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "20px",
              paddingBottom: "20px",
              marginBottom: "20px",
              borderBottom: "3px solid var(--primaryRed)",
            }}
          >
            <label style={labelStyle}>Event Start Time:</label>
            <input
              type="text"
              style={{ ...inputStyle, width: "180px" }}
              placeholder="e.g. 9:00 AM"
              value={eventStartTimeInput}
              onChange={(e) => setEventStartTimeInput(e.target.value)}
            />
            <SaveButton
              onClick={handleSaveEventStartTime}
              style={{ width: "120px", fontSize: "18px", height: "48px" }}
            >
              Save
            </SaveButton>
          </div>

          {blocksState.length === 0 && (
            <p
              style={{
                color: "var(--textBlack)",
                fontWeight: "normal",
                fontSize: "18px",
              }}
            >
              No blocks defined yet. Add one below.
            </p>
          )}

          {blocksState.map((block) => (
            <div
              key={block.blockScheduleId}
              style={{
                borderBottom: "2px solid var(--primaryBlue)",
                paddingBottom: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <span style={{ ...labelStyle, minWidth: "80px" }}>
                  {block.blockName}
                </span>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <label style={labelStyle}>Duration (min):</label>
                  <input
                    type="number"
                    style={{ ...inputStyle, width: "140px" }}
                    placeholder="e.g. 45"
                    value={
                      blockEdits[block.blockScheduleId]?.durationMinutes ?? ""
                    }
                    onChange={(e) =>
                      setBlockEdits((prev) => ({
                        ...prev,
                        [block.blockScheduleId]: {
                          ...prev[block.blockScheduleId],
                          durationMinutes: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <SaveButton
                    onClick={() => handleSaveBlock(block)}
                    style={{ width: "120px", fontSize: "18px", height: "48px" }}
                  >
                    Save
                  </SaveButton>
                  <button
                    style={iconBtn}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--primaryRed)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--primaryBlue)")
                    }
                    onClick={() =>
                      setBlockDeleteModal({
                        blockScheduleId: block.blockScheduleId,
                        blockName: block.blockName,
                      })
                    }
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Block */}
          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "3px solid var(--primaryRed)",
            }}
          >
            <label
              className="info-label"
              style={{ marginBottom: "20px", display: "block" }}
            >
              Add New Block:
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <label style={labelStyle}>Block Name:</label>
                <input
                  type="text"
                  style={{ ...inputStyle, width: "200px" }}
                  placeholder="e.g. Tour"
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                />
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <label style={labelStyle}>Duration (min):</label>
                <input
                  type="number"
                  style={{ ...inputStyle, width: "140px" }}
                  placeholder="e.g. 45"
                  value={newBlockDuration}
                  onChange={(e) => setNewBlockDuration(e.target.value)}
                />
              </div>
              <AddButton
                onClick={handleAddBlock}
                style={{ width: "160px", fontSize: "20px", height: "50px" }}
              >
                Add
                <i
                  className="bi bi-plus-circle"
                  style={{ marginLeft: "10px", fontSize: "22px" }}
                />
              </AddButton>
            </div>
          </div>
        </InfoBox>
      )}

      {/* ══════════════════════════════════════════════
          SECTION 3 — TOUR ROUTES
          Routes are auto-created when groups are made.
          This section is edit-only — add/remove stops.
      ══════════════════════════════════════════════ */}
      {activeSection === "routes" && (
        <>
          {routesState.length === 0 ? (
            <div
              style={{
                marginTop: "60px",
                fontSize: "22px",
                color: "var(--primaryBlue)",
                textAlign: "center",
              }}
            >
              No routes yet. Routes are created automatically when you click
              <strong> Create Groups</strong> on the Upload page.
            </div>
          ) : (
            <>
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
              <ViewDropdown
                header="Tour Routes"
                sections={routesState.map((route) => ({
                  title: `Route ${route.routeNum} — ${route.stops.length} stop${route.stops.length !== 1 ? "s" : ""}`,
                  sectionId: route.routeId,
                  content: (
                    <section>
                      {/* Stops table */}
                      {route.stops.length === 0 ? (
                        <p
                          style={{
                            color: "var(--textBlack)",
                            fontWeight: "normal",
                            fontSize: "18px",
                            marginBottom: "20px",
                          }}
                        >
                          No stops yet. Add one below.
                        </p>
                      ) : (
                        <table
                          style={{
                            borderCollapse: "collapse",
                            width: "85%",
                            margin: "0 auto 30px",
                            border: "4px solid var(--primaryBlue)",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          <thead>
                            <tr>
                              {["#", "Location", "Duration (min)", ""].map(
                                (h, i) => (
                                  <th
                                    key={i}
                                    style={{
                                      backgroundColor: "var(--primaryBlue)",
                                      color: "white",
                                      fontWeight: "bold",
                                      textAlign: "center",
                                      padding: "12px",
                                      border: "2px solid var(--primaryBlue)",
                                    }}
                                  >
                                    {h}
                                  </th>
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {route.stops.map((stop) => (
                              <tr key={stop.routeStopId}>
                                {[
                                  stop.stopOrder,
                                  stop.location ?? "Unknown",
                                  `${stop.durationMinutes} min`,
                                ].map((val, i) => (
                                  <td
                                    key={i}
                                    style={{
                                      backgroundColor: "white",
                                      textAlign: "center",
                                      padding: "12px",
                                      border: "2px solid var(--primaryBlue)",
                                      fontSize: "20px",
                                    }}
                                  >
                                    {val}
                                  </td>
                                ))}
                                <td
                                  style={{
                                    backgroundColor: "white",
                                    textAlign: "center",
                                    padding: "12px",
                                    border: "2px solid var(--primaryBlue)",
                                  }}
                                >
                                  <button
                                    style={iconBtn}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color =
                                        "var(--primaryRed)")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color =
                                        "var(--primaryBlue)")
                                    }
                                    onClick={() =>
                                      setStopDeleteModal({
                                        routeId: route.routeId,
                                        routeStopId: stop.routeStopId,
                                        stopOrder: stop.stopOrder,
                                        location: stop.location,
                                      })
                                    }
                                  >
                                    <i className="bi bi-trash" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* Add Stop form */}
                      <div
                        style={{
                          borderTop: "2px solid var(--primaryBlue)",
                          paddingTop: "20px",
                          marginTop: "10px",
                        }}
                      >
                        <label
                          className="info-label"
                          style={{ marginBottom: "15px", display: "block" }}
                        >
                          Add Stop:
                        </label>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: "20px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <label style={labelStyle}>Location:</label>
                            <select
                              className="form-select"
                              style={{ width: "280px", fontSize: "18px" }}
                              value={newStopHallway[route.routeId] ?? ""}
                              onChange={(e) =>
                                setNewStopHallway((prev) => ({
                                  ...prev,
                                  [route.routeId]: e.target.value,
                                }))
                              }
                            >
                              <option value="" disabled>
                                Select a stop...
                              </option>
                              {hallways.map((h) => (
                                <option
                                  key={h.hallwayStopId}
                                  value={h.hallwayStopId}
                                >
                                  {h.location}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <label style={labelStyle}>Duration (min):</label>
                            <input
                              type="number"
                              style={{ ...inputStyle, width: "140px" }}
                              placeholder="e.g. 10"
                              value={newStopDuration[route.routeId] ?? ""}
                              onChange={(e) =>
                                setNewStopDuration((prev) => ({
                                  ...prev,
                                  [route.routeId]: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <AddButton
                            onClick={() => handleAddStop(route.routeId)}
                            style={{
                              width: "130px",
                              fontSize: "18px",
                              height: "50px",
                            }}
                          >
                            Add
                            <i
                              className="bi bi-plus-circle"
                              style={{ marginLeft: "8px", fontSize: "20px" }}
                            />
                          </AddButton>
                        </div>
                      </div>
                    </section>
                  ),
                }))}
              />
            </>
          )}
        </>
      )}

      {/* ══════════ BLOCK DELETE MODAL ══════════ */}
      {blockDeleteModal !== null && (
        <ModalShell
          title="Delete Block"
          onClose={() => setBlockDeleteModal(null)}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onClick={() => setBlockDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                style={deleteBtnStyle}
                onClick={async () => {
                  if (blockDeleteModal !== null) {
                    await handleDeleteBlock(
                      blockDeleteModal.blockScheduleId,
                      blockDeleteModal.blockName,
                    );
                    setBlockDeleteModal(null);
                  }
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: "17px" }}>
            Are you sure you want to delete block{" "}
            <strong>"{blockDeleteModal?.blockName}"</strong>? This cannot be
            undone.
          </p>
        </ModalShell>
      )}

      {/* ══════════ STOP DELETE MODAL ══════════ */}
      {stopDeleteModal !== null && (
        <ModalShell
          title="Delete Stop"
          onClose={() => setStopDeleteModal(null)}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onClick={() => setStopDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                style={deleteBtnStyle}
                onClick={async () => {
                  if (stopDeleteModal !== null) {
                    await handleDeleteStop(
                      stopDeleteModal.routeId,
                      stopDeleteModal.routeStopId,
                    );
                    setStopDeleteModal(null);
                  }
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: "17px" }}>
            Are you sure you want to delete stop{" "}
            <strong>
              #{stopDeleteModal?.stopOrder} (
              {stopDeleteModal?.location ?? "Unknown"})
            </strong>
            ? This cannot be undone.
          </p>
        </ModalShell>
      )}

      {/* ══════════ ADD HALLWAY MODAL ══════════ */}
      {showHallwayModal && (
        <ModalShell
          title="Create New Hallway"
          onClose={() => {
            setShowHallwayModal(false);
            setNewHallway("");
          }}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onClick={() => {
                  setShowHallwayModal(false);
                  setNewHallway("");
                }}
              >
                Cancel
              </button>
              <button
                style={saveBtnStyle}
                onClick={async () => {
                  const result = await addHallway(newHallway);
                  if (result?.success) {
                    showAlert(
                      `Successfully added hallway "${newHallway}"`,
                      "success",
                    );
                  } else {
                    showAlert(
                      `Failed to add hallway "${newHallway}"`,
                      "danger",
                    );
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
