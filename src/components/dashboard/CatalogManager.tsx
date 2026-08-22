"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteProductAction,
  toggleProductStatusAction,
  upsertProductAction,
} from "@/actions/catalog";
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
  Textarea,
} from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { formatPrice } from "@/lib/utils";

export interface ManagedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  images: unknown;
  customAttributes: unknown;
  status: string;
}

const emptyDraft = {
  productId: undefined as string | undefined,
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  attributes: [] as { key: string; value: string }[],
  status: "draft" as "draft" | "published",
};

export default function CatalogManager({
  siteId,
  products,
}: {
  siteId: string;
  products: ManagedProduct[];
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [pending, startTransition] = useTransition();

  const openCreate = () => {
    setDraft(emptyDraft);
    setOpen(true);
  };

  const openEdit = (product: ManagedProduct) => {
    const attributes = Object.entries(
      (product.customAttributes as Record<string, string>) ?? {}
    ).map(([key, value]) => ({ key, value: String(value) }));
    setDraft({
      productId: product.id,
      name: product.name,
      description: product.description ?? "",
      price: product.price !== null ? String(product.price / 100) : "",
      category: product.category ?? "",
      imageUrl: Array.isArray(product.images) ? String(product.images[0] ?? "") : "",
      attributes,
      status: product.status === "published" ? "published" : "draft",
    });
    setOpen(true);
  };

  const save = () =>
    startTransition(async () => {
      const result = await upsertProductAction({
        productId: draft.productId,
        siteId,
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        price: draft.price ? Math.round(Number(draft.price) * 100) : null,
        currency: "EUR",
        category: draft.category.trim() || undefined,
        imageUrl: draft.imageUrl.trim() || undefined,
        customAttributes: Object.fromEntries(
          draft.attributes.filter((entry) => entry.key.trim()).map((entry) => [entry.key.trim(), entry.value])
        ),
        status: draft.status,
      });

      if (result.ok) {
        toast.success(draft.productId ? t.catalog.productUpdated : t.catalog.productCreated);
        setOpen(false);
      } else {
        toast.error(t.common.genericError);
      }
    });

  return (
    <div>
      <PageHeader
        title={t.catalog.title}
        description={t.catalog.subtitle}
        action={<Button onClick={openCreate}>+ {t.catalog.newProduct}</Button>}
      />

      {products.length === 0 ? (
        <EmptyState
          icon="▩"
          title={t.catalog.noProducts}
          action={<Button onClick={openCreate}>{t.catalog.newProduct}</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/70 text-[12px] uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium">{t.catalog.name}</th>
                <th className="px-5 py-3 font-medium">{t.catalog.category}</th>
                <th className="px-5 py-3 font-medium">{t.catalog.price}</th>
                <th className="px-5 py-3 font-medium">{t.settings.visibility}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/60">
                  <td className="px-5 py-3">
                    <p className="font-medium text-zinc-900">{product.name}</p>
                    {product.description && (
                      <p className="mt-0.5 line-clamp-1 text-[12.5px] text-zinc-500">
                        {product.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-zinc-500">
                    {product.category || "—"}
                  </td>
                  <td className="px-5 py-3 text-[13px]">
                    {formatPrice(product.price, product.currency ?? "EUR", `${locale}-FR`) ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          const result = await toggleProductStatusAction(product.id);
                          if (result.ok) toast.success(t.common.savedToast);
                          else toast.error(t.common.genericError);
                        })
                      }
                    >
                      <Badge tone={product.status === "published" ? "success" : "neutral"}>
                        {product.status === "published" ? t.common.published : t.common.draft}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <IconButton label={t.common.edit} onClick={() => openEdit(product)}>
                        ✎
                      </IconButton>
                      <IconButton
                        label={t.common.delete}
                        onClick={() =>
                          startTransition(async () => {
                            const result = await deleteProductAction(product.id);
                            if (result.ok) toast.success(t.catalog.productDeleted);
                            else toast.error(t.common.genericError);
                          })
                        }
                      >
                        ✕
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={draft.productId ? t.catalog.editProduct : t.catalog.newProduct}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button loading={pending} onClick={save} disabled={!draft.name.trim()}>
              {t.common.save}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.catalog.name} required>
              <Input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                autoFocus
              />
            </Field>
            <Field label={t.catalog.category}>
              <Input
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              />
            </Field>
            <Field label={`${t.catalog.price} (€)`}>
              <Input
                type="number"
                step="0.01"
                value={draft.price}
                onChange={(event) => setDraft({ ...draft, price: event.target.value })}
              />
            </Field>
            <Field label={t.catalog.imageUrl}>
              <Input
                value={draft.imageUrl}
                onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })}
                placeholder="https://…"
              />
            </Field>
          </div>

          <Field label={t.catalog.description}>
            <Textarea
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </Field>

          <div className="rounded-xl border border-zinc-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-medium text-zinc-700">
                {t.catalog.customAttributes}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setDraft({ ...draft, attributes: [...draft.attributes, { key: "", value: "" }] })
                }
              >
                + {t.catalog.addAttribute}
              </Button>
            </div>
            <div className="space-y-2">
              {draft.attributes.map((attribute, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={t.catalog.attributeKey}
                    value={attribute.key}
                    onChange={(event) => {
                      const next = [...draft.attributes];
                      next[index] = { ...next[index], key: event.target.value };
                      setDraft({ ...draft, attributes: next });
                    }}
                  />
                  <Input
                    placeholder={t.catalog.attributeValue}
                    value={attribute.value}
                    onChange={(event) => {
                      const next = [...draft.attributes];
                      next[index] = { ...next[index], value: event.target.value };
                      setDraft({ ...draft, attributes: next });
                    }}
                  />
                  <IconButton
                    label={t.common.delete}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        attributes: draft.attributes.filter((_, i) => i !== index),
                      })
                    }
                  >
                    ✕
                  </IconButton>
                </div>
              ))}
              {draft.attributes.length === 0 && (
                <p className="text-[12.5px] text-zinc-400">—</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(["draft", "published"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setDraft({ ...draft, status })}
                className={`rounded-xl border-2 px-4 py-2 text-[13px] font-medium transition ${
                  draft.status === status
                    ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                    : "border-zinc-200 text-zinc-500"
                }`}
              >
                {status === "draft" ? t.common.draft : t.common.published}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
