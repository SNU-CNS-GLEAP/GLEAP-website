"use client";

import { useEffect } from "react";
import styles from "@/app/[locale]/page.module.css";

const clamp = (minimum: number, value: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function HomeMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const page = document.querySelector<HTMLElement>("[data-home-page]");
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const counters = Array.from(
      document.querySelectorAll<HTMLElement>("[data-count-to]"),
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    root.dataset.homeMotion = "ready";

    const setCounterToFinalValue = (counter: HTMLElement) => {
      const target = Number(counter.dataset.countTo ?? 0);
      const padding = Number(counter.dataset.countPad ?? 0);
      const suffix = counter.dataset.countSuffix ?? "";
      counter.textContent = `${Math.round(target).toString().padStart(padding, "0")}${suffix}`;
    };

    if (reduceMotion) {
      revealTargets.forEach((target) => {
        target.dataset.visible = "true";
      });
      counters.forEach(setCounterToFinalValue);
      return () => {
        delete root.dataset.homeMotion;
      };
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.visible = "true";
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
    requestAnimationFrame(() => {
      revealTargets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
          target.dataset.visible = "true";
          revealObserver.unobserve(target);
        }
      });
    });

    const animatedCounters = new WeakSet<HTMLElement>();
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const counter = entry.target as HTMLElement;
          if (animatedCounters.has(counter)) return;
          animatedCounters.add(counter);
          countObserver.unobserve(counter);

          const target = Number(counter.dataset.countTo ?? 0);
          const padding = Number(counter.dataset.countPad ?? 0);
          const suffix = counter.dataset.countSuffix ?? "";
          const startingValue = target > 1000 ? target - 28 : 0;
          const duration = target > 1000 ? 900 : 1250;
          const startedAt = performance.now();

          const tick = (now: number) => {
            const progress = clamp(0, (now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(
              startingValue + (target - startingValue) * eased,
            );
            counter.textContent = `${value.toString().padStart(padding, "0")}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.65 },
    );

    counters.forEach((counter) => countObserver.observe(counter));

    let scrollFrame = 0;

    const updateScrollEffects = () => {
      scrollFrame = 0;
      const documentHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const progress = clamp(0, window.scrollY / documentHeight, 1);
      page?.style.setProperty("--page-progress", progress.toString());
      root.dataset.pageScrolled = window.scrollY > 18 ? "true" : "false";

    };

    const scheduleScrollEffects = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(updateScrollEffects);
    };

    window.addEventListener("scroll", scheduleScrollEffects, { passive: true });
    window.addEventListener("resize", scheduleScrollEffects);
    updateScrollEffects();

    return () => {
      revealObserver.disconnect();
      countObserver.disconnect();
      window.removeEventListener("scroll", scheduleScrollEffects);
      window.removeEventListener("resize", scheduleScrollEffects);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      delete root.dataset.homeMotion;
      delete root.dataset.pageScrolled;
    };
  }, []);

  return <div className={styles.scrollProgress} aria-hidden />;
}
