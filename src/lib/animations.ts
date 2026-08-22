"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────────── Core config ─────────────────────────── */

const EASE = "power3.out";
const EASE_BACK = "back.out(1.4)";
const DURATION = 0.7;
const STAGGER = 0.08;

/* ────────────────────────── Scroll-triggered reveal ──────────────────── */

/**
 * Attach to a container ref: every child with `data-anim` will
 * fade/slide in when it enters the viewport.
 *
 * `data-anim` values: "up" | "down" | "left" | "right" | "fade" | "scale" | "pop"
 * `data-delay` optional extra delay in seconds ("0.2")
 */
export function useScrollReveal(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = el.querySelectorAll<HTMLElement>("[data-anim]");
    if (!items.length) return;

    const animations: gsap.core.Tween[] = [];

    items.forEach((item) => {
      const type = item.dataset.anim || "up";
      const extraDelay = parseFloat(item.dataset.delay || "0");

      const from: gsap.TweenVars = { opacity: 0, duration: DURATION, ease: EASE, delay: extraDelay };

      switch (type) {
        case "up":
          from.y = 40;
          break;
        case "down":
          from.y = -40;
          break;
        case "left":
          from.x = 50;
          break;
        case "right":
          from.x = -50;
          break;
        case "scale":
          from.scale = 0.92;
          from.y = 20;
          break;
        case "pop":
          from.scale = 0.85;
          from.ease = EASE_BACK;
          break;
        case "fade":
        default:
          break;
      }

      gsap.set(item, { ...from, immediateRender: true });

      const tween = gsap.to(item, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: DURATION,
        ease: from.ease as string,
        delay: extraDelay,
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          once: true,
        },
      });

      animations.push(tween);
    });

    return () => {
      animations.forEach((tween) => tween.kill());
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [containerRef]);
}

/* ─────────────────────── Staggered children reveal ───────────────────── */

/**
 * All direct children of the container stagger in on scroll.
 */
export function useStaggerReveal(
  containerRef: RefObject<HTMLElement | null>,
  selector = ":scope > *",
  direction: "up" | "left" = "up"
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const children = el.querySelectorAll<HTMLElement>(selector);
    if (!children.length) return;

    gsap.set(children, {
      opacity: 0,
      y: direction === "up" ? 30 : 0,
      x: direction === "left" ? 40 : 0,
    });

    const tween = gsap.to(children, {
      opacity: 1,
      y: 0,
      x: 0,
      duration: 0.55,
      ease: EASE,
      stagger: STAGGER,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [containerRef, selector, direction]);
}

/* ──────────────────────── Hero entrance timeline ─────────────────────── */

export function useHeroEntrance(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const badge = el.querySelector("[data-hero-badge]");
    const title = el.querySelector("[data-hero-title]");
    const subtitle = el.querySelector("[data-hero-subtitle]");
    const buttons = el.querySelector("[data-hero-buttons]");
    const preview = el.querySelector("[data-hero-preview]");

    const targets = [badge, title, subtitle, buttons, preview].filter(Boolean) as HTMLElement[];

    gsap.set(targets, { opacity: 0, y: 30 });

    const tl = gsap.timeline({ delay: 0.15 });

    if (badge) tl.to(badge, { opacity: 1, y: 0, duration: 0.5, ease: EASE });
    if (title) tl.to(title, { opacity: 1, y: 0, duration: 0.6, ease: EASE }, "-=0.3");
    if (subtitle) tl.to(subtitle, { opacity: 1, y: 0, duration: 0.5, ease: EASE }, "-=0.35");
    if (buttons) tl.to(buttons, { opacity: 1, y: 0, duration: 0.5, ease: EASE }, "-=0.3");
    if (preview) {
      gsap.set(preview, { opacity: 0, y: 50, scale: 0.96 });
      tl.to(preview, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: EASE }, "-=0.2");
    }

    return () => {
      tl.kill();
    };
  }, [containerRef]);
}

/* ──────────────────── Parallax float on scroll ──────────────────────── */

export function useParallax(
  ref: RefObject<HTMLElement | null>,
  speed = 0.15
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tween = gsap.to(el, {
      y: () => -speed * ScrollTrigger.maxScroll(window),
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [ref, speed]);
}

/* ──────────────────── Counter animation ──────────────────────────────── */

export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  target: number,
  duration = 1.5
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { val: 0 };

    const tween = gsap.to(obj, {
      val: target,
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
      onUpdate() {
        el.textContent = Math.round(obj.val).toLocaleString();
      },
    });

    return () => {
      tween.kill();
    };
  }, [ref, target, duration]);
}

/* ──────────── Magnetic hover (for buttons / icons) ──────────────────── */

export function useMagneticHover(ref: RefObject<HTMLElement | null>, strength = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.3, ease: "power2.out" });
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, strength]);
}

/* ────────────────── Text split reveal (word by word) ─────────────────── */

export function useSplitReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const text = el.textContent || "";
    const words = text.split(/\s+/).filter(Boolean);
    el.innerHTML = words
      .map((w) => `<span class="inline-block overflow-hidden"><span class="gsap-word inline-block">${w}</span></span>`)
      .join(" ");

    const wordSpans = el.querySelectorAll(".gsap-word");
    gsap.set(wordSpans, { y: "105%", opacity: 0 });

    const tween = gsap.to(wordSpans, {
      y: "0%",
      opacity: 1,
      duration: 0.5,
      ease: EASE_BACK,
      stagger: 0.04,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    });

    return () => {
      tween.kill();
      el.textContent = text;
    };
  }, [ref]);
}

/* ────────────────── Nav shrink on scroll ─────────────────────────────── */

export function useNavShrink(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      start: 80,
      onUpdate(self) {
        if (self.direction === 1 && self.scroll() > 80) {
          gsap.to(el, { height: 52, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", duration: 0.3, ease: "power2.out" });
        } else if (self.scroll() < 80) {
          gsap.to(el, { height: 64, boxShadow: "none", duration: 0.3, ease: "power2.out" });
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [ref]);
}
