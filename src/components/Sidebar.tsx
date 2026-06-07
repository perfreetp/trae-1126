import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  Wrench,
  Calendar,
  Fuel,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../store';

const menuItems = [
  { path: '/dashboard', label: '作业看板', icon: LayoutDashboard },
  { path: '/equipment', label: '设备台账', icon: ClipboardList },
  { path: '/running-hours', label: '运行小时', icon: Clock },
  { path: '/maintenance', label: '故障维修', icon: Wrench },
  { path: '/upkeep', label: '保养排程', icon: Calendar },
  { path: '/oil-tire', label: '油料轮胎', icon: Fuel },
  { path: '/driver-feedback', label: '司机反馈', icon: MessageSquare },
  { path: '/performance', label: '绩效统计', icon: BarChart3 },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-primary-900 text-white transition-all duration-300 z-20 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-primary-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-teal rounded-industrial flex items-center justify-center font-bold">
              港
            </div>
            <span className="font-semibold text-lg">设备运维</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 bg-accent-teal rounded-industrial flex items-center justify-center font-bold mx-auto">
            港
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-industrial transition-all duration-200 ${
                      isActive
                        ? 'bg-accent-teal text-white shadow-lg'
                        : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={toggleSidebar}
        className="h-12 border-t border-primary-700 flex items-center justify-center hover:bg-primary-800 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
