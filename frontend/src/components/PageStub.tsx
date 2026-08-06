export function PageStub({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-[760px] flex-col justify-center px-5 py-32 sm:px-8">
      <div className="mono mb-4 text-[0.7rem] text-marigold">Under construction</div>
      <h1 className="text-[clamp(1.8rem,4vw,2.6rem)]">{title}</h1>
      {note && <p className="mt-4 max-w-[55ch] text-ink-soft">{note}</p>}
    </div>
  );
}
