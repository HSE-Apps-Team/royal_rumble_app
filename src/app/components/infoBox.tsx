"use client";

import React from "react";

type InfoBoxProps = {
  headerText: string;
  children: React.ReactNode;
};

export default function InfoBox({ headerText, children }: InfoBoxProps) {
  const containerStyle = {
    width: "85%",
    margin: "30px 20px",
  };

  const headerStyle = {
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "bold",
    fontSize: "24px",
    padding: "0 20px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const contentStyle = {
    backgroundColor: "white",
    border: "5px solid var(--primaryRed)",
    color: "#000000",
    fontFamily: "Poppins, sans-serif",
    fontSize: "16px",
    padding: "30px 20px",
    textAlign: "left" as const,
    height: "auto",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>{headerText}</div>
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
