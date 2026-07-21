"use client";

import { Clock3, MessageCircleMore, Phone } from "lucide-react";
import { useAppStore } from "@/lib/store";

type FollowUpItem = { id: string; name: string; condition: string; due: string };

export function FollowUpBoard({
  overdue,
  dueToday,
  upcoming,
}: {
  overdue: FollowUpItem[];
  dueToday: FollowUpItem[];
  upcoming: FollowUpItem[];
}) {
  const { notify } = useAppStore();

  const groups = [
    { title: "Overdue", tone: "red", items: overdue },
    { title: "Due today", tone: "amber", items: dueToday },
    { title: "Upcoming", tone: "green", items: upcoming },
  ];

  return (
    <div className="followup-board">
      {groups.map((group) => (
        <section className="followup-column" key={group.title}>
          <header>
            <span>
              <i className={`${group.tone}-dot`} />
              {group.title}
            </span>
            <strong>{group.items.length}</strong>
          </header>
          {group.items.length === 0 && (
            <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>
              No follow-ups
            </div>
          )}
          {group.items.map((item) => (
            <article className="followup-item" key={item.id}>
              <div>
                <span className="avatar">
                  {item.name.split(" ").map((p) => p[0]).join("")}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.condition}</small>
                </span>
              </div>
              <p>
                <Clock3 size={14} /> {item.due}
              </p>
              <div>
                <button
                  className="button button-small button-secondary"
                  onClick={() => notify(`Called ${item.name}.`)}
                >
                  <Phone size={14} /> Call
                </button>
                <button
                  className="button button-small button-whatsapp"
                  onClick={() => notify(`WhatsApp reminder sent to ${item.name}.`)}
                >
                  <MessageCircleMore size={14} /> Message
                </button>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
