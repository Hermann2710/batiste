import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { requireSiteAccess } from "@/lib/guards";
import { getMessages, normalizeLocale } from "@/i18n/messages";
import BlogManager from "@/components/dashboard/BlogManager";
import { EmptyState } from "@/components/ui";

export default async function BlogRoute({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale: rawLocale, siteId } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = getMessages(locale);
  const { site, features } = await requireSiteAccess(siteId, locale);

  if (!features.blog) {
    return (
      <EmptyState
        icon="¶"
        title={t.blog.disabled}
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
    .from(blogPosts)
    .where(eq(blogPosts.siteId, siteId))
    .orderBy(desc(blogPosts.createdAt));

  return (
    <BlogManager
      siteId={siteId}
      languages={
        (site.supportedLanguages as string[]) ?? [site.defaultLanguage]
      }
      defaultLanguage={site.defaultLanguage}
      posts={rows.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        language: post.language,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        coverImage: post.coverImage,
        status: post.status,
        publishedAt: post.publishedAt,
      }))}
    />
  );
}
