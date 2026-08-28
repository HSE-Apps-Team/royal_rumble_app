"use client";

import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import BackButton from "../../components/backButton";
import InfoBox from "../../components/infoBox";
import { saveContent } from "@/src/actions/other";
import { useAlert } from "@/app/context/AlertContext";
import "../../css/admin.css";
import "../../css/logo+login.css";

type HelpPrompt = {
  slug: string;
  title: string;
  description: string;
  contentKey: string;
  text: string;
};

export default function AdminHelpUI({ prompts }: { prompts: HelpPrompt[] }) {
  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Help &amp; AI Assistant</h1>
      </header>

      <BackButton href="/admin" />

      <div style={{ width: "85%", marginTop: "20px", color: "var(--textBlack)" }}>
        <p style={{ fontSize: "16px", lineHeight: 1.5 }}>
          Copy a prompt below and paste it into any AI chat tool (ChatGPT, Claude, etc.).
          It gives the AI the context it needs about that part of the site, so you can then
          ask it any how-to question &mdash; e.g. &ldquo;how do I move a mentor to a different
          group?&rdquo;
        </p>
      </div>

      {prompts.map((p) => (
        <PromptCard key={p.slug} prompt={p} />
      ))}
    </main>
  );
}

function PromptCard({ prompt }: { prompt: HelpPrompt }) {
  const { showAlert } = useAlert();
  const [text, setText] = useState(prompt.text);
  const [draft, setDraft] = useState(prompt.text);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showAlert("Failed to copy to clipboard.", "danger");
    }
  };

  const handleEdit = () => {
    setDraft(text);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(text);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContent(prompt.contentKey, draft);
      setText(draft);
      setEditing(false);
      showAlert(`"${prompt.title}" prompt saved.`, "success");
    } catch {
      showAlert("Failed to save prompt.", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <InfoBox headerText={prompt.title}>
      <div style={{ fontSize: "14px", color: "#555", marginBottom: "12px" }}>
        {prompt.description}
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{
            width: "100%",
            minHeight: "220px",
            fontFamily: "inherit",
            fontSize: "14px",
            boxSizing: "border-box",
            resize: "vertical",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "12px",
            color: "var(--textBlack)",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            maxHeight: "220px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            backgroundColor: "#f9fafb",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "12px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        >
          {text}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
        {editing ? (
          <>
            <ActionButton onClick={handleSave} disabled={saving}>
              <i className="bi bi-check-lg" /> {saving ? "Saving..." : "Save"}
            </ActionButton>
            <ActionButton onClick={handleCancel} disabled={saving} variant="outline">
              Cancel
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton onClick={handleCopy}>
              <i className={`bi ${copied ? "bi-clipboard-check" : "bi-clipboard"}`} />{" "}
              {copied ? "Copied!" : "Copy Prompt"}
            </ActionButton>
            <ActionButton onClick={handleEdit} variant="outline">
              <i className="bi bi-pencil" /> Edit
            </ActionButton>
          </>
        )}
      </div>
    </InfoBox>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "solid",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline";
}) {
  const solidStyle: React.CSSProperties = {
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    border: "2px solid var(--primaryBlue)",
  };
  const outlineStyle: React.CSSProperties = {
    backgroundColor: "white",
    color: "var(--primaryBlue)",
    border: "2px solid var(--primaryBlue)",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(variant === "solid" ? solidStyle : outlineStyle),
        borderRadius: "8px",
        padding: "8px 16px",
        fontFamily: "Poppins, sans-serif",
        fontWeight: 600,
        fontSize: "14px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}
