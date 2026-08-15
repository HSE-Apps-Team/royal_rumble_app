"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAlert } from "@/app/context/AlertContext";
import ModalShell from "./ModalShell";
import "./viewDropdown.css";

interface ViewDropdownProps {
  editLink?: string;
  deleteAction?: (id: string | number) => Promise<{ success: boolean }>;
  idIndex?: number;
  header?: string;
  sections?: {
    title: string;
    content: React.ReactNode;
    sectionId: string | number;
  }[];
  defaultOpenAll?: boolean;
}

export default function ViewDropdown({
  header,
  sections = [],
  editLink,
  deleteAction,
  idIndex = 0,
  defaultOpenAll = false,
}: ViewDropdownProps) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [openIndices, setOpenIndices] = useState<(string | number)[]>(() =>
    defaultOpenAll ? sections.map((s) => s.sectionId) : [],
  );
  const [modalID, setModalID] = useState<null | string | number>(null);

  const containerStyle = {
    border: "5px solid var(--primaryBlue)",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "bold",
    color: "var(--primaryBlue)",
    width: "85%",
    margin: "20px auto",
    backgroundColor: "white",
    overflow: "hidden",
  };

  const headerStyle = {
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    padding: "20px 16px",
    display: "flex",
    alignItems: "center",
    fontSize: "24px",
    justifyContent: "space-between",
  };

  const accordionHeaderStyle = {
    backgroundColor: "white",
    color: "var(--primaryBlue)",
    fontSize: "30px",
    borderTop: "2px solid var(--primaryBlue)",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  };

  const contentWrapperStyle = {
    padding: "16px",
    backgroundColor: "white",
    borderTop: "none",
  };

  const contentBoxStyle = {
    border: "5px solid var(--primaryRed)",
    padding: "16px",
    margin: "15px 50px",
    height: "auto",
    color: "var(--textBlack)",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    textAlign: "left" as const,
    overflow: "auto" as const,
  };

  const arrowBase = {
    border: "solid gray",
    borderWidth: "0 3px 3px 0",
    display: "inline-block",
    padding: "5px",
    transition: "transform 0.2s",
  };

  const handleToggle = (index: number | string) => {
    setOpenIndices((prevOpen) =>
      prevOpen.includes(index)
        ? prevOpen.filter((i) => i !== index)
        : [...prevOpen, index],
    );
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

  const iconContainer: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    margin: "20px 60px 10px 10px",
  };

  const buttonStyle = {
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
    padding: "5px 5px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "100px"
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
    fontSize: "15px",
    border: "5px solid transparent",
    borderRadius: "14px",
    padding: "5px 5px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "100px"
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
    <div className="view-dropdown-container" style={containerStyle}>
      {/* Top blue header */}
      {header && <div className="view-dropdown-header" style={headerStyle}>{header}</div>}

      {/* Accordion Sections */}
      {sections.map((section) => {
        const isOpen = openIndices.includes(section.sectionId);

        return (
          <div key={section.sectionId}>
            <div
              className="view-dropdown-accordion-header"
              style={accordionHeaderStyle}
              onClick={() => handleToggle(section.sectionId)}
            >
              <span>{section.title}</span>
              <i
                style={{
                  ...arrowBase,
                  transform: isOpen ? "rotate(-135deg)" : "rotate(45deg)",
                }}
              ></i>
            </div>

            {isOpen && (
              <div>
                <div className="view-dropdown-icon-container" style={iconContainer}>
                  {editLink && (
                    <i
                      className="bi bi-pencil"
                      style={iconStyle}
                      onMouseEnter={hover}
                      onMouseLeave={unhover}
                      onClick={() => router.push(`${editLink}/${section.sectionId}`)}
                    />
                  )}

                  {deleteAction && (
                    <i
                      className="bi bi-trash"
                      style={iconStyle}
                      onMouseEnter={hover}
                      onMouseLeave={unhover}
                      onClick={() => setModalID(section.sectionId)}
                    />
                  )}
                </div>
                <div style={contentWrapperStyle}>
                  <div className="view-dropdown-content-box" style={contentBoxStyle}>{section.content}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {modalID !== null && (
        <ModalShell
          title="Delete Item"
          onClose={() => setModalID(null)}
          footer={
            <>
              <button
                style={buttonStyle}
                onMouseEnter={buttonHover}
                onMouseLeave={buttonUnhover}
                onClick={() => setModalID(null)}
              >
                Cancel
              </button>
              <button
                style={buttonStyle2}
                onMouseEnter={buttonHover2}
                onMouseLeave={buttonUnhover2}
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
