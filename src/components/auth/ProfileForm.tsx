"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { changePasswordAction, updateProfileAction } from "@/actions/auth";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  ImageUpload,
  Input,
  PageHeader,
} from "@/components/ui";
import { useI18n } from "@/i18n/client";

export default function ProfileForm() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  if (status === "loading" || !session?.user) return null;
  const [firstName = "", ...lastNames] = (session.user.name ?? "").split(" ");
  return (
    <ProfileEditor
      key={session.user.id}
      email={session.user.email ?? ""}
      initial={{
        firstName,
        lastName: lastNames.join(" "),
        avatarUrl: session.user.image ?? "",
      }}
      t={t}
    />
  );
}

function ProfileEditor({
  email,
  initial,
  t,
}: {
  email: string;
  initial: { firstName: string; lastName: string; avatarUrl: string };
  t: ReturnType<typeof useI18n>["t"];
}) {
  const { update } = useSession();
  const [pending, startTransition] = useTransition();
  const [pwPending, startPwTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });

  const saveProfile = () => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.set(key, value));
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (!result.ok) {
        toast.error(t.common.genericError);
        return;
      }
      await update({
        name: `${form.firstName} ${form.lastName}`.trim(),
        image: form.avatarUrl || null,
      });
      toast.success(t.common.savedToast);
    });
  };

  const savePassword = () => {
    if (!pw.currentPassword || pw.newPassword.length < 8) {
      toast.error(t.validation.passwordTooShort);
      return;
    }
    const data = new FormData();
    data.set("currentPassword", pw.currentPassword);
    data.set("newPassword", pw.newPassword);
    startPwTransition(async () => {
      const result = await changePasswordAction(data);
      if (!result.ok) {
        toast.error(
          (result.error as string) === "invalid_credentials"
            ? t.profile.wrongPassword
            : t.common.genericError,
        );
        return;
      }
      setPw({ currentPassword: "", newPassword: "" });
      toast.success(t.profile.passwordChanged);
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 animate-rise">
      <PageHeader title={t.profile.title} description={t.profile.subtitle} />

      {/* Personal info */}
      <Card>
        <CardHeader
          title={t.profile.personalInfo}
          action={
            <Button size="sm" loading={pending} onClick={saveProfile}>
              {pending ? t.common.saving : t.common.save}
            </Button>
          }
        />
        <CardBody className="space-y-5">
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-5">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt=""
                className="size-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-900 text-xl font-semibold text-white">
                {form.firstName.slice(0, 1).toUpperCase() || "B"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-950">{email}</p>
              <p className="mt-1 text-xs text-zinc-500">{t.profile.account}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.auth.firstName}>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </Field>
            <Field label={t.auth.lastName}>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </Field>
          </div>

          <Field label={t.profile.avatarUrl} hint={t.profile.avatarHint}>
            <ImageUpload
              value={form.avatarUrl}
              onChange={(avatarUrl) => setForm({ ...form, avatarUrl })}
            />
          </Field>
        </CardBody>
      </Card>

      {/* Security / password */}
      <Card>
        <CardHeader
          title={t.profile.security}
          action={
            <Button size="sm" loading={pwPending} onClick={savePassword}>
              {pwPending ? t.common.saving : t.profile.changePassword}
            </Button>
          }
        />
        <CardBody className="space-y-4">
          <Field label={t.profile.currentPassword}>
            <Input
              type="password"
              value={pw.currentPassword}
              onChange={(e) =>
                setPw({ ...pw, currentPassword: e.target.value })
              }
              autoComplete="current-password"
            />
          </Field>
          <Field label={t.profile.newPassword} hint={t.auth.passwordHint}>
            <Input
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
        </CardBody>
      </Card>
    </div>
  );
}
