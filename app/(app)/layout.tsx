'use client';

import { AppShell } from '@/components/layout/app-shell';
import { RoleSwitcher } from '@/components/layout/role-switcher';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="mb-4 flex justify-end">
        <RoleSwitcher />
      </div>
      {children}
    </AppShell>
  );
}
