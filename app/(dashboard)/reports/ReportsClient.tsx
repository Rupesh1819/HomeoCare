"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Box, Download, FileText, MoreHorizontal, Search, ShieldCheck, UploadCloud, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import { uploadReport, getSecureReportUrl } from "@/app/actions/upload";

type Patient = {
  dbId: string;
  name: string;
  id: string; // patientNumber
};

type Report = {
  id: string;
  name: string;
  patient: string;
  category: string;
  date: string;
  type: string;
  url: string | null;
  storagePath: string;
};

export function ReportsClient({
  initialReports,
  patients,
}: {
  initialReports: Report[];
  patients: Patient[];
}) {
  const { notify } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Report[]>(initialReports);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const triggerFileSelect = () => {
    if (!selectedPatientId) {
      notify("Please select a patient first before uploading.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPatientId) return;

    setIsUploading(true);
    notify(`Uploading "${file.name}"...`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", selectedPatientId);
    formData.append("category", file.type.includes("pdf") ? "Blood Test" : "Imaging");
    formData.append("uploadedBy", "Dr. Maya Smith");

    try {
      const res = await uploadReport(formData);
      if (res.success && res.report) {
        setFiles((c) => [res.report as Report, ...c]);
        notify(
          res.demo
            ? `[Demo Mode] Report "${file.name}" attached.`
            : `Report "${file.name}" uploaded to secure storage.`
        );
      } else {
        notify(`Upload failed: ${res.error}`);
      }
    } catch (err: any) {
      notify(`Upload failed: ${err.message || err}`);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="page-stack">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".pdf,.png,.jpg,.jpeg,.docx"
        disabled={isUploading}
      />
      <PageHeader
        title="Clinical document center"
        description="Upload, preview, version, and share reports with role-based patient access."
        action={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              className="input-field"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{ minWidth: "200px" }}
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.dbId} value={p.dbId}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
            <button
              className="button button-primary"
              onClick={triggerFileSelect}
              disabled={!selectedPatientId || isUploading}
            >
              <UploadCloud size={17} />{" "}
              {isUploading ? "Uploading..." : "Upload report"}
            </button>
          </div>
        }
      />
      <div className="report-stats metric-grid metric-grid-4">
        <MetricCard icon={FileText} label="Total reports" value={files.length.toString()} note="All time" tone="blue" />
        <MetricCard icon={UploadCloud} label="Storage" value="Secure" note="Supabase Cloud" tone="green" />
        <MetricCard icon={ShieldCheck} label="Encryption" value="Enabled" note="At Rest" tone="violet" />
        <MetricCard icon={Box} label="Access" value="Role-Based" note="Strict" tone="amber" />
      </div>

      <Panel
        className="upload-zone"
        onClick={triggerFileSelect}
        style={{
          opacity: isUploading || !selectedPatientId ? 0.6 : 1,
          cursor: isUploading || !selectedPatientId ? "not-allowed" : "pointer",
        }}
      >
        <span className="upload-icon">
          <UploadCloud size={26} />
        </span>
        <h3>Drop clinical files here</h3>
        <p>PDF, PNG, JPG, JPEG, or DOCX up to 25 MB.</p>
        {!selectedPatientId ? (
          <p style={{ color: "var(--brand-600)", fontWeight: 500 }}>
            Select a patient from the top right menu to enable uploading.
          </p>
        ) : (
          <button className="button button-secondary" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Browse files"}
          </button>
        )}
      </Panel>

      <Panel>
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input placeholder="Search reports or patient" />
          </div>
          <select>
            <option>All categories</option>
            <option>Blood Test</option>
            <option>X-Ray</option>
            <option>MRI</option>
          </select>
          <select>
            <option>Newest first</option>
            <option>Oldest first</option>
          </select>
        </div>
        
        {files.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            No reports uploaded yet.
          </div>
        ) : (
          <div className="document-grid">
            {files.map((file, index) => (
              <article className="document-card" key={file.id || `${file.name}-${index}`}>
                <div className="document-preview">
                  <FileText size={34} />
                  <span>{file.type}</span>
                </div>
                <div className="document-info">
                  <span className="panel-kicker">{file.category}</span>
                  <h3>{file.name}</h3>
                  <p>
                    {file.patient} · {file.date}
                  </p>
                </div>
                <div className="document-actions">
                  <button
                    className="icon-button"
                    onClick={async () => {
                      if (file.url && file.url !== "#") {
                        window.open(file.url, "_blank");
                      } else if (file.storagePath) {
                        const res = await getSecureReportUrl(file.storagePath);
                        if (res.success && res.url) window.open(res.url, "_blank");
                        else notify(res.error || "Preview failed");
                      } else {
                        notify(`${file.name} opened in secure preview.`);
                      }
                    }}
                    title="Preview"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={async () => {
                      if (file.url && file.url !== "#") {
                        window.open(file.url, "_blank");
                      } else if (file.storagePath) {
                        const res = await getSecureReportUrl(file.storagePath, true);
                        if (res.success && res.url) window.open(res.url, "_blank");
                        else notify(res.error || "Download failed");
                      } else {
                        notify(`${file.name} downloaded.`);
                      }
                    }}
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button className="icon-button" title="More">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
