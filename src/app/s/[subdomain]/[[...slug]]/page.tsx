import PublicSite, { buildSiteMetadata } from "@/components/site/PublicSite";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string; slug?: string[] }>;
}) {
  const { subdomain } = await params;
  return buildSiteMetadata(subdomain);
}

export default async function SiteCatchAllPage({
  params,
}: {
  params: Promise<{ subdomain: string; slug?: string[] }>;
}) {
  const { subdomain, slug } = await params;
  return <PublicSite subdomain={subdomain} slug={slug ?? []} />;
}
