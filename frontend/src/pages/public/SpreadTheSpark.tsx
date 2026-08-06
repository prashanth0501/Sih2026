import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { detectPlatform } from '@/lib/utils';
import { getPromoPosts, getPromoWall, submitPromoShare, type ApiPromoPost } from '@/api/promotions';

function shareText(post: ApiPromoPost) {
  return `${post.caption}\n\n${post.hashtags.join(' ')}`;
}

function SubmitLinkForm({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', usn: '', post_url: '' });
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState('');
  const platform = detectPlatform(form.post_url);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await submitPromoShare(postId, form);
      setResult({ count: res.count_for_post });
    } catch {
      setError("Couldn't submit that — try again.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mono mt-4 rounded-full border border-line px-3.5 py-2 text-[0.66rem] hover:border-marigold hover:text-marigold"
      >
        I posted this — submit your link
      </button>
    );
  }

  if (result) {
    return (
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-[0.9rem] font-bold text-marigold">🎉 You're #{result.count} to share this one.</p>
        <p className="mt-1 text-[0.82rem] text-ink-soft">Thanks for spreading the spark — no login needed, you're already credited.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3 border-t border-line pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="border border-line bg-paper px-3.5 py-2.5 text-[0.85rem] outline-none focus-visible:border-marigold"
        />
        <input
          required
          placeholder="USN"
          value={form.usn}
          onChange={(e) => setForm((f) => ({ ...f, usn: e.target.value.toUpperCase() }))}
          className="border border-line bg-paper px-3.5 py-2.5 text-[0.85rem] outline-none focus-visible:border-marigold"
        />
      </div>
      <input
        required
        type="url"
        placeholder="Paste your Instagram / LinkedIn / Facebook post URL"
        value={form.post_url}
        onChange={(e) => setForm((f) => ({ ...f, post_url: e.target.value }))}
        className="border border-line bg-paper px-3.5 py-2.5 text-[0.85rem] outline-none focus-visible:border-marigold"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="mono text-[0.64rem] text-ink-soft">
          {platform ? <>Detected: <span className="text-marigold">{platform}</span></> : 'Paste a link to detect the platform'}
        </span>
        <Button type="submit" variant="primary" className="px-5 py-2.5 text-[0.66rem]">
          Submit →
        </Button>
      </div>
      {error && <p className="text-[0.8rem] text-red-700">{error}</p>}
    </form>
  );
}

function PromoCard({ post }: { post: ApiPromoPost }) {
  const [copied, setCopied] = useState(false);
  const text = shareText(post);
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  async function copyCaption() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: post.title, text });
    } catch {
      // user cancelled — nothing to do
    }
  }

  const encoded = encodeURIComponent(text);

  return (
    <div className="border border-line bg-paper-2 p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[1.05rem] font-bold">{post.title}</h3>
        {post.share_count > 0 && (
          <span className="mono shrink-0 rounded-full bg-marigold/10 px-3 py-1 text-[0.62rem] text-marigold">
            {post.share_count} {post.share_count === 1 ? 'share' : 'shares'}
          </span>
        )}
      </div>
      <p className="mt-2.5 whitespace-pre-line text-[0.9rem] text-ink-soft">{post.caption}</p>
      <div className="mono mt-3 flex flex-wrap gap-2 text-[0.62rem] text-marigold">
        {post.hashtags.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>

      <div className="mono mt-5 flex flex-wrap gap-2 text-[0.66rem]">
        <button onClick={copyCaption} className="rounded-full border border-line px-3.5 py-2 hover:border-marigold hover:text-marigold">
          {copied ? 'Copied ✓' : 'Copy caption'}
        </button>
        {canNativeShare && (
          <button onClick={nativeShare} className="rounded-full border border-line px-3.5 py-2 hover:border-marigold hover:text-marigold">
            Share…
          </button>
        )}
        <a
          href={`https://wa.me/?text=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-3.5 py-2 hover:border-marigold hover:text-marigold"
        >
          WhatsApp
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-3.5 py-2 hover:border-marigold hover:text-marigold"
        >
          X
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://sih.gov.in')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-3.5 py-2 hover:border-marigold hover:text-marigold"
        >
          LinkedIn
        </a>
      </div>
      <p className="mono mt-3 text-[0.58rem] text-ink-soft/60">
        Posting on Instagram? Copy the caption above, save the asset, and post it from the app — Instagram
        doesn't support pre-filled web posting.
      </p>

      <SubmitLinkForm postId={post.id} />
    </div>
  );
}

export function SpreadTheSpark() {
  const { data: posts, isLoading } = useQuery({ queryKey: ['promo-posts'], queryFn: getPromoPosts });
  const { data: wall } = useQuery({ queryKey: ['promo-wall'], queryFn: getPromoWall });

  return (
    <div className="mx-auto max-w-[900px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="text-center">
          <div className="eyebrow mb-5">Spread the Spark</div>
          <h1 className="mx-auto max-w-[20ch] text-[clamp(2rem,5vw,3rem)]">Post it as your own. Get credit for it.</h1>
          <p className="lede mx-auto mt-5 max-w-[65ch]">
            Coordinators post ready-to-share content here. Copy the caption, share it on your own social
            media, then submit the link — no login needed, just your name and USN. It auto-detects the
            platform and counts toward the total right away.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5">
        {isLoading && <p className="text-center text-ink-soft">Loading…</p>}
        {posts?.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.06}>
            <PromoCard post={post} />
          </Reveal>
        ))}
      </div>

      {wall && wall.length > 0 && (
        <Reveal delay={0.2}>
          <div className="mt-16 border-t border-line pt-10">
            <div className="eyebrow text-left text-[0.85rem]">The Spark Wall</div>
            <h2 className="mt-3 text-[1.2rem] font-bold">Everyone who's spread it so far</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {wall.map((w) => (
                <div key={w.id} className="flex items-center justify-between gap-3 border border-line bg-paper-2 px-4 py-3">
                  <span className="font-medium">{w.name}</span>
                  <span className="mono text-[0.62rem] text-marigold">{w.platform}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
