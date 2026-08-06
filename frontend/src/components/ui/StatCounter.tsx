import { useEffect, useRef, useState } from 'react';

export function StatCounter({ target, label, suffix = '' }: { target: number; label: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            if (reduceMotion) {
              setValue(target);
              return;
            }
            const duration = 1300;
            const start = performance.now();
            const step = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(eased * target));
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="border border-line bg-paper p-5">
      <div className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold tabular-nums">
        {value.toLocaleString()}
        {suffix}
      </div>
      <div className="mono mt-1.5 text-[0.66rem] text-ink-soft">{label}</div>
    </div>
  );
}
