import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPromoPost, getPromoSharesForPost, type ApiPromoShare } from '@/api/promotions';

type PlatformFilter = 'all' | 'Instagram' | 'LinkedIn' | 'YouTube' | 'other';

export function PromoPostDetails() {
  const { postId = '' } = useParams<{ postId: string }>();
  const [platform, setPlatform] = useState<PlatformFilter>('all');
  const [query, setQuery] = useState('');

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['promo-post', postId],
    queryFn: () => getPromoPost(postId),
    enabled: Boolean(postId),
  });

  const { data: shares = [], isLoading: sharesLoading } = useQuery({
    queryKey: ['promo-post-shares', postId],
    queryFn: () => getPromoSharesForPost(postId),
    enabled: Boolean(postId),
    refetchInterval: 5000,
  });

  const isLoading = postLoading || sharesLoading;

  // Platform counts
  const instagramCount = shares.filter((s) => s.platform === 'Instagram').length;
  const linkedinCount = shares.filter((s) => s.platform === 'LinkedIn').length;
  const youtubeCount = shares.filter((s) => s.platform === 'YouTube').length;
  const otherCount = shares.filter((s) => !['Instagram', 'LinkedIn', 'YouTube'].includes(s.platform)).length;

  const filteredShares = useMemo(() => {
    return shares.filter((s: ApiPromoShare) => {
      // Platform tab check
      if (platform === 'Instagram' && s.platform !== 'Instagram') return false;
      if (platform === 'LinkedIn' && s.platform !== 'LinkedIn') return false;
      if (platform === 'YouTube' && s.platform !== 'YouTube') return false;
      if (platform === 'other' && ['Instagram', 'LinkedIn', 'YouTube'].includes(s.platform)) return false;

      // Text query check
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      const studentName = s.student_name || s.name || '';
      return studentName.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q) || s.post_url.toLowerCase().includes(q);
    });
  }, [shares, platform, query]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-ink-soft mono">
        Loading promo post details & student shares...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Promo Post Not Found</h1>
        <p className="mt-2 text-ink-soft">The requested promo post ID does not exist.</p>
        <Link to="/admin/promotions" className="mono mt-4 inline-block text-[0.8rem] text-marigold hover:underline">
          ← Back to Promotions
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header & Breadcrumb */}
      <div className="mb-6">
        <Link to="/admin/promotions" className="mono text-[0.75rem] text-marigold hover:underline">
          ← Back to All Promo Posts
        </Link>
        <h1 className="font-display text-[1.8rem] font-bold mt-2">{post.title}</h1>
        <p className="mt-1 text-[0.9rem] text-ink-soft max-w-3xl">{post.caption}</p>
        <div className="mono mt-2.5 flex flex-wrap gap-2 text-[0.75rem] text-marigold">
          {post.hashtags?.map((tag, idx) => (
            <span key={idx} className="rounded bg-paper-3 px-2 py-0.5 border border-line">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Post Analytics Banner */}
      <div className="mt-6 border border-line bg-paper p-5 grid gap-4 sm:grid-cols-4">
        <div>
          <div className="mono text-[0.62rem] text-ink-soft uppercase">Total Student Shares</div>
          <div className="mt-1 font-display text-2xl font-bold text-marigold">{shares.length}</div>
        </div>
        <div>
          <div className="mono text-[0.62rem] text-ink-soft uppercase">Instagram Submissions</div>
          <div className="mt-1 font-display text-2xl font-bold text-pink-600">{instagramCount}</div>
        </div>
        <div>
          <div className="mono text-[0.62rem] text-ink-soft uppercase">LinkedIn Submissions</div>
          <div className="mt-1 font-display text-2xl font-bold text-blue-600">{linkedinCount}</div>
        </div>
        <div>
          <div className="mono text-[0.62rem] text-ink-soft uppercase">YouTube Submissions</div>
          <div className="mt-1 font-display text-2xl font-bold text-red-600">{youtubeCount}</div>
        </div>
      </div>

      {/* Platform Tabs & Search Filter */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-2 mono text-[0.78rem]">
          <button
            onClick={() => setPlatform('all')}
            className={`px-3 py-1.5 rounded transition-colors ${platform === 'all' ? 'bg-paper-3 font-bold border border-line text-ink' : 'text-ink-soft hover:text-ink'}`}
          >
            All Platforms ({shares.length})
          </button>
          <button
            onClick={() => setPlatform('Instagram')}
            className={`px-3 py-1.5 rounded transition-colors ${platform === 'Instagram' ? 'bg-pink-700/20 text-pink-700 font-bold border border-pink-700/40' : 'text-ink-soft hover:text-pink-600'}`}
          >
            📸 Instagram ({instagramCount})
          </button>
          <button
            onClick={() => setPlatform('LinkedIn')}
            className={`px-3 py-1.5 rounded transition-colors ${platform === 'LinkedIn' ? 'bg-blue-700/20 text-blue-700 font-bold border border-blue-700/40' : 'text-ink-soft hover:text-blue-600'}`}
          >
            💼 LinkedIn ({linkedinCount})
          </button>
          <button
            onClick={() => setPlatform('YouTube')}
            className={`px-3 py-1.5 rounded transition-colors ${platform === 'YouTube' ? 'bg-red-700/20 text-red-700 font-bold border border-red-700/40' : 'text-ink-soft hover:text-red-600'}`}
          >
            🎥 YouTube ({youtubeCount})
          </button>
          <button
            onClick={() => setPlatform('other')}
            className={`px-3 py-1.5 rounded transition-colors ${platform === 'other' ? 'bg-paper-3 font-bold border border-line text-ink' : 'text-ink-soft hover:text-ink'}`}
          >
            Other ({otherCount})
          </button>
        </div>

        <input
          type="search"
          placeholder="Filter by student name or USN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64 border border-line bg-paper px-3 py-2 text-[0.82rem] outline-none focus-visible:border-marigold"
        />
      </div>

      {/* Student Shares Table */}
      <div className="mt-4 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[760px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="mono border-b border-line text-left text-[0.62rem] text-ink-soft uppercase">
              <th className="px-4 py-3 font-normal">Student Name</th>
              <th className="px-4 py-3 font-normal">USN</th>
              <th className="px-4 py-3 font-normal">Platform</th>
              <th className="px-4 py-3 font-normal">Social Post URL</th>
              <th className="px-4 py-3 font-normal">Submitted Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredShares.map((s) => {
              const studentName = s.student_name || s.name || 'Anonymous Student';
              return (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                  <td className="px-4 py-3 font-medium">{studentName}</td>
                  <td className="mono px-4 py-3 font-semibold text-ink-soft">{s.usn}</td>
                  <td className="px-4 py-3">
                    <span className={`mono rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${
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
                  <td className="px-4 py-3">
                    <a
                      href={s.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono inline-flex items-center gap-1 text-[0.78rem] text-marigold hover:underline font-bold"
                    >
                      Open Post Link ↗
                    </a>
                  </td>
                  <td className="mono px-4 py-3 text-[0.78rem] text-ink-soft">
                    {new Date(s.submitted_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              );
            })}

            {filteredShares.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-soft">
                  No share submissions match your selected platform or search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
