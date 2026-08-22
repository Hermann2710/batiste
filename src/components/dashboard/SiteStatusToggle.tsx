"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleSiteStatusAction } from "@/actions/sites";
import { Button } from "@/components/ui";
import { useI18n } from "@/i18n/client";

export default function SiteStatusToggle({
  siteId,
  status,
}: {
  siteId: string;
  status: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const published = status === "published";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-zinc-500">
        {published ? t.dashboard.sitePublished : t.dashboard.publishSiteHint}
      </span>
      <Button
        variant={published ? "outline" : "primary"}
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleSiteStatusAction(siteId);
            if (result.ok) {
              toast.success(t.common.savedToast);
              router.refresh();
            } else toast.error(t.common.genericError);
          })
        }
      >
        {published ? t.common.unpublish : t.common.publish}
      </Button>
    </div>
  );
}
