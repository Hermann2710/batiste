import { eq, sql, and } from "drizzle-orm";
import { db } from "@/db";
import { formSubmissions, siteMembers, sites } from "@/db/schema";
import { requireSiteAccess } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";
import SiteShell from "@/components/dashboard/SiteShell";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale: rawLocale, siteId } = await params;
  const locale = normalizeLocale(rawLocale);
  const { site, user, features } = await requireSiteAccess(siteId, locale);

  const memberships = await db
    .select({ site: sites })
    .from(siteMembers)
    .innerJoin(sites, eq(siteMembers.siteId, sites.id))
    .where(eq(siteMembers.userId, user.id));

  const [unread] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(formSubmissions)
    .where(
      and(
        eq(formSubmissions.siteId, siteId),
        eq(formSubmissions.status, "new"),
      ),
    );

  return (
    <SiteShell
      site={{
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        status: site.status,
      }}
      sites={memberships.map((row) => ({
        id: row.site.id,
        name: row.site.name,
        subdomain: row.site.subdomain,
        status: row.site.status,
      }))}
      features={features}
      unreadCount={unread?.value ?? 0}
    >
      {children}
    </SiteShell>
  );
}
