"use client";

import { CalendarDays, CircleDollarSign, History, UsersRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";

type AnalyticsData = {
  patientGrowth: string;
  revenueGrowth: string;
  totalRevenue: string;
  appointmentRate: string;
  completedAppointments: number;
  followUpSuccess: string;
  revenueData: { name: string; revenue: number; patients: number }[];
  diseaseData: { name: string; value: number; color: string }[];
  doctorPerformance: { name: string; score: string; cases: string }[];
  statusBreakdown: { name: string; value: string; tone: string }[];
};

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  return (
    <div className="page-stack">
      <PageHeader
        title="Clinical intelligence"
        description="Understand patient growth, revenue, disease trends, and operational effectiveness."
        action={
          <div className="segmented-control">
            <button>Daily</button>
            <button>Weekly</button>
            <button className="active">Monthly</button>
            <button>Yearly</button>
          </div>
        }
      />
      <div className="metric-grid metric-grid-4">
        <MetricCard
          icon={UsersRound}
          label="Patient growth"
          value={data.patientGrowth}
          note="vs previous period"
          tone="blue"
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Revenue growth"
          value={data.revenueGrowth}
          note={`${data.totalRevenue} total`}
          tone="green"
        />
        <MetricCard
          icon={CalendarDays}
          label="Appointment rate"
          value={data.appointmentRate}
          note={`${data.completedAppointments} completed`}
          tone="violet"
        />
        <MetricCard
          icon={History}
          label="Follow-up success"
          value={data.followUpSuccess}
          note="Completion rate"
          tone="amber"
        />
      </div>
      <div className="analytics-grid">
        <Panel className="chart-panel analytics-wide">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">PERFORMANCE</span>
              <h3>Patients and revenue</h3>
            </div>
            <div className="legend-inline">
              <span>
                <i className="blue-dot" />
                Patients
              </span>
              <span>
                <i className="green-dot" />
                Revenue
              </span>
            </div>
          </div>
          <div className="chart-height chart-height-large">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData}>
                <defs>
                  <linearGradient id="analyticsBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066ff" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0066ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="patients"
                  stroke="#0066ff"
                  strokeWidth={3}
                  fill="url(#analyticsBlue)"
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">DISEASE TRENDS</span>
              <h3>Case distribution</h3>
            </div>
          </div>
          <div className="analytics-disease-list">
            {data.diseaseData.map((item) => (
              <div key={item.name}>
                <span>
                  <i style={{ background: item.color }} />
                  {item.name}
                </span>
                <div>
                  <b style={{ width: `${item.value * 3}%`, background: item.color }} />
                </div>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">DOCTOR PERFORMANCE</span>
              <h3>Consultation outcomes</h3>
            </div>
          </div>
          <div className="doctor-performance">
            {data.doctorPerformance.map((doc) => (
              <div key={doc.name}>
                <span className="avatar">
                  {doc.name
                    .split(" ")
                    .slice(1)
                    .map((i) => i[0])
                    .join("")}
                </span>
                <span>
                  <strong>{doc.name}</strong>
                  <small>{doc.cases}</small>
                </span>
                <b>{doc.score}</b>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">APPOINTMENTS</span>
              <h3>Status breakdown</h3>
            </div>
          </div>
          <div className="status-breakdown">
            {data.statusBreakdown.map((item) => (
              <div key={item.name}>
                <span>
                  <i className={`${item.tone}-dot`} />
                  {item.name}
                </span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
