"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, IconButton, Select } from "@/components/ui";
import SignOutButton from "./SignOutButton";
import type { ShellSite } from "./SiteShell";

export interface SiteNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

function ProfileAvatar({
  collapsed,
  locale,
}: {
  collapsed: boolean;
  locale: string;
}) {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "";
  const image = session?.user?.image;
  const initials =
    name
      .split(" ")
      .map((n: any) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "B";
  return (
    <Link
      href={`/${locale}/dashboard/profile`}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-zinc-200 px-2.5 py-2 text-[13px] font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50",
        collapsed && "justify-center px-2",
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="size-7 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[11px] font-semibold text-white">
          {initials}
        </span>
      )}
      {!collapsed && (
        <span className="min-w-0 flex-1 truncate text-[12.5px]">
          {name || session?.user?.email?.split("@")[0] || "Profil"}
        </span>
      )}
    </Link>
  );
}

export default function SiteSidebar({
  site,
  sites,
  items,
  locale,
  collapsed,
  onToggle,
}: {
  site: ShellSite;
  sites: ShellSite[];
  items: SiteNavItem[];
  locale: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-zinc-200/80 bg-white transition-[width] lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "border-b border-zinc-200/80 py-4",
          collapsed ? "px-3" : "px-4",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/${locale}/dashboard`}
            className={cn(
              "text-[11px] font-medium uppercase tracking-wider text-zinc-400 hover:text-zinc-600",
              collapsed && "mx-auto",
            )}
          >
            {collapsed ? (
              <ArrowLeft className="size-4" />
            ) : (
              <>
                <ArrowLeft className="mr-1 inline size-3" />
                Mes sites
              </>
            )}
          </Link>
          <IconButton
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            className="shrink-0 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </IconButton>
        </div>
        {!collapsed && (
          <>
            <p className="mt-2 truncate text-sm font-semibold tracking-tight text-zinc-900">
              {site.name}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">
              {site.subdomain}.batiste.app
            </p>
            <div className="mt-2">
              <Badge tone={site.status === "published" ? "success" : "neutral"}>
                {site.status === "published" ? "Publié" : "Brouillon"}
              </Badge>
            </div>
          </>
        )}
      </div>
      <nav
        aria-label="Site navigation"
        className="flex-1 space-y-1 overflow-y-auto p-3"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-[background-color,color,transform]",
              item.href === pathname
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-600 hover:translate-x-0.5 hover:bg-zinc-100 hover:text-zinc-950",
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0",
                item.href === pathname ? "opacity-90" : "text-zinc-400",
              )}
            />
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {item.badge && !collapsed ? (
              <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 border-t border-zinc-200 p-3">
        <a
          href={`/s/${site.subdomain}`}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "flex items-center rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <span className={collapsed ? "sr-only" : ""}>Voir le site</span>
          <ArrowUpRight className="size-4 text-zinc-400" />
        </a>
        {sites.length > 1 && !collapsed && (
          <Select
            value={site.id}
            onChange={(event) => {
              window.location.href = `/${locale}/dashboard/${event.target.value}`;
            }}
          >
            {sites.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </Select>
        )}
        <ProfileAvatar collapsed={collapsed} locale={locale} />
        <SignOutButton variant="ghost" />
      </div>
    </aside>
  );
}
