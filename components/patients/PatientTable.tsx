"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Download, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { downloadCSV } from "@/lib/csv";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";

export type PatientData = {
  id: string;
  dbId: string;
  name: string;
  initials: string;
  age: number;
  gender: string;
  mobile: string;
  email: string;
  condition: string;
  lastVisit: string;
  nextFollowUp: string;
  status: string;
  color: string;
};

export function PatientTable({ patients }: { patients: PatientData[] }) {
  const { notify } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const visible = useMemo(
    () =>
      patients.filter((patient) => {
        const matchesQuery =
          `${patient.name} ${patient.id} ${patient.mobile} ${patient.condition}`
            .toLowerCase()
            .includes(query.toLowerCase());
        return matchesQuery && (filter === "All" || patient.status === filter);
      }),
    [patients, query, filter]
  );

  return (
    <Panel>
      <div className="table-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name, mobile, ID or disease"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Follow-up</option>
          <option>Inactive</option>
          <option>Emergency</option>
        </select>
        <button
          className="button button-secondary"
          onClick={() => {
            const csvData = visible.map(p => ({
              ID: p.id,
              Name: p.name,
              Age: p.age,
              Gender: p.gender,
              Mobile: p.mobile,
              Email: p.email,
              Condition: p.condition,
              LastVisit: p.lastVisit,
              NextFollowUp: p.nextFollowUp,
              Status: p.status
            }));
            downloadCSV(csvData, "patients_export");
            notify(`Exported ${visible.length} patients to CSV.`);
          }}
        >
          <Download size={16} /> Export
        </button>
      </div>
      <div className="filter-chips">
        {["All", "Active", "Follow-up", "Emergency"].map((item) => (
          <button
            className={filter === item ? "chip chip-active" : "chip"}
            onClick={() => setFilter(item)}
            key={item}
          >
            {item} {item === "All" && <span>{patients.length}</span>}
          </button>
        ))}
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Contact</th>
              <th>Primary condition</th>
              <th>Last visit</th>
              <th>Next follow-up</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <Link
                    className="patient-cell"
                    href={`/patients/${patient.id}`}
                  >
                    <span
                      className="avatar"
                      style={{ background: patient.color }}
                    >
                      {patient.initials}
                    </span>
                    <span>
                      <strong>{patient.name}</strong>
                      <small>
                        {patient.id} · {patient.age}Y · {patient.gender}
                      </small>
                    </span>
                  </Link>
                </td>
                <td>
                  <strong>{patient.mobile}</strong>
                  <small>{patient.email}</small>
                </td>
                <td>{patient.condition}</td>
                <td>{patient.lastVisit}</td>
                <td>{patient.nextFollowUp}</td>
                <td>
                  <StatusBadge status={patient.status as any} />
                </td>
                <td>
                  <Link className="icon-button" href={`/patients/${patient.id}`}>
                    <ChevronRight size={17} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-card-list">
        {visible.map((patient) => (
          <Link
            className="patient-mobile-card"
            key={patient.id}
            href={`/patients/${patient.id}`}
          >
            <div className="patient-mobile-head">
              <span className="avatar" style={{ background: patient.color }}>
                {patient.initials}
              </span>
              <span>
                <strong>{patient.name}</strong>
                <small>{patient.id}</small>
              </span>
              <MoreHorizontal size={18} />
            </div>
            <div className="patient-mobile-meta">
              <span>
                <small>PRIMARY CONDITION</small>
                {patient.condition}
              </span>
              <span>
                <small>LAST VISIT</small>
                {patient.lastVisit}
              </span>
            </div>
            <div className="patient-mobile-footer">
              <StatusBadge status={patient.status as any} />
              <span>
                View records <ChevronRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="table-footer">
        <span>
          Showing {visible.length} of {patients.length} patients
        </span>
        <div>
          <button disabled>Previous</button>
          <button className="active-page">1</button>
          <button>2</button>
          <button>3</button>
          <button>Next</button>
        </div>
      </div>
    </Panel>
  );
}
