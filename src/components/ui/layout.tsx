import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(24,24,27,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("px-5 py-5", className)}>{children}</div>;
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { key: T; label: string; badge?: number }[];
  active: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition",
            active === tab.key
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
