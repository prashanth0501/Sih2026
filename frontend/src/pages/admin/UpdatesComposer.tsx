import { useState } from 'react';
import { UPDATES, type UpdatePost, type PostKind } from '@/lib/data';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const KIND_LABEL = { post: 'Post', update: 'Update' } as const;
const KIND_TONE = {
  post: 'bg-marigold/10 text-marigold',
  update: 'bg-indigo/10 text-indigo',
} as const;

export function UpdatesComposer() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<UpdatePost[]>(UPDATES);
  const [kind, setKind] = useState<PostKind>('post');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !body) return;
    const post: UpdatePost = {
      id: `u-${Date.now()}`,
      kind,
      author: `${user?.name ?? 'Coordinator'} · ${user?.role === 'spoc' ? 'SPOC' : 'Coordinator'}`,
      date: new Date().toISOString().slice(0, 10),
      title,
      body,
    };
    setPosts((p) => [...p, post]);
    setTitle('');
    setBody('');
  }

  return (
    <div>
      <h1 className="font-display text-[1.6rem] font-bold">Updates composer</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        <span className="text-marigold">Posts</span> show share buttons on the public page, for anything worth
        passing on. <span className="text-indigo">Updates</span> are informational only — no share buttons.
      </p>

      <form onSubmit={publish} className="mt-6 grid max-w-xl gap-3 border border-line bg-paper p-5">
        <div className="mono flex gap-2 text-[0.7rem]">
          {(['post', 'update'] as PostKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'rounded-full border px-4 py-2 transition-colors',
                kind === k ? cn('border-transparent', KIND_TONE[k]) : 'border-line text-ink-soft hover:border-ink'
              )}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="What's the update?"
          className="border border-line bg-paper-2 px-4 py-2.5 outline-none focus-visible:border-marigold"
        />
        <Button type="submit" variant="primary" className="justify-self-start">
          Publish {KIND_LABEL[kind]} →
        </Button>
      </form>

      <div className="mt-8 grid gap-3">
        {[...posts].reverse().map((p) => (
          <div key={p.id} className="border border-line bg-paper p-4">
            <div className="flex items-center justify-between gap-3">
              <span className={cn('mono inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.58rem]', KIND_TONE[p.kind])}>
                {KIND_LABEL[p.kind]}
              </span>
              <div className="mono text-[0.6rem] text-ink-soft">{p.date}</div>
            </div>
            <div className="mono mt-2 text-[0.6rem] text-ink-soft">{p.author}</div>
            <div className="mt-1 font-bold">{p.title}</div>
            <p className="mt-1 text-[0.85rem] text-ink-soft">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
