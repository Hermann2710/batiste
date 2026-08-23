"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { Spinner } from "./feedback";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-zinc-900 text-white shadow-sm hover:-translate-y-px hover:bg-zinc-800 hover:shadow-md focus-visible:outline-zinc-900 disabled:bg-zinc-400",
  secondary: "bg-zinc-100 text-zinc-900 hover:-translate-y-px hover:bg-zinc-200 focus-visible:outline-zinc-400 disabled:text-zinc-400",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-zinc-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  outline: "border border-zinc-300 bg-white text-zinc-800 shadow-sm hover:-translate-y-px hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-zinc-400",
};
const sizes: Record<ButtonSize, string> = { sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg", md: "h-10 px-4 text-sm gap-2 rounded-xl", lg: "h-12 px-6 text-[15px] gap-2 rounded-xl" };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean; }

export function Button({ variant = "primary", size = "md", loading = false, className, children, disabled, ...props }: ButtonProps) {
  return <button className={cn("inline-flex items-center justify-center font-medium transition-[background-color,border-color,box-shadow,transform] focus-visible:outline focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70", variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>{loading && <Spinner className="size-4" />}{children}</button>;
}

export function SubmitButton({ children, pendingLabel, ...props }: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending} {...props}>{pending && pendingLabel ? pendingLabel : children}</Button>;
}

export function IconButton({ className, label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button title={label} aria-label={label} className={cn("inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40", className)} {...props}>{children}</button>;
}
