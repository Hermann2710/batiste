"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addBlockAction,
  createPageAction,
  deleteBlockAction,
  deletePageAction,
  duplicateBlockAction,
  reorderBlocksAction,
  toggleBlockVisibilityAction,
  updateBlockContentAction,
  updatePageAction,
} from "@/actions/content";
import { BLOCK_REGISTRY, BLOCK_TYPES, getBlockDef, type FieldDef } from "@/lib/blocks";
import { Badge, Button, Card, EmptyState, Field, IconButton, Input, Modal, Select, Switch, Textarea } from "@/components/ui";
import BlockView, { type PublicProduct } from "@/components/site/BlockView";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { themeStyle } from "@/lib/themes";
import type { Locale } from "@/i18n/messages";

export interface BuilderBlock {
  id: string;
  type: string;
  position: number;
  isVisible: boolean;
  content: Record<string, unknown>;
}

export interface BuilderPage {
  id: string;
  title: string;
  slug: string;
  language: string;
  status: string;
  isHomepage: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  blocks: BuilderBlock[];
}

interface Props {
  siteId: string;
  pages: BuilderPage[];
  languages: string[];
  defaultLanguage: string;
  theme: { colors: unknown; fonts: unknown; borderRadius: string | null };
  products: PublicProduct[];
  features: Record<string, boolean>;
}

