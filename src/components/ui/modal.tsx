"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { IconButton } from "./button";

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; size?: "md" | "lg" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; }; }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(<div role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()} className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-zinc-950/50 p-4 backdrop-blur-sm sm:p-8"><div ref={ref} role="dialog" aria-modal="true" aria-labelledby="modal-title" className={cn("my-auto w-full rounded-2xl border border-zinc-200 bg-white shadow-2xl", size === "lg" ? "max-w-3xl" : "max-w-lg")}><div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4"><div><h2 id="modal-title" className="font-display text-base font-semibold tracking-tight text-zinc-900">{title}</h2>{description && <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p>}</div><IconButton label="close" onClick={onClose}>✕</IconButton></div><div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>{footer && <div className="flex items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50/60 px-6 py-4">{footer}</div>}</div></div>, document.body);
}
