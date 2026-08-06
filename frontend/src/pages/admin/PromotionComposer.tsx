import { useState } from 'react';
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
  const { data: posts } = useQuery({ queryKey: ['promo-posts'], queryFn: getPromoPosts });
  const { data: shares } = useQuery({ queryKey: ['promo-shares'], queryFn: getAllPromoShares });

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('#SIH2026');

  const publishMutation = useMutation({
    mutationFn: () => createPromoPost({ title, caption, hashtags: hashtags.split(/\s+/).filter(Boolean) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-posts'] });
      setTitle('');
      setCaption('');
      setHashtags('#SIH2026');
    },
  });

  return (
    <div>
      <h1 className="font-display text-[1.6rem] font-bold">Promotion composer</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Publish ready-to-share content for the public "Spread the Spark" page.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title || !caption) return;
          publishMutation.mutate();
        }}
        className="mt-6 grid max-w-xl gap-3 border border-line bg-paper p-5"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
        />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          placeholder="Caption"
          className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
        />
        <input
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#hashtags #space-separated"
          className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
        />
        <Button type="submit" variant="primary" className="justify-self-start" disabled={publishMutation.isPending}>
          Publish →
        </Button>
      </form>

      <div className="mt-8 grid gap-3">
        {posts?.map((p) => (
          <div key={p.id} className="border border-line bg-paper p-4">
            <div className="font-bold">{p.title}</div>
            <p className="mt-1 text-[0.85rem] text-ink-soft">{p.caption}</p>
            <div className="mono mt-2 flex gap-2 text-[0.6rem] text-marigold">{p.hashtags.join(' ')}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-[1.3rem] font-bold">Submitted links</h2>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Every student who submitted a posted link — no login required from them, so this table is the only
        record. Name and USN are self-reported.
      </p>

      <div className="mt-4 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[720px] border-collapse text-[0.85rem]">
          <thead>
            <tr className="mono border-b border-line text-left text-[0.62rem] text-ink-soft">
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">USN</th>
              <th className="px-4 py-3 font-normal">Platform</th>
              <th className="px-4 py-3 font-normal">Link</th>
              <th className="px-4 py-3 font-normal">On wall?</th>
              <th className="px-4 py-3 font-normal">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {shares?.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0 hover:bg-paper-2">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="mono px-4 py-3 text-ink-soft">{s.usn}</td>
                <td className="px-4 py-3">
                  <span className="mono rounded-full bg-marigold/10 px-2.5 py-0.5 text-[0.62rem] text-marigold">{s.platform}</span>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3">
                  <a href={s.post_url} target="_blank" rel="noopener noreferrer" className="text-marigold hover:underline">
                    {s.post_url}
                  </a>
                </td>
                <td className="px-4 py-3 text-ink-soft">{s.is_public_on_wall ? 'Yes' : 'No'}</td>
                <td className="mono px-4 py-3 text-ink-soft">{new Date(s.submitted_at).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
            {(!shares || shares.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">No submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
