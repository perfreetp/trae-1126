import { Bell, User, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store';
import { ShiftTypeLabels } from '../types';

export function Header() {
  const { currentShift, setCurrentShift, faultOrders } = useAppStore();
  
  const pendingFaults = faultOrders.filter(f => f.status === 'pending').length;
  const urgentFaults = faultOrders.filter(f => f.level === 'urgent' && f.status !== 'completed').length;

  return (
    <header className="h-16 bg-white border-b border-industrial-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-industrial-500">当前班次：</span>
          <div className="flex bg-industrial-100 rounded-industrial p-0.5">
            {(['day', 'night'] as const).map((shift) => (
              <button
                key={shift}
                onClick={() => setCurrentShift(shift)}
                className={`px-3 py-1 text-sm rounded-industrial transition-all duration-200 ${
                  currentShift === shift
                    ? 'bg-white text-primary-900 shadow-sm font-medium'
                    : 'text-industrial-500 hover:text-industrial-700'
                }`}
              >
                {ShiftTypeLabels[shift]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-industrial-500 hover:text-primary-900 hover:bg-primary-50 rounded-industrial transition-colors">
            <Bell className="w-5 h-5" />
            {(pendingFaults > 0 || urgentFaults > 0) && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-orange text-white text-xs rounded-full flex items-center justify-center">
                {pendingFaults + urgentFaults}
              </span>
            )}
          </button>
          <button className="p-2 text-industrial-500 hover:text-primary-900 hover:bg-primary-50 rounded-industrial transition-colors">
            <Sun className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-industrial-200" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-industrial-800">管理员</p>
            <p className="text-xs text-industrial-500">设备部</p>
          </div>
        </div>
      </div>
    </header>
  );
}
