import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteMembers, sites } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";
import { I18nProvider } from "@/i18n/client";
import SignOutButton from "@/components/dashboard/SignOutButton";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const user = await requireUser(locale);

  const memberships = await db
    .select({ site: sites })
    .from(siteMembers)
    .innerJoin(sites, eq(siteMembers.siteId, sites.id))
    .where(eq(siteMembers.userId, user.id))
    .limit(5);

  const name = user.name ?? user.email ?? "";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "B";

  return (
    <I18nProvider locale={locale}>
      <div className="flex min-h-screen bg-zinc-50">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white lg:flex">
          <div className="border-b border-zinc-200/80 px-4 py-4">
            <Link
              href={`/${locale}/dashboard`}
              className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 hover:text-zinc-600"
            >
              ← Mes sites
            </Link>
            <p className="mt-3 text-sm font-semibold tracking-tight text-zinc-900">Mon profil</p>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            <Link
              href={`/${locale}/dashboard/profile`}
              className="flex items-center gap-2.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-[13px] font-medium text-white shadow-sm"
            >
              Informations personnelles
            </Link>
          </nav>

          <div className="space-y-2 border-t border-zinc-200 p-3">
            {memberships.length > 0 && (
              <div className="space-y-1">
                <p className="px-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Mes sites
                </p>
                {memberships.map(({ site }) => (
                  <Link
                    key={site.id}
                    href={`/${locale}/dashboard/${site.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-[12.5px] font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    <span className="truncate">{site.name}</span>
                    <span className="ml-2 shrink-0 text-zinc-300">→</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[11px] font-semibold text-white">
                {initials}
              </div>
              <span className="min-w-0 flex-1 truncate text-[12px] text-zinc-600">{user.email}</span>
            </div>
            <SignOutButton variant="ghost" />
          </div>
        </aside>

        {/* Mobile header */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href={`/${locale}/dashboard`} className="text-[13px] font-medium text-zinc-500">
              ← Mes sites
            </Link>
            <span className="text-[13px] font-semibold text-zinc-900">Mon profil</span>
          </header>
          <main className="flex-1 p-5 sm:p-8">{children}</main>
        </div>
      </div>
    </I18nProvider>
  );
}
