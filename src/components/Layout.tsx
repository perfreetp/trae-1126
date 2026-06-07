import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../store';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-industrial-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-60'}`}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
