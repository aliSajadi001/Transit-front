import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

/**
 * Optimized counter on view:
 * - Animates from `from` to `to` over `durationMs`.
 * - Starts when target enters viewport (IntersectionObserver).
 * - Respects 'prefers-reduced-motion'.
 * - Minimizes re-renders by only setting state when value actually changes.
 */
function useCountOnView<T extends HTMLElement>(
  targetRef: React.RefObject<T | null>,
  from: number,
  to: number,
  durationMs: number,
  options?: IntersectionObserverInit
) {
  const [value, setValue] = useState(from);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastValueRef = useRef<number>(from);

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    if (prefersReducedMotion) {
      setValue(to);
      setDone(true);
      return;
    }

    const startCounting = (io?: IntersectionObserver) => {
      if (startedRef.current) return;
      startedRef.current = true;
      io?.unobserve(el);
      io?.disconnect();

      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const current = Math.round(from + (to - from) * progress);

        if (current !== lastValueRef.current) {
          lastValueRef.current = current;
          setValue(current);
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDone(true);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startCounting(io);
          }
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.3, ...options }
    );

    io.observe(el);

    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetRef, from, to, durationMs, options, prefersReducedMotion]);

  return { value, done };
}

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const numberRef = useRef<HTMLDivElement>(null);

  // Animate from 0 to 404 in ~2000ms when visible
  const { value: count, done } = useCountOnView(numberRef, 0, 404, 2000);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4"
      aria-labelledby="not-found-title"
      role="region"
    >
      <div className="w-full max-w-3xl text-center">
        {/* 404 بسیار بزرگ */}
        <div
          ref={numberRef}
          className="select-none text-stone-400 font-semibold tracking-tight 
                     text-[18vw] leading-none 
                     sm:text-[16vw] 
                     md:text-[12vw] 
                     lg:text-[10vw] 
                     will-change-transform will-change-opacity animate-pulse"
          aria-hidden={false}
        >
          {count}
        </div>

        {/* عنوان برای SR (همه چیز زیر یک namespace: notFound) */}
        <h1 id="not-found-title" className="sr-only">
          {t("notFound.title")}
        </h1>

        {/* متن توضیحی + دکمه بازگشت: با اتمام شمارش ظاهر می‌شوند */}
        <div
          className={[
            "mt-6 flex flex-col items-center gap-4",
            " transition-all duration-700 ease-out",
            done ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
        >
          <p className="text-stone-400 text-base sm:text-lg md:text-xl">
            {t("notFound.subtitle")}
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-500/40
                       px-4 py-2 text-stone-300 hover:text-stone-100
                       hover:bg-stone-700/40 focus:outline-none focus:ring-2 focus:ring-stone-400/40
                       transition-colors"
            aria-label={t("notFound.back")}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>{t("notFound.back")}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(NotFound);
