"use client";

import { useI18n } from "@/i18n/client";
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  PageHeader,
  StatTile,
} from "@/components/ui";
import type { AnalyticsSummary } from "@/actions/analytics";

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
      <div
        className="h-full rounded-full bg-zinc-900 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SparkLine({ data }: { data: { date: string; views: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.views), 1);
  return (
    <div className="flex h-16 items-end gap-px">
      {data.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.views}`}
          className="flex-1 rounded-sm bg-zinc-900 opacity-80 transition-all hover:opacity-100"
          style={{ height: `${Math.max(4, (d.views / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export default function AnalyticsDashboard({
  summary,
}: {
  summary: AnalyticsSummary;
}) {
  const { t } = useI18n();
  const maxViews = Math.max(...summary.topPages.map((p) => p.views), 1);

  return (
    <div>
      <PageHeader
        title={t.analytics.title}
        description={t.analytics.subtitle}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile label={t.analytics.totalViews} value={summary.totalViews} />
        <StatTile
          label={t.analytics.uniqueVisitors}
          value={summary.uniqueVisitors}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader
            title={t.analytics.dailyViews}
            description={t.analytics.last30days}
          />
          <CardBody>
            {summary.dailyViews.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-zinc-400">
                {t.analytics.noData}
              </p>
            ) : (
              <SparkLine data={summary.dailyViews} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t.analytics.topPages} />
          <CardBody>
            {summary.topPages.length === 0 ? (
              <EmptyState title={t.analytics.noData} />
            ) : (
              <ul className="space-y-3">
                {summary.topPages.map((page) => (
                  <li key={page.path}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate font-mono text-[12px] text-zinc-700">
                        {page.path || "/"}
                      </span>
                      <span className="shrink-0 text-[12px] text-zinc-500">
                        {page.views} {t.analytics.views}
                      </span>
                    </div>
                    <MiniBar value={page.views} max={maxViews} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
