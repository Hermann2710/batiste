"use server";

import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEvents, sites } from "@/db/schema";
import { assertSiteAccess } from "@/lib/guards";

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  dailyViews: { date: string; views: number }[];
}

export async function getAnalyticsSummary(
  siteId: string,
  days = 30
): Promise<AnalyticsSummary> {
  await assertSiteAccess(siteId);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const [totals] = await db
    .select({
      totalViews: count(),
      uniqueVisitors: sql<number>`count(distinct ${analyticsEvents.visitorId})::int`,
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.siteId, siteId), gte(analyticsEvents.createdAt, since)));

  const topPages = await db
    .select({ path: analyticsEvents.path, views: count() })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.siteId, siteId), gte(analyticsEvents.createdAt, since)))
    .groupBy(analyticsEvents.path)
    .orderBy(desc(count()))
    .limit(10);

  const dailyRows = await db
    .select({
      date: sql<string>`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`,
      views: count(),
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.siteId, siteId), gte(analyticsEvents.createdAt, since)))
    .groupBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`);

  return {
    totalViews: totals?.totalViews ?? 0,
    uniqueVisitors: totals?.uniqueVisitors ?? 0,
    topPages,
    dailyViews: dailyRows,
  };
}

/** Appelé depuis le site public pour tracker une visite. */
export async function trackPageView(subdomain: string, path: string, visitorId: string) {
  const [site] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.subdomain, subdomain))
    .limit(1);
  if (!site) return;

  await db.insert(analyticsEvents).values({ siteId: site.id, path, visitorId });
}
