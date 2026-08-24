import { requireSiteAccess } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";
import { getAnalyticsSummary } from "@/actions/analytics";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale: rawLocale, siteId } = await params;
  const locale = normalizeLocale(rawLocale);
  await requireSiteAccess(siteId, locale);

  const summary = await getAnalyticsSummary(siteId);

  return <AnalyticsDashboard summary={summary} />;
}
