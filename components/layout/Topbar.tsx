"use client";

import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Sun,
  UserRoundPlus,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { getAdminProfile } from "@/app/actions/settings";
import { GlobalSearch } from "./GlobalSearch";

export function Topbar({ title, eyebrow }: { title: string; eyebrow: string }) {
  const {
    darkMode,
    toggleTheme,
    language,
    cycleLanguage,
    setSidebarOpen,
    setAddingPatient,
    notify,
  } = useAppStore();

  const [profile, setProfile] = useState<{ firstName: string; lastName: string; role: string } | null>(null);

  useEffect(() => {
    getAdminProfile().then(p => {
      setProfile({
        firstName: p.firstName,
        lastName: p.lastName,
        role: p.role || "Admin"
      });
    }).catch(console.error);
  }, []);

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Dr. Maya Smith";
  const initials = profile ? `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase() : "MS";
  const roleName = profile ? (profile.role === "DOCTOR" ? "Doctor" : profile.role === "CLINIC_ADMIN" ? "Clinic Admin" : profile.role) : "Clinic Admin";
  const displayName = profile?.role === "DOCTOR" ? `Dr. ${fullName}` : fullName;

  return (
    <header className="topbar">
      <div className="topbar-title">
        <button
          className="icon-button mobile-menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
        <div>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <GlobalSearch />
        <button className="language-button" onClick={cycleLanguage}>
          {language}
        </button>
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="icon-button notification-button"
          onClick={() => notify("You have 3 unread notifications.")}
        >
          <Bell size={18} />
          <span />
        </button>
        <button
          className="button button-primary topbar-add"
          onClick={() => setAddingPatient(true)}
        >
          <UserRoundPlus size={17} /> Add patient
        </button>
        <button className="profile-menu">
          <span className="avatar avatar-blue">{initials}</span>
          <span>
            <strong>{displayName}</strong>
            <small>{roleName}</small>
          </span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}