export default function PageBuilder({
  siteId,
  pages,
  languages,
  defaultLanguage,
  theme,
  products,
  features,
}: Props) {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();

  const [language, setLanguage] = useState(
    languages.includes(defaultLanguage) ? defaultLanguage : languages[0] ?? "fr"
  );
  const visiblePages = useMemo(
    () => pages.filter((page) => page.language === language),
    [pages, language]
  );

  const [activePageId, setActivePageId] = useState<string | null>(visiblePages[0]?.id ?? null);
  const activePage = pages.find((page) => page.id === activePageId) ?? visiblePages[0] ?? null;

  const [blocks, setBlocks] = useState<BuilderBlock[]>(activePage?.blocks ?? []);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [view, setView] = useState<"structure" | "preview">("structure");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;

  const selectLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    const nextPage = pages.find((page) => page.language === nextLanguage);
    setActivePageId(nextPage?.id ?? null);
    setBlocks(nextPage?.blocks ?? []);
    setSelectedBlockId(null);
  };

  const selectPage = (page: BuilderPage) => {
    setActivePageId(page.id);
    setBlocks(page.blocks);
    setSelectedBlockId(null);
  };

  /* ------------------------------------------------------------- helpers */

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, successMessage?: string) =>
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        if (successMessage) toast.success(successMessage);
      } else {
        toast.error(t.common.genericError);
      }
    });

  /* -------------------------------------------------------- block edition */

  const patchBlockContent = (blockId: string, content: Record<string, unknown>) => {
    setBlocks((current) =>
      current.map((block) => (block.id === blockId ? { ...block, content } : block))
    );
    void updateBlockContentAction(blockId, content).then((result) => {
      if (!result.ok) toast.error(t.common.genericError);
    });
  };

  const handleDrop = (targetIndex: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === targetIndex || !activePage) return;

    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    setBlocks(next.map((block, index) => ({ ...block, position: index })));
    run(() => reorderBlocksAction(activePage.id, next.map((block) => block.id)));
  };

  /* ------------------------------------------------------------ renderers */

  const renderField = (
    field: FieldDef,
    value: unknown,
    onChange: (next: unknown) => void,
    keyPrefix = ""
  ) => {
    const label = t.fields[field.labelKey] ?? field.key;

    if (field.type === "boolean") {
      return (
        <div key={keyPrefix + field.key} className="flex items-center justify-between py-1">
          <span className="text-[13px] font-medium text-zinc-700">{label}</span>
          <Switch checked={Boolean(value)} onChange={onChange} label={label} />
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <Field key={keyPrefix + field.key} label={label}>
          <Select value={String(value ?? field.options?.[0] ?? "")} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      );
    }

    if (field.type === "number") {
      return (
        <Field key={keyPrefix + field.key} label={label}>
          <Input
            type="number"
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
        </Field>
      );
    }

    if (field.type === "textarea") {
      return (
        <Field key={keyPrefix + field.key} label={label}>
          <Textarea rows={4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    }

    if (field.type === "list") {
      const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      return (
        <div key={keyPrefix + field.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-zinc-700">{label}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                onChange([
                  ...items,
                  Object.fromEntries((field.itemFields ?? []).map((sub) => [sub.key, ""])),
                ])
              }
            >
              + {t.pages.addItem}
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    {t.pages.item} {index + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <IconButton
                      label={t.pages.moveUp}
                      disabled={index === 0}
                      onClick={() => {
                        const next = [...items];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        onChange(next);
                      }}
                    >
                      ↑
                    </IconButton>
                    <IconButton
                      label={t.pages.moveDown}
                      disabled={index === items.length - 1}
                      onClick={() => {
                        const next = [...items];
                        [next[index + 1], next[index]] = [next[index], next[index + 1]];
                        onChange(next);
                      }}
                    >
                      ↓
                    </IconButton>
                    <IconButton
                      label={t.common.delete}
                      onClick={() => onChange(items.filter((_, i) => i !== index))}
                    >
                      ✕
                    </IconButton>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {(field.itemFields ?? []).map((sub) =>
                    renderField(
                      sub,
                      item[sub.key],
                      (next) => {
                        const copy = [...items];
                        copy[index] = { ...copy[index], [sub.key]: next };
                        onChange(copy);
                      },
                      `${keyPrefix}${field.key}-${index}-`
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Field key={keyPrefix + field.key} label={label}>
        <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      </Field>
    );
  };

  /* ----------------------------------------------------------------- JSX */

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900">{t.pages.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t.pages.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {languages.length > 1 && (
            <Select
              className="h-10 w-auto py-0"
              value={language}
              onChange={(event) => selectLanguage(event.target.value)}
            >
              {languages.map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </Select>
          )}
          <Button variant="outline" onClick={() => setNewPageOpen(true)}>
            + {t.pages.newPage}
          </Button>
          {activePage && (
            <Button
              loading={pending}
              onClick={() =>
                run(
                  () =>
                    updatePageAction({
                      pageId: activePage.id,
                      status: activePage.status === "published" ? "draft" : "published",
                    }),
                  activePage.status === "published" ? t.pages.pageUnpublished : t.pages.pagePublished
                )
              }
            >
              {activePage.status === "published" ? t.common.unpublish : t.common.publish}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[210px_minmax(0,1fr)_320px]">
        {/* Pages */}
        <Card className="h-fit p-2">
          {visiblePages.length === 0 ? (
            <p className="px-2 py-6 text-center text-[13px] text-zinc-400">{t.pages.noPages}</p>
          ) : (
            <ul className="space-y-0.5">
              {visiblePages.map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => selectPage(page)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left transition-colors",
                      page.id === activePage?.id ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
                    )}
                  >
                    <span className="block truncate text-[13px] font-medium">{page.title}</span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate font-mono text-[11px]",
                        page.id === activePage?.id ? "text-white/60" : "text-zinc-400"
                      )}
                    >
                      /{page.slug}
                      {page.status === "published" ? " · ●" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Center */}
        <div className="min-w-0 space-y-3">
          {activePage ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-0.5">
                  {(["structure", "preview"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setView(mode)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[13px] font-medium transition",
                        view === mode ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
                      )}
                    >
                      {mode === "structure" ? t.pages.blocks : t.pages.livePreview}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={activePage.status === "published" ? "success" : "neutral"}>
                    {activePage.status === "published" ? t.common.published : t.common.draft}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => setPageSettingsOpen(true)}>
                    {t.common.edit}
                  </Button>
                </div>
              </div>

              {view === "structure" ? (
                <Card className="p-3">
                  {blocks.length === 0 ? (
                    <EmptyState
                      title={t.pages.noBlocks}
                      action={<Button onClick={() => setLibraryOpen(true)}>{t.pages.addBlock}</Button>}
                    />
                  ) : (
                    <ul className="space-y-1.5">
                      {blocks.map((block, index) => {
                        const def = getBlockDef(block.type);
                        return (
                          <li
                            key={block.id}
                            draggable
                            onDragStart={() => (dragIndex.current = index)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => handleDrop(index)}
                            onClick={() => setSelectedBlockId(block.id)}
                            className={cn(
                              "group flex cursor-grab items-center gap-3 rounded-xl border px-3 py-2.5 transition active:cursor-grabbing",
                              selectedBlockId === block.id
                                ? "border-zinc-900 bg-zinc-50"
                                : "border-zinc-200 hover:border-zinc-300"
                            )}
                          >
                            <span className="text-zinc-300">⠿</span>
                            <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-[12px] text-white">
                              {def?.icon ?? "▪"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-zinc-900">
                                {t.blocks[block.type as keyof typeof t.blocks] ?? block.type}
                              </p>
                              <p className="truncate text-[12px] text-zinc-400">
                                {String(block.content.title ?? "—")}
                              </p>
                            </div>
                            {!block.isVisible && <Badge>{t.pages.hidden}</Badge>}
                            <div className="flex items-center opacity-0 transition group-hover:opacity-100">
                              <IconButton
                                label={t.pages.visible}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setBlocks((current) =>
                                    current.map((item) =>
                                      item.id === block.id
                                        ? { ...item, isVisible: !item.isVisible }
                                        : item
                                    )
                                  );
                                  run(() => toggleBlockVisibilityAction(block.id));
                                }}
                              >
                                {block.isVisible ? "◉" : "◌"}
                              </IconButton>
                              <IconButton
                                label={t.pages.duplicate}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  run(() => duplicateBlockAction(block.id));
                                }}
                              >
                                ⧉
                              </IconButton>
                              <IconButton
                                label={t.common.delete}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setBlocks((current) =>
                                    current.filter((item) => item.id !== block.id)
                                  );
                                  if (selectedBlockId === block.id) setSelectedBlockId(null);
                                  run(() => deleteBlockAction(block.id), t.pages.blockDeleted);
                                }}
                              >
                                ✕
                              </IconButton>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {blocks.length > 0 && (
                    <button
                      onClick={() => setLibraryOpen(true)}
                      className="mt-2 w-full rounded-xl border border-dashed border-zinc-300 py-3 text-[13px] font-medium text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-900"
                    >
                      + {t.pages.addBlock}
                    </button>
                  )}
                </Card>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                  <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-2">
                    <span className="size-2.5 rounded-full bg-zinc-300" />
                    <span className="size-2.5 rounded-full bg-zinc-300" />
                    <span className="size-2.5 rounded-full bg-zinc-300" />
                  </div>
                  <div className="scroll-slim max-h-[70vh] overflow-y-auto" style={themeStyle(theme)}>
                    {blocks
                      .filter((block) => block.isVisible)
                      .map((block) => (
                        <BlockView
                          key={block.id}
                          type={block.type}
                          content={block.content}
                          ctx={{
                            siteId,
                            pageId: activePage.id,
                            locale: locale as Locale,
                            products,
                            preview: true,
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title={t.pages.selectPage}
              action={<Button onClick={() => setNewPageOpen(true)}>{t.pages.newPage}</Button>}
            />
          )}
        </div>

        {/* Inspector */}
        <Card className="h-fit p-4 xl:sticky xl:top-6">
          {selectedBlock ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight">{t.pages.properties}</h3>
                <Badge>{t.blocks[selectedBlock.type as keyof typeof t.blocks] ?? selectedBlock.type}</Badge>
              </div>
              <div className="scroll-slim max-h-[65vh] space-y-3.5 overflow-y-auto pr-1">
                {(getBlockDef(selectedBlock.type)?.fields ?? []).map((field) =>
                  renderField(field, selectedBlock.content[field.key], (next) =>
                    patchBlockContent(selectedBlock.id, {
                      ...selectedBlock.content,
                      [field.key]: next,
                    })
                  )
                )}
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-[13px] text-zinc-400">{t.pages.selectBlock}</p>
          )}
        </Card>
      </div>

      {/* Block library */}
      <Modal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        title={t.pages.blockLibrary}
        size="lg"
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {BLOCK_TYPES.filter((type) => {
            if (type === "product_grid") return features.catalog;
            if (type === "booking_form") return features.booking;
            return true;
          }).map((type) => (
            <button
              key={type}
              onClick={() => {
                if (!activePage) return;
                setLibraryOpen(false);
                run(() => addBlockAction({ pageId: activePage.id, type }), t.pages.blockAdded);
              }}
              className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3.5 text-left transition hover:border-zinc-900 hover:bg-zinc-50"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[13px] text-white">
                {BLOCK_REGISTRY[type].icon}
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-zinc-900">
                  {t.blocks[type]}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500">
                  {t.blocks[`${type}Desc` as keyof typeof t.blocks]}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* New page */}
      <NewPageModal
        open={newPageOpen}
        onClose={() => setNewPageOpen(false)}
        siteId={siteId}
        language={language}
      />

      {/* Page settings */}
      {activePage && (
        <PageSettingsModal
          key={activePage.id}
          open={pageSettingsOpen}
          onClose={() => setPageSettingsOpen(false)}
          page={activePage}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Modals */

function NewPageModal({
  open,
  onClose,
  siteId,
  language,
}: {
  open: boolean;
  onClose: () => void;
  siteId: string;
  language: string;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.pages.newPage}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await createPageAction({
                  siteId,
                  title: title.trim(),
                  slug: slug.trim() || undefined,
                  language: language as "fr" | "en",
                });
                if (result.ok) {
                  toast.success(t.pages.pageCreated);
                  setTitle("");
                  setSlug("");
                  onClose();
                } else {
                  toast.error(
                    result.error === "slug_taken" ? t.pages.pageSlug : t.common.genericError
                  );
                }
              })
            }
            disabled={title.trim().length < 1}
          >
            {t.common.create}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t.pages.pageName} required>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
        </Field>
        <Field label={t.pages.pageSlug} hint={t.pages.slugHelp}>
          <Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="contact" />
        </Field>
      </div>
    </Modal>
  );
}

function PageSettingsModal({
  open,
  onClose,
  page,
}: {
  open: boolean;
  onClose: () => void;
  page: BuilderPage;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page.seoDescription ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.pages.pageName}
      footer={
        <>
          {!page.isHomepage && (
            <Button
              variant="danger"
              onClick={() =>
                startTransition(async () => {
                  const result = await deletePageAction(page.id);
                  if (result.ok) {
                    toast.success(t.pages.pageDeleted);
                    onClose();
                  } else toast.error(t.common.genericError);
                })
              }
            >
              {t.common.delete}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await updatePageAction({
                  pageId: page.id,
                  title,
                  slug,
                  seoTitle: seoTitle || null,
                  seoDescription: seoDescription || null,
                });
                if (result.ok) {
                  toast.success(t.common.savedToast);
                  onClose();
                } else toast.error(t.common.genericError);
              })
            }
          >
            {t.common.save}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t.pages.pageName} required>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        {!page.isHomepage && (
          <Field label={t.pages.pageSlug} hint={t.pages.slugHelp}>
            <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
          </Field>
        )}
        <div className="border-t border-zinc-200 pt-4">
          <p className="mb-3 text-[13px] font-semibold text-zinc-900">{t.pages.seoSection}</p>
          <div className="space-y-3">
            <Field label={t.pages.seoTitle}>
              <Input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
            </Field>
            <Field label={t.pages.seoDescription}>
              <Textarea
                rows={3}
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>
    </Modal>
  );
}
