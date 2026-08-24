"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useHeroEntrance,
  useScrollReveal,
  useStaggerReveal,
} from "@/lib/animations";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ────────────────────────── Floating glass navbar ────────────────────── */

export function AnimatedNav({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const pill = pillRef.current;
    if (!outer || !pill) return;

    // Entrance: slide down from -20
    gsap.fromTo(
      outer,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.05 },
    );

    // Scroll-driven transition: transparent → glass pill
    const st = ScrollTrigger.create({
      start: 60,
      onUpdate(self) {
        const scrolled = self.scroll() > 60;
        gsap.to(pill, {
          backgroundColor: scrolled
            ? "rgba(255,255,255,0.82)"
            : "rgba(255,255,255,0)",
          borderColor: scrolled
            ? "rgba(228,228,231,0.7)"
            : "rgba(228,228,231,0)",
          boxShadow: scrolled
            ? "0 4px 24px -6px rgba(24,24,27,0.1), 0 0 0 1px rgba(228,228,231,0.5)"
            : "0 0 0 0 transparent",
          backdropFilter: scrolled
            ? "blur(16px) saturate(1.6)"
            : "blur(0px) saturate(1)",
          paddingTop: scrolled ? 10 : 16,
          paddingBottom: scrolled ? 10 : 16,
          duration: 0.35,
          ease: "power2.out",
        });
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <header
      ref={outerRef}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:px-6"
    >
      <div
        ref={pillRef}
        className="w-full max-w-5xl rounded-2xl border border-transparent px-5 py-4 transition-all"
        style={{ WebkitBackdropFilter: "blur(0px) saturate(1)" }}
      >
        {children}
      </div>
    </header>
  );
}

/* ──────────────────────────── Hero entrance ──────────────────────────── */

export function AnimatedHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useHeroEntrance(ref);
  return (
    <section ref={ref} className="relative overflow-hidden">
      {children}
    </section>
  );
}

/* ────────────────────── Section with data-anim ──────────────────────── */

export function AnimatedSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref);
  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}

/* ──────────────────── Grid with stagger children ────────────────────── */

export function AnimatedGrid({
  children,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useStaggerReveal(ref, ":scope > *", direction);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
