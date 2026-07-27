"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";

type AddButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // properly typed
  href?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
};

export default function AddButton({
  children,
  onClick,
  href,
  style,
  disabled,
}: AddButtonProps) {
  const router = useRouter();
  const buttonStyle = {
    ...(style || {}),
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    fontFamily: "Poppins, sans-serif",
    fontWeight: "bold",
    fontSize: style?.fontSize || "21px",
    border: "5px solid transparent",
    borderRadius: "14px",
    padding: style?.padding || "20px 20px",
    width: style?.width || "270px",
    height: style?.height || "70px",
    textAlign: "center" as const,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "background-color 0.3s",
    margin: style?.margin || "10px",
  };

  const buttonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.backgroundColor = "white";
    e.currentTarget.style.color = "var(--primaryBlue)";
    e.currentTarget.style.borderColor = "var(--primaryBlue)";
  };

  const buttonUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.backgroundColor = "var(--primaryBlue)";
    e.currentTarget.style.color = "white";
    e.currentTarget.style.borderColor = "transparent";
  };


  return (
    <button
      style={buttonStyle}
      onMouseEnter={buttonHover}
      onMouseLeave={buttonUnhover}
      onClick={onClick ? onClick : () => href && router.push(href)}
      type="button"
      disabled={disabled}
    >
      {children}
    </button>
  );
}
