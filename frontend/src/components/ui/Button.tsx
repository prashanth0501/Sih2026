import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, useRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

const base =
  'mono inline-flex items-center gap-2.5 rounded-sm border px-6 py-4 text-[0.74rem] transition-colors duration-150 will-change-transform';
const variants = {
  primary: 'bg-ink text-paper border-ink hover:bg-marigold hover:border-marigold',
  ghost: 'bg-transparent text-ink border-ink hover:border-marigold hover:text-marigold',
};

function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.16}px, ${y * 0.32}px)`;
  };
  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  };
  return { ref, onMouseMove, onMouseLeave };
}

type Variant = keyof typeof variants;

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const magnetic = useMagnetic<HTMLButtonElement>();
  return (
    <button
      ref={magnetic.ref}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

export function LinkButton({
  variant = 'primary',
  className,
  ...props
}: LinkProps & { variant?: Variant; className?: string }) {
  const magnetic = useMagnetic<HTMLAnchorElement>();
  return (
    <Link
      ref={magnetic.ref}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

export function ExternalLinkButton({
  variant = 'primary',
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  const magnetic = useMagnetic<HTMLAnchorElement>();
  return (
    <a
      ref={magnetic.ref}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
