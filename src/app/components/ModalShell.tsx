"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ModalShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        style={{
          border: "5px solid var(--primaryBlue)",
          borderRadius: "12px",
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "white",
          overflow: "hidden",
          width: "min(500px, 90vw)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "var(--primaryBlue)",
            color: "white",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          <span>{title}</span>
          <i
            className="bi bi-x-lg"
            style={{ cursor: "pointer", fontSize: "20px" }}
            onClick={onClose}
          />
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 0" }}>
          <div
            style={{
              border: "5px solid var(--primaryRed)",
              padding: "16px 20px",
              backgroundColor: "white",
              color: "var(--textBlack)",
              fontFamily: "Poppins, sans-serif",
              fontSize: "16px",
            }}
          >
            {children}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            padding: "16px 20px",
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
