export type PatientStatus = "Active" | "Follow-up" | "Inactive" | "Emergency";

export type Patient = {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: string;
  mobile: string;
  email: string;
  condition: string;
  lastVisit: string;
  nextFollowUp: string;
  status: PatientStatus;
  color: string;
};

export type AppointmentStatus =
  | "Confirmed"
  | "Waiting"
  | "Checked in"
  | "Reschedule"
  | "Completed";

export type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  mode: "Clinic" | "Video";
  status: AppointmentStatus;
  reason: string;
};

export const patients: Patient[] = [
  {
    id: "PAT-2026-00892",
    name: "Elena Rodriguez",
    initials: "ER",
    age: 34,
    gender: "Female",
    mobile: "+91 98201 44018",
    email: "elena.rodriguez@example.com",
    condition: "Chronic Migraine",
    lastVisit: "12 Jun 2026",
    nextFollowUp: "18 Jun 2026",
    status: "Active",
    color: "#dbeafe",
  },
  {
    id: "PAT-2026-00744",
    name: "Marcus Thorne",
    initials: "MT",
    age: 52,
    gender: "Male",
    mobile: "+91 97655 18402",
    email: "marcus.thorne@example.com",
    condition: "Hypertension",
    lastVisit: "10 Jun 2026",
    nextFollowUp: "Today",
    status: "Follow-up",
    color: "#dcfce7",
  },
  {
    id: "PAT-2026-00121",
    name: "Sarah Jenkins",
    initials: "SJ",
    age: 29,
    gender: "Female",
    mobile: "+91 98904 22267",
    email: "sarah.jenkins@example.com",
    condition: "Gastritis",
    lastVisit: "02 Jun 2026",
    nextFollowUp: "24 Jun 2026",
    status: "Inactive",
    color: "#f3e8ff",
  },
  {
    id: "PAT-2026-00333",
    name: "David Chen",
    initials: "DC",
    age: 41,
    gender: "Male",
    mobile: "+91 91580 78092",
    email: "david.chen@example.com",
    condition: "Acute Bronchitis",
    lastVisit: "Just now",
    nextFollowUp: "15 Jun 2026",
    status: "Emergency",
    color: "#fee2e2",
  },
  {
    id: "PAT-2026-00904",
    name: "Priya Sharma",
    initials: "PS",
    age: 37,
    gender: "Female",
    mobile: "+91 94220 83761",
    email: "priya.sharma@example.com",
    condition: "Allergic Rhinitis",
    lastVisit: "28 May 2026",
    nextFollowUp: "20 Jun 2026",
    status: "Active",
    color: "#fef3c7",
  },
  {
    id: "PAT-2026-00671",
    name: "Arjun Malhotra",
    initials: "AM",
    age: 46,
    gender: "Male",
    mobile: "+91 99871 11529",
    email: "arjun.malhotra@example.com",
    condition: "Arthritis",
    lastVisit: "25 May 2026",
    nextFollowUp: "16 Jun 2026",
    status: "Follow-up",
    color: "#cffafe",
  },
];

export const appointments: Appointment[] = [
  {
    id: "APT-1042",
    patient: "Arjun Malhotra",
    doctor: "Dr. Maya Smith",
    time: "10:30 AM",
    mode: "Clinic",
    status: "Confirmed",
    reason: "Arthritis follow-up",
  },
  {
    id: "APT-1043",
    patient: "Priya Sharma",
    doctor: "Dr. Robert Chen",
    time: "11:15 AM",
    mode: "Video",
    status: "Waiting",
    reason: "Allergic rhinitis",
  },
  {
    id: "APT-1044",
    patient: "Marcus Thorne",
    doctor: "Dr. Maya Smith",
    time: "02:00 PM",
    mode: "Clinic",
    status: "Reschedule",
    reason: "Blood pressure review",
  },
  {
    id: "APT-1045",
    patient: "Lena Volkova",
    doctor: "Dr. Maya Smith",
    time: "04:30 PM",
    mode: "Video",
    status: "Confirmed",
    reason: "Migraine consultation",
  },
];

export const revenueData = [
  { name: "Jan", revenue: 16600, patients: 820 },
  { name: "Feb", revenue: 18200, patients: 875 },
  { name: "Mar", revenue: 17750, patients: 940 },
  { name: "Apr", revenue: 21100, patients: 1030 },
  { name: "May", revenue: 22800, patients: 1160 },
  { name: "Jun", revenue: 24800, patients: 1284 },
];

export const diseaseData = [
  { name: "Migraine", value: 28, color: "#0066ff" },
  { name: "Respiratory", value: 22, color: "#10b981" },
  { name: "Digestive", value: 19, color: "#8b5cf6" },
  { name: "Skin", value: 17, color: "#f59e0b" },
  { name: "Other", value: 14, color: "#cbd5e1" },
];

export const invoices = [
  {
    id: "INV-2026-0428",
    patient: "Elena Rodriguez",
    date: "12 Jun 2026",
    amount: "₹2,450",
    method: "UPI",
    status: "Paid",
  },
  {
    id: "INV-2026-0427",
    patient: "Marcus Thorne",
    date: "12 Jun 2026",
    amount: "₹1,800",
    method: "Cash",
    status: "Paid",
  },
  {
    id: "INV-2026-0426",
    patient: "Sarah Jenkins",
    date: "11 Jun 2026",
    amount: "₹3,250",
    method: "Card",
    status: "Pending",
  },
  {
    id: "INV-2026-0425",
    patient: "David Chen",
    date: "11 Jun 2026",
    amount: "₹1,200",
    method: "UPI",
    status: "Overdue",
  },
];

export const inventory = [
  {
    medicine: "Arnica Montana",
    potency: "30C",
    manufacturer: "SBL",
    batch: "ARN-2441",
    stock: 84,
    expiry: "Mar 2028",
    status: "Healthy",
  },
  {
    medicine: "Nux Vomica",
    potency: "200C",
    manufacturer: "Dr. Reckeweg",
    batch: "NUX-1938",
    stock: 12,
    expiry: "Dec 2027",
    status: "Low stock",
  },
  {
    medicine: "Belladonna",
    potency: "30C",
    manufacturer: "Schwabe",
    batch: "BEL-0842",
    stock: 45,
    expiry: "Sep 2026",
    status: "Expiring",
  },
  {
    medicine: "Rhus Toxicodendron",
    potency: "1M",
    manufacturer: "SBL",
    batch: "RHU-5540",
    stock: 67,
    expiry: "Jan 2029",
    status: "Healthy",
  },
  {
    medicine: "Pulsatilla",
    potency: "30C",
    manufacturer: "Bakson",
    batch: "PUL-8812",
    stock: 8,
    expiry: "Jun 2027",
    status: "Low stock",
  },
];
