"use client";

import { useState, useTransition } from "react";
import { Download, Printer, Search, Plus, CheckCircle2, CreditCard, X, Loader2, IndianRupee, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { downloadInvoicePDF, printInvoicePDF } from "@/lib/pdf";
import { downloadCSV } from "@/lib/csv";
import { createInvoice, recordPayment, deleteInvoice } from "@/app/actions/billing";
import { useRouter } from "next/navigation";

type InvoiceData = {
  id: string; // invoiceNumber
  dbId: string;
  patientId: string;
  patientNumber: string;
  patient: string;
  date: string;
  consultationFee: number;
  medicineCharges: number;
  labCharges: number;
  totalAmountNum: number;
  amount: string;
  method: string;
  status: string;
};

type SimplePatient = {
  id: string;
  dbId: string;
  name: string;
  mobile: string;
};

export function InvoiceTable({
  invoices,
  patients = [],
}: {
  invoices: InvoiceData[];
  patients?: SimplePatient[];
}) {
  const { notify } = useAppStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Invoice Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [consultationFee, setConsultationFee] = useState("500");
  const [medicineCharges, setMedicineCharges] = useState("0");
  const [labCharges, setLabCharges] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [invoiceStatus, setInvoiceStatus] = useState<"PAID" | "PENDING">("PENDING");

  // Record Payment Modal State
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<"CASH" | "UPI" | "CREDIT_CARD" | "DEBIT_CARD">("CASH");

  // Delete State
  const [deletingDbId, setDeletingDbId] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.patientNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PAID" && inv.status === "Paid") ||
      (statusFilter === "PENDING" && inv.status === "Pending");

    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      notify("Please select a patient.");
      return;
    }

    const cFee = parseFloat(consultationFee) || 0;
    const mCharges = parseFloat(medicineCharges) || 0;
    const lCharges = parseFloat(labCharges) || 0;

    startTransition(async () => {
      try {
        await createInvoice({
          patientId: selectedPatientId,
          consultationFee: cFee,
          medicineCharges: mCharges,
          labCharges: lCharges,
          paymentMethod: paymentMethod as any,
          status: invoiceStatus,
        });
        notify("Invoice created successfully!");
        setIsCreateOpen(false);
        router.refresh();
      } catch (err: any) {
        notify(`Error: ${err.message || err}`);
      }
    });
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;

    startTransition(async () => {
      try {
        await recordPayment(paymentInvoice.dbId, selectedMethod);
        notify(`Payment of ${paymentInvoice.amount} recorded successfully!`);
        setPaymentInvoice(null);
        router.refresh();
      } catch (err: any) {
        notify(`Payment failed: ${err.message || err}`);
      }
    });
  };

  const handleDelete = (dbId: string) => {
    startTransition(async () => {
      try {
        await deleteInvoice(dbId);
        notify("Invoice deleted.");
        setDeletingDbId(null);
        router.refresh();
      } catch (err: any) {
        notify(`Delete failed: ${err.message || err}`);
      }
    });
  };

  return (
    <>
      <Panel>
        <div className="panel-heading" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="panel-kicker">INVOICES &amp; BILLING</span>
            <h3>Transactions &amp; Receipts ({filteredInvoices.length})</h3>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <button className="button button-primary" onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} /> Create Invoice
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                const csvData = filteredInvoices.map((inv) => ({
                  InvoiceID: inv.id,
                  Patient: inv.patient,
                  PatientID: inv.patientNumber,
                  Date: inv.date,
                  ConsultationFee: inv.consultationFee,
                  MedicineCharges: inv.medicineCharges,
                  LabCharges: inv.labCharges,
                  Amount: inv.amount,
                  Method: inv.method,
                  Status: inv.status,
                }));
                downloadCSV(csvData, "invoices_export");
                notify(`Exported ${filteredInvoices.length} invoices to CSV.`);
              }}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="toolbar" style={{ marginTop: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <div className="tab-group">
            {["ALL", "PENDING", "PAID"].map((st) => (
              <button
                key={st}
                type="button"
                className={`tab-item ${statusFilter === st ? "tab-item-active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === "ALL" ? "All Invoices" : st}
              </button>
            ))}
          </div>

          <div className="input-with-icon" style={{ minWidth: 260, flex: 1 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by patient, mobile or invoice number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <CreditCard size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: "var(--text-main)" }}>No Invoices Found</p>
            <p style={{ fontSize: "0.875rem" }}>
              {searchQuery ? "No invoice matches your search filter." : "Click 'Create Invoice' to generate a bill for a patient."}
            </p>
          </div>
        ) : (
          <div className="data-table-wrap" style={{ marginTop: "1rem" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Fee Breakdown</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.dbId}>
                    <td>
                      <strong style={{ color: "var(--text-main)" }}>{inv.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{inv.patient}</div>
                      <small style={{ color: "var(--text-muted)" }}>ID: {inv.patientNumber}</small>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{inv.date}</td>
                    <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      <div>Doc: ₹{inv.consultationFee} | Med: ₹{inv.medicineCharges}</div>
                      {inv.labCharges > 0 && <div style={{ color: "#0284c7", fontWeight: 600 }}>Lab: ₹{inv.labCharges}</div>}
                    </td>
                    <td>
                      <strong style={{ color: "var(--color-primary-600)", fontSize: "0.95rem" }}>{inv.amount}</strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>{inv.method}</span>
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row-actions" style={{ justifyContent: "flex-end", gap: 6 }}>
                        {inv.status === "Pending" && (
                          <button
                            className="button button-success button-sm"
                            onClick={() => {
                              setPaymentInvoice(inv);
                              setSelectedMethod("CASH");
                            }}
                            title="Collect payment / Mark Paid"
                          >
                            <CheckCircle2 size={13} /> Collect
                          </button>
                        )}
                        <button
                          className="icon-button"
                          onClick={() => {
                            downloadInvoicePDF({
                              invoiceNumber: inv.id,
                              clinicName: "Bhagwati Clinic",
                              branchName: "Navgaon Clinic",
                              patientName: inv.patient,
                              date: inv.date,
                              consultationFee: inv.consultationFee,
                              medicineCharges: inv.medicineCharges,
                              labCharges: inv.labCharges,
                              amount: inv.amount,
                              method: inv.method,
                              status: inv.status,
                              gstin: "27AABCH1842F1Z8",
                            });
                            notify("Invoice PDF downloaded!");
                          }}
                          title="Download PDF Invoice"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => {
                            printInvoicePDF({
                              invoiceNumber: inv.id,
                              clinicName: "Bhagwati Clinic",
                              branchName: "Navgaon Clinic",
                              patientName: inv.patient,
                              date: inv.date,
                              consultationFee: inv.consultationFee,
                              medicineCharges: inv.medicineCharges,
                              labCharges: inv.labCharges,
                              amount: inv.amount,
                              method: inv.method,
                              status: inv.status,
                              gstin: "27AABCH1842F1Z8",
                            });
                            notify("Printing Bhagwati Clinic Invoice...");
                          }}
                          title="Print Bhagwati Clinic Invoice"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          className="icon-button"
                          style={{ color: "var(--red-600)" }}
                          onClick={() => setDeletingDbId(inv.dbId)}
                          title="Delete Invoice"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Create Invoice Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <IndianRupee size={22} className="text-primary" />
                <h3>Create New Invoice</h3>
              </div>
              <button className="icon-button" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="field-label">Select Patient *</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.dbId} value={p.dbId}>
                        {p.name} ({p.id} · {p.mobile})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="field-label">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Medicine Charges (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={medicineCharges}
                      onChange={(e) => setMedicineCharges(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="field-label">Lab Test Charges (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={labCharges}
                      onChange={(e) => setLabCharges(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">Total Amount</label>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, padding: "0.5rem 0", color: "var(--color-primary-600)" }}>
                      ₹{(parseFloat(consultationFee) || 0) + (parseFloat(medicineCharges) || 0) + (parseFloat(labCharges) || 0)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className="field-label">Payment Method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Payment Status</label>
                    <select value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value as any)}>
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid / Received</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={isPending}>
                  {isPending ? <Loader2 size={16} className="spin-icon" /> : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={22} style={{ color: "#10b981" }} />
                <div>
                  <h3 style={{ margin: 0 }}>Collect Payment</h3>
                  <small style={{ color: "var(--text-muted)" }}>
                    Invoice {paymentInvoice.id} · {paymentInvoice.patient}
                  </small>
                </div>
              </div>
              <button className="icon-button" onClick={() => setPaymentInvoice(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ background: "var(--color-neutral-50)", padding: "1rem", borderRadius: 8, textAlign: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Amount Due</span>
                  <strong style={{ fontSize: "1.6rem", color: "#10b981" }}>{paymentInvoice.amount}</strong>
                </div>

                <div>
                  <label className="field-label">Payment Mode</label>
                  <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value as any)}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setPaymentInvoice(null)}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-success" disabled={isPending}>
                  {isPending ? <Loader2 size={16} className="spin-icon" /> : "Confirm Payment Received"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDbId && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3>Delete Invoice</h3>
              <button className="icon-button" onClick={() => setDeletingDbId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this invoice? This will remove all associated payment logs.</p>
            </div>
            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="button button-secondary" onClick={() => setDeletingDbId(null)} disabled={isPending}>
                Cancel
              </button>
              <button className="button button-danger" onClick={() => handleDelete(deletingDbId)} disabled={isPending}>
                {isPending ? "Deleting..." : "Delete Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
