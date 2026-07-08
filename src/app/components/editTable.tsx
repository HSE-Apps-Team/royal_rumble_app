"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAlert } from "@/app/context/AlertContext";
import ExportToExcelButton from "./ExportToExcelButton";
import ModalShell from "./ModalShell";

interface EditTableProps {
  headers: string[];
  data: any[];
  editLink: string;
  deleteAction: (id: string | number) => Promise<{ success: boolean }>;
  idIndex?: number;
  visibleColumns: number[];
  fileName?: string;
}

const makeBtn = (bg: string) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bg,
  color: "white",
  fontFamily: "Poppins, sans-serif",
  fontWeight: "bold" as const,
  fontSize: "15px",
  border: "5px solid transparent",
  borderRadius: "14px",
  padding: "8px 18px",
  cursor: "pointer",
  transition: "background-color 0.2s",
  minWidth: "100px",
});

export default function EditTable({
  headers,
  data,
  editLink,
  deleteAction,
  idIndex = 0,
  visibleColumns,
  fileName,
}: EditTableProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [modalID, setModalID] = useState<null | string | number>(null);

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

  const cancelBtnStyle = makeBtn("var(--secondarySilver)");
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

  const deleteBtnStyle = makeBtn("var(--primaryRed)");
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
            <th style={headerCellStyle}>
              {fileName ? (
                <ExportToExcelButton
                  headers={headers}
                  data={data}
                  fileName={fileName}
                />
              ) : (
                ""
              )}
            </th>
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
                    <i
                      className="bi bi-pencil"
                      style={iconStyle}
                      onMouseEnter={hover}
                      onMouseLeave={unhover}
                      onClick={() => router.push(`${editLink}/${id}`)}
                    />
                    <i
                      className="bi bi-trash"
                      style={iconStyle}
                      onMouseEnter={hover}
                      onMouseLeave={unhover}
                      onClick={() => setModalID(id)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modalID !== null && (
        <ModalShell
          title="Delete Item"
          onClose={() => setModalID(null)}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onMouseEnter={cancelBtnHover}
                onMouseLeave={cancelBtnUnhover}
                onClick={() => setModalID(null)}
              >
                Cancel
              </button>
              <button
                style={deleteBtnStyle}
                onMouseEnter={deleteBtnHover}
                onMouseLeave={deleteBtnUnhover}
                onClick={async () => {
                  if (deleteAction && modalID !== null) {
                    const result = await deleteAction(modalID);
                    if (result?.success) {
                      showAlert(`Successfully deleted item with ID ${modalID}`, "success");
                    } else {
                      showAlert(`Failed to delete item with ID ${modalID}`, "danger");
                    }
                    setModalID(null);
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
            <strong>ID: {modalID}</strong>? This action cannot be undone.
          </p>
        </ModalShell>
      )}
    </div>
  );
}
