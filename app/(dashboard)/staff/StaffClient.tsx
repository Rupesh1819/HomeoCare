"use client";

import { Activity, BriefcaseMedical, ChevronRight, MoreHorizontal, Search, ShieldCheck, UserRoundPlus, UsersRound, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { MetricCard } from "@/components/ui/MetricCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { InviteStaffDrawer } from "@/components/staff/InviteStaffDrawer";
import { EditStaffDrawer } from "@/components/staff/EditStaffDrawer";
import { RoleAccessDrawer } from "@/components/staff/RoleAccessDrawer";
import { deleteStaff } from "@/app/actions/staff";
import { Pencil } from "lucide-react";

type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  name: string;
  role: string;
  rawRole: string;
  specialty: string;
  registrationNo: string;
  status: string;
  initials: string;
};

type StaffData = {
  staff: StaffMember[];
  stats: {
    totalStaff: number;
    activeDoctors: number;
    rolesConfigured: number;
    activeSessions: number;
  };
};

export function StaffClient({ data }: { data: StaffData }) {
  const { notify } = useAppStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All roles");
  const [isInviting, setIsInviting] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [accessRoleView, setAccessRoleView] = useState<string | null>(null);

  const filteredStaff = data.staff.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === "All roles" || member.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleSuccess = () => {
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}? This will revoke their access.`)) {
      try {
        const res = await deleteStaff(id);
        if (res.success) {
          notify(res.message || "Staff member removed.");
          router.refresh();
        } else {
          notify(`Error: ${res.error}`);
        }
      } catch (err: any) {
        notify(`Failed to remove staff: ${err.message || err}`);
      }
    }
  };

  return (
    <div className="page-stack">
      <InviteStaffDrawer 
        isOpen={isInviting} 
        onClose={() => setIsInviting(false)} 
        onSuccess={handleSuccess} 
      />
      
      <EditStaffDrawer 
        isOpen={!!editingStaffMember} 
        onClose={() => setEditingStaffMember(null)} 
        onSuccess={handleSuccess}
        staff={editingStaffMember}
      />

      <RoleAccessDrawer
        isOpen={!!accessRoleView}
        onClose={() => setAccessRoleView(null)}
        role={accessRoleView || ""}
      />
      
      <PageHeader
        title="Clinic team"
        description="Manage access, responsibilities, branch assignments, and activity."
        action={
          <button className="button button-primary" onClick={() => setIsInviting(true)}>
            <UserRoundPlus size={17} /> Invite staff
          </button>
        }
      />
      <div className="metric-grid metric-grid-4">
        <MetricCard
          icon={BriefcaseMedical}
          label="Active doctors"
          value={String(data.stats.activeDoctors)}
          note="In database"
          tone="blue"
        />
        <MetricCard
          icon={UsersRound}
          label="Total staff"
          value={String(data.stats.totalStaff)}
          note="Registered users"
          tone="green"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Roles configured"
          value={String(data.stats.rolesConfigured)}
          note="RBAC active"
          tone="violet"
        />
        <MetricCard
          icon={Activity}
          label="Active sessions"
          value={String(data.stats.activeSessions)}
          note="Online users"
          tone="amber"
        />
      </div>
      <Panel>
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              placeholder="Search team member"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option>All roles</option>
            <option value="Clinic Admin">Clinic Admin</option>
            <option value="Doctor">Doctor</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Accountant">Accountant</option>
          </select>
          <select>
            <option>All branches</option>
            <option>Navgaon</option>
            <option>Aundh Branch</option>
          </select>
        </div>
        <div className="staff-grid">
          {filteredStaff.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#666" }}>
              No staff members found matching criteria.
            </div>
          ) : (
            filteredStaff.map((member) => (
              <article className="staff-card" key={member.name}>
                <header>
                  <span className="avatar avatar-large">{member.initials}</span>
                  <div className="card-actions">
                    <button className="icon-button" onClick={() => setEditingStaffMember(member)} title="Edit staff">
                      <Pencil size={16} />
                    </button>
                    <button className="icon-button delete-action" onClick={() => handleDelete(member.id, member.name)} title="Remove staff">
                      <Trash2 size={16} color="var(--danger)" />
                    </button>
                  </div>
                </header>
                <h3>{member.name}</h3>
                <p>{member.specialty}</p>
                <span className="role-pill">{member.role}</span>
                <footer>
                  <span className={`presence ${member.status === "Offline" ? "offline" : ""}`}>
                    <i />
                    {member.status}
                  </span>
                  <button className="text-button" onClick={() => setAccessRoleView(member.rawRole || member.role)}>
                    View access <ChevronRight size={14} />
                  </button>
                </footer>
              </article>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
