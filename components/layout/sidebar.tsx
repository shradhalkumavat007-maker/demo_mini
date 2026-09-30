'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  ChevronLeft,
  HelpCircle,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { navSections } from './nav-config';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { getPermissions } from '@/lib/permissions';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebar = useUIStore((s) => s.setMobileSidebar);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const permissions = user ? getPermissions(user.role) : [];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-navy text-white transition-all duration-200',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-base font-bold leading-tight">ElectroStock</span>
              <span className="text-[11px] text-white/60">Inventory Management</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
          {navSections.map((section, si) => {
            const visibleItems = section.items.filter((item) =>
              permissions.includes(item.permission)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={si} className="mb-1">
                {!collapsed && section.label && (
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    {section.label}
                  </p>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebar(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors relative group',
                        active
                          ? 'text-white bg-primary'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                      {active && (
                        <span className="absolute left-0 top-0 h-full w-1 rounded-r bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Button variant="ghost" size="sm" className="flex-1 justify-start text-white/70 hover:text-white hover:bg-white/5" asChild>
                <Link href="/settings">
                  <HelpCircle className="mr-2 h-4 w-4" /> Help
                </Link>
              </Button>
            </div>
          )}
          {!collapsed && user && (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Button variant="ghost" size="sm" className="flex-1 justify-start text-white/70 hover:text-white hover:bg-white/5" asChild>
                <Link href={`/users`}>
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </Link>
              </Button>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:text-white hover:bg-white/5'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center justify-center py-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
      </aside>
    </>
  );
}
