import { useMemo, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { UPDATES, type UpdatePost, type PostKind } from '@/lib/data';
import { cn } from '@/lib/utils';

const KIND_LABEL = { post: 'Post', update: 'Update' } as const;
const KIND_ACCENT = { post: 'bg-marigold', update: 'bg-indigo' } as const;
const KIND_TEXT = { post: 'text-marigold', update: 'text-indigo' } as const;

function UpdateCard({ post }: { post: UpdatePost }) {
  const [copied, setCopied] = useState(false);
  const text = `${post.title}\n\n${post.body}`;
  const date = new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  async function copyForInstagram() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative overflow-hidden border border-line bg-paper-2">
      <span className={cn('absolute inset-y-0 left-0 w-1.5', KIND_ACCENT[post.kind])} />
      <div className="p-6 pl-7">
        <div className="flex items-center justify-between gap-3">
          <span className={cn('mono text-[0.64rem] font-bold', KIND_TEXT[post.kind])}>{KIND_LABEL[post.kind]}</span>
          <div className="mono text-[0.64rem] text-ink-soft">{date}</div>
        </div>
        <div className="mono mt-3 text-[0.64rem] text-ink-soft">{post.author}</div>
        <h2 className="mt-1.5 text-[1.1rem] font-bold">{post.title}</h2>
        <p className="mt-2 text-[0.92rem] text-ink-soft">{post.body}</p>

        {post.kind === 'post' && (
          <div className="mono mt-5 flex flex-wrap gap-2 border-t border-line pt-4 text-[0.66rem]">
            <span className="flex items-center text-ink-soft/70">Share:</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-line px-3.5 py-2 hover:border-marigold hover:text-marigold"
            >
              WhatsApp
            </a>
            <button onClick={copyForInstagram} className="rounded-full border border-line px-3.5 py-2 hover:border-marigold hover:text-marigold">
              {copied ? 'Copied ✓' : 'Copy for Instagram'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const FILTERS: Array<{ key: PostKind | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'post', label: 'Posts' },
  { key: 'update', label: 'Updates' },
];

export function Updates() {
  const [filter, setFilter] = useState<PostKind | 'all'>('all');
  const feed = useMemo(() => {
    const rows = [...UPDATES].reverse();
    return filter === 'all' ? rows : rows.filter((p) => p.kind === filter);
  }, [filter]);

  return (
    <div className="mx-auto max-w-[720px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="text-center">
          <div className="eyebrow mb-5">Updates</div>
          <h1 className="mx-auto text-[clamp(2rem,5vw,3rem)]">What the SPOC and coordinators are saying.</h1>
          <p className="lede mx-auto mt-5 max-w-[60ch]">
            <span className="font-bold text-marigold">Posts</span> are shareable — pass them on.{' '}
            <span className="font-bold text-indigo">Updates</span> are just information, no forwarding needed.
            Either way: no likes, no comments.
          </p>
        </div>
      </Reveal>

      <div className="mono mt-10 flex justify-center gap-2 text-[0.7rem]">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full border px-4 py-2 transition-colors',
              filter === f.key ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft hover:border-ink hover:text-ink'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5">
        {feed.map((post, i) => (
          <Reveal key={post.id} delay={Math.min(i * 0.06, 0.3)}>
            <UpdateCard post={post} />
          </Reveal>
        ))}
        {feed.length === 0 && <p className="py-10 text-center text-ink-soft">Nothing here yet.</p>}
      </div>
    </div>
  );
}
