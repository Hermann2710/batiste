"use client";

import { useRef } from "react";
import { useScrollReveal } from "@/lib/animations";

export default function AnimatedBlockWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
