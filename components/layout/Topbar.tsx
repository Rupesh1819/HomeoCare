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
import { getNotifications, markAllAsRead } from "@/app/actions/notifications";
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchAlerts = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAdminProfile().then(p => {
      setProfile({
        firstName: p.firstName,
        lastName: p.lastName,
        role: p.role || "Admin"
      });
    }).catch(console.error);

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // 10 seconds polling
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async () => {
    await markAllAsRead();
    fetchAlerts();
    setShowNotifications(false);
  };

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Dr. Madhukar Takpire";
  const initials = profile ? `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase() : "MT";
  
  const isDoctorOwner = profile?.firstName === "Madhukar" && profile?.lastName === "Takpire";
  const roleName = isDoctorOwner ? "Clinic Owner & Doctor" : profile ? (profile.role === "DOCTOR" ? "Doctor" : profile.role === "CLINIC_ADMIN" ? "Clinic Admin" : profile.role) : "Clinic Admin";
  const displayName = (isDoctorOwner || profile?.role === "DOCTOR") ? `Dr. ${fullName}` : fullName;
  const unreadCount = notifications.filter((n) => !n.read).length;

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
        <div style={{ position: "relative" }}>
          <button
            className="icon-button notification-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span />}
          </button>
          
          {showNotifications && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setShowNotifications(false)} />
              <div className="dropdown-menu" style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", width: "320px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100, padding: "16px", display: "flex", flexDirection: "column", gap: "12px", color: "var(--text)", maxHeight: "400px", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--surface)" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Notifications {unreadCount > 0 && `(${unreadCount})`}</h4>
                  <span style={{ fontSize: "12px", color: "var(--primary)", cursor: "pointer", fontWeight: 500 }} onClick={handleMarkAsRead}>Mark all as read</span>
                </div>
                <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {notifications.length === 0 ? (
                    <span style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>No notifications</span>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} style={{ display: "flex", gap: "12px", opacity: n.read ? 0.6 : 1 }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: n.read ? "transparent" : "var(--primary)", border: n.read ? "1px solid var(--border)" : "none", marginTop: "6px", flexShrink: 0 }} />
                        <div>
                          <strong style={{ display: "block", marginBottom: "4px" }}>{n.title}</strong>
                          <span style={{ color: "var(--text-secondary)", lineHeight: 1.4, display: "block" }}>{n.message}</span>
                          <small style={{ color: "var(--text-tertiary)", marginTop: "4px", display: "block" }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
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
