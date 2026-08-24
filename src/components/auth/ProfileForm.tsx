"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/auth";
import { Button, Card, CardBody, Field, ImageUpload, Input, PageHeader } from "@/components/ui";
import { useI18n } from "@/i18n/client";

export default function ProfileForm() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  if (status === "loading" || !session?.user) return null;
  const [firstName = "", ...lastNames] = (session.user.name ?? "").split(" ");
  return <ProfileEditor key={session.user.id} email={session.user.email ?? ""} initial={{ firstName, lastName: lastNames.join(" "), avatarUrl: session.user.image ?? "" }} t={t} />;
}

function ProfileEditor({ email, initial, t }: { email: string; initial: { firstName: string; lastName: string; avatarUrl: string }; t: ReturnType<typeof useI18n>["t"] }) {
  const { update } = useSession();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  const save = () => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.set(key, value));
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (!result.ok) {
        toast.error(result.error === "validation" ? t.validation.invalidEmail : t.common.genericError);
        return;
      }
      await update({ name: `${form.firstName} ${form.lastName}`.trim(), image: form.avatarUrl || null });
      toast.success(t.common.savedToast);
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl animate-rise">
      <PageHeader title={t.profile.title} description={t.profile.subtitle} action={<Button loading={pending} onClick={save}>{pending ? t.common.saving : t.common.save}</Button>} />
      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-5">
            {form.avatarUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={form.avatarUrl} alt="" className="size-16 rounded-2xl object-cover" /> : <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-900 text-xl font-semibold text-white">{form.firstName.slice(0, 1).toUpperCase() || "B"}</div>}
            <div><p className="text-sm font-semibold text-zinc-950">{email}</p><p className="mt-1 text-xs text-zinc-500">{t.profile.account}</p></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.auth.firstName}><Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></Field>
            <Field label={t.auth.lastName}><Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></Field>
          </div>
          <Field label={t.profile.avatarUrl} hint={t.profile.avatarHint}><ImageUpload value={form.avatarUrl} onChange={(avatarUrl) => setForm({ ...form, avatarUrl })} /></Field>
        </CardBody>
      </Card>
    </div>
  );
}
