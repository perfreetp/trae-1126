import type { EquipmentStatus, FaultLevel, FaultStatus, FeedbackStatus, FeedbackType } from '../types';
import { EquipmentStatusLabels, FaultLevelLabels, FaultStatusLabels } from '../types';

interface StatusBadgeProps {
  status: EquipmentStatus | FaultLevel | FaultStatus | FeedbackStatus | FeedbackType;
  type?: 'equipment' | 'fault-level' | 'fault-status' | 'feedback';
}

const statusColors: Record<string, string> = {
  running: 'bg-accent-teal/10 text-accent-teal border-accent-teal/30',
  stopped: 'bg-industrial-100 text-industrial-600 border-industrial-300',
  maintenance: 'bg-accent-orange/10 text-accent-orange border-accent-orange/30',
  normal: 'bg-blue-50 text-blue-600 border-blue-200',
  serious: 'bg-amber-50 text-amber-600 border-amber-200',
  urgent: 'bg-red-50 text-red-600 border-red-200',
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  processing: 'bg-blue-50 text-blue-600 border-blue-200',
  completed: 'bg-accent-teal/10 text-accent-teal border-accent-teal/30',
  abnormal: 'bg-red-50 text-red-600 border-red-200',
  suggestion: 'bg-purple-50 text-purple-600 border-purple-200',
};

const statusDots: Record<string, string> = {
  running: 'bg-accent-teal',
  stopped: 'bg-industrial-400',
  maintenance: 'bg-accent-orange',
  normal: 'bg-blue-500',
  serious: 'bg-amber-500',
  urgent: 'bg-red-500',
  pending: 'bg-amber-500',
  processing: 'bg-blue-500',
  completed: 'bg-accent-teal',
};

export function StatusBadge({ status, type = 'equipment' }: StatusBadgeProps) {
  let label: string = status;
  if (type === 'equipment') {
    label = EquipmentStatusLabels[status as EquipmentStatus];
  } else if (type === 'fault-level') {
    label = FaultLevelLabels[status as FaultLevel];
  } else if (type === 'fault-status') {
    label = FaultStatusLabels[status as FaultStatus];
  } else if (type === 'feedback') {
    const feedbackStatus = status as unknown as string;
    label = feedbackStatus === 'abnormal' ? '异常' : feedbackStatus === 'suggestion' ? '建议' : label;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status] || 'bg-gray-400'} ${status === 'urgent' ? 'animate-pulse-slow' : ''}`} />
      {label}
    </span>
  );
}
