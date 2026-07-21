"use client";

import {
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";

const diseaseData = [
  { name: "Migraine", value: 22, color: "#0066ff" },
  { name: "Allergy", value: 18, color: "#10b981" },
  { name: "Arthritis", value: 15, color: "#8b5cf6" },
  { name: "Gastric", value: 14, color: "#f59e0b" },
  { name: "Respiratory", value: 12, color: "#ef4444" },
  { name: "Other", value: 19, color: "#94a3b8" },
];

type DashboardClientProps = {
  appointments: { id: string; patient: string; time: string; reason: string; status: string; mode: string }[];
  recentPatients: { id: string; name: string; initials: string; condition: string; lastVisit: string; color: string }[];
  totalPatients: number;
};

export function DashboardCharts({ appointments, recentPatients, totalPatients }: DashboardClientProps) {
  // Generate fake revenue data based on the real total patient count
  const revenueData = [
    { name: "Jan", patients: Math.round(totalPatients * 0.82) },
    { name: "Feb", patients: Math.round(totalPatients * 0.85) },
    { name: "Mar", patients: Math.round(totalPatients * 0.89) },
    { name: "Apr", patients: Math.round(totalPatients * 0.92) },
    { name: "May", patients: Math.round(totalPatients * 0.96) },
    { name: "Jun", patients: totalPatients },
  ];

  return (
    <div className="dashboard-grid">
      <Panel className="chart-panel chart-panel-wide">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">GROWTH</span>
            <h3>Patient growth</h3>
          </div>
          <select className="compact-select" defaultValue="6m">
            <option value="6m">Last 6 months</option>
            <option>Year</option>
          </select>
        </div>
        <div className="chart-legend">
          <strong>{totalPatients.toLocaleString("en-IN")} total</strong>
          <span className="trend-up">↑ 14.2%</span>
        </div>
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
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">CASE MIX</span>
            <h3>Disease distribution</h3>
          </div>
          <MoreHorizontal size={19} />
        </div>
        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={diseaseData} dataKey="value" innerRadius={54} outerRadius={78} paddingAngle={3}>
                {diseaseData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>{totalPatients.toLocaleString("en-IN")}</strong>
            <span>patients</span>
          </div>
        </div>
        <div className="disease-legend">
          {diseaseData.slice(0, 4).map((item) => (
            <span key={item.name}>
              <i style={{ background: item.color }} />
              {item.name}
              <strong>{item.value}%</strong>
            </span>
          ))}
        </div>
      </Panel>

      <Panel className="appointments-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">TODAY</span>
            <h3>Upcoming appointments</h3>
          </div>
          <Link className="text-button" href="/appointments">
            View schedule <ChevronRight size={15} />
          </Link>
        </div>
        <div className="appointment-list">
          {appointments.slice(0, 4).map((appointment) => (
            <div className="appointment-row" key={appointment.id}>
              <div className="time-block">
                <strong>{appointment.time.split(" ")[0]}</strong>
                <span>{appointment.time.split(" ")[1]}</span>
              </div>
              <span className="avatar">
                {appointment.patient.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </span>
              <div className="appointment-copy">
                <strong>{appointment.patient}</strong>
                <span>{appointment.reason}</span>
              </div>
              <StatusBadge status={appointment.status} />
              <button className="icon-button"><MoreHorizontal size={17} /></button>
            </div>
          ))}
          {appointments.length === 0 && (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)" }}>
              No appointments scheduled for today.
            </div>
          )}
        </div>
      </Panel>

      <Panel className="recent-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">RECENT</span>
            <h3>Latest patients</h3>
          </div>
          <Link className="text-button" href="/patients">
            All patients <ChevronRight size={15} />
          </Link>
        </div>
        <div className="recent-patient-list">
          {recentPatients.slice(0, 4).map((patient) => (
            <Link className="recent-patient" key={patient.id} href={`/patients/${patient.id}`}>
              <span className="avatar" style={{ background: patient.color }}>
                {patient.initials}
              </span>
              <span>
                <strong>{patient.name}</strong>
                <small>{patient.condition}</small>
              </span>
              <span className="patient-visit">
                {patient.lastVisit}
                <ChevronRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
