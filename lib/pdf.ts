"use client";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Register fonts
if (typeof window !== "undefined") {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;
}

type PrescriptionData = {
  clinicName: string;
  branchName: string;
  doctorName: string;
  doctorReg: string;
  clinicPhone: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientId: string;
  date: string;
  diagnosis: string;
  items: { medicine: string; potency: string; dosage: string }[];
  instructions: string;
  followUpDate: string;
  doctorDegrees?: string[];
};

type InvoiceData = {
  invoiceNumber: string;
  clinicName: string;
  branchName: string;
  patientName: string;
  date: string;
  consultationFee?: number;
  medicineCharges?: number;
  labCharges?: number;
  amount: string;
  method: string;
  status: string;
  gstin?: string;
};

export function downloadPrescriptionPDF(data: PrescriptionData) {
  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 60],
    content: [
      // Header
      {
        columns: [
          {
            stack: [
              { text: data.clinicName || "Bhagwati Clinic", style: "clinicName" },
              { text: data.branchName || "Navgaon Clinic", style: "branchInfo" },
            ],
          },
          {
            stack: [
              { text: data.doctorName, style: "doctorName", alignment: "right", margin: [0, 0, 0, 2] },
              ...(data.doctorDegrees?.map(degree => ({ text: degree, style: "doctorInfo", alignment: "right" })) || []),
              { text: `Reg No. ${data.doctorReg} · ${data.clinicPhone}`, style: "doctorInfo", alignment: "right", margin: [0, 2, 0, 0] },
            ],
          },
        ],
        margin: [0, 0, 0, 15],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: "#e2e8f0" }] },

      // Patient info
      {
        columns: [
          {
            stack: [
              { text: "PATIENT", style: "label" },
              { text: data.patientName, style: "value" },
              { text: `${data.patientAge} years · ${data.patientGender} · ${data.patientId}`, style: "subValue" },
            ],
          },
          {
            stack: [
              { text: "DATE", style: "label" },
              { text: data.date, style: "value" },
              { text: `Diagnosis: ${data.diagnosis}`, style: "subValue" },
            ],
            alignment: "right",
          },
        ],
        margin: [0, 15, 0, 15],
      },

      // Rx symbol
      { text: "Rx", style: "rxSymbol", margin: [0, 5, 0, 10] },

      // Medicines table
      {
        table: {
          headerRows: 1,
          widths: ["*", 80, "*"],
          body: [
            [
              { text: "Medicine", style: "tableHeader" },
              { text: "Potency", style: "tableHeader" },
              { text: "Dosage & Duration", style: "tableHeader" },
            ],
            ...data.items.map(item => [
              { text: item.medicine, style: "tableCellBold" },
              { text: item.potency, style: "tableCell" },
              { text: item.dosage, style: "tableCell" },
            ]),
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => "#e2e8f0",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
        margin: [0, 0, 0, 20],
      },

      // Instructions
      data.instructions
        ? {
            stack: [
              { text: "INSTRUCTIONS", style: "label" },
              { text: data.instructions, style: "instructionText" },
            ],
            margin: [0, 0, 0, 15],
          }
        : {},

      // Follow up
      data.followUpDate
        ? {
            columns: [
              {
                stack: [
                  { text: "NEXT FOLLOW-UP", style: "label" },
                  { text: data.followUpDate, style: "value" },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          }
        : {},

      // Footer
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#e2e8f0" }] },
      { text: "Bhagwati Clinic · Advanced Care Center · Navgaon", style: "footerNote", margin: [0, 10, 0, 0] },
    ],
    styles: {
      clinicName: { fontSize: 16, bold: true, color: "#0f172a" },
      branchInfo: { fontSize: 9, color: "#64748b", margin: [0, 2, 0, 0] },
      doctorName: { fontSize: 12, bold: true, color: "#0f172a" },
      doctorInfo: { fontSize: 8, color: "#64748b" },
      label: { fontSize: 8, color: "#94a3b8", bold: true },
      value: { fontSize: 11, bold: true, color: "#0f172a", margin: [0, 2, 0, 0] },
      subValue: { fontSize: 9, color: "#64748b", margin: [0, 1, 0, 0] },
      rxSymbol: { fontSize: 20, bold: true, color: "#0284c7" },
      tableHeader: { fontSize: 9, bold: true, color: "#64748b", fillColor: "#f8fafc" },
      tableCell: { fontSize: 10, color: "#334155" },
      tableCellBold: { fontSize: 10, bold: true, color: "#0f172a" },
      instructionText: { fontSize: 10, color: "#334155", margin: [0, 4, 0, 0] },
      footerNote: { fontSize: 8, color: "#94a3b8", alignment: "center" },
    },
  };

  pdfMake.createPdf(docDefinition).download(`Prescription_${data.patientName.replace(/\s+/g, "_")}.pdf`);
}

function buildInvoiceDocDefinition(data: InvoiceData): any {
  const itemsList: any[] = [];
  if (data.consultationFee && data.consultationFee > 0) {
    itemsList.push([
      { text: "Doctor Consultation & Clinical Service", style: "tableCell" },
      { text: `₹${data.consultationFee}`, style: "tableCell", alignment: "right" },
    ]);
  }
  if (data.medicineCharges && data.medicineCharges > 0) {
    itemsList.push([
      { text: "Pharmacy & Medicine Supply", style: "tableCell" },
      { text: `₹${data.medicineCharges}`, style: "tableCell", alignment: "right" },
    ]);
  }
  if (data.labCharges && data.labCharges > 0) {
    itemsList.push([
      { text: "Diagnostic & Laboratory Tests", style: "tableCell" },
      { text: `₹${data.labCharges}`, style: "tableCell", alignment: "right" },
    ]);
  }
  if (itemsList.length === 0) {
    itemsList.push([
      { text: "Medical Consultation & Healthcare Services", style: "tableCell" },
      { text: data.amount, style: "tableCell", alignment: "right" },
    ]);
  }

  return {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 60],
    content: [
      // Header
      {
        columns: [
          {
            stack: [
              { text: data.clinicName || "Bhagwati Clinic", style: "clinicName" },
              { text: data.branchName || "Navgaon Clinic, Paithan Road, Pune", style: "branchInfo" },
              { text: `GSTIN: ${data.gstin || "27AABCH1842F1Z8"}`, style: "branchInfo" },
            ],
          },
          {
            stack: [
              { text: "TAX INVOICE / RECEIPT", style: "invoiceTitle", alignment: "right" },
              { text: data.invoiceNumber, style: "invoiceNumber", alignment: "right" },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: "#e2e8f0" }] },

      // Invoice details
      {
        columns: [
          {
            stack: [
              { text: "PATIENT / BILL TO", style: "label" },
              { text: data.patientName, style: "value" },
            ],
          },
          {
            stack: [
              { text: "INVOICE DATE", style: "label" },
              { text: data.date, style: "value" },
              { text: `Payment Mode: ${data.method}`, style: "subValue" },
            ],
            alignment: "right",
          },
        ],
        margin: [0, 15, 0, 20],
      },

      // Summary table
      {
        table: {
          headerRows: 1,
          widths: ["*", 120],
          body: [
            [
              { text: "Service Description", style: "tableHeader" },
              { text: "Amount (INR)", style: "tableHeader", alignment: "right" },
            ],
            ...itemsList,
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => "#e2e8f0",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
        margin: [0, 0, 0, 20],
      },

      // Total & Status
      {
        columns: [
          {
            stack: [
              { text: `Status: ${data.status.toUpperCase()}`, style: "statusPill", color: data.status.toLowerCase() === "paid" ? "#047857" : "#c2410c" },
            ],
          },
          {
            stack: [
              {
                columns: [
                  { text: "Total Amount:", style: "totalLabel", width: "auto" },
                  { text: data.amount, style: "totalValue", alignment: "right" },
                ],
              },
            ],
            width: 200,
          },
        ],
        margin: [0, 0, 0, 40],
      },

      // Footer
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#e2e8f0" }] },
      { text: "Thank you for choosing Bhagwati Clinic.", style: "thankYou", margin: [0, 15, 0, 0] },
      { text: "This is an official computer-generated invoice.", style: "footerNote", margin: [0, 4, 0, 0] },
    ],
    styles: {
      clinicName: { fontSize: 16, bold: true, color: "#0f172a" },
      branchInfo: { fontSize: 9, color: "#64748b", margin: [0, 2, 0, 0] },
      invoiceTitle: { fontSize: 13, bold: true, color: "#0284c7" },
      invoiceNumber: { fontSize: 10, color: "#64748b", margin: [0, 3, 0, 0] },
      label: { fontSize: 8, color: "#94a3b8", bold: true },
      value: { fontSize: 12, bold: true, color: "#0f172a", margin: [0, 3, 0, 0] },
      subValue: { fontSize: 9, color: "#64748b", margin: [0, 2, 0, 0] },
      tableHeader: { fontSize: 9, bold: true, color: "#64748b", fillColor: "#f8fafc" },
      tableCell: { fontSize: 10, color: "#0f172a" },
      statusPill: { fontSize: 10, bold: true },
      totalLabel: { fontSize: 13, bold: true, color: "#0f172a" },
      totalValue: { fontSize: 13, bold: true, color: "#0284c7" },
      thankYou: { fontSize: 10, color: "#334155", alignment: "center" },
      footerNote: { fontSize: 8, color: "#94a3b8", alignment: "center" },
    },
  };
}

export function downloadInvoicePDF(data: InvoiceData) {
  const docDefinition = buildInvoiceDocDefinition(data);
  pdfMake.createPdf(docDefinition).download(`Invoice_${data.invoiceNumber}.pdf`);
}

export function printInvoicePDF(data: InvoiceData) {
  const docDefinition = buildInvoiceDocDefinition(data);
  pdfMake.createPdf(docDefinition).print();
}
