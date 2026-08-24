import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blocks, pages, products } from "@/db/schema";
import { requireSiteAccess } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";
import PageBuilder, {
  type BuilderPage,
} from "@/components/dashboard/PageBuilder";

export default async function PagesRoute({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale: rawLocale, siteId } = await params;
  const locale = normalizeLocale(rawLocale);
  const { site, theme, features } = await requireSiteAccess(siteId, locale);

  const pageRows = await db
    .select()
    .from(pages)
    .where(eq(pages.siteId, siteId))
    .orderBy(asc(pages.sortOrder), asc(pages.title));

  const blockRows = await db
    .select()
    .from(blocks)
    .innerJoin(pages, eq(blocks.pageId, pages.id))
    .where(eq(pages.siteId, siteId))
    .orderBy(asc(blocks.position));

  const builderPages: BuilderPage[] = pageRows.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    language: page.language,
    status: page.status,
    isHomepage: Boolean(page.isHomepage),
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    blocks: blockRows
      .filter((row) => row.blocks.pageId === page.id)
      .map((row) => ({
        id: row.blocks.id,
        type: row.blocks.type,
        position: row.blocks.position,
        isVisible: Boolean(row.blocks.isVisible),
        content: (row.blocks.content as Record<string, unknown>) ?? {},
      })),
  }));

  const productRows = features.catalog
    ? await db
        .select()
        .from(products)
        .where(
          and(eq(products.siteId, siteId), eq(products.status, "published")),
        )
        .orderBy(asc(products.sortOrder))
    : [];

  return (
    <PageBuilder
      siteId={siteId}
      pages={builderPages}
      languages={
        (site.supportedLanguages as string[]) ?? [site.defaultLanguage]
      }
      defaultLanguage={site.defaultLanguage}
      theme={{
        colors: theme.colors,
        fonts: theme.fonts,
        borderRadius: theme.borderRadius,
      }}
      products={productRows.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        images: product.images,
        category: product.category,
        customAttributes: product.customAttributes,
      }))}
      features={features}
    />
  );
}
