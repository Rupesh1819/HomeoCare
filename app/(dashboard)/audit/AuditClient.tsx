"use client";

import { useState } from "react";
import { Filter, Search, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: any;
  user: string;
  userRole: string;
  userEmail: string;
  timestamp: string;
};

export function AuditClient({ initialLogs }: { initialLogs: AuditLog[] }) {
  const [search, setSearch] = useState("");

  const filteredLogs = initialLogs.filter((log) =>
    JSON.stringify(log).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-stack">
      <PageHeader
        title="Audit Logs"
        description="Monitor system activity and changes across the clinic."
      />

      <Panel>
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">SECURITY</span>
            <h3>System Activity</h3>
          </div>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User</th>
                <th>Entity</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {new Date(log.timestamp).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    <span className="badge badge-amber">{log.action}</span>
                  </td>
                  <td>
                    <strong>{log.user}</strong>
                    <br />
                    <small>{log.userRole}</small>
                  </td>
                  <td>
                    {log.entity}
                    <br />
                    <small>{log.entityId}</small>
                  </td>
                  <td>
                    <pre
                      style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                        maxWidth: "300px",
                        overflowX: "auto",
                        background: "var(--bg)",
                        padding: "4px",
                        borderRadius: "4px",
                      }}
                    >
                      {log.metadata ? JSON.stringify(log.metadata, null, 2) : "-"}
                    </pre>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                    <ShieldAlert size={32} style={{ color: "var(--border)", margin: "0 auto 1rem" }} />
                    <p style={{ color: "var(--muted)" }}>No audit logs found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
