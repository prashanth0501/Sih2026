const SHAPES = [
  { side: 'left', top: '14%', kind: 'rings' },
  { side: 'right', top: '26%', kind: 'diamond' },
  { side: 'left', top: '44%', kind: 'dots' },
  { side: 'right', top: '58%', kind: 'arc' },
  { side: 'left', top: '72%', kind: 'plus' },
  { side: 'right', top: '86%', kind: 'rings' },
] as const;

function RingsShape() {
  return (
    <svg width="86" height="86" viewBox="0 0 86 86" fill="none">
      <circle cx="43" cy="43" r="42" stroke="var(--color-line)" />
      <circle cx="43" cy="43" r="28" stroke="var(--color-indigo)" strokeOpacity="0.35" strokeDasharray="3 7" />
      <circle cx="43" cy="43" r="4" fill="var(--color-spark)" opacity="0.6" />
    </svg>
  );
}
function DiamondShape() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect x="10" y="10" width="44" height="44" rx="2" stroke="var(--color-marigold)" strokeOpacity="0.4" transform="rotate(45 32 32)" />
      <rect x="22" y="22" width="20" height="20" rx="1" stroke="var(--color-line)" transform="rotate(45 32 32)" />
    </svg>
  );
}
function DotsShape() {
  return (
    <svg width="70" height="60" viewBox="0 0 70 60" fill="none">
      <circle cx="8" cy="52" r="3" fill="var(--color-line)" />
      <circle cx="35" cy="30" r="3.5" fill="var(--color-indigo)" opacity="0.45" />
      <circle cx="62" cy="8" r="3" fill="var(--color-line)" />
      <path d="M8 52 L35 30 L62 8" stroke="var(--color-line)" strokeDasharray="2 6" />
    </svg>
  );
}
function ArcShape() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <path d="M4 78 A74 74 0 0 0 78 4" stroke="var(--color-marigold)" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M18 78 A56 56 0 0 0 78 18" stroke="var(--color-line)" strokeDasharray="2 6" />
    </svg>
  );
}
function PlusShape() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <line x1="24" y1="4" x2="24" y2="44" stroke="var(--color-line)" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="var(--color-line)" />
      <circle cx="24" cy="24" r="14" stroke="var(--color-spark)" strokeOpacity="0.4" strokeDasharray="1 5" />
    </svg>
  );
}

const SHAPE_COMPONENTS = { rings: RingsShape, diamond: DiamondShape, dots: DotsShape, arc: ArcShape, plus: PlusShape };

export function MarginRail() {
  return (
    <>
      <div className="margin-rail left-6">
        <span className="margin-rail-text">Ignite · SIH 2026 · One spark, one nationwide stage</span>
      </div>
      <div className="margin-rail right-6">
        <span className="margin-rail-text">Nagarjuna College of Engineering &amp; Technology</span>
      </div>

      {SHAPES.map((s, i) => {
        const Shape = SHAPE_COMPONENTS[s.kind];
        return (
          <div
            key={i}
            className={`margin-deco ${s.side === 'left' ? 'left-16' : 'right-16'}`}
            style={{ top: s.top }}
          >
            <Shape />
          </div>
        );
      })}
    </>
  );
}
