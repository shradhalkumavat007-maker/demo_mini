'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useInventoryStore } from '@/store/inventory-store';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const generateAlerts = useInventoryStore((s) => s.generateAlerts);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    generateAlerts();
  }, [generateAlerts]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('flex min-h-screen flex-col transition-all duration-200', collapsed ? 'lg:pl-[68px]' : 'lg:pl-64')}>
        <Header />
        <main className="flex-1 p-4 lg:p-6 animate-in-fade">
          {children}
        </main>
      </div>
    </div>
  );
}
