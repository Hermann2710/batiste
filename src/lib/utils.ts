import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string, maxLength = 50): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

export function formatPrice(
  cents: number | null,
  currency = "EUR",
  locale = "fr-FR",
) {
  if (cents === null || cents === undefined) return null;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    cents / 100,
  );
}

export function formatDate(date: Date | string | null, locale = "fr-FR") {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(date),
  );
}

export function formatDateTime(date: Date | string | null, locale = "fr-FR") {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

/** Very small in-memory sliding window rate limiter. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export const FEATURES = ["blog", "catalog", "quote", "booking"] as const;
export type FeatureId = (typeof FEATURES)[number];
