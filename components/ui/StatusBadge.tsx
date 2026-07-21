export function StatusBadge({ status }: { status: string }) {
  const slug = status.toLowerCase().replace(/\s+/g, "-");
  return (
    <span className={`status-badge status-badge-${slug}`}>
      <i />
      {status}
    </span>
  );
}
