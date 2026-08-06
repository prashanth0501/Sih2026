import { STATUS_LABEL, STATUS_TONE, type ScreeningStatus } from '@/lib/data';
import { cn } from '@/lib/utils';

const toneClasses = {
  neutral: 'bg-paper-3 text-ink-soft',
  progress: 'bg-indigo/10 text-indigo',
  good: 'bg-green-600/10 text-green-700',
  bad: 'bg-red-600/10 text-red-700',
};

export function StatusBadge({ status }: { status: ScreeningStatus }) {
  return (
    <span className={cn('mono inline-flex items-center rounded-full px-3 py-1 text-[0.62rem]', toneClasses[STATUS_TONE[status]])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
