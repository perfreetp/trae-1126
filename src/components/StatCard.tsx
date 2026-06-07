import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

const colorClasses = {
  blue: 'bg-primary-50 text-primary-900',
  green: 'bg-accent-teal/10 text-accent-teal',
  orange: 'bg-accent-orange/10 text-accent-orange',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'blue' }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-industrial-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-industrial-800">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? 'text-accent-teal' : 'text-accent-orange'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-industrial-400 ml-1">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-industrial ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
