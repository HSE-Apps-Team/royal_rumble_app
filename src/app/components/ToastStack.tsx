"use client";

import { useToast, type Toast, type ToastType } from "../context/ToastContext";

const ICONS: Record<ToastType, string> = {
  success: "bi-check-circle-fill",
  danger: "bi-x-circle-fill",
  warning: "bi-exclamation-triangle-fill",
  info: "bi-info-circle-fill",
};

const ACCENT_COLORS: Record<ToastType, string> = {
  success: "var(--primaryBlue)",
  danger: "var(--primaryRed)",
  warning: "#c47f00",
  info: "var(--secondarySilver)",
};

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  return (
    <div
      className="toast show"
      role="status"
      aria-live="polite"
      style={{
        fontFamily: "'Poppins', sans-serif",
        minWidth: "280px",
        maxWidth: "340px",
        background: "white",
        border: "2px solid " + ACCENT_COLORS[toast.type],
        borderRadius: "8px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 14px",
        }}
      >
        <i
          className={`bi ${ICONS[toast.type]}`}
          style={{ color: ACCENT_COLORS[toast.type], fontSize: "1.3rem", flexShrink: 0 }}
        ></i>

        <span
          style={{
            flex: 1,
            color: "var(--textBlack)",
            fontWeight: 600,
            fontSize: "0.95rem",
            textAlign: "left",
          }}
        >
          {toast.message}
        </span>

        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.1rem",
            lineHeight: 1,
            color: "var(--secondarySilver)",
            flexShrink: 0,
          }}
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
    </div>
  );
}

export default function ToastStack() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "flex-end",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
