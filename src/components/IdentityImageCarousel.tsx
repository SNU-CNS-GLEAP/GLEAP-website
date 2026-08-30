"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/app/[locale]/page.module.css";

const ROTATION_MS = 5200;

type IdentitySlide = {
  src: string;
  alt: string;
  label: string;
};

export function IdentityImageCarousel({
  slides,
  isEnglish,
}: {
  slides: IdentitySlide[];
  isEnglish: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const remainingTimeRef = useRef(ROTATION_MS);
  const timerStartedAtRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  const activateSlide = useCallback(
    (nextIndex: number) => {
      const normalizedIndex = (nextIndex + slides.length) % slides.length;
      remainingTimeRef.current = ROTATION_MS;
      timerStartedAtRef.current = null;

      if (normalizedIndex === activeIndex) {
        setTransitionKey((key) => key + 1);
        return;
      }

      setPreviousIndex(activeIndex);
      setActiveIndex(normalizedIndex);
      setTransitionKey((key) => key + 1);
    },
    [activeIndex, slides.length],
  );

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);
    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.22 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  const autoplayPaused =
    userPaused || interactionPaused || reduceMotion || !inView || !pageVisible;

  useEffect(() => {
    if (autoplayPaused || slides.length < 2) return;

    timerStartedAtRef.current = performance.now();
    const timeout = window.setTimeout(() => {
      timerStartedAtRef.current = null;
      remainingTimeRef.current = ROTATION_MS;
      activateSlide(activeIndex + 1);
    }, remainingTimeRef.current);

    return () => {
      window.clearTimeout(timeout);
      if (timerStartedAtRef.current !== null) {
        const elapsed = performance.now() - timerStartedAtRef.current;
        remainingTimeRef.current = Math.max(
          80,
          remainingTimeRef.current - elapsed,
        );
        timerStartedAtRef.current = null;
      }
    };
  }, [activeIndex, activateSlide, autoplayPaused, transitionKey, slides.length]);

  const labels = isEnglish
    ? {
        carousel: "GLEAP moments",
        previous: "Previous image",
        next: "Next image",
        pause: "Pause image rotation",
        play: "Resume image rotation",
        choose: "Show image",
      }
    : {
        carousel: "GLEAP 활동 사진",
        previous: "이전 이미지",
        next: "다음 이미지",
        pause: "이미지 자동 전환 일시정지",
        play: "이미지 자동 전환 재생",
        choose: "이미지 보기",
      };

  return (
    <div className={styles.identityImageFrame}>
      <div
        ref={rootRef}
        className={styles.identityCarousel}
        data-paused={autoplayPaused}
        aria-label={labels.carousel}
        aria-roledescription="carousel"
        role="region"
        onFocusCapture={() => setInteractionPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setInteractionPaused(false);
          }
        }}
      >
        <div className={styles.identityCarouselStage}>
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            const isPrevious = index === previousIndex;

            return (
              <div
                key={slide.src}
                className={`${styles.identitySlide} ${
                  isActive
                    ? styles.identitySlideActive
                    : isPrevious
                      ? styles.identitySlidePrevious
                      : ""
                }`}
                aria-hidden={!isActive}
              >
                <Image
                  src={slide.src}
                  alt={isActive ? slide.alt : ""}
                  fill
                  preload={index === 0}
                  loading={index === 0 ? undefined : "eager"}
                  quality={90}
                  sizes="(min-width: 900px) 46vw, 100vw"
                  className={styles.identityCarouselImage}
                />
              </div>
            );
          })}

          <span className={styles.identityCarouselShade} aria-hidden="true" />

          <div className={styles.identityCarouselHud}>
            <div
              className={styles.identityCarouselMeta}
              aria-live={autoplayPaused ? "polite" : "off"}
              aria-atomic="true"
            >
              <span>{String(activeIndex + 1).padStart(2, "0")}</span>
              <span aria-hidden="true">/</span>
              <span>{String(slides.length).padStart(2, "0")}</span>
              <span className={styles.identityCarouselLabel}>
                {slides[activeIndex]?.label}
              </span>
            </div>

            <div className={styles.identityCarouselControls}>
              <button
                type="button"
                className={styles.identityCarouselControl}
                onClick={() => activateSlide(activeIndex - 1)}
                aria-label={labels.previous}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                className={styles.identityCarouselControl}
                onClick={() => setUserPaused((paused) => !paused)}
                aria-label={userPaused ? labels.play : labels.pause}
                aria-pressed={userPaused}
              >
                <span
                  className={
                    userPaused
                      ? styles.identityCarouselPlayIcon
                      : styles.identityCarouselPauseIcon
                  }
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                className={styles.identityCarouselControl}
                onClick={() => activateSlide(activeIndex + 1)}
                aria-label={labels.next}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div
            className={styles.identityCarouselProgress}
            role="group"
            aria-label={labels.carousel}
          >
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.src}
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${labels.choose} ${index + 1}: ${slide.label}`}
                  className={styles.identityProgressButton}
                  onClick={() => activateSlide(index)}
                >
                  <span className={styles.identityProgressRail}>
                    {isActive && (
                      <span
                        key={`${activeIndex}-${transitionKey}`}
                        className={styles.identityProgressFill}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
