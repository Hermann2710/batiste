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
      <div ref={leftRef} className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        {left}
      </div>
      <div ref={rightRef} className="hidden bg-zinc-900 lg:block lg:w-1/2">
        {right}
      </div>
    </main>
  );
}
