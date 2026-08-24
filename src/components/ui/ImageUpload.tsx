"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./button";

const MAX_SIZE = 10 * 1024 * 1024;

export function ImageUpload({
  value,
  onChange,
  siteId,
  disabled = false,
}: {
  value: string;
  onChange: (url: string) => void;
  siteId?: string;
  disabled?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_SIZE) {
      toast.error("Choisissez une image de moins de 10 Mo.");
      return;
    }
    setUploading(true);
    try {
      const signature = await fetch("/api/uploads/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      if (!signature.ok) throw new Error(await signature.text());
      const fields = (await signature.json()) as {
        cloudName: string;
        apiKey: string;
        timestamp: number;
        folder: string;
        signature: string;
      };
      const data = new FormData();
      data.set("file", file);
      data.set("api_key", fields.apiKey);
      data.set("timestamp", String(fields.timestamp));
      data.set("folder", fields.folder);
      data.set("signature", fields.signature);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${fields.cloudName}/image/upload`,
        { method: "POST", body: data },
      );
      if (!response.ok) throw new Error(await response.text());
      const result = (await response.json()) as { secure_url?: string };
      if (!result.secure_url) throw new Error("missing_url");
      onChange(result.secure_url);
      toast.success("Image téléversée.");
    } catch {
      toast.error(
        "Impossible de téléverser l’image. Vérifiez la configuration Cloudinary.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          loading={uploading}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Téléversement…" : "Téléverser une image"}
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled || uploading}
            onClick={() => onChange("")}
          >
            Retirer
          </Button>
        )}
      </div>
      {value && (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <img src={value} alt="" className="h-32 w-full object-cover" />
        </div>
      )}
    </div>
  );
}
