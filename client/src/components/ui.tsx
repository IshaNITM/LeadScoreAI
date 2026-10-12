import type { Priority, MatchStatus } from '../types';
import {
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    HIGH: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MODERATE: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-red-50 text-red-700 border-red-200',
  };

  const icons: Record<Priority, React.ReactNode> = {
    HIGH: <ArrowUpCircle className="w-3.5 h-3.5" />,
    MODERATE: <ArrowRightCircle className="w-3.5 h-3.5" />,
    LOW: <ArrowDownCircle className="w-3.5 h-3.5" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[priority]}`}>
      {icons[priority]}
      {priority}
    </span>
  );
}

export function MatchStatusIcon({ status }: { status: MatchStatus }) {
  if (status === 'MATCH') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === 'MISMATCH') return <XCircle className="w-4 h-4 text-red-500" />;
  return <HelpCircle className="w-4 h-4 text-slate-400" />;
}

export function ScoreBadge({ score }: { score: number }) {
  let color = 'text-red-600 bg-red-50 border-red-200';
  if (score >= 75) color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  else if (score >= 45) color = 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold border ${color}`}>
      {score}
    </span>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600`} />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <XCircle className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-900 mb-1">Something went wrong</h3>
      <p className="text-sm text-red-600 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
