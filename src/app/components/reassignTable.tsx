"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAlert } from "@/app/context/AlertContext";
import ModalShell from "./ModalShell";

interface ReassignTableProps {
  headers: string[];
  data: any[];
  deleteAction?: (id: string | number) => Promise<{ success: boolean }>;
  idIndex?: number;
  visibleColumns: number[];
  reassignAction?: (
    id: string | number,
    newGroupId: string | number,
  ) => Promise<{ success: boolean }>;
  currentGroupId: number | string;
  possibleGroups: Array<{ group_id: number; name: string }>;
}

/* ---- reusable button styles ---- */
const makeBtn = (bg: string, border: string) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bg,
  color: "white",
  fontFamily: "Poppins, sans-serif",
  fontWeight: "bold" as const,
  fontSize: "15px",
  border: `5px solid transparent`,
  borderRadius: "14px",
  padding: "8px 18px",
  cursor: "pointer",
  transition: "background-color 0.2s",
  minWidth: "100px",
});

export default function ReassignTable({
  headers,
  data,
  deleteAction,
  idIndex = 0,
  visibleColumns,
  reassignAction,
  currentGroupId,
  possibleGroups,
}: ReassignTableProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [deleteModalID, setDeleteModalID] = useState<null | string | number>(null);
  const [reassignModalID, setReassignModalID] = useState<null | string | number>(null);
  const [newGroupId, setNewGroupId] = useState<string | number>("");

  useEffect(() => {
    if (reassignModalID !== null) {
      setNewGroupId(currentGroupId);
    }
  }, [reassignModalID, currentGroupId]);

  const colCount = visibleColumns.length + 1;

  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse",
    width: "100%",
    height: "300px",
    border: "4px solid var(--primaryBlue)",
    fontFamily: "Poppins, sans-serif",
  };

  const headerCellStyle: React.CSSProperties = {
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    padding: "12px",
    border: "2px solid var(--primaryBlue)",
  };

  const cellStyle: React.CSSProperties = {
    backgroundColor: "white",
    color: "var(--textBlack)",
    textAlign: "left",
    padding: "12px",
    border: "2px solid var(--primaryBlue)",
    whiteSpace: "normal",
    overflowWrap: "break-word",
    wordBreak: "normal",
    fontSize: "20px",
    lineHeight: "1.3",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "40px",
    color: "var(--primaryBlue)",
    cursor: "pointer",
    margin: "0px 3px",
    transition: "color 0.3s",
  };

  const hover = (e: React.MouseEvent<HTMLElement>) =>
    (e.currentTarget.style.color = "var(--primaryRed)");
  const unhover = (e: React.MouseEvent<HTMLElement>) =>
    (e.currentTarget.style.color = "var(--primaryBlue)");

  // Reassign button (blue)
  const reassignBtnStyle = makeBtn("var(--primaryBlue)", "var(--primaryBlue)");
  const reassignBtnHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "var(--primaryBlue)";
    e.currentTarget.style.borderColor = "var(--primaryBlue)";
  };
  const reassignBtnUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "var(--primaryBlue)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.borderColor = "transparent";
  };

  // Cancel button (grey)
  const cancelBtnStyle = makeBtn("var(--secondarySilver)", "var(--secondarySilver)");
  const cancelBtnHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "var(--secondarySilver)";
    e.currentTarget.style.borderColor = "var(--secondarySilver)";
  };
  const cancelBtnUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "var(--secondarySilver)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.borderColor = "transparent";
  };

  // Delete button (red)
  const deleteBtnStyle = makeBtn("var(--primaryRed)", "var(--primaryRed)");
  const deleteBtnHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "var(--primaryRed)";
    e.currentTarget.style.borderColor = "var(--primaryRed)";
  };
  const deleteBtnUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "var(--primaryRed)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.borderColor = "transparent";
  };

  return (
    <div>
      <table style={tableStyle}>
        <colgroup>
          {Array.from({ length: colCount }).map((_, i) => (
            <col
              key={i}
              style={{
                width: i === colCount - 1 ? "15%" : `${85 / (colCount - 1)}%`,
              }}
            />
          ))}
        </colgroup>

        <thead>
          <tr>
            {visibleColumns.map((colIndex) => (
              <th key={colIndex} style={headerCellStyle}>
                {headers[colIndex]}
              </th>
            ))}
            <th style={headerCellStyle}></th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => {
            const id = row[idIndex];
            return (
              <tr key={rowIndex}>
                {visibleColumns.map((ci) => (
                  <td key={ci} style={cellStyle} title={String(row[ci] ?? "")}>
                    {row[ci]}
                  </td>
                ))}
                <td style={cellStyle}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
                    <button
                      style={reassignBtnStyle}
                      onMouseEnter={reassignBtnHover}
                      onMouseLeave={reassignBtnUnhover}
                      onClick={() => setReassignModalID(id)}
                    >
                      Reassign
                    </button>
                    <i
                      className="bi bi-trash"
                      style={iconStyle}
                      onMouseEnter={hover}
                      onMouseLeave={unhover}
                      onClick={() => setDeleteModalID(id)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ---- Delete Modal ---- */}
      {deleteModalID !== null && (
        <ModalShell
          title="Delete Item"
          onClose={() => setDeleteModalID(null)}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onMouseEnter={cancelBtnHover}
                onMouseLeave={cancelBtnUnhover}
                onClick={() => setDeleteModalID(null)}
              >
                Cancel
              </button>
              <button
                style={deleteBtnStyle}
                onMouseEnter={deleteBtnHover}
                onMouseLeave={deleteBtnUnhover}
                onClick={async () => {
                  if (deleteAction && deleteModalID !== null) {
                    const result = await deleteAction(deleteModalID);
                    if (result?.success) {
                      showAlert(`Successfully deleted item with ID ${deleteModalID}`, "success");
                    } else {
                      showAlert(`Failed to delete item with ID ${deleteModalID}`, "danger");
                    }
                    setDeleteModalID(null);
                    router.refresh();
                  }
                }}
              >
                Delete
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: "17px" }}>
            Are you sure you want to delete item{" "}
            <strong>ID: {deleteModalID}</strong>? This action cannot be undone.
          </p>
        </ModalShell>
      )}

      {/* ---- Reassign Modal ---- */}
      {reassignModalID !== null && (
        <ModalShell
          title="Reassign to Group"
          onClose={() => setReassignModalID(null)}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onMouseEnter={cancelBtnHover}
                onMouseLeave={cancelBtnUnhover}
                onClick={() => setReassignModalID(null)}
              >
                Cancel
              </button>
              <button
                style={reassignBtnStyle}
                onMouseEnter={reassignBtnHover}
                onMouseLeave={reassignBtnUnhover}
                onClick={async () => {
                  if (reassignAction && reassignModalID !== null) {
                    const result = await reassignAction(reassignModalID, newGroupId);
                    if (result?.success) {
                      showAlert(`Successfully reassigned ID ${reassignModalID}`, "success");
                    } else {
                      showAlert(`Failed to reassign ID ${reassignModalID}`, "danger");
                    }
                    setReassignModalID(null);
                    router.refresh();
                  }
                }}
              >
                Reassign
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p style={{ margin: 0, fontSize: "16px" }}>
              Reassigning <strong>ID: {reassignModalID}</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "var(--primaryBlue)",
                }}
              >
                New Group:
              </label>
              <select
                className="form-select"
                value={newGroupId}
                onChange={(e) => setNewGroupId(e.target.value)}
                style={{ fontSize: "15px" }}
              >
                <option value="unassigned">— Unassigned —</option>
                {possibleGroups.map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
