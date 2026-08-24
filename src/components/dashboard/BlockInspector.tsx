"use client";

import {
  Badge,
  Button,
  Field,
  IconButton,
  ImageUpload,
  Input,
  Select,
  Switch,
  Textarea,
} from "@/components/ui";
import { getBlockDef, type FieldDef } from "@/lib/blocks";
import type { Messages } from "@/i18n/messages";
import type { BuilderBlock } from "./PageBuilder";

export default function BlockInspector({
  block,
  siteId,
  t,
  onChange,
}: {
  block: BuilderBlock;
  siteId: string;
  t: Messages;
  onChange: (content: Record<string, unknown>) => void;
}) {
  const renderField = (
    field: FieldDef,
    value: unknown,
    update: (next: unknown) => void,
    prefix = "",
  ): React.ReactNode => {
    const label = t.fields[field.labelKey] ?? field.key;
    if (field.type === "boolean")
      return (
        <div
          key={prefix + field.key}
          className="flex items-center justify-between py-1"
        >
          <span className="text-[13px] font-medium text-zinc-700">{label}</span>
          <Switch checked={Boolean(value)} onChange={update} label={label} />
        </div>
      );
    if (field.type === "select")
      return (
        <Field key={prefix + field.key} label={label}>
          <Select
            value={String(value ?? field.options?.[0] ?? "")}
            onChange={(event) => update(event.target.value)}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      );
    if (field.type === "number")
      return (
        <Field key={prefix + field.key} label={label}>
          <Input
            type="number"
            value={value == null ? "" : String(value)}
            onChange={(event) =>
              update(
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
          />
        </Field>
      );
    if (field.type === "textarea")
      return (
        <Field key={prefix + field.key} label={label}>
          <Textarea
            rows={4}
            value={String(value ?? "")}
            onChange={(event) => update(event.target.value)}
          />
        </Field>
      );
    if (field.type === "url")
      return (
        <Field key={prefix + field.key} label={label}>
          <ImageUpload
            siteId={siteId}
            value={String(value ?? "")}
            onChange={update}
          />
        </Field>
      );
    if (field.type === "list") {
      const items = Array.isArray(value)
        ? (value as Record<string, unknown>[])
        : [];
      return (
        <div key={prefix + field.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-zinc-700">
              {label}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                update([
                  ...items,
                  Object.fromEntries(
                    (field.itemFields ?? []).map((item) => [item.key, ""]),
                  ),
                ])
              }
            >
              + {t.pages.addItem}
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3"
              >
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
                        [next[index - 1], next[index]] = [
                          next[index],
                          next[index - 1],
                        ];
                        update(next);
                      }}
                    >
                      ↑
                    </IconButton>
                    <IconButton
                      label={t.pages.moveDown}
                      disabled={index === items.length - 1}
                      onClick={() => {
                        const next = [...items];
                        [next[index + 1], next[index]] = [
                          next[index],
                          next[index + 1],
                        ];
                        update(next);
                      }}
                    >
                      ↓
                    </IconButton>
                    <IconButton
                      label={t.common.delete}
                      onClick={() =>
                        update(items.filter((_, current) => current !== index))
                      }
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
                      (next) =>
                        update(
                          items.map((current, currentIndex) =>
                            currentIndex === index
                              ? { ...current, [sub.key]: next }
                              : current,
                          ),
                        ),
                      `${prefix}${field.key}-${index}-`,
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <Field key={prefix + field.key} label={label}>
        <Input
          value={String(value ?? "")}
          onChange={(event) => update(event.target.value)}
        />
      </Field>
    );
  };

  const fields = getBlockDef(block.type)?.fields ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">
          {t.pages.properties}
        </h3>
        <Badge>
          {t.blocks[block.type as keyof typeof t.blocks] ?? block.type}
        </Badge>
      </div>
      <div className="scroll-slim max-h-[65vh] space-y-3.5 overflow-y-auto pr-1">
        {fields.map((field) =>
          renderField(field, block.content[field.key], (next) =>
            onChange({ ...block.content, [field.key]: next }),
          ),
        )}
      </div>
    </div>
  );
}
