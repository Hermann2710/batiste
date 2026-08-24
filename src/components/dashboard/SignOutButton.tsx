"use client";

import { useTransition } from "react";
import { signOutAction } from "@/actions/auth";
import { useI18n } from "@/i18n/client";
import { Button } from "@/components/ui";

export default function SignOutButton({
  variant = "outline",
}: {
  variant?: "outline" | "ghost";
}) {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={variant}
      loading={pending}
      onClick={() => startTransition(() => signOutAction(locale))}
    >
      {t.common.logout}
    </Button>
  );
}
