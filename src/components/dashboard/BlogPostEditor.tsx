"use client";

import {
  Button,
  Field,
  ImageUpload,
  Input,
  Modal,
  Select,
  Textarea,
} from "@/components/ui";
import type { Messages } from "@/i18n/messages";

export interface PostDraft {
  postId?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  language: string;
  status: "draft" | "published";
}

export default function BlogPostEditor({
  open,
  draft,
  languages,
  pending,
  siteId,
  t,
  onClose,
  onChange,
  onSave,
}: {
  open: boolean;
  draft: PostDraft;
  languages: string[];
  pending: boolean;
  siteId: string;
  t: Messages;
  onClose: () => void;
  onChange: (draft: PostDraft) => void;
  onSave: (status: PostDraft["status"]) => void;
}) {
  const update = (values: Partial<PostDraft>) =>
    onChange({ ...draft, ...values });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={draft.postId ? t.blog.editPost : t.blog.newPost}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            variant="outline"
            loading={pending}
            onClick={() => onSave("draft")}
            disabled={!draft.title.trim()}
          >
            {t.common.draft}
          </Button>
          <Button
            loading={pending}
            onClick={() => onSave("published")}
            disabled={!draft.title.trim()}
          >
            {t.common.publish}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t.blog.postTitle} required>
          <Input
            value={draft.title}
            onChange={(event) => update({ title: event.target.value })}
            autoFocus
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t.blog.category}>
            <Input
              value={draft.category}
              onChange={(event) => update({ category: event.target.value })}
            />
          </Field>
          <Field label={t.common.language}>
            <Select
              value={draft.language}
              onChange={(event) => update({ language: event.target.value })}
            >
              {languages.map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.blog.coverImage}>
            <ImageUpload
              siteId={siteId}
              value={draft.coverImage}
              onChange={(coverImage) => update({ coverImage })}
            />
          </Field>
        </div>
        <Field label={t.blog.excerpt}>
          <Input
            value={draft.excerpt}
            onChange={(event) => update({ excerpt: event.target.value })}
          />
        </Field>
        <Field label={t.blog.content} hint={t.blog.contentHelp}>
          <Textarea
            rows={12}
            value={draft.content}
            onChange={(event) => update({ content: event.target.value })}
            className="font-mono text-[13px]"
          />
        </Field>
      </div>
    </Modal>
  );
}
