"use client";

import { toast } from "sonner";
import {
  deleteProductAction,
  toggleProductStatusAction,
} from "@/actions/catalog";
import { Badge, Card, IconButton } from "@/components/ui";
import type { Messages } from "@/i18n/messages";
import { formatPrice } from "@/lib/utils";
import type { ManagedProduct } from "./CatalogManager";

export default function ProductTable({
  products,
  locale,
  t,
  onEdit,
}: {
  products: ManagedProduct[];
  locale: string;
  t: Messages;
  onEdit: (product: ManagedProduct) => void;
}) {
  const action = async (task: Promise<{ ok: boolean }>, success: string) => {
    const result = await task;
    result.ok ? toast.success(success) : toast.error(t.common.genericError);
  };
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/70 text-[12px] uppercase tracking-wide text-zinc-500">
            <tr>
              {[
                t.catalog.name,
                t.catalog.category,
                t.catalog.price,
                t.settings.visibility,
                "",
              ].map((label) => (
                <th key={label} className="px-5 py-3 font-medium">
                  {label}
                </th>
              ))}
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
                  {product.category || "-"}
                </td>
                <td className="px-5 py-3 text-[13px]">
                  {formatPrice(
                    product.price,
                    product.currency ?? "EUR",
                    `${locale}-FR`,
                  ) ?? "-"}
                </td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      action(
                        toggleProductStatusAction(product.id),
                        t.common.savedToast,
                      )
                    }
                  >
                    <Badge
                      tone={
                        product.status === "published" ? "success" : "neutral"
                      }
                    >
                      {product.status === "published"
                        ? t.common.published
                        : t.common.draft}
                    </Badge>
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <IconButton
                      label={t.common.edit}
                      onClick={() => onEdit(product)}
                    >
                      ✎
                    </IconButton>
                    <IconButton
                      label={t.common.delete}
                      onClick={() =>
                        action(
                          deleteProductAction(product.id),
                          t.catalog.productDeleted,
                        )
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
      </div>
    </Card>
  );
}
