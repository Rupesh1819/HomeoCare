"use client";

import {
  BarChart3,
  BriefcaseMedical,
  Building2,
  CalendarDays,
  ChevronDown,
  HeartPulse,
  History,
  LayoutDashboard,
  LogOut,
  MessageCircleMore,
  PackageSearch,
  Pill,
  ReceiptText,
  Settings,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  X,
  FileText,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminProfile } from "@/app/actions/settings";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/patients", label: "Patients", icon: UsersRound },
      {
        href: "/appointments",
        label: "Appointments",
        icon: CalendarDays,
        badge: "12",
      },
      { href: "/follow-ups", label: "Follow-Ups", icon: History, badge: "7" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/treatments", label: "Treatments", icon: Stethoscope },
      { href: "/prescriptions", label: "Prescriptions", icon: Pill },
      { href: "/reports", label: "Medical Reports", icon: FileText },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/billing", label: "Billing", icon: ReceiptText },
      { href: "/inventory", label: "Inventory", icon: PackageSearch },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      {
        href: "/whatsapp",
        label: "WhatsApp Center",
        icon: MessageCircleMore,
      },
      { href: "/staff", label: "Staff Management", icon: BriefcaseMedical },
      { href: "/audit", label: "Audit Log", icon: ShieldAlert },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar({
  open,
  settings,
  onClose,
  onLogout,
}: {
  open: boolean;
  settings?: any;
  onClose: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("CLINIC_ADMIN");

  useEffect(() => {
    getAdminProfile().then(p => setRole(p.role || "CLINIC_ADMIN")).catch(console.error);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <button
          className="sidebar-scrim"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Clinic Logo" className="brand-logo" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
          ) : (
            <span className="brand-mark">
              <HeartPulse size={22} />
            </span>
          )}
          <div>
            <strong>{settings?.name || "HomeoCare Pro"}</strong>
            <small>Enterprise</small>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <button className="branch-switcher">
          <span className="branch-icon">
            <Building2 size={18} />
          </span>
          <span style={{ textAlign: 'left' }}>
            <small>Current branch</small>
            <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
              {settings?.branches?.[0]?.name || "Pune Central Clinic"}
            </strong>
          </span>
          <ChevronDown size={15} />
        </button>

        <nav className="sidebar-nav">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter((item) => {
              if (role === "LAB_TECHNICIAN") {
                return item.href === "/" || item.href === "/reports";
              }
              if (role === "PHARMACIST") {
                return item.href === "/" || item.href === "/prescriptions" || item.href === "/inventory";
              }
              if (item.href === "/audit") {
                return role === "CLINIC_ADMIN" || role === "SUPER_ADMIN";
              }
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div className="nav-group" key={group.label}>
                <span className="nav-group-label">{group.label}</span>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      className={`nav-item ${active ? "nav-item-active" : ""}`}
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {item.badge && <em>{item.badge}</em>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="storage-card">
            <div>
              <ShieldCheck size={17} />
              <strong>Cloud backup</strong>
              <span>Synced 2 min ago</span>
            </div>
            <span className="status-dot" />
          </div>
          <button className="nav-item" onClick={onLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
