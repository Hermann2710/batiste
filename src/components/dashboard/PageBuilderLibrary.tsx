"use client";

import { BLOCK_REGISTRY, BLOCK_TYPES } from "@/lib/blocks";
import { Modal } from "@/components/ui";
import { useI18n } from "@/i18n/client";

export function BlockLibrary({ open, onClose, features, onAdd }: { open: boolean; onClose: () => void; features: Record<string, boolean>; onAdd: (type: (typeof BLOCK_TYPES)[number]) => void }) {
  const { t } = useI18n();
  const available = BLOCK_TYPES.filter((type) => type !== "product_grid" || features.catalog).filter((type) => type !== "booking_form" || features.booking);
  return <Modal open={open} onClose={onClose} title={t.pages.blockLibrary} size="lg"><div className="grid gap-2.5 sm:grid-cols-2">{available.map((type) => <button key={type} onClick={() => onAdd(type)} className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3.5 text-left transition hover:border-zinc-900 hover:bg-zinc-50"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[13px] text-white">{BLOCK_REGISTRY[type].icon}</span><span><span className="block text-[13px] font-semibold text-zinc-900">{t.blocks[type]}</span><span className="mt-0.5 block text-[12px] leading-snug text-zinc-500">{t.blocks[`${type}Desc` as keyof typeof t.blocks]}</span></span></button>)}</div></Modal>;
}
