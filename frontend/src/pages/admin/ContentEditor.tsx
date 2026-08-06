import { useState } from 'react';
import { PEOPLE } from '@/lib/data';
import { Button } from '@/components/ui/Button';

const SLUGS = ['principal-message', 'profile-bhargav', 'profile-partha', 'profile-nirmith', 'awareness-why-sih'];

export function ContentEditor() {
  const [slug, setSlug] = useState(SLUGS[0]);
  const [text, setText] = useState(PEOPLE.principal.message.join('\n\n'));
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <h1 className="font-display text-[1.6rem] font-bold">Content editor</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Institutional copy lives here instead of in code, so it can change without a deploy. Maps to{' '}
        <code className="mono rounded bg-paper-3 px-1.5 py-0.5 text-[0.78rem]">PUT /content/{'{slug}'}</code>.
      </p>

      <div className="mt-6 flex max-w-xl flex-col gap-3">
        <select
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSaved(false);
          }}
          className="border border-line bg-paper px-4 py-2.5 outline-none focus-visible:border-marigold"
        >
          {SLUGS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSaved(false);
          }}
          rows={10}
          className="border border-line bg-paper px-4 py-3 outline-none focus-visible:border-marigold"
        />
        <Button
          type="button"
          variant="primary"
          className="justify-self-start"
          onClick={() => setSaved(true)}
        >
          Save →
        </Button>
        {saved && <p className="text-[0.82rem] text-green-700">Saved.</p>}
      </div>
    </div>
  );
}
