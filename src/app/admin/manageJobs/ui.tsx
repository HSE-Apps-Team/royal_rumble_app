"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../components/logoButton";
import LoginButton from "../../components/loginButton";
import BackButton from "../../components/backButton";
import AddButton from "../../components/addButton";
import ModalShell from "../../components/ModalShell";
import "../../css/admin.css";
import "../../css/logo+login.css";
import { useAlert } from "@/app/context/AlertContext";
import { addJob, renameJob, deleteJob } from "@/actions/job";

interface JobRow {
  jobId: number;
  slug: string;
  dbJob: string;
  label: string;
  contentKey: string;
  isProtected: boolean;
  isNonUtility: boolean;
}

const modalFormStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  width: "100%",
};

const modalLabelStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "var(--primaryBlue)",
};

const modalInputStyle: React.CSSProperties = {
  border: "3px solid var(--primaryBlue)",
  padding: "10px",
  fontSize: "16px",
  fontFamily: "inherit",
  color: "var(--textBlack)",
  fontWeight: 400,
  width: "100%",
  boxSizing: "border-box",
};

const modalHintStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--secondarySilver)",
  marginTop: "6px",
  marginBottom: 0,
};

const makeBtn = (bg: string) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bg,
  color: "white",
  fontFamily: "Poppins, sans-serif",
  fontWeight: "bold" as const,
  fontSize: "15px",
  border: "5px solid transparent",
  borderRadius: "14px",
  padding: "8px 18px",
  cursor: "pointer",
  transition: "background-color 0.2s",
  minWidth: "100px",
});

