"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Search,
  FlaskConical,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Play,
  X,
  Loader2,
  Eye,
  Filter,
  User,
  Calendar,
  Stethoscope,
  Tag,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { useAppStore } from "@/lib/store";
import {
  getLabOrders,
  updateLabOrderStatus,
  uploadLabReport,
} from "@/app/actions/lab";

type LabOrder = {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  mobile: string;
  doctorName: string;
  testName: string;
  category: string;
  price: number;
  prescriptionNo: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string;
  reportUrl: string | null;
  reportStoragePath: string | null;
  uploadedBy: string | null;
  orderedAt: string;
  formattedDate: string;
  completedAt: string | null;
};

export default function LabDashboardPage() {
  const { notify } = useAppStore();
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);

  // Modal Upload State
  const [uploadingOrder, setUploadingOrder] = useState<LabOrder | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [technicianName, setTechnicianName] = useState("Sanjay Kulkarni (Lab)");
  const [uploading, setUploading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getLabOrders({
        status: statusFilter,
        search: searchQuery,
        todayOnly,
      });
      setOrders(data);
    } catch (err: any) {
      notify(`Error loading lab orders: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, todayOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = (orderId: string, newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED") => {
    startTransition(async () => {
      try {
        await updateLabOrderStatus(orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        notify(`Order status changed to ${newStatus.replace("_", " ")}.`);
      } catch (err: any) {
        notify(`Failed to update status: ${err.message || err}`);
      }
    });
  };

  const handleOpenUploadModal = (order: LabOrder) => {
    setUploadingOrder(order);
    setSelectedFile(null);
    setUploadNotes("");
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingOrder) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("orderId", uploadingOrder.id);
      formData.append("notes", uploadNotes);
      formData.append("uploadedBy", technicianName);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await uploadLabReport(formData);
      if (res.success) {
        notify("Lab report uploaded and marked as COMPLETED!");
        setUploadingOrder(null);
        fetchOrders();
      } else {
        notify(`Upload error: ${res.error}`);
      }
    } catch (err: any) {
      notify(`Upload failed: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  // Metrics
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const inProgressCount = orders.filter((o) => o.status === "IN_PROGRESS").length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Lab Assistant Dashboard"
        description="Monitor diagnostic orders, update workflow statuses, and upload test reports."
      />

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Orders</span>
            <FlaskConical size={18} className="text-primary" />
          </div>
          <div className="metric-value">{orders.length}</div>
          <span className="metric-subtext">Active diagnostic requests</span>
        </div>

        <div className="metric-card" style={{ borderLeft: "4px solid #f97316" }}>
          <div className="metric-header">
            <span className="metric-title">Pending</span>
            <Clock size={18} style={{ color: "#f97316" }} />
          </div>
          <div className="metric-value" style={{ color: "#f97316" }}>
            {pendingCount}
          </div>
          <span className="metric-subtext">Awaiting sample collection</span>
        </div>

        <div className="metric-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div className="metric-header">
            <span className="metric-title">In Progress</span>
            <Play size={18} style={{ color: "#3b82f6" }} />
          </div>
          <div className="metric-value" style={{ color: "#3b82f6" }}>
            {inProgressCount}
          </div>
          <span className="metric-subtext">Currently being analyzed</span>
        </div>

        <div className="metric-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="metric-header">
            <span className="metric-title">Completed</span>
            <CheckCircle2 size={18} style={{ color: "#10b981" }} />
          </div>
          <div className="metric-value" style={{ color: "#10b981" }}>
            {completedCount}
          </div>
          <span className="metric-subtext">Reports uploaded & ready</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Panel>
        <form onSubmit={handleSearchSubmit} className="toolbar" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div className="tab-group" style={{ overflowX: "auto" }}>
            {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((st) => (
              <button
                type="button"
                key={st}
                className={`tab-item ${statusFilter === st ? "tab-item-active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === "ALL" ? "All Orders" : st.replace("_", " ")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flex: 1, alignItems: "center", minWidth: 260 }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search patient, mobile, doctor or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                checked={todayOnly}
                onChange={(e) => setTodayOnly(e.target.checked)}
              />
              Today Only
            </label>

            <button className="button button-secondary" type="submit">
              Filter
            </button>
          </div>
        </form>
      </Panel>

      {/* Orders Table */}
      <Panel>
        <div className="panel-heading">
          <div>
            <h3>Diagnostic Work Orders</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Ordered tests from doctor prescriptions and walk-in requests
            </p>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="spin-icon" style={{ margin: "0 auto 10px" }} />
            Loading lab orders queue...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <FlaskConical size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: "var(--text-main)" }}>No Lab Orders Found</p>
            <p style={{ fontSize: "0.875rem" }}>
              {statusFilter !== "ALL" || searchQuery
                ? "Try adjusting your status tabs or search filter."
                : "Lab orders will automatically appear here when doctors prescribe tests."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Info</th>
                  <th>Patient Details</th>
                  <th>Prescribed Test</th>
                  <th>Ordering Doctor</th>
                  <th>Ordered Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isPendingStatus = order.status === "PENDING";
                  const isInProgressStatus = order.status === "IN_PROGRESS";
                  const isCompletedStatus = order.status === "COMPLETED";

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong style={{ color: "var(--text-main)" }}>
                          {order.prescriptionNo}
                        </strong>
                        {order.notes && (
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "#d97706",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              marginTop: 2,
                            }}
                          >
                            <AlertCircle size={12} /> {order.notes}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {order.patientName}
                        </div>
                        <small style={{ color: "var(--text-muted)" }}>
                          ID: {order.patientNumber} | {order.mobile}
                        </small>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {order.testName}
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: "0.72rem" }}>
                          {order.category} (₹{order.price})
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.875rem" }}>{order.doctorName}</span>
                      </td>

                      <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {order.formattedDate}
                      </td>

                      <td>
                        {isPendingStatus && (
                          <span
                            className="badge"
                            style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #ffedd5" }}
                          >
                            <Clock size={12} /> Pending
                          </span>
                        )}
                        {isInProgressStatus && (
                          <span
                            className="badge"
                            style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #dbeafe" }}
                          >
                            <Play size={12} /> In Progress
                          </span>
                        )}
                        {isCompletedStatus && (
                          <span
                            className="badge"
                            style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #d1fae5" }}
                          >
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons" style={{ justifyContent: "flex-end" }}>
                          {isPendingStatus && (
                            <button
                              className="button button-secondary button-sm"
                              onClick={() => handleStatusChange(order.id, "IN_PROGRESS")}
                              disabled={isPending}
                            >
                              <Play size={14} /> Start Test
                            </button>
                          )}

                          {(isPendingStatus || isInProgressStatus) && (
                            <button
                              className="button button-primary button-sm"
                              onClick={() => handleOpenUploadModal(order)}
                            >
                              <Upload size={14} /> Complete &amp; Upload
                            </button>
                          )}

                          {isCompletedStatus && (
                            <>
                              {order.reportUrl && order.reportUrl !== "#" ? (
                                <a
                                  href={order.reportUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="button button-secondary button-sm"
                                >
                                  <Eye size={14} /> View Report
                                </a>
                              ) : (
                                <button
                                  className="button button-secondary button-sm"
                                  onClick={() => handleOpenUploadModal(order)}
                                >
                                  <Upload size={14} /> Re-upload Report
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Upload Report Modal */}
      {uploadingOrder && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={22} className="text-primary" />
                <div>
                  <h3 style={{ margin: 0 }}>Upload Diagnostic Report</h3>
                  <small style={{ color: "var(--text-muted)" }}>
                    {uploadingOrder.testName} for {uploadingOrder.patientName}
                  </small>
                </div>
              </div>
              <button className="icon-button" onClick={() => setUploadingOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ background: "var(--color-neutral-50)", padding: "0.85rem", borderRadius: 8, fontSize: "0.85rem" }}>
                  <div><strong>Patient:</strong> {uploadingOrder.patientName} ({uploadingOrder.patientNumber})</div>
                  <div><strong>Test:</strong> {uploadingOrder.testName} ({uploadingOrder.category})</div>
                  <div><strong>Ordered By:</strong> {uploadingOrder.doctorName}</div>
                </div>

                <div>
                  <label className="field-label">Select Report File (PDF, PNG, JPG)</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    style={{ padding: "0.5rem" }}
                  />
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: 4 }}>
                    Max file size 10MB. Report will be saved to patient history.
                  </small>
                </div>

                <div>
                  <label className="field-label">Lab Technician Name</label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="field-label">Technician Findings / Remarks (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Hemoglobin 13.5 g/dL (Normal range). Fasting sugar 95 mg/dL."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setUploadingOrder(null)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="spin-icon" /> Uploading...
                    </>
                  ) : (
                    "Mark Complete & Save Report"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
