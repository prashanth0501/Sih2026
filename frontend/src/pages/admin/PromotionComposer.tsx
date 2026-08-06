import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { getPromoPosts, getAllPromoShares, type ApiPromoPost } from '@/api/promotions';
import { Button } from '@/components/ui/Button';

async function createPromoPost(input: { title: string; caption: string; hashtags: string[] }) {
  const { data } = await api.post<ApiPromoPost>('/promotions', input);
  return data;
}

export function PromotionComposer() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading: postsLoading } = useQuery({ queryKey: ['promo-posts'], queryFn: getPromoPosts });
  const { data: shares = [], isLoading: sharesLoading } = useQuery({ queryKey: ['promo-shares'], queryFn: getAllPromoShares });

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('#SIH2026 #IgniteSIH');

  const publishMutation = useMutation({
    mutationFn: () => createPromoPost({ title, caption, hashtags: hashtags.split(/\s+/).filter(Boolean) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-posts'] });
      setTitle('');
      setCaption('');
      setHashtags('#SIH2026 #IgniteSIH');
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.6rem] font-bold">Promotion Composer & Post Dashboard</h1>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            Create promotional posts and view detailed student share submissions broken down by platform.
          </p>
        </div>
        <div className="mono rounded bg-paper-3 px-3 py-1 text-[0.75rem] text-marigold border border-line">
          Total Student Posts: {shares.length}
        </div>
      </div>

      {/* Publish New Promo Post Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title || !caption) return;
          publishMutation.mutate();
        }}
        className="mt-6 grid max-w-2xl gap-3 border border-line bg-paper p-5"
      >
        <div className="font-bold text-[0.95rem]">Create New Promotional Post</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title (e.g. SIH 2026 Registrations Open)"
          required
          className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold text-[0.9rem]"
        />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          placeholder="Post Caption for students to copy & share..."
          required
          className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold text-[0.9rem]"
        />
        <input
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#hashtags #space-separated"
          className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold text-[0.9rem] font-mono"
        />
        <Button type="submit" variant="primary" className="justify-self-start mt-1" disabled={publishMutation.isPending}>
          {publishMutation.isPending ? 'Publishing...' : 'Publish Promo Post →'}
        </Button>
      </form>

      {/* Published Admin Promo Posts Cards Grid */}
      <h2 className="mt-10 font-display text-[1.3rem] font-bold">Published Promo Posts ({posts.length})</h2>
      <p className="mt-1 text-[0.85rem] text-ink-soft">
        Click on any post card to open its dedicated page and view student submissions split by Instagram, LinkedIn, YouTube, and other platforms.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {postsLoading && <p className="text-ink-soft">Loading posts...</p>}

        {posts.map((p) => {
          const postShares = shares.filter((s) => s.promo_post_id === p.id);
          const shareCount = p.share_count ?? postShares.length;

          return (
            <div key={p.id} className="border border-line bg-paper p-5 flex flex-col justify-between hover:border-marigold transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="font-bold text-[1.05rem]">{p.title}</div>
                  <span className="mono rounded-full bg-marigold/10 border border-marigold/30 px-2.5 py-0.5 text-[0.68rem] text-marigold font-bold shrink-0">
                    {shareCount} Shares
                  </span>
                </div>
                <p className="mt-2 text-[0.85rem] text-ink-soft line-clamp-3">{p.caption}</p>
                <div className="mono mt-3 flex flex-wrap gap-1.5 text-[0.7rem] text-marigold">
                  {p.hashtags?.map((tag, i) => (
                    <span key={i} className="rounded bg-paper-2 border border-line px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-3 flex items-center justify-between">
                <span className="mono text-[0.7rem] text-ink-soft">
                  {shareCount} student links submitted
                </span>
                <Link
                  to={`/admin/promotions/${p.id}`}
                  className="mono rounded bg-paper-3 border border-line px-3 py-1.5 text-[0.75rem] font-bold text-ink hover:border-marigold hover:text-marigold transition-colors"
                >
                  View Details & Submissions →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overview Table of All Recent Student Submissions */}
      <h2 className="mt-12 font-display text-[1.3rem] font-bold">Recent Student Link Submissions Across All Posts</h2>
      <p className="mt-1 text-[0.85rem] text-ink-soft">
        Global list of student shares submitted on the Spread the Spark portal.
      </p>

      <div className="mt-4 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[720px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="mono border-b border-line text-left text-[0.62rem] text-ink-soft uppercase">
              <th className="px-4 py-3 font-normal">Student Name</th>
              <th className="px-4 py-3 font-normal">USN</th>
              <th className="px-4 py-3 font-normal">Platform</th>
              <th className="px-4 py-3 font-normal">Social Link</th>
              <th className="px-4 py-3 font-normal">Submitted Date</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((s) => {
              const studentName = s.student_name || s.name || 'Student';
              return (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                  <td className="px-4 py-3 font-medium">{studentName}</td>
                  <td className="mono px-4 py-3 text-ink-soft font-semibold">{s.usn}</td>
                  <td className="px-4 py-3">
                    <span className={`mono rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold ${
                      s.platform === 'Instagram'
                        ? 'bg-pink-100 text-pink-700 border border-pink-300'
                        : s.platform === 'LinkedIn'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : s.platform === 'YouTube'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-paper-3 text-ink border border-line'
                    }`}>
                      {s.platform}
                    </span>
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3">
                    <a
                      href={s.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono font-bold text-[0.78rem] text-marigold hover:underline"
                    >
                      Open Link ↗
                    </a>
                  </td>
                  <td className="mono px-4 py-3 text-ink-soft text-[0.78rem]">
                    {new Date(s.submitted_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              );
            })}
            {(!shares || shares.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                  {sharesLoading ? 'Loading shares...' : 'No student link submissions yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
