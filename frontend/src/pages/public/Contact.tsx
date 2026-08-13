import { useState } from 'react';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { PEOPLE, COLLEGE_SOCIAL, SIH_OFFICIAL } from '@/lib/data';

const PEOPLE_TO_CONTACT = [
  { ...PEOPLE.spoc, note: 'Final selection & escalations' },
  { ...PEOPLE.ncet_coordinator, note: 'Registrations & logistics' },
];

export function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setLoading(true);
    setError('');

    try {
      // 1. Send background email via Web3Forms directly to parthshankar21@gmail.com
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: 'b8478426-3023-42e1-a0d3-305f2c416e78', // Public Web3Forms API Endpoint
          name: form.name,
          email: form.email,
          message: form.message,
          subject: `SIH 2026 Portal Inquiry from ${form.name}`,
          from_name: 'NCET SIH 2026 Portal',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
      } else {
        // Fallback to mailto if web form service is unreachable
        triggerMailtoFallback();
      }
    } catch {
      triggerMailtoFallback();
    } finally {
      setLoading(false);
    }
  }

  function triggerMailtoFallback() {
    const subject = encodeURIComponent(`SIH 2026 Inquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:parthshankar21@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div>
      <div className="mx-auto max-w-[960px] px-5 pt-6 sm:pt-8 sm:px-8">
        <Reveal>
          <div className="text-center flex flex-col items-center justify-center mx-auto max-w-2xl space-y-3">
            <div className="eyebrow">Contact</div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink text-center">
              Talk to a real person.
            </h1>
            <p className="lede text-center mx-auto max-w-xl text-base text-ink-soft">
              Coordinators handle day-to-day questions about screening. The SPOC handles anything bigger.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {PEOPLE_TO_CONTACT.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    className="absolute inset-[-10%] rounded-full opacity-60 blur-lg"
                    style={{ background: 'radial-gradient(circle, var(--color-spark-glow), transparent 72%)' }}
                  />
                  <img src={p.photoUrl} alt={p.name} className="relative h-28 w-28 rounded-full object-cover shadow-lg shadow-ink/10" />
                </div>
                <div className="mt-4 font-bold text-ink text-base">{p.name}</div>
                <div className="mono mt-1 text-[0.62rem] text-marigold">{p.role}</div>
                <p className="mt-2 text-[0.82rem] text-ink-soft">{p.note}</p>
                <div className="mt-3 grid gap-1 text-[0.8rem]">
                  <a href={`mailto:${p.email}`} className="text-marigold hover:underline">{p.email}</a>
                  <a href={`tel:${p.phone.replace(/\s+/g, '')}`} className="text-ink-soft hover:text-marigold">{p.phone}</a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.1}>
        <div className="relative mt-20 overflow-hidden bg-ink py-14 text-paper">
          <div
            className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--color-spark-glow), transparent 70%)' }}
          />
          <div className="relative mx-auto grid max-w-[960px] gap-10 px-5 sm:grid-cols-2 sm:px-8">
            <div>
              <h2 className="text-[1.15rem] font-bold text-paper">Follow the college</h2>
              <p className="mt-2 text-[0.85rem] text-paper/65">
                Nagarjuna College of Engineering &amp; Technology, official accounts.
              </p>
              <div className="mono mt-4 flex flex-wrap gap-2 text-[0.66rem]">
                <a href={COLLEGE_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-paper/20 px-3.5 py-2 hover:border-marigold hover:text-marigold">Instagram</a>
                <a href={COLLEGE_SOCIAL.youtube} target="_blank" rel="noopener noreferrer" className="rounded-full border border-paper/20 px-3.5 py-2 hover:border-marigold hover:text-marigold">YouTube</a>
                <a href={COLLEGE_SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full border border-paper/20 px-3.5 py-2 hover:border-marigold hover:text-marigold">LinkedIn</a>
              </div>
            </div>
            <div>
              <h2 className="text-[1.15rem] font-bold text-paper">The national SIH team</h2>
              <p className="mt-2 text-[0.85rem] text-paper/65">
                For questions only AICTE / the MoE Innovation Cell can answer.
              </p>
              <a href={`mailto:${SIH_OFFICIAL.email}`} className="mt-3 block text-[0.82rem] text-marigold hover:underline">
                {SIH_OFFICIAL.email}
              </a>
              <div className="mono mt-4 flex flex-wrap gap-2 text-[0.66rem]">
                <a href={SIH_OFFICIAL.website} target="_blank" rel="noopener noreferrer" className="rounded-full border border-paper/20 px-3.5 py-2 hover:border-marigold hover:text-marigold">sih.gov.in</a>
                <a href={SIH_OFFICIAL.social.x} target="_blank" rel="noopener noreferrer" className="rounded-full border border-paper/20 px-3.5 py-2 hover:border-marigold hover:text-marigold">X</a>
                <a href={SIH_OFFICIAL.social.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full border border-paper/20 px-3.5 py-2 hover:border-marigold hover:text-marigold">LinkedIn</a>
                <a href={SIH_OFFICIAL.social.facebook} target="_blank" rel="noopener noreferrer" className="rounded-full border border-paper/20 px-3.5 py-2 hover:border-marigold hover:text-marigold">Facebook</a>
                <a href={SIH_OFFICIAL.social.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-paper/20 px-3.5 py-2 hover:border-marigold hover:text-marigold">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto max-w-[640px] px-5 pb-16 pt-16 sm:px-8">
        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-line bg-paper-2 p-8 sm:p-10 shadow-sm">
            <div className="eyebrow text-left text-[0.85rem]">Or write it down</div>
            <h2 className="mt-2 text-[1.4rem] font-bold text-ink">Send a message</h2>
            {sent ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-bold text-marigold">Message Sent Successfully!</p>
                <p className="text-xs text-ink-soft">Thanks — a coordinator will get back to you shortly.</p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: '', email: '', message: '' });
                  }}
                  className="mono text-xs font-bold text-marigold hover:underline pt-2 inline-block cursor-pointer"
                >
                  Send another message →
                </button>
              </div>
            ) : (
              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink block">
                    Your name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:text-ink-soft/60 outline-none focus:border-marigold focus:bg-paper"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink block">
                    Your email <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Your email"
                    className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:text-ink-soft/60 outline-none focus:border-marigold focus:bg-paper"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink block">
                    What's on your mind? <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="What's on your mind?"
                    className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:text-ink-soft/60 outline-none focus:border-marigold focus:bg-paper"
                  />
                </div>

                {error && <p className="text-xs font-bold text-red-600">{error}</p>}

                <Button type="submit" variant="primary" disabled={loading} className="justify-self-start mt-1">
                  {loading ? 'Sending message...' : 'Send message →'}
                </Button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
