"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { Badge, IconButton, Select } from "@/components/ui";
import SignOutButton from "./SignOutButton";
import { ArrowLeft, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, FileText, Globe2, Inbox, LayoutDashboard, Palette, Settings, UserRound } from "lucide-react";

export interface ShellSite {
  id: string;
  name: string;
  subdomain: string;
  status: string;
}

export default function SiteShell({
  site,
  sites,
  features,
  unreadCount,
  children,
}: {
  site: ShellSite;
  sites: ShellSite[];
  features: Record<string, boolean>;
  unreadCount: number;
  children: React.ReactNode;
}) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const base = `/${locale}/dashboard/${site.id}`;
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { href: base, label: t.nav.overview, icon: LayoutDashboard, show: true },
    { href: `${base}/pages`, label: t.nav.pages, icon: FileText, show: true },
    { href: `${base}/catalog`, label: t.nav.catalog, icon: Palette, show: features.catalog },
    { href: `${base}/blog`, label: t.nav.blog, icon: BookOpen, show: features.blog },
    { href: `${base}/inbox`, label: t.nav.inbox, icon: Inbox, show: true, badge: unreadCount },
    { href: `${base}/settings`, label: t.nav.settings, icon: Settings, show: true },
  ].filter((item) => item.show);
  const currentItem = items.find((item) => item.href === pathname);

  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.05 });
    if (sidebarRef.current) {
      const navItems = sidebarRef.current.querySelectorAll("nav a, nav button");
      gsap.set(sidebarRef.current, { x: -16, opacity: 0 });
      tl.to(sidebarRef.current, { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" });
      if (navItems.length) {
        gsap.set(navItems, { x: -10, opacity: 0 });
        tl.to(navItems, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out", stagger: 0.04 }, "-=0.2");
      }
    }
    if (mainRef.current) {
      gsap.set(mainRef.current, { opacity: 0, y: 12 });
      tl.to(mainRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.15);
    }
    return () => { tl.kill(); };
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside ref={sidebarRef} className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-zinc-200/80 bg-white transition-[width] lg:flex", collapsed ? "w-[76px]" : "w-64")}>
        <div className={cn("border-b border-zinc-200/80 py-4", collapsed ? "px-3" : "px-4")}>
          <div className="flex items-center justify-between gap-2">
          <Link
            href={`/${locale}/dashboard`}
            className={cn("text-[11px] font-medium uppercase tracking-wider text-zinc-400 hover:text-zinc-600", collapsed && "mx-auto")}
          >
            {collapsed ? <ArrowLeft className="size-4" /> : <><ArrowLeft className="mr-1 inline size-3" />{t.nav.mySites}</>}
          </Link>
          <IconButton label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)} className="shrink-0 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100">
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </IconButton></div>
          {!collapsed && <><p className="mt-2 truncate text-sm font-semibold tracking-tight text-zinc-900">
            {site.name}
          </p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">
            {site.subdomain}.batiste.app
          </p>
          <div className="mt-2">
            <Badge tone={site.status === "published" ? "success" : "neutral"}>
              {site.status === "published" ? t.common.published : t.common.draft}
            </Badge>
          </div>
          </>}
        </div>

        <nav aria-label="Site navigation" className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-[background-color,color,transform]",
                  active
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-600 hover:translate-x-0.5 hover:bg-zinc-100 hover:text-zinc-950"
                )}
              >
                <item.icon className={cn("size-4 shrink-0", active ? "opacity-90" : "text-zinc-400")} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {item.badge && !collapsed ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      active ? "bg-white/20 text-white" : "bg-zinc-900 text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-zinc-200 p-3">
          <a
            href={`/s/${site.subdomain}`}
            target="_blank"
            rel="noreferrer"
            className={cn("flex items-center rounded-xl border border-zinc-200 px-3 py-2.5 text-[13px] font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50", collapsed ? "justify-center" : "justify-between")}
          >
            {!collapsed && t.common.visit}
            <ArrowUpRight className="size-4 text-zinc-400" />
          </a>

          {sites.length > 1 && !collapsed && (
            <Select
              value={site.id}
              onChange={(event) => {
                window.location.href = `/${locale}/dashboard/${event.target.value}`;
              }}
              className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[13px] text-zinc-700"
            >
              {sites.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </Select>
          )}

          <div className="flex items-center gap-2">
            <Link href={`/${locale}/profile`} aria-label={t.nav.profile} className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
              <UserRound className="size-4" />
            </Link>
            <Link
              href={`/${pathname.startsWith(`/fr`) ? "en" : "fr"}/dashboard/${site.id}`}
              className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50"
            >
              {pathname.startsWith("/fr") ? "EN" : "FR"}
            </Link>
            {!collapsed && <SignOutButton variant="ghost" />}
          </div>
        </div>
      </aside>

      <div ref={mainRef} className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-zinc-950">{site.name}</p>
              <p className="truncate font-mono text-[10px] text-zinc-400">{site.subdomain}.batiste.app</p>
            </div>
            <a href={`/s/${site.subdomain}`} target="_blank" rel="noreferrer" aria-label={t.common.visit} className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50">
              <Globe2 className="size-4" />
            </a>
          </div>
          <nav aria-label="Site navigation" className="scroll-slim flex gap-1 overflow-x-auto px-3 pb-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium",
                pathname === item.href ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
          </nav>
        </header>
        <div className="sticky top-0 z-30 hidden items-center justify-between border-b border-zinc-200/80 bg-white/95 px-8 py-3 backdrop-blur lg:flex">
          <div className="flex min-w-0 items-center gap-2 text-[12px] text-zinc-400">
            <span className="font-medium text-zinc-500">{t.nav.mySites}</span>
            <span>/</span>
            <span className="truncate font-medium text-zinc-500">{site.name}</span>
            {currentItem && <><span>/</span><span className="truncate font-medium text-zinc-950">{currentItem.label}</span></>}
          </div>
          <a href={`/s/${site.subdomain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-950">
            <Globe2 className="size-3.5" /> {t.common.visit} <ArrowUpRight className="size-3" />
          </a>
        </div>
        <main className="dashboard-grid min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
