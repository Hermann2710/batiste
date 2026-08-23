import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blocks, blogPosts, featureFlags, pages, products, sites, themes } from "@/db/schema";
import BlockView, { type PublicProduct } from "@/components/site/BlockView";
import { themeStyle } from "@/lib/themes";
import { getMessages, normalizeLocale, type Locale } from "@/i18n/messages";
import { formatDate, formatPrice } from "@/lib/utils";
import { isSupportedLocale, publicLanguagePrefix, publicPath } from "@/lib/public-site";

const ROOT_DOMAINS = ["batiste.app", "lvh.me", "localhost"];

async function loadSite(subdomain: string) {
  const rows = await db
    .select({ site: sites, theme: themes })
    .from(sites)
    .innerJoin(themes, eq(sites.themeId, themes.id))
    .where(eq(sites.subdomain, subdomain))
    .limit(1);
  return rows[0] ?? null;
}

export async function buildSiteMetadata(subdomain: string): Promise<Metadata> {
  const data = await loadSite(subdomain);
  if (!data) return { title: "Batiste" };
  const title = data.site.seoTitle || data.site.name;
  return {
    title,
    description: data.site.seoDescription ?? undefined,
    openGraph: {
      title,
      description: data.site.seoDescription ?? undefined,
      type: "website",
      siteName: data.site.name,
    },
    twitter: { card: "summary_large_image", title },
  };
}

