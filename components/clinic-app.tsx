"use client";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  Box,
  BriefcaseMedical,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  HeartPulse,
  HelpCircle,
  History,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircleMore,
  Moon,
  MoreHorizontal,
  PackageSearch,
  Pencil,
  Phone,
  Pill,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  Trash2,
  UploadCloud,
  UserRound,
  UserRoundPlus,
  UsersRound,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  appointments as initialAppointments,
  diseaseData,
  inventory,
  invoices,
  patients as initialPatients,
  revenueData,
  type Appointment,
  type AppointmentStatus,
  type Patient,
} from "@/lib/data";

type ViewId =
  | "dashboard"
  | "patients"
  | "appointments"
  | "treatments"
  | "prescriptions"
  | "reports"
  | "billing"
  | "inventory"
  | "analytics"
  | "followups"
  | "whatsapp"
  | "staff"
  | "settings";

type NavItem = {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "patients", label: "Patients", icon: UsersRound },
      { id: "appointments", label: "Appointments", icon: CalendarDays, badge: "12" },
      { id: "followups", label: "Follow-Ups", icon: History, badge: "7" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { id: "treatments", label: "Treatments", icon: Stethoscope },
      { id: "prescriptions", label: "Prescriptions", icon: Pill },
      { id: "reports", label: "Medical Reports", icon: FileText },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "billing", label: "Billing", icon: ReceiptText },
      { id: "inventory", label: "Inventory", icon: PackageSearch },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "whatsapp", label: "WhatsApp Center", icon: MessageCircleMore },
      { id: "staff", label: "Staff Management", icon: BriefcaseMedical },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const pageTitles: Record<ViewId, { title: string; eyebrow: string }> = {
  dashboard: { title: "Practice Health", eyebrow: "Friday, 12 June 2026" },
  patients: { title: "Patient Management", eyebrow: "Clinical records" },
  appointments: { title: "Appointment Center", eyebrow: "Schedule and availability" },
  treatments: { title: "Treatment Management", eyebrow: "Consultation records" },
  prescriptions: { title: "Prescription Studio", eyebrow: "Clinical documentation" },
  reports: { title: "Medical Reports", eyebrow: "Secure document center" },
  billing: { title: "Billing & Revenue", eyebrow: "Invoices and payments" },
  inventory: { title: "Medicine Inventory", eyebrow: "Stock and expiry tracking" },
  analytics: { title: "Clinic Analytics", eyebrow: "Performance intelligence" },
  followups: { title: "Follow-Up Center", eyebrow: "Continuity of care" },
  whatsapp: { title: "WhatsApp Center", eyebrow: "Patient communication" },
  staff: { title: "Staff Management", eyebrow: "Roles and access" },
  settings: { title: "Clinic Settings", eyebrow: "Configuration" },
};

export function ClinicApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState<ViewId>("dashboard");
  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [addingPatient, setAddingPatient] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [toast, setToast] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notify = (message: string) => setToast(message);

  const navigate = (nextView: ViewId) => {
    setView(nextView);
    setSelectedPatient(null);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addPatient = (patient: Patient) => {
    setPatients((current) => [patient, ...current]);
    setAddingPatient(false);
    notify(`${patient.name} was registered successfully.`);
  };

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  const activeMeta = pageTitles[view];

  return (
    <div className="app-shell">
      <Sidebar
        active={view}
        open={sidebarOpen}
        onNavigate={navigate}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => setAuthenticated(false)}
      />

      <main className="main-shell">
        <Topbar
          title={selectedPatient ? "Patient Profile" : activeMeta.title}
          eyebrow={selectedPatient ? selectedPatient.id : activeMeta.eyebrow}
          darkMode={darkMode}
          language={language}
          onMenu={() => setSidebarOpen(true)}
          onTheme={() => setDarkMode((value) => !value)}
          onLanguage={() => setLanguage((value) => (value === "EN" ? "मराठी" : value === "मराठी" ? "हिंदी" : "EN"))}
          onAddPatient={() => setAddingPatient(true)}
          onNotify={notify}
        />

        <div className="content-shell">
          {selectedPatient ? (
            <PatientProfile
              patient={selectedPatient}
              onBack={() => setSelectedPatient(null)}
              onNotify={notify}
            />
          ) : (
            <>
              {view === "dashboard" && (
                <Dashboard
                  patients={patients}
                  appointments={appointments}
                  onNavigate={navigate}
                  onAddPatient={() => setAddingPatient(true)}
                  onPatient={setSelectedPatient}
                />
              )}
              {view === "patients" && (
                <PatientsPage
                  patients={patients}
                  onPatient={setSelectedPatient}
                  onAdd={() => setAddingPatient(true)}
                  onNotify={notify}
                />
              )}
              {view === "appointments" && (
                <AppointmentsPage
                  appointments={appointments}
                  setAppointments={setAppointments}
                  onNotify={notify}
                />
              )}
              {view === "treatments" && <TreatmentsPage onNotify={notify} />}
              {view === "prescriptions" && <PrescriptionsPage onNotify={notify} />}
              {view === "reports" && <ReportsPage onNotify={notify} />}
              {view === "billing" && <BillingPage onNotify={notify} />}
              {view === "inventory" && <InventoryPage onNotify={notify} />}
              {view === "analytics" && <AnalyticsPage />}
              {view === "followups" && <FollowUpsPage onNotify={notify} />}
              {view === "whatsapp" && <WhatsAppPage onNotify={notify} />}
              {view === "staff" && <StaffPage onNotify={notify} />}
              {view === "settings" && (
                <SettingsPage
                  darkMode={darkMode}
                  language={language}
                  onTheme={() => setDarkMode((value) => !value)}
                  onLanguage={setLanguage}
                  onNotify={notify}
                />
              )}
            </>
          )}
        </div>
      </main>

      {addingPatient && (
        <AddPatientDrawer
          onClose={() => setAddingPatient(false)}
          onSave={addPatient}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon"><Check size={16} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(onLogin, 550);
  };

  return (
    <div className="login-page">
      <section className="login-brand-panel">
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-mark"><HeartPulse size={24} /></span>
          <div>
            <strong>HomeoCare Pro</strong>
            <small>Enterprise</small>
          </div>
        </div>
        <div className="login-hero">
          <span className="eyebrow-light">CLINICAL PRECISION, SIMPLIFIED</span>
          <h1>Better care begins with a complete patient story.</h1>
          <p>
            One secure workspace for consultations, appointments, prescriptions,
            reports, billing, and meaningful follow-up.
          </p>
          <div className="trust-row">
            <span><ShieldCheck size={18} /> Role-based security</span>
            <span><Activity size={18} /> Live practice insights</span>
          </div>
        </div>
        <div className="login-quote">
          <div className="doctor-avatar">MS</div>
          <div>
            <p>“Every detail is exactly where the care team needs it.”</p>
            <span>Dr. Madhukar Takpire, Clinical Director</span>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="mobile-login-brand">
          <span className="brand-mark"><HeartPulse size={22} /></span>
          <strong>HomeoCare Pro</strong>
        </div>
        <form className="login-card" onSubmit={submit}>
          <span className="kicker">SECURE CLINIC ACCESS</span>
          <h2>Welcome back, Doctor</h2>
          <p>Sign in to access your clinical dashboard and patient records.</p>

          <label className="field-label" htmlFor="email">Email address</label>
          <div className="input-with-icon">
            <Mail size={17} />
            <input id="email" type="email" defaultValue="doctor@homeocare.in" required />
          </div>

          <label className="field-label" htmlFor="password">Password</label>
          <div className="input-with-icon">
            <LockKeyhole size={17} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              defaultValue="homeocare"
              required
            />
            <button
              className="icon-button inline-icon"
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <X size={16} /> : <Sparkles size={16} />}
            </button>
          </div>

          <div className="login-options">
            <label><input type="checkbox" defaultChecked /> Remember me</label>
            <button type="button">Forgot password?</button>
          </div>

          <button className="button button-primary button-full" type="submit">
            {loading ? "Securing session..." : "Login to HomeoCare"}
            {!loading && <ChevronRight size={17} />}
          </button>

          <div className="login-support">
            <HelpCircle size={16} />
            Technical difficulty? <a href="mailto:support@homeocare.in">Contact IT support</a>
          </div>
          <div className="security-note"><ShieldCheck size={16} /> Encrypted healthcare workspace</div>
        </form>
      </section>
    </div>
  );
}

