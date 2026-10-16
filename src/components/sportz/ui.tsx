import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className={cn("card-surface p-5 md:p-6", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-lg font-extrabold text-navy md:text-xl">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground md:text-sm">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "chip";
  className?: string;
  disabled?: boolean;
}) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-[var(--shadow-card)]",
    ghost: "border border-border bg-card text-navy hover:bg-accent",
    chip: "border border-border bg-soft text-navy-2 hover:border-primary hover:text-primary text-xs",
  }[variant];
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-60",
        v,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DemoTag({ label = "DEMO DATA" }: { label?: string }) {
  return (
    <span className="rounded-full border border-warn/40 bg-warn/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-warn">
      {label}
    </span>
  );
}

export function Sparkline({
  data,
  up = true,
  className,
}: {
  data: number[];
  up?: boolean;
  className?: string;
}) {
  const max = Math.max(...data),
    min = Math.min(...data);
  const pts = data
    .map(
      (d, i) => `${(i / (data.length - 1)) * 100},${30 - ((d - min) / (max - min || 1)) * 26 - 2}`,
    )
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" className={cn("h-7 w-20", className)} preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        strokeWidth="2.2"
        className={up ? "stroke-up" : "stroke-down"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Ring({
  pct,
  size = 140,
  stroke = 14,
  children,
  className,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="fill-none stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="fill-none stroke-[url(#ringgrad)] transition-all duration-700"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          stroke="url(#ringgrad)"
        />
        <defs>
          <linearGradient id="ringgrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--f1)" />
            <stop offset="50%" stopColor="var(--mlb)" />
            <stop offset="100%" stopColor="var(--nba)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function SportBadge({
  grad,
  label,
  size = "md",
}: {
  grad: string;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        grad,
        "inline-flex shrink-0 items-center justify-center rounded-lg font-black text-on-color",
        size === "sm" ? "h-7 w-9 text-[10px]" : "h-9 w-11 text-xs",
      )}
    >
      {label}
    </span>
  );
}