export default async function PublicSite({
  subdomain,
  slug = [],
}: {
  subdomain: string;
  slug?: string[];
}) {
  const data = await loadSite(subdomain);

  if (!data || data.site.status !== "published") {
    const fallback = getMessages("fr");
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {fallback.publicSite.notFound}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{fallback.publicSite.notFoundDesc}</p>
        </div>
      </main>
    );
  }

  const { site, theme } = data;
  const defaultLanguage = isSupportedLocale(site.defaultLanguage) ? site.defaultLanguage : "fr";
  const supported: Locale[] = Array.from(
    new Set([
      defaultLanguage,
      ...(((site.supportedLanguages as string[]) ?? []).filter(isSupportedLocale)),
    ])
  );

  const segments = [...slug];
  let language = defaultLanguage;
  if (segments.length && isSupportedLocale(segments[0]) && supported.includes(segments[0])) {
    language = segments.shift() as Locale;
  }
  const locale = normalizeLocale(language) as Locale;
  const t = getMessages(locale);

  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  const onSubdomain = ROOT_DOMAINS.some((root) => host.endsWith(`.${root}`) && host.startsWith(`${subdomain}.`));
  const root = onSubdomain ? "" : `/s/${subdomain}`;
  const prefix = publicLanguagePrefix(root, language, defaultLanguage);
  const href = (path: string) => publicPath(prefix, path);

  const flags = await db.select().from(featureFlags).where(eq(featureFlags.siteId, site.id));
  const features = Object.fromEntries(flags.map((flag) => [flag.feature, Boolean(flag.isEnabled)]));

  const navPages = await db
    .select()
    .from(pages)
    .where(
      and(eq(pages.siteId, site.id), eq(pages.status, "published"), eq(pages.language, language))
    )
    .orderBy(asc(pages.sortOrder));

  const productRows = features.catalog
    ? await db
        .select()
        .from(products)
        .where(and(eq(products.siteId, site.id), eq(products.status, "published")))
        .orderBy(asc(products.sortOrder))
    : [];

  const publicProducts: PublicProduct[] = productRows.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    images: product.images,
    category: product.category,
    customAttributes: product.customAttributes,
  }));

  const route = segments.join("/");
  const isBlog = route === "blog" && features.blog;
  const isCatalog = route === "catalog" && features.catalog;
  const blogSlug = segments[0] === "blog" && segments[1] ? segments[1] : null;

  const currentPage =
    !isBlog && !isCatalog && !blogSlug
      ? navPages.find((page) => page.slug === route) ??
        (route === "" ? navPages.find((page) => page.isHomepage) ?? navPages[0] : undefined)
      : undefined;

  const pageBlocks = currentPage
    ? await db
        .select()
        .from(blocks)
        .where(and(eq(blocks.pageId, currentPage.id), eq(blocks.isVisible, true)))
        .orderBy(asc(blocks.position))
    : [];

  const posts =
    (isBlog || blogSlug) && features.blog
      ? await db
          .select()
          .from(blogPosts)
          .where(
            and(
              eq(blogPosts.siteId, site.id),
              eq(blogPosts.status, "published"),
              eq(blogPosts.language, language)
            )
          )
          .orderBy(desc(blogPosts.publishedAt))
      : [];

  const singlePost = blogSlug ? posts.find((post) => post.slug === blogSlug) : undefined;
  const languageTargets = await Promise.all(
    supported.map(async (code) => {
      const targetPrefix = publicLanguagePrefix(root, code, defaultLanguage);
      if (!segments.length) return publicPath(targetPrefix);
      if (segments[0] === "catalog") return publicPath(targetPrefix, "catalog");
      if (segments[0] === "blog") {
        if (segments.length === 1) return publicPath(targetPrefix, "blog");
        const targetPost = await db
          .select({ slug: blogPosts.slug })
          .from(blogPosts)
          .where(and(eq(blogPosts.siteId, site.id), eq(blogPosts.slug, segments[1]), eq(blogPosts.language, code), eq(blogPosts.status, "published")))
          .limit(1);
        return targetPost[0] ? publicPath(targetPrefix, `blog/${targetPost[0].slug}`) : publicPath(targetPrefix, "blog");
      }
      const targetPage = await db
        .select({ slug: pages.slug })
        .from(pages)
        .where(and(eq(pages.siteId, site.id), eq(pages.slug, route), eq(pages.language, code), eq(pages.status, "published")))
        .limit(1);
      return targetPage[0] ? publicPath(targetPrefix, targetPage[0].slug) : publicPath(targetPrefix);
    })
  );
  const categories = Array.from(
    new Set(publicProducts.map((product) => product.category).filter(Boolean))
  ) as string[];

  return (
    <div className="site-root min-h-screen" style={themeStyle(theme)}>
      <header
        className="site-surface sticky top-0 z-40 border-b"
        style={{ borderColor: "var(--c-border)" }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
          <Link href={href("")} className="site-heading text-[17px] font-semibold">
            {site.name}
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13.5px]">
            {navPages.map((page) => (
              <Link
                key={page.id}
                href={href(page.slug)}
                className="transition hover:opacity-70"
                style={{ color: currentPage?.id === page.id ? "var(--c-primary)" : "var(--c-muted)" }}
              >
                {page.title}
              </Link>
            ))}
            {features.blog && (
              <Link
                href={href("blog")}
                className="transition hover:opacity-70"
                style={{ color: isBlog ? "var(--c-primary)" : "var(--c-muted)" }}
              >
                Blog
              </Link>
            )}
            {features.catalog && (
              <Link
                href={href("catalog")}
                className="transition hover:opacity-70"
                style={{ color: isCatalog ? "var(--c-primary)" : "var(--c-muted)" }}
              >
                {t.catalog.title}
              </Link>
            )}
          </nav>

          {supported.length > 1 && (
            <div className="ml-auto flex items-center gap-1 text-[12px]">
              {supported.map((code, index) => {
                const target = languageTargets[index];
                return (
                  <Link
                    key={code}
                    href={target || "/"}
                    className="rounded-md px-2 py-1 uppercase transition"
                    style={{
                      background: code === language ? "var(--c-primary)" : "transparent",
                      color: code === language ? "var(--c-on-primary)" : "var(--c-muted)",
                    }}
                  >
                    {code}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <main>
        {singlePost ? (
          <article className="mx-auto max-w-3xl px-6 py-16">
            <Link href={href("blog")} className="site-muted text-[13px]">
              ← Blog
            </Link>
            <h1 className="site-heading mt-6 text-[34px] font-semibold leading-tight">
              {singlePost.title}
            </h1>
            <p className="site-muted mt-2 text-[13px]">
              {formatDate(singlePost.publishedAt, `${locale}-FR`)}
              {singlePost.category ? ` · ${singlePost.category}` : ""}
            </p>
            {singlePost.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={singlePost.coverImage} alt="" className="mt-8 w-full rounded-xl object-cover" />
            )}
            <div className="mt-8 space-y-4 text-[15.5px] leading-[1.8]">
              {singlePost.content
                .split("\n")
                .filter((line) => line.trim())
                .map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
            </div>
          </article>
        ) : isBlog ? (
          <section className="mx-auto max-w-5xl px-6 py-16">
            <h1 className="site-heading text-[32px] font-semibold">Blog</h1>
            {posts.length === 0 ? (
              <p className="site-muted mt-8 text-sm">{t.publicSite.noPosts}</p>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={href(`blog/${post.slug}`)}
                    className="site-card overflow-hidden"
                  >
                    {post.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt="" className="h-40 w-full object-cover" />
                    )}
                    <div className="p-5">
                      <p className="site-muted text-[12px]">
                        {formatDate(post.publishedAt, `${locale}-FR`)}
                      </p>
                      <h2 className="site-heading mt-1.5 text-[17px] font-semibold">{post.title}</h2>
                      {post.excerpt && (
                        <p className="site-muted mt-2 line-clamp-3 text-[13.5px] leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : isCatalog ? (
          <section className="mx-auto max-w-5xl px-6 py-16">
            <h1 className="site-heading text-[32px] font-semibold">{t.catalog.title}</h1>
            {categories.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="site-muted">{t.publicSite.filters} :</span>
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full px-3 py-1"
                    style={{ background: "var(--c-surface)" }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
            {publicProducts.length === 0 ? (
              <p className="site-muted mt-8 text-sm">{t.publicSite.noProducts}</p>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {publicProducts.map((product) => {
                  const image = Array.isArray(product.images) ? String(product.images[0] ?? "") : "";
                  const attributes = (product.customAttributes as Record<string, string>) ?? {};
                  return (
                    <article key={product.id} className="site-card overflow-hidden">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={product.name} className="h-44 w-full object-cover" />
                      ) : (
                        <div className="h-44 w-full" style={{ background: "var(--c-surface)" }} />
                      )}
                      <div className="p-5">
                        <h2 className="site-heading text-[16px] font-semibold">{product.name}</h2>
                        {product.description && (
                          <p className="site-muted mt-1.5 text-[13.5px] leading-relaxed">
                            {product.description}
                          </p>
                        )}
                        {Object.keys(attributes).length > 0 && (
                          <dl className="mt-3 space-y-1 text-[12.5px]">
                            {Object.entries(attributes).map(([key, value]) => (
                              <div key={key} className="flex justify-between gap-3">
                                <dt className="site-muted">{key}</dt>
                                <dd>{String(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        {product.price !== null && (
                          <p className="mt-3 text-[15px] font-semibold">
                            {formatPrice(product.price, product.currency ?? "EUR", `${locale}-FR`)}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : currentPage ? (
          pageBlocks.length === 0 ? (
            <section className="mx-auto max-w-3xl px-6 py-24 text-center">
              <h1 className="site-heading text-[30px] font-semibold">{currentPage.title}</h1>
            </section>
          ) : (
            pageBlocks.map((block) => (
              <BlockView
                key={block.id}
                type={block.type}
                content={(block.content as Record<string, unknown>) ?? {}}
                ctx={{
                  siteId: site.id,
                  pageId: currentPage.id,
                  locale,
                  products: publicProducts,
                  publicPrefix: prefix,
                }}
              />
            ))
          )
        ) : (
          <section className="mx-auto max-w-3xl px-6 py-24 text-center">
            <h1 className="site-heading text-[26px] font-semibold">{t.publicSite.pageNotFound}</h1>
            <Link href={href("")} className="site-muted mt-3 inline-block text-sm underline">
              {site.name}
            </Link>
          </section>
        )}
      </main>

      <footer
        className="site-surface border-t px-6 py-10 text-center text-[13px]"
        style={{ borderColor: "var(--c-border)", color: "var(--c-muted)" }}
      >
        <p>
          © {new Date().getFullYear()} {site.name} — {t.publicSite.poweredBy} Batiste
        </p>
      </footer>
    </div>
  );
}
