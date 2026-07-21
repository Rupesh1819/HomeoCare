import type { LucideIcon } from "lucide-react";

export function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-${tone}`}>
        <Icon size={19} />
      </div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <small className={tone === "red" ? "note-danger" : ""}>{note}</small>
    </article>
  );
}
