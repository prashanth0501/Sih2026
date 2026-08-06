import { useMemo, useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { UPDATES, type UpdatePost, type PostKind } from '@/lib/data';
import { cn } from '@/lib/utils';

const POST_EXTENSIONS: Record<string, { avatarBg: string; avatarText: string; verifiedTitle: string; initialLikes: number; image?: string }> = {
  u1: {
    avatarBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    avatarText: 'BR',
    verifiedTitle: 'Official SIH SPOC · NCET',
    initialLikes: 142,
    image: '/gallery/nodal-audience.webp',
  },
  u2: {
    avatarBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    avatarText: 'PS',
    verifiedTitle: 'Student Coordinator · NCET',
    initialLikes: 89,
    image: '/hero/mentor-session.webp',
  },
};

function FeedPostCard({ post }: { post: UpdatePost }) {
  const ext = POST_EXTENSIONS[post.id] || {
    avatarBg: 'bg-gradient-to-br from-marigold to-orange-500',
    avatarText: post.author.substring(0, 2).toUpperCase(),
    verifiedTitle: 'NCET Coordinator',
    initialLikes: 45,
  };

  const [likes, setLikes] = useState(ext.initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const textToShare = `${post.title}\n\n${post.body}`;

  const toggleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  async function copyPostLink() {
    await navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="rounded-3xl border border-line bg-paper-2 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-marigold/60 space-y-5">
      
      {/* 1. Feed Author Bar (Instagram / LinkedIn Style) */}
      <div className="flex items-center justify-between gap-3 border-b border-line/50 pb-4">
        <div className="flex items-center gap-3.5">
          <div className={cn('h-11 w-11 rounded-full flex items-center justify-center font-display text-sm font-bold text-white shadow-md', ext.avatarBg)}>
            {ext.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold text-ink">
                {post.author}
              </span>
              <span className="mono text-[0.68rem] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            </div>
            <div className="mono text-xs text-ink-soft">
              {ext.verifiedTitle} · {formattedDate}
            </div>
          </div>
        </div>

        <span className={cn(
          'mono text-xs font-bold rounded-full border px-3.5 py-1',
          post.kind === 'post' ? 'bg-marigold/15 text-marigold border-marigold/30' : 'bg-indigo/15 text-indigo border-indigo/30'
        )}>
          {post.kind === 'post' ? 'Broadcast Post' : 'Coordinator Update'}
        </span>
      </div>

      {/* 2. Feed Post Main Content */}
      <div className="space-y-3">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink leading-tight">
          {post.title}
        </h2>
        <p className="text-sm sm:text-base text-ink-soft leading-relaxed">
          {post.body}
        </p>
      </div>

      {/* 3. Post Image Card (if present) */}
      {ext.image && (
        <div className="overflow-hidden rounded-2xl border border-line shadow-md">
          <img
            src={ext.image}
            alt={post.title}
            className="h-56 sm:h-72 w-full object-cover"
          />
        </div>
      )}

      {/* 4. Social Action & Reaction Bar (Twitter / LinkedIn style) */}
      <div className="mono pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <button
          onClick={toggleLike}
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-2 font-bold transition-all cursor-pointer hover:scale-105',
            hasLiked
              ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
              : 'bg-paper border-line text-ink-soft hover:border-rose-300 hover:text-rose-600'
          )}
        >
          <span>{hasLiked ? '❤️ Liked' : '🤍 Like'}</span>
          <span className="bg-paper-3 px-2 py-0.5 rounded-full text-[0.7rem] font-bold">
            {likes}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(textToShare)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line bg-paper px-4 py-2 font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105"
          >
            WhatsApp
          </a>
          <button
            onClick={copyPostLink}
            className="rounded-full border border-line bg-paper px-4 py-2 font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105 cursor-pointer"
          >
            {copied ? 'Copied ✓' : 'Copy Post'}
          </button>
        </div>
      </div>

    </div>
  );
}

const FILTERS: Array<{ key: PostKind | 'all'; label: string }> = [
  { key: 'all', label: 'All Feed Posts' },
  { key: 'post', label: 'SPOC Broadcasts' },
  { key: 'update', label: 'Coordinator Notices' },
];

export function Updates() {
  const [filter, setFilter] = useState<PostKind | 'all'>('all');

  const feed = useMemo(() => {
    const rows = [...UPDATES].reverse();
    return filter === 'all' ? rows : rows.filter((p) => p.kind === filter);
  }, [filter]);

  return (
    <div className="mx-auto max-w-[840px] px-4 sm:px-8 pb-24 pt-6 sm:pt-8 space-y-10">
      
      {/* 1. Centered Header Block */}
      <Reveal>
        <div className="text-center flex flex-col items-center justify-center mx-auto max-w-2xl space-y-4">
          <div className="eyebrow">
            Campus Social Feed
          </div>

          <h1 className="font-display text-3xl sm:text-6xl font-bold tracking-tight text-ink leading-tight text-center">
            Official SIH 2026 Feed
          </h1>

          <p className="lede mx-auto text-base sm:text-xl text-ink-soft max-w-xl text-center">
            Live broadcasts, official deadlines, and notices directly from NCET SPOC and coordinator leads.
          </p>
        </div>
      </Reveal>

      {/* 2. Feed Category Filter Pills */}
      <Reveal delay={0.05}>
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl mx-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'mono text-xs font-bold rounded-full px-5 py-2.5 transition-all border cursor-pointer',
                filter === f.key
                  ? 'bg-marigold text-paper border-marigold shadow-sm'
                  : 'bg-paper border-line text-ink-soft hover:border-marigold'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* 3. Feed Cards List */}
      <div className="space-y-6">
        {feed.map((post, i) => (
          <Reveal key={post.id} delay={Math.min(i * 0.05, 0.2)}>
            <FeedPostCard post={post} />
          </Reveal>
        ))}
      </div>

    </div>
  );
}
