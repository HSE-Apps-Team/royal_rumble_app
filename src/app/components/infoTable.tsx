"use client";

import React from "react";
import "./infoTable.css";

export default function Table({
  headers,
  data,
}: {
  headers: string[];
  data: (string | number)[][];
}) {
  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse" as const,
    width: "85%",
    height: "300px",
    maxWidth: "85%",
    margin: "20px auto",
    border: "4px solid var(--primaryBlue)",
    fontFamily: "Poppins, sans-serif",
    tableLayout: "fixed" as const,
  };

  const headerCellStyle = {
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    fontWeight: "bold",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
    padding: "12px",
    border: "2px solid var(--primaryBlue)",
  };

  const cellStyle = {
    backgroundColor: "white",
    color: "var(--textBlack)",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
    padding: "12px",
    border: "2px solid var(--primaryBlue)",
  };

  return (
    <>
      {/* Desktop table */}
      <table style={tableStyle} className="info-table-desktop">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} style={headerCellStyle}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={cellStyle}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card layout */}
      <div className="info-table-mobile">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="info-card">
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="info-card-row">
                <span className="info-card-label">{headers[cellIndex]}</span>
                <span className="info-card-value">{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
