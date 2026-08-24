"use client";

import { DEFAULT_THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

export default function ThemePicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {DEFAULT_THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id)}
          className={cn(
            "overflow-hidden rounded-xl border-2 text-left transition",
            selected === theme.id
              ? "border-zinc-900"
              : "border-zinc-200 hover:border-zinc-300",
          )}
        >
          <div
            className="flex h-20 items-end gap-1 p-3"
            style={{ backgroundColor: theme.colors.surface }}
          >
            {theme.swatch.map((color) => (
              <span
                key={color}
                className="size-5 rounded-md ring-1 ring-black/5"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="px-3 py-2.5">
            <p className="text-[13px] font-semibold text-zinc-900">
              {theme.name}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-zinc-500">
              {theme.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
