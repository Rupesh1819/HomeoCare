"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-layer">
      <button
        className="modal-scrim"
        aria-label="Close modal"
        onClick={onClose}
      />
      <section className="modal">
        <header>
          <h3>{title}</h3>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
