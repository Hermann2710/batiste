"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedAuthLayout({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.1 });

    if (leftRef.current) {
      const children = leftRef.current.querySelectorAll("[data-auth-anim]");
      gsap.set(children, { opacity: 0, y: 24 });
      tl.to(children, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.07,
      });
    }

    if (rightRef.current) {
      gsap.set(rightRef.current, { opacity: 0, x: 30 });
      tl.to(
        rightRef.current,
        { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" },
        0.2
      );
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <main className="flex min-h-screen">
      <div ref={leftRef} className="flex w-full flex-col justify-center bg-[#f7f7f5] px-6 py-12 sm:px-12 lg:w-1/2">
        {left}
      </div>
      <div ref={rightRef} className="dashboard-grid relative hidden overflow-hidden bg-zinc-950 lg:block lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(45,212,191,0.12),transparent_25%)]" />
        {right}
      </div>
    </main>
  );
}
