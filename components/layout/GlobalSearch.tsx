"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchPatients } from "@/app/actions/search";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim() === "") {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchPatients(query);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (patientId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="global-search" ref={wrapperRef} style={{ position: "relative" }}>
      <Search size={17} />
      <input
        ref={inputRef}
        placeholder="Search patient, mobile or ID..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      <kbd>⌘ K</kbd>

      {isOpen && query.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "350px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            zIndex: 100,
            overflow: "hidden"
          }}
        >
          {isSearching ? (
            <div style={{ padding: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--muted)" }}>
              <Loader2 size={16} className="spinner" /> Searching...
            </div>
          ) : results.length > 0 ? (
            <ul style={{ listStyle: "none", margin: 0, padding: "4px" }}>
              {results.map((patient) => (
                <li key={patient.id}>
                  <button
                    onClick={() => handleSelect(patient.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-raised)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontWeight: 500, color: "var(--text)" }}>{patient.name}</span>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {patient.patientNumber} {patient.mobile ? `• ${patient.mobile}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: "12px", color: "var(--muted)", fontSize: "14px" }}>
              No patients found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
