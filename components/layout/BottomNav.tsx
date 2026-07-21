"use client";

import {
  CalendarDays,
  LayoutDashboard,
  Plus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";

const tabs = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: UsersRound },
  { href: "/appointments", label: "Calendar", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();
  const setAddingPatient = useAppStore((s) => s.setAddingPatient);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-nav-item ${active ? "bottom-nav-active" : ""}`}
          >
            <Icon size={22} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
      <button
        className="bottom-nav-item bottom-nav-add"
        onClick={() => setAddingPatient(true)}
      >
        <span className="bottom-nav-fab">
          <Plus size={22} />
        </span>
        <span>Add</span>
      </button>
    </nav>
  );
}
