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
      setError('Submission failed. Please check your network and try again.');
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mono mt-4 rounded-full bg-paper border border-line px-5 py-2.5 text-xs font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105 cursor-pointer"
      >
        Posted this on your social media? Submit your link for credit
      </button>
    );
  }

  if (result) {
    return (
      <div className="mt-4 rounded-2xl border border-marigold/40 bg-marigold/10 p-5 space-y-1 text-center sm:text-left">
        <p className="text-sm font-bold text-marigold font-display">You are Advocate #{result.count} to share this post!</p>
        <p className="text-xs text-ink-soft">Your submission has been verified and added to the official NCET Spark Wall.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-line/60 pt-4">
      <div className="mono text-xs font-bold text-marigold uppercase tracking-wider">
        Submit Your Social Media Post Link
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus-visible:border-marigold"
        />
        <input
          required
          placeholder="USN (e.g. 1NC23CS001)"
          value={form.usn}
          onChange={(e) => setForm((f) => ({ ...f, usn: e.target.value.toUpperCase() }))}
          className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus-visible:border-marigold"
        />
      </div>

      <input
        required
        type="url"
        placeholder="Paste your Instagram / LinkedIn / Facebook / X post URL"
        value={form.post_url}
        onChange={(e) => setForm((f) => ({ ...f, post_url: e.target.value }))}
        className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus-visible:border-marigold"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="mono text-xs text-ink-soft">
          {platform ? (
            <>
              Platform Detected: <span className="font-bold text-marigold">{platform}</span>
            </>
          ) : (
            'Paste your post URL to auto-detect platform'
          )}
        </span>

        <Button type="submit" variant="primary" className="rounded-full px-6 py-2.5 text-xs font-bold mono">
          Submit Link
        </Button>
      </div>

      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
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
      // User cancelled share
    }
  }

  const encoded = encodeURIComponent(text);

  return (
    <div className="rounded-3xl border border-line bg-paper-2 p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-lg space-y-4">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
          {post.title}
        </h3>
        {post.share_count > 0 && (
          <span className="mono shrink-0 rounded-full bg-marigold/15 border border-marigold/30 px-3.5 py-1 text-xs font-bold text-marigold">
            {post.share_count} {post.share_count === 1 ? 'Share' : 'Shares'}
          </span>
        )}
      </div>

      {/* Caption Content */}
      <p className="whitespace-pre-line text-sm sm:text-base text-ink-soft leading-relaxed">
        {post.caption}
      </p>

      {/* Hashtags Strip */}
      <div className="mono flex flex-wrap gap-2 text-xs font-bold text-marigold">
        {post.hashtags.map((h) => (
          <span key={h} className="bg-marigold/10 rounded-md px-2.5 py-0.5">
            {h}
          </span>
        ))}
      </div>

      {/* Share Buttons */}
      <div className="mono pt-3 border-t border-line/60 flex flex-wrap gap-2 text-xs">
        <button
          onClick={copyCaption}
          className="rounded-full border border-line bg-paper px-4 py-2 font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105 cursor-pointer"
        >
          {copied ? 'Caption Copied ✓' : 'Copy Caption'}
        </button>

        {canNativeShare && (
          <button
            onClick={nativeShare}
            className="rounded-full border border-line bg-paper px-4 py-2 font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105 cursor-pointer"
          >
            Native Share
          </button>
        )}

        <a
          href={`https://wa.me/?text=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line bg-paper px-4 py-2 font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105"
        >
          WhatsApp
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${encoded}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line bg-paper px-4 py-2 font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105"
        >
          X (Twitter)
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://sih.gov.in')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line bg-paper px-4 py-2 font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105"
        >
          LinkedIn
        </a>
      </div>

      <SubmitLinkForm postId={post.id} />
    </div>
  );
}

export function SpreadTheSpark() {
  const { data: posts, isLoading } = useQuery({ queryKey: ['promo-posts'], queryFn: getPromoPosts });
  const { data: wall } = useQuery({ queryKey: ['promo-wall'], queryFn: getPromoWall });

  return (
    <div className="mx-auto max-w-[960px] px-4 sm:px-8 pb-24 pt-6 sm:pt-8 space-y-12">
      
      {/* 1. Centered Header Block */}
      <Reveal>
        <div className="text-center flex flex-col items-center justify-center mx-auto max-w-3xl space-y-4">
          <div className="eyebrow">
            Campus Innovation Campaign
          </div>

          <h1 className="font-display text-3xl sm:text-6xl font-bold tracking-tight text-ink leading-tight text-center">
            Spread the Spark Campaign
          </h1>

          <p className="lede mx-auto text-base sm:text-xl text-ink-soft max-w-2xl text-center">
            Amplify Smart India Hackathon 2026 across Nagarjuna College. Share ready-to-use posts on social media, submit your post link, and earn recognition on the official Spark Wall.
          </p>
        </div>
      </Reveal>

      {/* 2. Promotional Posts List */}
      <div className="space-y-6">
        {isLoading && (
          <div className="rounded-3xl border border-line bg-paper-2 p-10 text-center text-ink-soft mono text-sm">
            Loading ready-to-share promo posts...
          </div>
        )}

        {posts?.map((post, i) => (
          <Reveal key={post.id} delay={Math.min(i * 0.05, 0.2)}>
            <PromoCard post={post} />
          </Reveal>
        ))}
      </div>

      {/* 3. The Spark Wall of Advocates */}
      {wall && wall.length > 0 && (
        <Reveal delay={0.15}>
          <div className="rounded-3xl border border-line bg-paper p-6 sm:p-10 shadow-sm space-y-6">
            <div className="text-center space-y-1">
              <div className="mono text-xs font-bold text-marigold uppercase tracking-wider">
                Community Advocates
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                The Spark Wall of Advocates
              </h2>
              <p className="text-sm text-ink-soft">
                NCET students and coordinators who have amplified SIH 2026 across social media.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {wall.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper-2 px-5 py-3.5 shadow-xs"
                >
                  <span className="font-bold text-ink text-sm sm:text-base">{w.name}</span>
                  <span className="mono text-xs font-bold text-marigold bg-marigold/10 rounded-md px-3 py-1 border border-marigold/20">
                    {w.platform}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

    </div>
  );
}
