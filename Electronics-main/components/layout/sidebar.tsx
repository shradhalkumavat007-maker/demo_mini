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

import { useRouter } from 'next/navigation';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebar = useUIStore((s) => s.setMobileSidebar);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const permissions = user ? getPermissions(user.role) : [];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card text-card-foreground transition-all duration-200',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Link
          href="/"
          className="flex h-16 items-center gap-3 border-b border-border px-4 hover:bg-muted/50 transition-colors cursor-pointer group"
          title="Return to ElectroStock Home"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-base font-bold leading-tight tracking-tight text-foreground">ElectroStock</span>
              <span className="text-[11px] font-medium text-muted-foreground">Inventory Management</span>
            </div>
          )}
        </Link>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-1">
          {navSections.map((section, si) => {
            const visibleItems = section.items.filter((item) =>
              permissions.includes(item.permission)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={si} className="mb-2">
                {!collapsed && section.label && (
                  <p className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                        'flex items-center gap-3 py-2 text-sm font-medium transition-all rounded-lg group',
                        collapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : 'px-3 mx-1',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-colors',
                          active
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border p-2 space-y-1">
          {!collapsed && (
            <div className="px-1 py-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-8 text-xs font-medium"
                asChild
              >
                <Link href="/help">
                  <HelpCircle className="mr-2 h-3.5 w-3.5 text-info" /> Help Center
                </Link>
              </Button>
            </div>
          )}
          {!collapsed && user && (
            <div className="px-1 py-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted h-8 text-xs font-medium"
                asChild
              >
                <Link href="/profile">
                  <UserIcon className="mr-2 h-3.5 w-3.5 text-primary" /> My Profile
                </Link>
              </Button>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 rounded-lg',
              collapsed ? 'justify-center px-0 h-10' : 'px-3'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0 text-destructive/80" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center justify-center py-2 text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-md transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
      </aside>
    </>
  );
}
