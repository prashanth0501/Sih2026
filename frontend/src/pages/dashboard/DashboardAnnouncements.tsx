import { ANNOUNCEMENTS } from '@/lib/data';

export function DashboardAnnouncements() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-[1.6rem] font-bold">Announcements</h1>
      <div className="mt-6 grid gap-4">
        {ANNOUNCEMENTS.map((a) => (
          <div key={a.id} className="border border-line bg-paper p-5">
            <div className="mono text-[0.62rem] text-ink-soft">{a.date}</div>
            <h2 className="mt-1.5 text-[1.05rem] font-bold">{a.title}</h2>
            <p className="mt-1.5 text-ink-soft">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
