import { requireSiteAccess } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";
import { getTestimonials } from "@/actions/testimonials";
import TestimonialsManager from "@/components/dashboard/TestimonialsManager";

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale: rawLocale, siteId } = await params;
  const locale = normalizeLocale(rawLocale);
  await requireSiteAccess(siteId, locale);

  const items = await getTestimonials(siteId);

  return <TestimonialsManager siteId={siteId} initial={items} />;
}
