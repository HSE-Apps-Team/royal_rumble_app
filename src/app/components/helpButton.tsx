"use client";

import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function HelpButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="floating-help-button"
      onClick={() => router.push("/admin/help")}
      aria-label="Help"
    >
      <i className="bi bi-question-circle-fill" />
      <span>Help</span>
    </button>
  );
}
