"use client";

import { toast } from "sonner";
import { deletePostAction } from "@/actions/catalog";
import { Badge, Card, IconButton } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ManagedPost } from "./BlogManager";

export default function BlogPostList({
  posts,
  locale,
  t,
  onEdit,
}: {
  posts: ManagedPost[];
  locale: string;
  t: ReturnType<typeof import("@/i18n/messages").getMessages>;
  onEdit: (post: ManagedPost) => void;
}) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="group flex items-center gap-4 px-4 py-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_30px_-24px_rgba(24,24,27,0.6)] sm:px-5"
        >
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt=""
              className="size-12 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-amber-50 group-hover:text-amber-600">
              ¶
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[14px] font-medium text-zinc-900">
                {post.title}
              </p>
              <Badge tone={post.status === "published" ? "success" : "neutral"}>
                {post.status === "published"
                  ? t.common.published
                  : t.common.draft}
              </Badge>
              <Badge tone="info">{post.language.toUpperCase()}</Badge>
            </div>
            <p className="mt-0.5 line-clamp-1 text-[12.5px] text-zinc-500">
              {post.excerpt || post.content.slice(0, 120)}
            </p>
            <p className="mt-1 text-[11.5px] text-zinc-400">
              {post.category ? `${post.category} · ` : ""}
              {post.publishedAt
                ? formatDate(post.publishedAt, `${locale}-FR`)
                : t.common.draft}
            </p>
          </div>
          <div className="flex shrink-0 gap-1 opacity-70 transition-opacity group-hover:opacity-100">
            <IconButton label={t.common.edit} onClick={() => onEdit(post)}>
              ✎
            </IconButton>
            <IconButton
              label={t.common.delete}
              onClick={async () => {
                const result = await deletePostAction(post.id);
                if (result.ok) toast.success(t.blog.postDeleted);
                else toast.error(t.common.genericError);
              }}
            >
              ✕
            </IconButton>
          </div>
        </Card>
      ))}
    </div>
  );
}
