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
  IconButton,
  PageHeader,
} from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { formatPrice } from "@/lib/utils";
import ProductEditor, { type ProductDraft } from "./ProductEditor";

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

const emptyDraft: ProductDraft = {
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
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
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

      <ProductEditor open={open} draft={draft} pending={pending} t={t} onClose={() => setOpen(false)} onChange={setDraft} onSave={save} />
    </div>
  );
}
