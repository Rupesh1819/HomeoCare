import type { ReactNode, CSSProperties } from "react";

export function Panel({
  children,
  className = "",
  onClick,
  style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <section className={`panel ${className}`} onClick={onClick} style={style}>
      {children}
    </section>
  );
}

