"use client";

import EditableContentBox from "../../components/editableContentBox";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import ContentModal from "../../components/ContentModal";
import BackButton from "@/app/components/backButton";
import ViewDropdown from "../../components/viewDropdown";
import SaveButton from "../../components/saveButton";
import "../../css/admin.css";
import "../../css/logo+login.css";
import { deleteFAQEntry } from "@/src/actions/other";
import {
  updateFAQEntryById,
  addFAQEntry,
  updateRoyalRumbleTicketLink,
} from "@/src/actions/other";
import { useAlert } from "@/app/context/AlertContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminEditContentPageUI({
  faqData,
  royalRumbleTicketLinkCurrent,
  jobs,
}: {
  faqData: Array<{ id: number; question: string; answer: string }>;
  royalRumbleTicketLinkCurrent: string;
  jobs: Array<{ slug: string; label: string; contentKey: string }>;
}) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [activeSection, setActiveSection] = useState<
    "FAQ" | "Text Content" | "External Links"
  >("FAQ");
  const [faqState, setFaqState] = useState(
    faqData.map((item) => ({ ...item })),
  );

  const [newFAQ, setNewFAQ] = useState("");
  const [newFAQAnswer, setNewFAQAnswer] = useState("");
  const [royalRumbleTicketLink, setRoyalRumbleTicketLink] = useState(
    royalRumbleTicketLinkCurrent,
  );

  const handleFieldChange = (
    id: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setFaqState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async (id: number) => {
    const item = faqState.find((f) => f.id === id);
    if (!item) return;

    const result = await updateFAQEntryById(id, item.question, item.answer);

    if (result.success) {
      router.refresh();
      showAlert("FAQ entry updated successfully!", "success");
    } else {
      showAlert("Failed to update FAQ entry.", "danger");
    }
  };

  const handleAdd = async () => {
    if (!newFAQ.trim() || !newFAQAnswer.trim()) {
      showAlert("Please fill in both the question and answer.", "danger");
      return;
    }

    const result = await addFAQEntry(newFAQ, newFAQAnswer);

    if (result?.success) {
      setFaqState((prev) => [
        ...prev,
        { id: result.id, question: result.question, answer: result.answer },
      ]);
      showAlert("FAQ entry added successfully!", "success");
    } else {
      showAlert("Failed to add FAQ entry.", "danger");
    }

    setNewFAQ("");
    setNewFAQAnswer("");
  };

  const handleRoyalRumbleLinkSave = async (link: string) => {
    const result = await updateRoyalRumbleTicketLink(link);

    if (result.success) {
      router.refresh();
      showAlert("Royal Rumble ticket link updated successfully!", "success");
    } else {
      showAlert("Failed to update Royal Rumble ticket link.", "danger");
    }
  };

  const contentWrapperStyle = {
    padding: "16px",
    backgroundColor: "white",
    borderTop: "none",
    marginLeft: "-2%"
  };

  const contentBoxStyle = {
    border: "5px solid var(--primaryRed)",
    padding: "16px",
    marginBottom: "20px",
    height: "auto",
    color: "var(--textBlack)",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    textAlign: "left" as const,
    overflow: "auto" as const,
    width: "180%"
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Content Editor</h1>
      </header>

      <BackButton href="/admin" />

      {/* ── Section Toggle ─────────────────────────────────────── */}
      <div style={{ width: "85%", marginTop: "20px" }}>
        <div className="form-container" style={{ margin: "0px" }}>
          <form className="manual-add-form">
            <div className="form-row checkbox-row">
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="routeSection"
                  className="checkbox-input"
                  checked={activeSection === "FAQ"}
                  onChange={() => setActiveSection("FAQ")}
                />
                FAQ
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="routeSection"
                  className="checkbox-input"
                  checked={activeSection === "Text Content"}
                  onChange={() => setActiveSection("Text Content")}
                />
                Text Content
              </label>
              <label className="checkbox-label">
                <input
                  type="radio"
                  name="routeSection"
                  className="checkbox-input"
                  checked={activeSection === "External Links"}
                  onChange={() => setActiveSection("External Links")}
                />
                External Links
              </label>
            </div>
          </form>
        </div>
      </div>

      {activeSection === "FAQ" && (
        <>
          <div
            style={{
              width: "85%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <ContentModal
              title="Add FAQ"
              btnText="Add FAQ"
              icon="bi bi-plus-circle"
              saveAction={handleAdd}
            >
              <div className="edit-user-form">
                <div className="form-row">
                  <label className="form-label">Question:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter the question"
                    value={newFAQ}
                    onChange={(e) => setNewFAQ(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Answer:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter the answer"
                    value={newFAQAnswer}
                    onChange={(e) => setNewFAQAnswer(e.target.value)}
                  />
                </div>
              </div>
            </ContentModal>
          </div>

          <ViewDropdown
            header="Questions and Answers"
            deleteAction={async (id) => {
              const result = await deleteFAQEntry(Number(id));

              if (result.success) {
                setFaqState((prev) =>
                  prev.filter((item) => item.id !== Number(id)),
                );
                router.refresh();
              }

              return { success: result.success };
            }}
            sections={faqState.map((item) => ({
              title: item.question,
              sectionId: `${item.id}`,
              content: (
                <section className="about-info-box">
                  <div
                    style={{
                      display: "flex",
                      color: "var(--textBlack)",
                      fontWeight: "normal",
                      fontSize: "20px",
                    }}
                  >
                    <div className="edit-user-form">
                      <div className="form-row">
                        <label className="form-label">Question:</label>
                        <input
                          type="text"
                          className="form-input"
                          value={item.question}
                          onChange={(e) =>
                            handleFieldChange(
                              item.id,
                              "question",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label className="form-label">Answer:</label>
                        <input
                          type="text"
                          className="form-input"
                          value={item.answer}
                          onChange={(e) =>
                            handleFieldChange(item.id, "answer", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-row">
                        <SaveButton onClick={() => handleSave(item.id)}>
                          Save
                        </SaveButton>
                      </div>
                    </div>
                  </div>
                </section>
              ),
            }))}
          />
        </>
      )}

      {activeSection === "Text Content" && (
        <>
          <EditableContentBox
            title="Attendee More Details Text"
            contentKey="freshmen_more_details"
          />
          {jobs.map((job) => (
            <EditableContentBox
              key={job.slug}
              title={`${job.label} More Details Text`}
              contentKey={job.contentKey}
            />
          ))}
        </>
      )}

      {activeSection === "External Links" && (
        <div style={{ width: "85%", marginTop: "20px" }}>
          <section className="about-info-box">
            <div
              style={{
                display: "flex",
                color: "var(--textBlack)",
                fontWeight: "normal",
                fontSize: "20px",
              }}
            >
              <div style={contentWrapperStyle}>
                <div style={contentBoxStyle}>
                  <div className="edit-user-form">
                    <label className="form-label" style={{ width: "100%" }}>
                      Royal Rumble Ticket Link:
                    </label>
                    <div className="form-row">
                      <input
                        type="text"
                        className="form-input"
                        style={{ width: "90%" }}
                        value={royalRumbleTicketLink}
                        placeholder="https://..."
                        onChange={(e) =>
                          setRoyalRumbleTicketLink(e.target.value)
                        }
                      />
                      <SaveButton
                        onClick={() =>
                          handleRoyalRumbleLinkSave(royalRumbleTicketLink)
                        }
                        style={{fontSize: "25px", width: "190px"}}
                      >
                        Save
                      </SaveButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
