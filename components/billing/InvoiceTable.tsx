"use client";

import { Download, Printer, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { downloadInvoicePDF } from "@/lib/pdf";
import { downloadCSV } from "@/lib/csv";

type InvoiceData = {
  id: string;
  patient: string;
  date: string;
  amount: string;
  method: string;
  status: string;
};

export function InvoiceTable({ invoices }: { invoices: InvoiceData[] }) {
  const { notify } = useAppStore();

  return (
    <Panel>
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">INVOICES</span>
          <h3>Recent transactions</h3>
        </div>
        <button className="button button-secondary" onClick={() => {
          const csvData = invoices.map(inv => ({
            InvoiceID: inv.id,
            Patient: inv.patient,
            Date: inv.date,
            Amount: inv.amount,
            Method: inv.method,
            Status: inv.status
          }));
          downloadCSV(csvData, "invoices_export");
          notify(`Exported ${invoices.length} invoices to CSV.`);
        }}>
          <Download size={16} /> Export
        </button>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td><strong>{inv.id}</strong></td>
                <td>{inv.patient}</td>
                <td>{inv.date}</td>
                <td><strong>{inv.amount}</strong></td>
                <td>{inv.method}</td>
                <td><StatusBadge status={inv.status} /></td>
                <td>
                  <div className="row-actions">
                    <button className="icon-button"><Search size={15} /></button>
                    <button className="icon-button" onClick={() => window.print()}><Printer size={15} /></button>
                    <button className="icon-button" onClick={() => {
                      downloadInvoicePDF({
                        invoiceNumber: inv.id,
                        clinicName: "HomeoCare Pro",
                        branchName: "Navgaon Clinic",
                        patientName: inv.patient,
                        date: inv.date,
                        amount: inv.amount,
                        method: inv.method,
                        status: inv.status,
                        gstin: "27AABCH1234F1Z5",
                      });
                      notify("Invoice PDF downloaded!");
                    }}><Download size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
