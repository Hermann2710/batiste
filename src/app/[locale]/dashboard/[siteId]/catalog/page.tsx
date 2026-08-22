import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireSiteAccess } from "@/lib/guards";
import { getMessages, normalizeLocale } from "@/i18n/messages";
import CatalogManager from "@/components/dashboard/CatalogManager";
import { EmptyState } from "@/components/ui";

export default async function CatalogRoute({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale: rawLocale, siteId } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = getMessages(locale);
  const { features } = await requireSiteAccess(siteId, locale);

  if (!features.catalog) {
    return (
      <EmptyState
        icon="▩"
        title={t.catalog.disabled}
        description={t.catalog.enableInSettings}
        action={
          <Link
            href={`/${locale}/dashboard/${siteId}/settings`}
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-[13px] font-medium text-white"
          >
            {t.settings.title}
          </Link>
        }
      />
    );
  }

  const rows = await db
    .select()
    .from(products)
    .where(eq(products.siteId, siteId))
    .orderBy(asc(products.sortOrder), asc(products.name));

  return (
    <CatalogManager
      siteId={siteId}
      products={rows.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        category: product.category,
        images: product.images,
        customAttributes: product.customAttributes,
        status: product.status,
      }))}
    />
  );
}