function Sidebar({
  active,
  open,
  onNavigate,
  onClose,
  onLogout,
}: {
  active: ViewId;
  open: boolean;
  onNavigate: (view: ViewId) => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close menu" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><HeartPulse size={22} /></span>
          <div>
            <strong>HomeoCare Pro</strong>
            <small>Enterprise</small>
          </div>
          <button className="sidebar-close" onClick={onClose}><X size={20} /></button>
        </div>

        <button className="branch-switcher">
          <span className="branch-icon"><Building2 size={18} /></span>
          <span><small>Current branch</small><strong>Navgaon Clinic</strong></span>
          <ChevronDown size={15} />
        </button>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={`nav-item ${active === item.id ? "nav-item-active" : ""}`}
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {item.badge && <em>{item.badge}</em>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="storage-card">
            <div><ShieldCheck size={17} /><strong>Cloud backup</strong><span>Synced 2 min ago</span></div>
            <span className="status-dot" />
          </div>
          <button className="nav-item" onClick={onLogout}>
            <LogOut size={18} /><span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({
  title,
  eyebrow,
  darkMode,
  language,
  onMenu,
  onTheme,
  onLanguage,
  onAddPatient,
  onNotify,
}: {
  title: string;
  eyebrow: string;
  darkMode: boolean;
  language: string;
  onMenu: () => void;
  onTheme: () => void;
  onLanguage: () => void;
  onAddPatient: () => void;
  onNotify: (message: string) => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="icon-button mobile-menu" onClick={onMenu}><Menu size={20} /></button>
        <div><span>{eyebrow}</span><h1>{title}</h1></div>
      </div>
      <div className="topbar-actions">
        <div className="global-search">
          <Search size={17} />
          <input placeholder="Search patient, mobile or ID..." />
          <kbd>⌘ K</kbd>
        </div>
        <button className="language-button" onClick={onLanguage}>{language}</button>
        <button className="icon-button" onClick={onTheme} aria-label="Toggle theme">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-button notification-button" onClick={() => onNotify("You have 3 unread notifications.")}>
          <Bell size={18} /><span />
        </button>
        <button className="button button-primary topbar-add" onClick={onAddPatient}>
          <UserRoundPlus size={17} /> Add patient
        </button>
        <button className="profile-menu">
          <span className="avatar avatar-blue">MS</span>
          <span><strong>Dr. Madhukar Takpire</strong><small>Clinic Admin</small></span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  patients,
  appointments,
  onNavigate,
  onAddPatient,
  onPatient,
}: {
  patients: Patient[];
  appointments: Appointment[];
  onNavigate: (view: ViewId) => void;
  onAddPatient: () => void;
  onPatient: (patient: Patient) => void;
}) {
  return (
    <div className="page-stack">
      <div className="welcome-row">
        <div>
          <span className="kicker">MORNING, DR. SMITH</span>
          <h2>Your clinic is running smoothly today.</h2>
          <p>12 appointments are scheduled, with 7 follow-ups needing attention.</p>
        </div>
        <div className="quick-actions">
          <button className="button button-secondary" onClick={() => onNavigate("appointments")}>
            <CalendarDays size={17} /> New appointment
          </button>
          <button className="button button-primary" onClick={onAddPatient}>
            <UserRoundPlus size={17} /> Register patient
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard icon={UsersRound} label="Total patients" value="1,284" note="+4.8% this month" tone="blue" />
        <MetricCard icon={CalendarDays} label="Today's appointments" value="12" note="4 remaining" tone="violet" />
        <MetricCard icon={BriefcaseMedical} label="Active treatments" value="48" note="6 updated today" tone="green" />
        <MetricCard icon={History} label="Follow-ups due" value="7" note="2 overdue" tone="red" />
        <MetricCard icon={CircleDollarSign} label="Revenue today" value="₹1.42L" note="+12.5% vs last Fri" tone="amber" />
        <MetricCard icon={BarChart3} label="Monthly revenue" value="₹24.8L" note="82% of target" tone="blue" />
      </div>

      <div className="dashboard-grid">
        <Panel className="chart-panel chart-panel-wide">
          <div className="panel-heading">
            <div><span className="panel-kicker">GROWTH</span><h3>Patient growth</h3></div>
            <select className="compact-select" defaultValue="6m"><option value="6m">Last 6 months</option><option>Year</option></select>
          </div>
          <div className="chart-legend"><strong>1,284 total</strong><span className="trend-up">↑ 14.2%</span></div>
          <div className="chart-height">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="patientFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066ff" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#0066ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--line)" }} />
                <Area type="monotone" dataKey="patients" stroke="#0066ff" strokeWidth={3} fill="url(#patientFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="chart-panel">
          <div className="panel-heading"><div><span className="panel-kicker">CASE MIX</span><h3>Disease distribution</h3></div><MoreHorizontal size={19} /></div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={diseaseData} dataKey="value" innerRadius={54} outerRadius={78} paddingAngle={3}>
                  {diseaseData.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center"><strong>1,284</strong><span>patients</span></div>
          </div>
          <div className="disease-legend">
            {diseaseData.slice(0, 4).map((item) => (
              <span key={item.name}><i style={{ background: item.color }} />{item.name}<strong>{item.value}%</strong></span>
            ))}
          </div>
        </Panel>

        <Panel className="appointments-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">TODAY</span><h3>Upcoming appointments</h3></div>
            <button className="text-button" onClick={() => onNavigate("appointments")}>View schedule <ChevronRight size={15} /></button>
          </div>
          <div className="appointment-list">
            {appointments.slice(0, 4).map((appointment) => (
              <div className="appointment-row" key={appointment.id}>
                <div className="time-block"><strong>{appointment.time.split(" ")[0]}</strong><span>{appointment.time.split(" ")[1]}</span></div>
                <span className="avatar">{appointment.patient.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                <div className="appointment-copy"><strong>{appointment.patient}</strong><span>{appointment.reason}</span></div>
                <StatusBadge status={appointment.status} />
                <button className="icon-button"><MoreHorizontal size={17} /></button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="recent-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">RECENT</span><h3>Latest patients</h3></div>
            <button className="text-button" onClick={() => onNavigate("patients")}>All patients <ChevronRight size={15} /></button>
          </div>
          <div className="recent-patient-list">
            {patients.slice(0, 4).map((patient) => (
              <button className="recent-patient" key={patient.id} onClick={() => onPatient(patient)}>
                <span className="avatar" style={{ background: patient.color }}>{patient.initials}</span>
                <span><strong>{patient.name}</strong><small>{patient.condition}</small></span>
                <span className="patient-visit">{patient.lastVisit}<ChevronRight size={15} /></span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function PatientsPage({
  patients,
  onPatient,
  onAdd,
  onNotify,
}: {
  patients: Patient[];
  onPatient: (patient: Patient) => void;
  onAdd: () => void;
  onNotify: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const visible = useMemo(() => patients.filter((patient) => {
    const matchesQuery = `${patient.name} ${patient.id} ${patient.mobile} ${patient.condition}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "All" || patient.status === filter);
  }), [patients, query, filter]);

  return (
    <div className="page-stack">
      <PageHeader
        title="All patients"
        description="Search, review, and manage complete longitudinal patient records."
        action={<button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add patient</button>}
      />
      <Panel>
        <div className="table-toolbar">
          <div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by patient name, mobile, ID or disease" /></div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Active</option><option>Follow-up</option><option>Inactive</option><option>Emergency</option></select>
          <button className="button button-secondary" onClick={() => onNotify("Patient list exported as CSV.")}><Download size={16} /> Export</button>
        </div>
        <div className="filter-chips">
          {["All", "Active", "Follow-up", "Emergency"].map((item) => (
            <button className={filter === item ? "chip chip-active" : "chip"} onClick={() => setFilter(item)} key={item}>
              {item} {item === "All" && <span>{patients.length}</span>}
            </button>
          ))}
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Contact</th><th>Primary condition</th><th>Last visit</th><th>Next follow-up</th><th>Status</th><th /></tr></thead>
            <tbody>
              {visible.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <button className="patient-cell" onClick={() => onPatient(patient)}>
                      <span className="avatar" style={{ background: patient.color }}>{patient.initials}</span>
                      <span><strong>{patient.name}</strong><small>{patient.id} · {patient.age}Y · {patient.gender}</small></span>
                    </button>
                  </td>
                  <td><strong>{patient.mobile}</strong><small>{patient.email}</small></td>
                  <td>{patient.condition}</td>
                  <td>{patient.lastVisit}</td>
                  <td>{patient.nextFollowUp}</td>
                  <td><StatusBadge status={patient.status} /></td>
                  <td><button className="icon-button" onClick={() => onPatient(patient)}><ChevronRight size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mobile-card-list">
          {visible.map((patient) => (
            <button className="patient-mobile-card" key={patient.id} onClick={() => onPatient(patient)}>
              <div className="patient-mobile-head">
                <span className="avatar" style={{ background: patient.color }}>{patient.initials}</span>
                <span><strong>{patient.name}</strong><small>{patient.id}</small></span>
                <MoreHorizontal size={18} />
              </div>
              <div className="patient-mobile-meta"><span><small>PRIMARY CONDITION</small>{patient.condition}</span><span><small>LAST VISIT</small>{patient.lastVisit}</span></div>
              <div className="patient-mobile-footer"><StatusBadge status={patient.status} /><span>View records <ChevronRight size={15} /></span></div>
            </button>
          ))}
        </div>
        <div className="table-footer"><span>Showing {visible.length} of {patients.length} patients</span><div><button disabled>Previous</button><button className="active-page">1</button><button>2</button><button>3</button><button>Next</button></div></div>
      </Panel>
    </div>
  );
}

function PatientProfile({
  patient,
  onBack,
  onNotify,
}: {
  patient: Patient;
  onBack: () => void;
  onNotify: (message: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Treatments", "Reports", "Prescriptions", "Billing", "Timeline"];

  return (
    <div className="page-stack">
      <div className="profile-topline">
        <button className="button button-ghost" onClick={onBack}><ArrowLeft size={17} /> Back to patients</button>
        <div><button className="button button-secondary" onClick={() => onNotify("Patient editor opened.")}><Pencil size={16} /> Edit record</button><button className="icon-button"><MoreHorizontal size={18} /></button></div>
      </div>
      <Panel className="profile-hero">
        <div className="profile-identity">
          <span className="profile-avatar" style={{ background: patient.color }}>{patient.initials}</span>
          <div><span className="kicker">PATIENT RECORD</span><h2>{patient.name}</h2><p>{patient.id} · {patient.age} years · {patient.gender}</p></div>
        </div>
        <div className="profile-facts">
          <span><Phone size={17} /><small>CONTACT</small><strong>{patient.mobile}</strong></span>
          <span><CalendarDays size={17} /><small>LAST VISIT</small><strong>{patient.lastVisit}</strong></span>
          <span><Activity size={17} /><small>STATUS</small><StatusBadge status={patient.status} /></span>
        </div>
        <button className="button button-primary" onClick={() => onNotify("Follow-up appointment created.")}><CalendarDays size={17} /> Schedule follow-up</button>
      </Panel>

      <div className="profile-tabs">
        {tabs.map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}</button>)}
      </div>

      {tab === "Overview" ? (
        <div className="profile-grid">
          <div className="page-stack">
            <Panel>
              <div className="panel-heading"><div><span className="panel-kicker">CLINICAL NOTE</span><h3>Clinical summary</h3></div><FileCheck2 size={20} /></div>
              <p className="clinical-summary">Patient reports significant improvement in frequency of episodes since beginning the current homeopathic regimen. Vitals remain within normal parameters. Continued monitoring for environmental triggers is recommended.</p>
              <div className="clinical-tags"><span><Check size={14} /> Consistent compliance</span><span><Sparkles size={14} /> High vitality</span><span><ShieldCheck size={14} /> No known allergies</span></div>
            </Panel>
            <Panel>
              <div className="panel-heading"><div><span className="panel-kicker">VITALS</span><h3>Latest observations</h3></div><button className="text-button">View history</button></div>
              <div className="vitals-grid">
                <Vital label="Blood pressure" value="120/80" unit="mmHg" />
                <Vital label="Heart rate" value="72" unit="bpm" />
                <Vital label="Weight" value="64.5" unit="kg" />
                <Vital label="Temperature" value="98.6" unit="°F" />
              </div>
            </Panel>
            <Panel>
              <div className="panel-heading"><div><span className="panel-kicker">HISTORY</span><h3>Recent timeline</h3></div><button className="text-button" onClick={() => setTab("Timeline")}>Full timeline</button></div>
              <Timeline />
            </Panel>
          </div>
          <aside className="page-stack">
            <Panel className="condition-card">
              <span className="card-icon card-icon-red"><AlertCircle size={20} /></span>
              <span className="panel-kicker">PRIMARY CONDITION</span>
              <h3>{patient.condition}</h3>
              <p>Diagnosed January 2025</p>
              <button className="text-button">View diagnosis <ChevronRight size={15} /></button>
            </Panel>
            <Panel className="followup-card">
              <span className="card-icon"><CalendarDays size={20} /></span>
              <span className="panel-kicker">NEXT FOLLOW-UP</span>
              <h3>{patient.nextFollowUp}</h3>
              <p>10:30 AM · Video consultation</p>
              <button className="button button-primary button-full">Manage appointment</button>
            </Panel>
            <Panel>
              <div className="panel-heading"><h3>Contact information</h3><Pencil size={17} /></div>
              <div className="contact-list"><span><Phone size={16} /><div><small>Mobile</small><strong>{patient.mobile}</strong></div></span><span><Mail size={16} /><div><small>Email</small><strong>{patient.email}</strong></div></span></div>
            </Panel>
          </aside>
        </div>
      ) : (
        <Panel className="tab-placeholder">
          <span className="card-icon"><ClipboardCheck size={22} /></span>
          <h3>{tab}</h3>
          <p>{patient.name}&apos;s complete {tab.toLowerCase()} records are ready for secure review.</p>
          <button className="button button-primary" onClick={() => onNotify(`New ${tab.toLowerCase()} entry started.`)}><Plus size={16} /> Add {tab === "Timeline" ? "event" : tab.slice(0, -1)}</button>
        </Panel>
      )}
    </div>
  );
}

function AppointmentsPage({
  appointments,
  setAppointments,
  onNotify,
}: {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  onNotify: (message: string) => void;
}) {
  const [mode, setMode] = useState("Week");
  const [showForm, setShowForm] = useState(false);

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    onNotify(`Appointment marked ${status.toLowerCase()}.`);
  };

  const addAppointment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const patient = String(data.get("patient") || "New patient");
    const next: Appointment = {
      id: `APT-${1040 + appointments.length + 1}`,
      patient,
      doctor: "Dr. Madhukar Takpire",
      time: String(data.get("time") || "05:00 PM"),
      mode: "Clinic",
      status: "Confirmed",
      reason: String(data.get("reason") || "Consultation"),
    };
    setAppointments((current) => [...current, next]);
    setShowForm(false);
    onNotify("Appointment scheduled and confirmation queued.");
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Today’s clinical schedule"
        description="Coordinate doctors, rooms, and patient arrival status from one live view."
        action={<button className="button button-primary" onClick={() => setShowForm(true)}><Plus size={17} /> Add appointment</button>}
      />
      <Panel className="calendar-panel">
        <div className="calendar-toolbar">
          <div><button className="icon-button"><ChevronRight className="rotate-180" size={17} /></button><strong>June 2026</strong><button className="icon-button"><ChevronRight size={17} /></button></div>
          <div className="segmented-control">{["Day", "Week", "Month"].map((item) => <button className={mode === item ? "active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}</div>
        </div>
        <div className="week-strip">
          {[
            ["MON", "8"], ["TUE", "9"], ["WED", "10"], ["THU", "11"], ["FRI", "12"], ["SAT", "13"], ["SUN", "14"],
          ].map(([day, date]) => <button className={date === "12" ? "active" : ""} key={date}><span>{day}</span><strong>{date}</strong><i /></button>)}
        </div>
      </Panel>
      <div className="schedule-grid">
        <Panel>
          <div className="panel-heading"><div><span className="panel-kicker">FRIDAY, 12 JUNE</span><h3>Today&apos;s schedule</h3></div><span className="count-pill">{appointments.length} appointments</span></div>
          <div className="schedule-list">
            {appointments.map((appointment) => (
              <div className={`schedule-card status-${appointment.status.toLowerCase().replace(" ", "-")}`} key={appointment.id}>
                <div className="schedule-time"><strong>{appointment.time}</strong><span>{appointment.mode === "Video" ? <Video size={15} /> : <Building2 size={15} />}{appointment.mode}</span></div>
                <span className="avatar">{appointment.patient.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                <div className="schedule-copy"><div><strong>{appointment.patient}</strong><StatusBadge status={appointment.status} /></div><span>{appointment.reason} · {appointment.doctor}</span></div>
                <div className="schedule-actions">
                  {appointment.status !== "Completed" && <button className="button button-small button-primary" onClick={() => updateStatus(appointment.id, appointment.status === "Waiting" ? "Checked in" : "Completed")}>{appointment.status === "Waiting" ? "Check in" : "Complete"}</button>}
                  <button className="button button-small button-secondary" onClick={() => updateStatus(appointment.id, "Reschedule")}>Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <aside className="page-stack">
          <Panel className="insight-card">
            <span className="card-icon"><Sparkles size={20} /></span>
            <span className="panel-kicker">OPTIMIZATION INSIGHT</span>
            <h3>Thursday mornings are fully booked</h3>
            <p>Consider opening two evening slots to accommodate five pending patient requests.</p>
            <button className="button button-light button-full">Review requests</button>
          </Panel>
          <Panel className="efficiency-card">
            <div className="progress-ring"><strong>94%</strong><span>attendance</span></div>
            <h3>Schedule efficiency</h3>
            <p>Confirmed attendance is 6% above the clinic average.</p>
          </Panel>
        </aside>
      </div>
      {showForm && (
        <Modal title="Create appointment" onClose={() => setShowForm(false)}>
          <form className="form-stack" onSubmit={addAppointment}>
            <label>Patient name<input name="patient" placeholder="Search or enter patient" required /></label>
            <div className="form-grid"><label>Date<input type="date" defaultValue="2026-06-12" /></label><label>Time<select name="time" defaultValue="05:00 PM"><option>05:00 PM</option><option>05:30 PM</option><option>06:00 PM</option></select></label></div>
            <label>Reason for visit<input name="reason" placeholder="e.g. Migraine follow-up" /></label>
            <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" type="submit">Schedule & notify</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function TreatmentsPage({ onNotify }: { onNotify: (message: string) => void }) {
  const [history, setHistory] = useState([
    { date: "12 Jun 2026", patient: "Elena Rodriguez", diagnosis: "Chronic Migraine", medicine: "Natrum Mur 200C", followup: "18 Jun" },
    { date: "11 Jun 2026", patient: "Marcus Thorne", diagnosis: "Hypertension", medicine: "Baryta Mur 30C", followup: "Today" },
    { date: "10 Jun 2026", patient: "Priya Sharma", diagnosis: "Allergic Rhinitis", medicine: "Allium Cepa 30C", followup: "20 Jun" },
  ]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setHistory((current) => [{
      date: "12 Jun 2026",
      patient: String(form.get("patient") || "New patient"),
      diagnosis: String(form.get("diagnosis") || "Assessment pending"),
      medicine: `${String(form.get("medicine") || "Medicine")} ${String(form.get("potency") || "30C")}`,
      followup: "26 Jun",
    }, ...current]);
    event.currentTarget.reset();
    onNotify("Treatment record saved to the immutable clinical history.");
  };

  return (
    <div className="page-stack">
      <PageHeader title="New consultation" description="Capture observations, diagnosis, medicine, and continuity-of-care instructions." action={<button className="button button-secondary"><History size={17} /> Treatment history</button>} />
      <div className="treatment-grid">
        <Panel>
          <form className="clinical-form" onSubmit={submit}>
            <div className="form-section-title"><span>01</span><div><h3>Consultation details</h3><p>Core clinical context</p></div></div>
            <div className="form-grid"><label>Patient<select name="patient" required defaultValue=""><option value="" disabled>Select patient</option><option>Elena Rodriguez</option><option>Marcus Thorne</option><option>Priya Sharma</option></select></label><label>Consultation date<input type="date" defaultValue="2026-06-12" /></label></div>
            <label>Symptoms<textarea name="symptoms" placeholder="Describe presenting symptoms, modalities, and duration..." /></label>
            <div className="form-grid"><label>Clinical observations<textarea placeholder="Vitals, appearance, temperament..." /></label><label>Diagnosis<input name="diagnosis" placeholder="Primary assessment" required /></label></div>
            <div className="form-section-title"><span>02</span><div><h3>Homeopathic prescription</h3><p>Medicine and dosage</p></div></div>
            <div className="form-grid form-grid-4"><label>Medicine<input name="medicine" placeholder="Medicine name" required /></label><label>Potency<select name="potency"><option>30C</option><option>200C</option><option>1M</option><option>6X</option></select></label><label>Dosage<input placeholder="4 pills" /></label><label>Duration<input placeholder="14 days" /></label></div>
            <label>Doctor notes<textarea placeholder="Clinical rationale and patient instructions..." /></label>
            <div className="form-grid"><label>Follow-up date<input type="date" defaultValue="2026-06-26" /></label><label>Reminder channel<select><option>WhatsApp + SMS</option><option>WhatsApp only</option><option>SMS only</option></select></label></div>
            <div className="form-footer"><span><ShieldCheck size={16} /> Treatment history is audit-protected.</span><button className="button button-primary" type="submit"><FileCheck2 size={17} /> Save treatment</button></div>
          </form>
        </Panel>
        <aside className="page-stack">
          <Panel className="patient-context-card">
            <div className="panel-heading"><h3>Patient context</h3><Search size={17} /></div>
            <div className="empty-context"><UserRound size={24} /><strong>Select a patient</strong><span>Recent history and allergies will appear here.</span></div>
          </Panel>
          <Panel className="ai-note">
            <Sparkles size={20} />
            <h3>Clinical completeness</h3>
            <p>Document modalities, causation, and mental generals before finalizing the remedy.</p>
          </Panel>
        </aside>
      </div>
      <Panel>
        <div className="panel-heading"><div><span className="panel-kicker">IMMUTABLE HISTORY</span><h3>Recent treatment records</h3></div><button className="button button-secondary"><Download size={16} /> Export</button></div>
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Medicine</th><th>Follow-up</th><th /></tr></thead><tbody>{history.map((item, index) => <tr key={`${item.patient}-${index}`}><td>{item.date}</td><td><strong>{item.patient}</strong></td><td>{item.diagnosis}</td><td>{item.medicine}</td><td>{item.followup}</td><td><button className="icon-button"><ChevronRight size={16} /></button></td></tr>)}</tbody></table></div>
      </Panel>
    </div>
  );
}

function PrescriptionsPage({ onNotify }: { onNotify: (message: string) => void }) {
  const [medicine, setMedicine] = useState("Natrum Muriaticum");
  const [potency, setPotency] = useState("200C");
  const [dosage, setDosage] = useState("4 pills, once daily");

  return (
    <div className="page-stack">
      <PageHeader title="Prescription generator" description="Create a professional, secure prescription ready for print or patient delivery." action={<button className="button button-secondary" onClick={() => onNotify("Draft prescription saved.")}><FileCheck2 size={17} /> Save draft</button>} />
      <div className="prescription-layout">
        <Panel className="prescription-editor">
          <div className="form-section-title"><span>01</span><div><h3>Patient & consultation</h3><p>Prescription context</p></div></div>
          <label>Patient<select><option>Elena Rodriguez · PAT-2026-00892</option><option>Marcus Thorne · PAT-2026-00744</option></select></label>
          <div className="form-grid"><label>Consultation date<input type="date" defaultValue="2026-06-12" /></label><label>Diagnosis<input defaultValue="Chronic Migraine" /></label></div>
          <div className="form-section-title"><span>02</span><div><h3>Medicine</h3><p>Remedy and instructions</p></div></div>
          <label>Medicine name<input value={medicine} onChange={(event) => setMedicine(event.target.value)} /></label>
          <div className="form-grid"><label>Potency<select value={potency} onChange={(event) => setPotency(event.target.value)}><option>30C</option><option>200C</option><option>1M</option></select></label><label>Dosage<input value={dosage} onChange={(event) => setDosage(event.target.value)} /></label></div>
          <label>Instructions<textarea defaultValue="Take on an empty stomach. Avoid coffee, mint, and strong fragrances during the course." /></label>
          <label>Follow-up date<input type="date" defaultValue="2026-06-26" /></label>
          <button className="button button-dashed button-full"><Plus size={16} /> Add another medicine</button>
        </Panel>
        <div className="prescription-preview-wrap">
          <div className="prescription-actions">
            <span>Live preview</span>
            <button className="button button-secondary" onClick={() => window.print()}><Printer size={16} /> Print</button>
            <button className="button button-secondary" onClick={() => onNotify("Prescription PDF generated.")}><Download size={16} /> PDF</button>
            <button className="button button-whatsapp" onClick={() => onNotify("Prescription queued for WhatsApp delivery.")}><MessageCircleMore size={16} /> WhatsApp</button>
          </div>
          <article className="prescription-paper">
            <header>
              <div className="brand-lockup"><span className="brand-mark"><HeartPulse size={22} /></span><div><strong>HomeoCare Pro</strong><small>Navgaon Clinic</small></div></div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong>Dr. Madhukar Takpire</strong>
                <small style={{ fontSize: '11px', color: 'var(--muted)' }}>M.D. (Home), C.C.M.P.</small>
                <small style={{ fontSize: '11px', color: 'var(--muted)' }}>शा. वै. महा. ओ. वाद. (घाटी)</small>
                <small style={{ fontSize: '11px', color: 'var(--muted)' }}>जनरल फिजिशियन अँड सर्जन</small>
                <span style={{ marginTop: '2px' }}>Reg No. 25705 · +91 9404981492</span>
              </div>
            </header>
            <div className="rx-patient"><div><span>PATIENT</span><strong>Elena Rodriguez</strong><small>34 years · Female · PAT-2026-00892</small></div><div><span>DATE</span><strong>12 June 2026</strong><small>Diagnosis: Chronic Migraine</small></div></div>
            <div className="rx-symbol">Rx</div>
            <table><thead><tr><th>Medicine</th><th>Potency</th><th>Dosage</th></tr></thead><tbody><tr><td><strong>{medicine}</strong><small>Homeopathic dilution</small></td><td>{potency}</td><td>{dosage}</td></tr></tbody></table>
            <section><span>INSTRUCTIONS</span><p>Take on an empty stomach. Avoid coffee, mint, and strong fragrances during the course.</p></section>
            <section><span>NEXT FOLLOW-UP</span><p><strong>26 June 2026</strong> · 10:30 AM · Video consultation</p></section>
            <footer><div><span>Digitally verified prescription</span><small>Generated by HomeoCare Pro Enterprise</small></div><div className="signature"><strong>Dr. Madhukar Takpire</strong><span>Authorized signature</span></div></footer>
          </article>
        </div>
      </div>
    </div>
  );
}

function ReportsPage({ onNotify }: { onNotify: (message: string) => void }) {
  const [files, setFiles] = useState([
    { name: "CBC Blood Test - June 2026.pdf", patient: "Elena Rodriguez", category: "Blood Test", date: "12 Jun 2026", type: "PDF" },
    { name: "Chest X-Ray PA View.jpg", patient: "David Chen", category: "X-Ray", date: "11 Jun 2026", type: "JPG" },
    { name: "Thyroid Profile.pdf", patient: "Priya Sharma", category: "Blood Test", date: "10 Jun 2026", type: "PDF" },
  ]);

  const upload = () => {
    setFiles((current) => [{ name: "New Clinical Report.pdf", patient: "Elena Rodriguez", category: "Other", date: "12 Jun 2026", type: "PDF" }, ...current]);
    onNotify("Report uploaded securely with version history enabled.");
  };

  return (
    <div className="page-stack">
      <PageHeader title="Clinical document center" description="Upload, preview, version, and share reports with role-based patient access." action={<button className="button button-primary" onClick={upload}><UploadCloud size={17} /> Upload report</button>} />
      <div className="report-stats metric-grid metric-grid-4">
        <MetricCard icon={FileText} label="Total reports" value="3,842" note="+48 this week" tone="blue" />
        <MetricCard icon={UploadCloud} label="Uploaded today" value="18" note="12 patients" tone="green" />
        <MetricCard icon={ShieldCheck} label="Securely shared" value="126" note="Last 30 days" tone="violet" />
        <MetricCard icon={Box} label="Storage used" value="68%" note="136 GB of 200 GB" tone="amber" />
      </div>
      <Panel className="upload-zone" onClick={upload}>
        <span className="upload-icon"><UploadCloud size={26} /></span>
        <h3>Drop clinical files here</h3>
        <p>PDF, PNG, JPG, JPEG, or DOCX up to 25 MB. Files are encrypted at rest.</p>
        <button className="button button-secondary">Browse files</button>
      </Panel>
      <Panel>
        <div className="table-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search reports or patient" /></div><select><option>All categories</option><option>Blood Test</option><option>X-Ray</option><option>MRI</option></select><select><option>Newest first</option><option>Oldest first</option></select></div>
        <div className="document-grid">
          {files.map((file, index) => (
            <article className="document-card" key={`${file.name}-${index}`}>
              <div className="document-preview"><FileText size={34} /><span>{file.type}</span></div>
              <div className="document-info"><span className="panel-kicker">{file.category}</span><h3>{file.name}</h3><p>{file.patient} · {file.date}</p></div>
              <div className="document-actions"><button className="icon-button" onClick={() => onNotify(`${file.name} opened in secure preview.`)}><Search size={16} /></button><button className="icon-button"><Download size={16} /></button><button className="icon-button"><MoreHorizontal size={16} /></button></div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function BillingPage({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <div className="page-stack">
      <PageHeader title="Revenue overview" description="Manage GST invoices, payments, outstanding balances, and revenue trends." action={<button className="button button-primary" onClick={() => onNotify("New invoice draft created.")}><Plus size={17} /> Create invoice</button>} />
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={CircleDollarSign} label="Revenue today" value="₹1.42L" note="+12.5% vs yesterday" tone="green" />
        <MetricCard icon={BarChart3} label="This month" value="₹24.8L" note="82% of target" tone="blue" />
        <MetricCard icon={Clock3} label="Pending payments" value="₹3.16L" note="18 invoices" tone="amber" />
        <MetricCard icon={AlertCircle} label="Overdue" value="₹84,600" note="6 accounts" tone="red" />
      </div>
      <div className="billing-grid">
        <Panel className="chart-panel">
          <div className="panel-heading"><div><span className="panel-kicker">REVENUE</span><h3>Monthly collections</h3></div><select className="compact-select"><option>2026</option></select></div>
          <div className="chart-height">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0066ff" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="payment-mix">
          <div className="panel-heading"><div><span className="panel-kicker">PAYMENTS</span><h3>Payment mix</h3></div><CreditCard size={19} /></div>
          {[["UPI", "54%", "#0066ff"], ["Cash", "24%", "#10b981"], ["Card", "16%", "#8b5cf6"], ["Net banking", "6%", "#f59e0b"]].map(([name, value, color]) => <div className="payment-row" key={name}><span><i style={{ background: color }} />{name}</span><div><b style={{ width: value, background: color }} /></div><strong>{value}</strong></div>)}
        </Panel>
      </div>
      <Panel>
        <div className="panel-heading"><div><span className="panel-kicker">INVOICES</span><h3>Recent transactions</h3></div><button className="button button-secondary" onClick={() => onNotify("Invoice report exported.")}><Download size={16} /> Export</button></div>
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Invoice</th><th>Patient</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th><th /></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.id}</strong></td><td>{invoice.patient}</td><td>{invoice.date}</td><td><strong>{invoice.amount}</strong></td><td>{invoice.method}</td><td><StatusBadge status={invoice.status} /></td><td><div className="row-actions"><button className="icon-button"><Search size={15} /></button><button className="icon-button" onClick={() => window.print()}><Printer size={15} /></button><button className="icon-button"><Download size={15} /></button></div></td></tr>)}</tbody></table></div>
      </Panel>
    </div>
  );
}

function InventoryPage({ onNotify }: { onNotify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const visible = inventory.filter((item) => `${item.medicine} ${item.batch} ${item.manufacturer}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="page-stack">
      <PageHeader title="Medicine inventory" description="Track batches, stock movement, expiry, and purchase history across branches." action={<button className="button button-primary" onClick={() => onNotify("New medicine form opened.")}><Plus size={17} /> Add medicine</button>} />
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={Pill} label="Total medicines" value="428" note="1,284 units" tone="blue" />
        <MetricCard icon={AlertCircle} label="Low stock" value="12" note="Reorder recommended" tone="red" />
        <MetricCard icon={Clock3} label="Expiring soon" value="8" note="Within 90 days" tone="amber" />
        <MetricCard icon={Box} label="Stock value" value="₹8.42L" note="Across 2 branches" tone="green" />
      </div>
      <Panel>
        <div className="table-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search medicine, batch or manufacturer" /></div><select><option>All stock status</option><option>Low stock</option><option>Expiring</option></select><button className="button button-secondary"><Download size={16} /> Export</button></div>
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Medicine</th><th>Manufacturer</th><th>Batch</th><th>Quantity</th><th>Expiry</th><th>Status</th><th /></tr></thead><tbody>{visible.map((item) => <tr key={item.batch}><td><div className="medicine-cell"><span className="medicine-icon"><Pill size={17} /></span><span><strong>{item.medicine}</strong><small>{item.potency}</small></span></div></td><td>{item.manufacturer}</td><td><code>{item.batch}</code></td><td><strong>{item.stock}</strong> units</td><td>{item.expiry}</td><td><StatusBadge status={item.status} /></td><td><button className="icon-button"><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div>
      </Panel>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Clinical intelligence" description="Understand patient growth, revenue, disease trends, and operational effectiveness." action={<div className="segmented-control"><button>Daily</button><button>Weekly</button><button className="active">Monthly</button><button>Yearly</button></div>} />
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={UsersRound} label="Patient growth" value="+14.2%" note="vs previous period" tone="blue" />
        <MetricCard icon={CircleDollarSign} label="Revenue growth" value="+12.5%" note="₹24.8L total" tone="green" />
        <MetricCard icon={CalendarDays} label="Appointment rate" value="91.4%" note="1,082 completed" tone="violet" />
        <MetricCard icon={History} label="Follow-up success" value="87.8%" note="+5.2% improvement" tone="amber" />
      </div>
      <div className="analytics-grid">
        <Panel className="chart-panel analytics-wide">
          <div className="panel-heading"><div><span className="panel-kicker">PERFORMANCE</span><h3>Patients and revenue</h3></div><div className="legend-inline"><span><i className="blue-dot" />Patients</span><span><i className="green-dot" />Revenue</span></div></div>
          <div className="chart-height chart-height-large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueData}><defs><linearGradient id="analyticsBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0066ff" stopOpacity={0.25} /><stop offset="100%" stopColor="#0066ff" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Area type="monotone" dataKey="patients" stroke="#0066ff" strokeWidth={3} fill="url(#analyticsBlue)" /><Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="none" /></AreaChart></ResponsiveContainer></div>
        </Panel>
        <Panel>
          <div className="panel-heading"><div><span className="panel-kicker">DISEASE TRENDS</span><h3>Case distribution</h3></div></div>
          <div className="analytics-disease-list">{diseaseData.map((item) => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><div><b style={{ width: `${item.value * 3}%`, background: item.color }} /></div><strong>{item.value}%</strong></div>)}</div>
        </Panel>
        <Panel>
          <div className="panel-heading"><div><span className="panel-kicker">DOCTOR PERFORMANCE</span><h3>Consultation outcomes</h3></div></div>
          <div className="doctor-performance">{[["Dr. Madhukar Takpire", "96%", "428 cases"], ["Dr. Madhukar Takpire", "92%", "316 cases"], ["Dr. Madhukar Takpire", "89%", "284 cases"]].map(([name, score, cases]) => <div key={name}><span className="avatar">{name.split(" ").slice(1).map((item) => item[0]).join("")}</span><span><strong>{name}</strong><small>{cases}</small></span><b>{score}</b></div>)}</div>
        </Panel>
        <Panel>
          <div className="panel-heading"><div><span className="panel-kicker">APPOINTMENTS</span><h3>Status breakdown</h3></div></div>
          <div className="status-breakdown">{[["Completed", "78%", "green"], ["Cancelled", "8%", "red"], ["No show", "5%", "amber"], ["Rescheduled", "9%", "blue"]].map(([name, value, tone]) => <div key={name}><span><i className={`${tone}-dot`} />{name}</span><strong>{value}</strong></div>)}</div>
        </Panel>
      </div>
    </div>
  );
}

function FollowUpsPage({ onNotify }: { onNotify: (message: string) => void }) {
  const groups = [
    { title: "Overdue", tone: "red", items: [["Marcus Thorne", "Hypertension", "2 days overdue"], ["Neha Joshi", "Eczema", "1 day overdue"]] },
    { title: "Due today", tone: "amber", items: [["Elena Rodriguez", "Chronic Migraine", "10:30 AM"], ["Arjun Malhotra", "Arthritis", "3:00 PM"], ["Fatima Khan", "Thyroid", "5:30 PM"]] },
    { title: "Upcoming", tone: "green", items: [["Priya Sharma", "Allergic Rhinitis", "Tomorrow"], ["David Chen", "Acute Bronchitis", "15 Jun"], ["Sarah Jenkins", "Gastritis", "24 Jun"]] },
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Care continuity board" description="Prioritize due, missed, and upcoming follow-ups before patients fall through the cracks." action={<button className="button button-primary" onClick={() => onNotify("Follow-up reminder campaign started.")}><Send size={17} /> Send reminders</button>} />
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={AlertCircle} label="Overdue" value="2" note="Needs action now" tone="red" />
        <MetricCard icon={Clock3} label="Due today" value="7" note="3 remaining" tone="amber" />
        <MetricCard icon={CalendarDays} label="Due tomorrow" value="11" note="Reminders queued" tone="blue" />
        <MetricCard icon={Check} label="Completion rate" value="87.8%" note="+5.2% this month" tone="green" />
      </div>
      <div className="followup-board">
        {groups.map((group) => <section className="followup-column" key={group.title}><header><span><i className={`${group.tone}-dot`} />{group.title}</span><strong>{group.items.length}</strong></header>{group.items.map(([name, condition, due]) => <article className="followup-item" key={name}><div><span className="avatar">{name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{name}</strong><small>{condition}</small></span></div><p><Clock3 size={14} /> {due}</p><div><button className="button button-small button-secondary" onClick={() => onNotify(`Called ${name}.`)}><Phone size={14} /> Call</button><button className="button button-small button-whatsapp" onClick={() => onNotify(`WhatsApp reminder sent to ${name}.`)}><MessageCircleMore size={14} /> Message</button></div></article>)}</section>)}
      </div>
    </div>
  );
}

function WhatsAppPage({ onNotify }: { onNotify: (message: string) => void }) {
  const templates = [
    { title: "Appointment confirmation", description: "Sent immediately after booking", icon: CalendarDays, color: "blue" },
    { title: "Follow-up reminder", description: "Sent 24 hours before due date", icon: History, color: "amber" },
    { title: "Prescription ready", description: "Secure prescription delivery", icon: Pill, color: "violet" },
    { title: "Payment receipt", description: "Invoice and receipt confirmation", icon: ReceiptText, color: "green" },
    { title: "Birthday greeting", description: "Personalized patient greeting", icon: Sparkles, color: "pink" },
    { title: "Clinic announcement", description: "Branch-wide broadcast template", icon: Bell, color: "blue" },
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Patient communication" description="Manage approved templates, transactional updates, and fallback SMS delivery." action={<button className="button button-whatsapp" onClick={() => onNotify("New WhatsApp campaign created.")}><MessageCircleMore size={17} /> New campaign</button>} />
      <div className="whatsapp-status"><span className="whatsapp-logo"><MessageCircleMore size={23} /></span><div><span className="kicker">WHATSAPP BUSINESS API</span><h3>HomeoCare Navgaon</h3><p>Connected · Last message delivered 1 minute ago</p></div><span className="connected-pill"><i /> Connected</span><button className="button button-secondary">Manage connection</button></div>
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={Send} label="Sent this month" value="4,821" note="98.4% delivered" tone="green" />
        <MetricCard icon={MessageCircleMore} label="Read rate" value="91.6%" note="+3.2% vs last month" tone="blue" />
        <MetricCard icon={Clock3} label="Scheduled" value="126" note="Next 7 days" tone="violet" />
        <MetricCard icon={AlertCircle} label="SMS fallback" value="18" note="0.4% of messages" tone="amber" />
      </div>
      <Panel>
        <div className="panel-heading"><div><span className="panel-kicker">APPROVED TEMPLATES</span><h3>Message library</h3></div><button className="button button-secondary"><Plus size={16} /> Create template</button></div>
        <div className="template-grid">{templates.map((template) => { const Icon = template.icon; return <article className="template-card" key={template.title}><span className={`card-icon card-icon-${template.color}`}><Icon size={19} /></span><div><h3>{template.title}</h3><p>{template.description}</p></div><button className="icon-button"><Pencil size={16} /></button><footer><span>English · Hindi · Marathi</span><button className="text-button" onClick={() => onNotify(`${template.title} test message sent.`)}>Send test <Send size={14} /></button></footer></article>; })}</div>
      </Panel>
    </div>
  );
}

function StaffPage({ onNotify }: { onNotify: (message: string) => void }) {
  const staff = [
    { name: "Dr. Madhukar Takpire", role: "Clinic Admin", specialty: "Classical Homeopathy", status: "Online", initials: "MT" },
    { name: "Dr. Madhukar Takpire", role: "Doctor", specialty: "Chronic Care", status: "In consultation", initials: "MT" },
    { name: "Dr. Madhukar Takpire", role: "Doctor", specialty: "Women & Child Care", status: "Online", initials: "MT" },
    { name: "Riya Deshmukh", role: "Receptionist", specialty: "Front desk", status: "Online", initials: "RD" },
    { name: "Amit Kulkarni", role: "Accountant", specialty: "Billing", status: "Offline", initials: "AK" },
  ];
  return (
    <div className="page-stack">
      <PageHeader title="Clinic team" description="Manage access, responsibilities, branch assignments, and activity." action={<button className="button button-primary" onClick={() => onNotify("Staff invitation sent.")}><UserRoundPlus size={17} /> Invite staff</button>} />
      <div className="metric-grid metric-grid-4">
        <MetricCard icon={BriefcaseMedical} label="Active doctors" value="8" note="3 available now" tone="blue" />
        <MetricCard icon={UsersRound} label="Total staff" value="24" note="Across 2 branches" tone="green" />
        <MetricCard icon={ShieldCheck} label="Roles configured" value="5" note="RBAC active" tone="violet" />
        <MetricCard icon={Activity} label="Active sessions" value="11" note="No unusual activity" tone="amber" />
      </div>
      <Panel>
        <div className="table-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Search team member" /></div><select><option>All roles</option><option>Doctor</option><option>Receptionist</option><option>Clinic Admin</option></select><select><option>All branches</option><option>Navgaon</option><option>Aundh Branch</option></select></div>
        <div className="staff-grid">{staff.map((member) => <article className="staff-card" key={member.name}><header><span className="avatar avatar-large">{member.initials}</span><button className="icon-button"><MoreHorizontal size={17} /></button></header><h3>{member.name}</h3><p>{member.specialty}</p><span className="role-pill">{member.role}</span><footer><span className={`presence ${member.status === "Offline" ? "offline" : ""}`}><i />{member.status}</span><button className="text-button">View access <ChevronRight size={14} /></button></footer></article>)}</div>
      </Panel>
    </div>
  );
}

function SettingsPage({
  darkMode,
  language,
  onTheme,
  onLanguage,
  onNotify,
}: {
  darkMode: boolean;
  language: string;
  onTheme: () => void;
  onLanguage: (language: string) => void;
  onNotify: (message: string) => void;
}) {
  return (
    <div className="page-stack settings-layout">
      <div className="settings-nav">
        {["Clinic profile", "Branches", "Notifications", "WhatsApp & SMS", "Language & appearance", "Security", "Backup & restore", "Audit logs"].map((item, index) => <button className={index === 0 ? "active" : ""} key={item}>{item}<ChevronRight size={15} /></button>)}
      </div>
      <div className="page-stack">
        <Panel>
          <div className="settings-heading"><div><span className="panel-kicker">ORGANIZATION</span><h3>Clinic information</h3><p>Information displayed on prescriptions, invoices, and patient communication.</p></div><button className="button button-secondary"><Pencil size={16} /> Edit</button></div>
          <div className="clinic-profile-block"><span className="clinic-logo"><HeartPulse size={30} /></span><div><h3>HomeoCare Pro Clinic</h3><p>Navgaon is a village located in the Paithan Sub-District of Chhatrapati Sambhajinagar</p><button className="text-button">Change clinic logo</button></div></div>
          <div className="settings-data-grid"><span><small>Registration number</small><strong>MH-HOM-2024-1842</strong></span><span><small>GSTIN</small><strong>27AABCH1842F1Z8</strong></span><span><small>Clinic phone</small><strong>+91 20 4102 2020</strong></span><span><small>Support email</small><strong>care@homeocare.in</strong></span></div>
        </Panel>
        <Panel>
          <div className="settings-heading"><div><span className="panel-kicker">PERSONALIZATION</span><h3>Language & appearance</h3><p>Choose how HomeoCare Pro appears for your account.</p></div></div>
          <div className="setting-row"><div><strong>Preferred language</strong><span>Dashboard, forms, reports, and patient portal.</span></div><select value={language} onChange={(event) => onLanguage(event.target.value)}><option value="EN">English</option><option value="हिंदी">हिंदी</option><option value="मराठी">मराठी</option></select></div>
          <div className="setting-row"><div><strong>Dark mode</strong><span>Use a darker clinical workspace in low-light environments.</span></div><button className={`toggle ${darkMode ? "toggle-on" : ""}`} onClick={onTheme}><span /></button></div>
        </Panel>
        <Panel>
          <div className="settings-heading"><div><span className="panel-kicker">DATA PROTECTION</span><h3>Cloud backup</h3><p>Encrypted database, report, and prescription backups.</p></div><span className="connected-pill"><i /> Healthy</span></div>
          <div className="backup-card"><span className="card-icon"><ShieldCheck size={21} /></span><div><strong>Automatic daily backup</strong><span>Last successful backup: 12 June 2026, 03:00 AM · 8.4 GB</span></div><button className="button button-secondary" onClick={() => onNotify("Manual encrypted backup started.")}>Back up now</button></div>
        </Panel>
        <div className="settings-save"><button className="button button-secondary">Discard changes</button><button className="button button-primary" onClick={() => onNotify("Clinic settings saved.")}>Save settings</button></div>
      </div>
    </div>
  );
}

function AddPatientDrawer({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (patient: Patient) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    gender: "Female",
    dob: "",
    mobile: "",
    email: "",
    address: "",
    city: "Pune",
    state: "Maharashtra",
    complaint: "",
    symptoms: "",
    disease: "",
    allergies: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyMobile: "",
  });

  const update = (key: keyof typeof data, value: string) => setData((current) => ({ ...current, [key]: value }));

  const save = () => {
    const name = `${data.firstName || "New"} ${data.lastName || "Patient"}`;
    onSave({
      id: `PAT-2026-${String(900 + Math.floor(Math.random() * 99)).padStart(5, "0")}`,
      name,
      initials: `${data.firstName[0] || "N"}${data.lastName[0] || "P"}`.toUpperCase(),
      age: data.dob ? Math.max(1, 2026 - Number(data.dob.slice(0, 4))) : 30,
      gender: data.gender,
      mobile: data.mobile || "+91 00000 00000",
      email: data.email || "patient@example.com",
      condition: data.disease || data.complaint || "Initial assessment",
      lastVisit: "Just now",
      nextFollowUp: "Not scheduled",
      status: "Active",
      color: "#e6f0ff",
    });
  };

  const stepFields = [
    <div className="drawer-form" key="personal">
      <div className="form-grid"><label>First name<input value={data.firstName} onChange={(event) => update("firstName", event.target.value)} autoFocus /></label><label>Last name<input value={data.lastName} onChange={(event) => update("lastName", event.target.value)} /></label></div>
      <label>Gender<div className="gender-options">{["Male", "Female", "Other"].map((item) => <button type="button" className={data.gender === item ? "active" : ""} onClick={() => update("gender", item)} key={item}>{item}</button>)}</div></label>
      <div className="form-grid"><label>Date of birth<input type="date" value={data.dob} onChange={(event) => update("dob", event.target.value)} /></label><label>Mobile number<input value={data.mobile} onChange={(event) => update("mobile", event.target.value)} placeholder="+91 98765 43210" /></label></div>
      <label>Email address<input type="email" value={data.email} onChange={(event) => update("email", event.target.value)} placeholder="patient@example.com" /></label>
    </div>,
    <div className="drawer-form" key="address">
      <label>Address<textarea value={data.address} onChange={(event) => update("address", event.target.value)} placeholder="House, street, area" /></label>
      <div className="form-grid"><label>City<input value={data.city} onChange={(event) => update("city", event.target.value)} /></label><label>State<input value={data.state} onChange={(event) => update("state", event.target.value)} /></label></div>
      <div className="form-grid"><label>Postal code<input placeholder="411001" /></label><label>Country<select><option>India</option></select></label></div>
    </div>,
    <div className="drawer-form" key="medical">
      <label>Chief complaint<textarea value={data.complaint} onChange={(event) => update("complaint", event.target.value)} placeholder="Primary reason for consultation" /></label>
      <label>Symptoms<textarea value={data.symptoms} onChange={(event) => update("symptoms", event.target.value)} placeholder="Symptoms, duration, modalities" /></label>
      <div className="form-grid"><label>Known disease<input value={data.disease} onChange={(event) => update("disease", event.target.value)} /></label><label>Allergies<input value={data.allergies} onChange={(event) => update("allergies", event.target.value)} placeholder="None known" /></label></div>
      <label>Previous treatments<textarea placeholder="Medication and prior care" /></label>
    </div>,
    <div className="drawer-form" key="emergency">
      <label>Contact name<input value={data.emergencyName} onChange={(event) => update("emergencyName", event.target.value)} /></label>
      <div className="form-grid"><label>Relationship<input value={data.emergencyRelation} onChange={(event) => update("emergencyRelation", event.target.value)} /></label><label>Mobile number<input value={data.emergencyMobile} onChange={(event) => update("emergencyMobile", event.target.value)} /></label></div>
      <div className="consent-card"><ShieldCheck size={21} /><div><strong>Patient consent</strong><p>Confirm consent for secure digital records and appointment communication.</p></div><input type="checkbox" defaultChecked /></div>
      <div className="registration-summary"><span className="panel-kicker">READY TO REGISTER</span><h3>{data.firstName || "New"} {data.lastName || "patient"}</h3><p>{data.mobile || "Mobile not added"} · {data.disease || "Initial assessment pending"}</p></div>
    </div>,
  ];

  return (
    <div className="drawer-layer">
      <button className="drawer-scrim" aria-label="Close add patient" onClick={onClose} />
      <aside className="drawer">
        <header className="drawer-header"><div><span className="kicker">PATIENT REGISTRATION</span><h2>Add patient</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></header>
        <div className="stepper">
          {[1, 2, 3, 4].map((item) => <div className={step >= item ? "active" : ""} key={item}><span>{step > item ? <Check size={13} /> : item}</span><i /></div>)}
        </div>
        <div className="drawer-title"><span>STEP {step} OF 4</span><h3>{["Personal information", "Address details", "Medical information", "Emergency contact"][step - 1]}</h3><p>{["Basic identity and communication details.", "Patient residence and location.", "Clinical context for the first consultation.", "Trusted contact and record consent."][step - 1]}</p></div>
        <div className="drawer-body">{stepFields[step - 1]}</div>
        <footer className="drawer-footer">
          <button className="button button-secondary" onClick={step === 1 ? onClose : () => setStep((current) => current - 1)}>{step === 1 ? "Cancel" : "Back"}</button>
          <button className="button button-primary" onClick={step === 4 ? save : () => setStep((current) => current + 1)}>{step === 4 ? "Register patient" : "Continue"}<ChevronRight size={16} /></button>
        </footer>
      </aside>
    </div>
  );
}

function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-header"><div><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

function Panel({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <section className={`panel ${className}`} onClick={onClick}>{children}</section>;
}

function MetricCard({ icon: Icon, label, value, note, tone }: { icon: LucideIcon; label: string; value: string; note: string; tone: string }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-${tone}`}><Icon size={19} /></div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <small className={tone === "red" ? "note-danger" : ""}>{note}</small>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const slug = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge status-badge-${slug}`}><i />{status}</span>;
}

function Vital({ label, value, unit }: { label: string; value: string; unit: string }) {
  return <div className="vital-card"><span>{label}</span><strong>{value}</strong><small>{unit}</small></div>;
}

function Timeline() {
  return (
    <div className="timeline">
      <div><span className="timeline-icon"><Pill size={15} /></span><div><strong>Prescription generated</strong><p>Natrum Muriaticum 200C · 4 pills daily</p><small>12 Jun 2026 · Dr. Madhukar Takpire</small></div></div>
      <div><span className="timeline-icon timeline-icon-green"><Stethoscope size={15} /></span><div><strong>Treatment record added</strong><p>Improvement noted in migraine frequency.</p><small>12 Jun 2026 · Dr. Madhukar Takpire</small></div></div>
      <div><span className="timeline-icon timeline-icon-amber"><FileText size={15} /></span><div><strong>Medical report uploaded</strong><p>CBC Blood Test - June 2026.pdf</p><small>11 Jun 2026 · Reception desk</small></div></div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-layer">
      <button className="modal-scrim" aria-label="Close modal" onClick={onClose} />
      <section className="modal"><header><h3>{title}</h3><button className="icon-button" onClick={onClose}><X size={18} /></button></header>{children}</section>
    </div>
  );
}
