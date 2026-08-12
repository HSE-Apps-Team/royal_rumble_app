"use client";

import React from "react";
import "../css/admin.css";

export default function AdminButtons({
  children,
  link = "#",
  className = "",
  borderColor,
  backgroundColor,
}: {
  children: React.ReactNode;
  link?: string;
  className?: string;
  borderColor?: string;
  backgroundColor?: string;
}) {
  const buttonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = backgroundColor ?? "var(--primaryBlue)";
    e.currentTarget.style.borderColor = borderColor ?? backgroundColor ?? "var(--primaryBlue)";
  };

  const buttonUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = backgroundColor ?? "var(--primaryBlue)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.borderColor = borderColor ?? "transparent";
  };

  return (
    <button
      className={`admin-nav-button ${className}`.trim()}
      style={{
        ...(borderColor ? { borderColor } : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
      }}
      onMouseEnter={buttonHover}
      onMouseLeave={buttonUnhover}
      onClick={() => {
        if (link) {
          window.location.href = link;
        }
      }}
    >
      {children}
    </button>
  );
}
