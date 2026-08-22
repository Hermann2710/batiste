import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { formSubmissions } from "@/db/schema";
import { requireSiteAccess } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";
import Inbox from "@/components/dashboard/Inbox";

export default async function InboxRoute({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale: rawLocale, siteId } = await params;
  const locale = normalizeLocale(rawLocale);
  await requireSiteAccess(siteId, locale);

  const rows = await db
    .select()
    .from(formSubmissions)
    .where(eq(formSubmissions.siteId, siteId))
    .orderBy(desc(formSubmissions.createdAt));

  return (
    <Inbox
      submissions={rows.map((row) => ({
        id: row.id,
        formType: row.formType,
        status: row.status,
        data: row.data,
        createdAt: row.createdAt,
      }))}
    />
  );
}
