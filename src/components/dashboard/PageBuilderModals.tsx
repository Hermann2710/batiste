"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createPageAction, deletePageAction, updatePageAction } from "@/actions/content";
import { Button, Field, Input, Modal, Textarea } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import type { BuilderPage } from "./PageBuilder";

export function NewPageModal({ open, onClose, siteId, language }: { open: boolean; onClose: () => void; siteId: string; language: string }) {
  const { t } = useI18n(); const [title, setTitle] = useState(""); const [slug, setSlug] = useState(""); const [pending, startTransition] = useTransition();
  const create = () => startTransition(async () => { const result = await createPageAction({ siteId, title: title.trim(), slug: slug.trim() || undefined, language: language as "fr" | "en" }); if (result.ok) { toast.success(t.pages.pageCreated); setTitle(""); setSlug(""); onClose(); } else toast.error(result.error === "slug_taken" ? t.pages.pageSlug : t.common.genericError); });
  return <Modal open={open} onClose={onClose} title={t.pages.newPage} footer={<><Button variant="ghost" onClick={onClose}>{t.common.cancel}</Button><Button loading={pending} onClick={create} disabled={!title.trim()}>{t.common.create}</Button></>}><div className="space-y-4"><Field label={t.pages.pageName} required><Input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus /></Field><Field label={t.pages.pageSlug} hint={t.pages.slugHelp}><Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="contact" /></Field></div></Modal>;
}

export function PageSettingsModal({ open, onClose, page }: { open: boolean; onClose: () => void; page: BuilderPage }) {
  const { t } = useI18n(); const [title, setTitle] = useState(page.title); const [slug, setSlug] = useState(page.slug); const [seoTitle, setSeoTitle] = useState(page.seoTitle ?? ""); const [seoDescription, setSeoDescription] = useState(page.seoDescription ?? ""); const [pending, startTransition] = useTransition();
  const save = () => startTransition(async () => { const result = await updatePageAction({ pageId: page.id, title, slug, seoTitle: seoTitle || null, seoDescription: seoDescription || null }); if (result.ok) { toast.success(t.common.savedToast); onClose(); } else toast.error(t.common.genericError); });
  const remove = () => startTransition(async () => { const result = await deletePageAction(page.id); if (result.ok) { toast.success(t.pages.pageDeleted); onClose(); } else toast.error(t.common.genericError); });
  return <Modal open={open} onClose={onClose} title={t.pages.pageName} footer={<>{!page.isHomepage && <Button variant="danger" onClick={remove}>{t.common.delete}</Button>}<Button variant="ghost" onClick={onClose}>{t.common.cancel}</Button><Button loading={pending} onClick={save}>{t.common.save}</Button></>}><div className="space-y-4"><Field label={t.pages.pageName} required><Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>{!page.isHomepage && <Field label={t.pages.pageSlug} hint={t.pages.slugHelp}><Input value={slug} onChange={(event) => setSlug(event.target.value)} /></Field>}<div className="border-t border-zinc-200 pt-4"><p className="mb-3 text-[13px] font-semibold text-zinc-900">{t.pages.seoSection}</p><div className="space-y-3"><Field label={t.pages.seoTitle}><Input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} /></Field><Field label={t.pages.seoDescription}><Textarea rows={3} value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} /></Field></div></div></div></Modal>;
}
