import { useState } from 'react';
import { cn } from '@/lib/utils';

export function FlipCard({
  initials,
  name,
  role,
  bio,
  photoUrl,
}: {
  initials: string;
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="h-96 cursor-pointer [perspective:1200px]"
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div
        className={cn(
          'group relative h-full w-full rounded-sm transition-transform duration-500 [transform-style:preserve-3d]',
          flipped && '[transform:rotateY(180deg)]'
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(.2,.8,.2,1)' }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border border-line bg-paper-2 p-6 text-center [backface-visibility:hidden]">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="h-40 w-40 rounded-full object-cover shadow-md shadow-ink/10" />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-marigold to-indigo font-display text-3xl font-bold text-paper">
              {initials}
            </div>
          )}
          <div>
            <h3 className="text-[1.2rem] font-bold">{name}</h3>
            <div className="mono mt-1 text-[0.68rem] text-ink-soft">{role}</div>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-start justify-start gap-2 border border-line bg-ink p-6 text-left text-paper [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mono text-[0.62rem] text-paper/70">{role}</div>
          <h3 className="text-[1.05rem] font-bold">{name}</h3>
          <p className="text-[0.85rem] text-paper/85">{bio}</p>
        </div>
      </div>
    </div>
  );
}