export default function ManageJobsUI({ jobsData }: { jobsData: JobRow[] }) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [jobs, setJobs] = useState(jobsData);
  const [addOpen, setAddOpen] = useState(false);
  const [newJobLabel, setNewJobLabel] = useState("");
  const [renameTarget, setRenameTarget] = useState<JobRow | null>(null);
  const [renameLabel, setRenameLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<JobRow | null>(null);
  const [saving, setSaving] = useState(false);

  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse",
    width: "100%",
    border: "4px solid var(--primaryBlue)",
    fontFamily: "Poppins, sans-serif",
  };

  const headerCellStyle: React.CSSProperties = {
    backgroundColor: "var(--primaryBlue)",
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    padding: "12px",
    border: "2px solid var(--primaryBlue)",
  };

  const cellStyle: React.CSSProperties = {
    backgroundColor: "white",
    color: "var(--textBlack)",
    textAlign: "left",
    padding: "12px",
    border: "2px solid var(--primaryBlue)",
    fontSize: "18px",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "32px",
    color: "var(--primaryBlue)",
    cursor: "pointer",
    margin: "0px 3px",
    transition: "color 0.3s",
  };

  const disabledIconStyle: React.CSSProperties = {
    ...iconStyle,
    color: "var(--secondarySilver)",
    cursor: "not-allowed",
  };

  const hover = (e: React.MouseEvent<HTMLElement>) =>
    (e.currentTarget.style.color = "var(--primaryRed)");
  const unhover = (e: React.MouseEvent<HTMLElement>) =>
    (e.currentTarget.style.color = "var(--primaryBlue)");

  const cancelBtnStyle = makeBtn("var(--secondarySilver)");
  const saveBtnStyle = makeBtn("var(--primaryBlue)");
  const deleteBtnStyle = makeBtn("var(--primaryRed)");

  const handleAdd = async () => {
    if (!newJobLabel.trim()) {
      showAlert("Please enter a job name.", "danger");
      return;
    }
    setSaving(true);
    const result = await addJob(newJobLabel);
    setSaving(false);
    if (result.success && result.job) {
      setJobs((prev) => [...prev, result.job as JobRow]);
      showAlert(`Added job "${result.job.label}".`, "success");
      setAddOpen(false);
      setNewJobLabel("");
      router.refresh();
    } else {
      showAlert(result.error ?? "Failed to add job.", "danger");
    }
  };

  const handleRename = async () => {
    if (!renameTarget) return;
    if (!renameLabel.trim()) {
      showAlert("Please enter a job name.", "danger");
      return;
    }
    setSaving(true);
    const result = await renameJob(renameTarget.jobId, renameLabel);
    setSaving(false);
    if (result.success) {
      setJobs((prev) =>
        prev.map((j) =>
          j.jobId === renameTarget.jobId
            ? { ...j, label: result.label!, dbJob: result.dbJob!, slug: result.slug! }
            : j,
        ),
      );
      showAlert(
        result.slugChanged
          ? `Renamed to "${result.label}" (URL is now /mentor/${result.slug}).`
          : `Renamed to "${result.label}".`,
        "success",
      );
      setRenameTarget(null);
      router.refresh();
    } else {
      showAlert(result.error ?? "Failed to rename job.", "danger");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const result = await deleteJob(deleteTarget.jobId);
    setSaving(false);
    if (result.success) {
      setJobs((prev) => prev.filter((j) => j.jobId !== deleteTarget.jobId));
      showAlert(`Deleted job "${deleteTarget.label}".`, "success");
      setDeleteTarget(null);
      router.refresh();
    } else {
      showAlert(result.error ?? "Failed to delete job.", "danger");
      setDeleteTarget(null);
    }
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Manage Jobs</h1>
      </header>

      <BackButton href="/admin/mentor" />

      <div
        style={{ display: "flex", justifyContent: "center", margin: "20px" }}
      >
        <AddButton onClick={() => setAddOpen(true)} style={{ fontSize: "30px", width: "240px" }}>
          Add
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "30px", fontSize: "30px" }}
          ></i>
        </AddButton>
      </div>

      <div style={{ width: "85%", marginTop: "25px" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Job Name</th>
              <th style={headerCellStyle}>Route</th>
              <th style={headerCellStyle}></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.jobId}>
                <td style={cellStyle}>
                  {job.label}
                  {job.isProtected && (
                    <span
                      style={{
                        marginLeft: "10px",
                        fontSize: "13px",
                        color: "var(--secondarySilver)",
                      }}
                    >
                      (protected)
                    </span>
                  )}
                </td>
                <td style={cellStyle}>/mentor/{job.slug}</td>
                <td style={cellStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <i
                      className="bi bi-pencil"
                      style={iconStyle}
                      onMouseEnter={hover}
                      onMouseLeave={unhover}
                      onClick={() => {
                        setRenameTarget(job);
                        setRenameLabel(job.label);
                      }}
                    />
                    <i
                      className={`bi bi-trash`}
                      style={job.isProtected ? disabledIconStyle : iconStyle}
                      onMouseEnter={job.isProtected ? undefined : hover}
                      onMouseLeave={job.isProtected ? undefined : unhover}
                      title={
                        job.isProtected
                          ? "This job cannot be deleted"
                          : undefined
                      }
                      onClick={() => {
                        if (job.isProtected) return;
                        setDeleteTarget(job);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD JOB MODAL --- */}
      {addOpen && (
        <ModalShell
          title="Add Job"
          onClose={() => setAddOpen(false)}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...saveBtnStyle, opacity: saving ? 0.6 : 1 }}
                disabled={saving}
                onClick={handleAdd}
              >
                {saving ? "Saving..." : "Add"}
              </button>
            </>
          }
        >
          <div style={modalFormStyle}>
            <label style={modalLabelStyle} htmlFor="new-job-label">
              Job Name:
            </label>
            <input
              id="new-job-label"
              type="text"
              style={modalInputStyle}
              placeholder="e.g. Setup Crew"
              value={newJobLabel}
              onChange={(e) => setNewJobLabel(e.target.value)}
            />
          </div>
        </ModalShell>
      )}

      {/* --- RENAME JOB MODAL --- */}
      {renameTarget && (
        <ModalShell
          title={`Rename "${renameTarget.label}"`}
          onClose={() => setRenameTarget(null)}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onClick={() => setRenameTarget(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...saveBtnStyle, opacity: saving ? 0.6 : 1 }}
                disabled={saving}
                onClick={handleRename}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          }
        >
          <div style={modalFormStyle}>
            <label style={modalLabelStyle} htmlFor="rename-job-label">
              Job Name:
            </label>
            <input
              id="rename-job-label"
              type="text"
              style={modalInputStyle}
              value={renameLabel}
              onChange={(e) => setRenameLabel(e.target.value)}
            />
            <p style={modalHintStyle}>
              Renaming updates all mentors and events currently assigned to
              this job.{" "}
              {renameTarget.isProtected
                ? `The page URL (/mentor/${renameTarget.slug}) will not change.`
                : `The page URL (/mentor/${renameTarget.slug}) will update to match.`}
            </p>
          </div>
        </ModalShell>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {deleteTarget && (
        <ModalShell
          title="Delete Job"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button
                style={cancelBtnStyle}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                style={{ ...deleteBtnStyle, opacity: saving ? 0.6 : 1 }}
                disabled={saving}
                onClick={handleDelete}
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </>
          }
        >
          <p style={{ margin: 0, fontSize: "17px" }}>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget.label}</strong>? This action cannot be
            undone. If any mentors are still assigned to this job, deletion
            will be blocked until they are reassigned.
          </p>
        </ModalShell>
      )}
    </main>
  );
}
