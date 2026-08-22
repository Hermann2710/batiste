"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePostAction, upsertPostAction } from "@/actions/catalog";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { formatDate } from "@/lib/utils";
import type { Locale } from "@/i18n/messages";

export interface ManagedPost {
  id: string;
  title: string;
  slug: string;
  language: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  coverImage: string | null;
  status: string;
  publishedAt: Date | string | null;
}

export default function BlogManager({
  siteId,
  posts,
  languages,
  defaultLanguage,
}: {
  siteId: string;
  posts: ManagedPost[];
  languages: string[];
  defaultLanguage: string;
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState({
    postId: undefined as string | undefined,
    title: "",
    excerpt: "",
    content: "",
    category: "",
    coverImage: "",
    language: defaultLanguage,
    status: "draft" as "draft" | "published",
  });

  const openCreate = () => {
    setDraft({
      postId: undefined,
      title: "",
      excerpt: "",
      content: "",
      category: "",
      coverImage: "",
      language: defaultLanguage,
      status: "draft",
    });
    setOpen(true);
  };

  const openEdit = (post: ManagedPost) => {
    setDraft({
      postId: post.id,
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: post.content,
      category: post.category ?? "",
      coverImage: post.coverImage ?? "",
      language: post.language,
      status: post.status === "published" ? "published" : "draft",
    });
    setOpen(true);
  };

  const save = (status: "draft" | "published") =>
    startTransition(async () => {
      const result = await upsertPostAction({
        postId: draft.postId,
        siteId,
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim() || undefined,
        content: draft.content,
        category: draft.category.trim() || undefined,
        coverImage: draft.coverImage.trim() || undefined,
        language: draft.language as Locale,
        status,
      });
      if (result.ok) {
        toast.success(draft.postId ? t.blog.postUpdated : t.blog.postCreated);
        setOpen(false);
      } else toast.error(t.common.genericError);
    });

  return (
    <div>
      <PageHeader
        title={t.blog.title}
        description={t.blog.subtitle}
        action={<Button onClick={openCreate}>+ {t.blog.newPost}</Button>}
      />

      {posts.length === 0 ? (
        <EmptyState
          icon="¶"
          title={t.blog.noPosts}
          action={<Button onClick={openCreate}>{t.blog.newPost}</Button>}
        />
      ) : (
        <div className="space-y-2.5">
          {posts.map((post) => (
            <Card key={post.id} className="flex items-center gap-4 px-5 py-4">
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImage}
                  alt=""
                  className="size-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-400">
                  ¶
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[14px] font-medium text-zinc-900">{post.title}</p>
                  <Badge tone={post.status === "published" ? "success" : "neutral"}>
                    {post.status === "published" ? t.common.published : t.common.draft}
                  </Badge>
                  <Badge tone="info">{post.language.toUpperCase()}</Badge>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[12.5px] text-zinc-500">
                  {post.excerpt || post.content.slice(0, 120)}
                </p>
                <p className="mt-1 text-[11.5px] text-zinc-400">
                  {post.category ? `${post.category} · ` : ""}
                  {post.publishedAt ? formatDate(post.publishedAt, `${locale}-FR`) : t.common.draft}
                </p>
              </div>
              <div className="flex gap-1">
                <IconButton label={t.common.edit} onClick={() => openEdit(post)}>
                  ✎
                </IconButton>
                <IconButton
                  label={t.common.delete}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deletePostAction(post.id);
                      if (result.ok) toast.success(t.blog.postDeleted);
                      else toast.error(t.common.genericError);
                    })
                  }
                >
                  ✕
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={draft.postId ? t.blog.editPost : t.blog.newPost}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="outline"
              loading={pending}
              onClick={() => save("draft")}
              disabled={!draft.title.trim()}
            >
              {t.common.draft}
            </Button>
            <Button loading={pending} onClick={() => save("published")} disabled={!draft.title.trim()}>
              {t.common.publish}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={t.blog.postTitle} required>
            <Input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              autoFocus
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t.blog.category}>
              <Input
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              />
            </Field>
            <Field label={t.common.language}>
              <Select
                value={draft.language}
                onChange={(event) => setDraft({ ...draft, language: event.target.value })}
              >
                {languages.map((code) => (
                  <option key={code} value={code}>
                    {code.toUpperCase()}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.blog.coverImage}>
              <Input
                value={draft.coverImage}
                onChange={(event) => setDraft({ ...draft, coverImage: event.target.value })}
                placeholder="https://…"
              />
            </Field>
          </div>

          <Field label={t.blog.excerpt}>
            <Input
              value={draft.excerpt}
              onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}
            />
          </Field>

          <Field label={t.blog.content} hint={t.blog.contentHelp}>
            <Textarea
              rows={12}
              value={draft.content}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
              className="font-mono text-[13px]"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
