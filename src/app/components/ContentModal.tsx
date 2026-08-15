"use client";
import { useState } from "react";

import React from "react";
import SaveButton from "./saveButton";
import AddButton from "./addButton";

export default function ModalStyle({
  children,
  title = "Modal Title",
  btnText = "",
  saveAction = undefined,
  icon = "bi bi-question-circle",
  show,
  onClose,
  dismissText,
}: {
  children: React.ReactNode;
  title?: string;
  btnText?: string;
  saveAction?: () => void;
  icon?: string;
  show?: boolean;
  onClose?: () => void;
  dismissText?: string;
}) {
  const [internalShow, setInternalShow] = useState(false);
  const isControlled = show !== undefined;
  const showModal = isControlled ? show : internalShow;
  const setShowModal = isControlled ? (onClose ? () => onClose() : () => {}) : setInternalShow;

  const greyButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--secondarySilver)",
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
    width: "160px",
  };

  const buttonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "var(--secondarySilver)";
    e.currentTarget.style.borderColor = "var(--secondarySilver)";
  };

  const buttonUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "var(--secondarySilver)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.borderColor = "transparent";
  };

  return (
    <>
      {!isControlled && (
        <AddButton
          onClick={() => setInternalShow(true)}
          style={{ fontSize: "21px", justifyContent: "flex-end", width: "265px" }}
        >
          {title || ""}
          <i className={icon} style={{ marginLeft: "30px", fontSize: "30px" }} />
        </AddButton>
      )}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              border: "5px solid var(--primaryBlue)",
              borderRadius: "12px",
              fontFamily: "Poppins, sans-serif",
              backgroundColor: "white",
              overflow: "hidden",
              width: "75%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div
              style={{
                backgroundColor: "var(--primaryBlue)",
                color: "white",
                padding: "20px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "24px",
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              <span>{title}</span>
              <i
                className="bi bi-x-lg"
                style={{ cursor: "pointer", fontSize: "22px" }}
                onClick={() => setShowModal(false)}
              />
            </div>

            {/* Content */}
            <div style={{ padding: "16px", overflowY: "auto" }}>
              <div
                style={{
                  border: "5px solid var(--primaryRed)",
                  padding: "16px",
                  margin: "15px 30px",
                  backgroundColor: "white",
                  color: "var(--textBlack)",
                }}
              >
                {children}
              </div>
            </div>

            {/* Footer buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "10px 30px",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <button
                style={greyButtonStyle}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonUnhover}
                onClick={() => {
                  setShowModal(false);
                }}
                type="button"
              >
                {dismissText ?? (saveAction ? "Cancel" : "Done")}
              </button>
              {saveAction && (
                <SaveButton
                  onClick={() => {
                    saveAction();
                    setShowModal(false);
                  }}
                  style={{ width: "160px", fontSize: "20px", height: "55px" }}
                >
                  {btnText}
                </SaveButton>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
