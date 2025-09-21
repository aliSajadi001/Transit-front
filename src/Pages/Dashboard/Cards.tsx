// src/components/Cards.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Truck, Bus, Car, Ship } from "lucide-react";
import { LocaleDigits } from "./components/LocaleDigits";

/** شمارنده با IntersectionObserver + rAF */
function CountUp({
  end,
  duration = 1500,
  className,
}: {
  end: number;
  duration?: number;
  className?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (ts: number) => {
            const p = Math.min(1, (ts - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            setVal(Math.round(end * eased));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className} aria-live="polite">
      {/* فقط همین خط تغییر کرده تا ارقام بر اساس زبان نمایش داده شوند */}
      <LocaleDigits value={val} />
    </span>
  );
}

type CardSpec = {
  key: "freight" | "passenger" | "fleet" | "ports";
  icon: React.ElementType;
  target: number;
};

export default function Cards() {
  const { t } = useTranslation();

  const cards: CardSpec[] = useMemo(
    () => [
      { key: "freight", icon: Truck, target: 3983 },
      { key: "passenger", icon: Bus, target: 1250 },
      { key: "fleet", icon: Car, target: 10000 },
      { key: "ports", icon: Ship, target: 870 },
    ],
    []
  );

  return (
    <div className="w-full">
      {/* گرید ریسپانسیو */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ key, icon: Icon, target }) => (
          <div
            key={key}
            className="border border-stone-400 bg-white/20  rounded-xl p-4 sm:p-4 md:p-5 transition-all duration-300 shadow-stone-500 hover:shadow-md"
          >
            {/* بالا: عنوان */}
            <div className="text-sm md:text-base font-medium text-stone-600 line-clamp-2">
              {t(`Cards.items.${key}.title`)}
            </div>

            {/* وسط: شمارنده */}
            <div className="mt-3 md:mt-4">
              <CountUp
                end={target}
                className="text-3xl md:text-4xl font-extrabold tracking-tight text-stone-400 tabular-nums"
              />
            </div>

            {/* پایین: Badge مثل BadgeAvatarDemo */}
            <div className="mt-4">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full px-2.5 py-1"
              >
                <Icon className="w-5 h-5 text-stone-600" />
                <span className="text-xs md:text-sm font-medium">
                  {t(`Cards.items.${key}.badge`)}
                </span>
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
