import { useEffect, useRef } from 'react';

/**
 * The site's signature motion device: a generated wavy path running down the page.
 * As the visitor scrolls, the path draws itself and a spark marker travels along it.
 * Hidden below 900px for responsive mobile performance.
 */
export function SparkThread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const bgRef = useRef<SVGPathElement>(null);
  const fgRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const pathLenRef = useRef(0);

  useEffect(() => {
    const svg = svgRef.current;
    const bg = bgRef.current;
    const fg = fgRef.current;
    const dot = dotRef.current;
    if (!svg || !bg || !fg || !dot) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function buildPath() {
      const currentSvg = svgRef.current;
      if (!currentSvg || !bg || !fg) return;
      const container = currentSvg.parentElement;
      const w = window.innerWidth;

      if (w < 900) {
        currentSvg.style.display = 'none';
        return;
      }
      currentSvg.style.display = 'block';

      // Measure height accurately without triggering a scrollHeight feedback loop
      const h = container ? container.getBoundingClientRect().height : document.documentElement.clientHeight;

      currentSvg.setAttribute('width', String(w));
      currentSvg.setAttribute('height', String(h));
      currentSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const xBase = Math.min(56, w * 0.04);
      const amp = 26;
      const segments = Math.max(6, Math.round(h / 460));
      const step = h / segments;
      let d = `M ${xBase} 0`;
      for (let i = 1; i <= segments; i++) {
        const y = step * i;
        const xOff = i % 2 === 0 ? amp : -amp;
        d += ` C ${xBase} ${y - step * 0.5}, ${xBase + xOff} ${y - step * 0.5}, ${xBase} ${y}`;
      }
      bg.setAttribute('d', d);
      fg.setAttribute('d', d);
      pathLenRef.current = fg.getTotalLength();
      fg.style.strokeDasharray = String(pathLenRef.current);
      onScroll();
    }

    function onScroll() {
      const currentSvg = svgRef.current;
      if (!currentSvg || !fg || !dot) return;
      const len = pathLenRef.current;
      if (!len) return;
      const container = currentSvg.parentElement;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const containerH = container ? container.getBoundingClientRect().height : document.documentElement.scrollHeight;
      const max = containerH - window.innerHeight;
      const progress = max > 0 ? Math.min(Math.max(scrollTop / max, 0), 1) : 0;
      fg.style.strokeDashoffset = String(len * (1 - progress));
      const pt = fg.getPointAtLength(len * progress);
      dot.setAttribute('transform', `translate(${pt.x},${pt.y})`);
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    let resizeTimer: number;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(buildPath, 200);
    };

    const t = window.setTimeout(buildPath, 250);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    if (reduceMotion) onScroll();

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] w-full overflow-hidden"
      aria-hidden="true"
    >
      <path ref={bgRef} fill="none" stroke="var(--color-line)" strokeWidth={2} />
      <path
        ref={fgRef}
        fill="none"
        stroke="var(--color-spark)"
        strokeWidth={2.5}
        style={{ filter: 'drop-shadow(0 0 6px var(--color-spark-glow))' }}
      />
      <g ref={dotRef}>
        <circle r={6} fill="var(--color-spark)" style={{ filter: 'drop-shadow(0 0 10px var(--color-spark-glow))' }} />
        <circle r={6} fill="none" stroke="var(--color-spark)" strokeWidth={1} opacity={0.5} />
      </g>
    </svg>
  );
}
