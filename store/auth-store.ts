import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types/user';
import { demoAccounts } from '@/data/mock-users';
import { mockUsers } from '@/data/mock-users';
import { getPermissions, type PermissionKey } from '@/lib/permissions';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: PermissionKey) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        const account = demoAccounts.find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );
        if (!account) {
          return { success: false, error: 'Invalid email or password. Use the demo accounts shown below.' };
        }
        const fullUser = mockUsers.find((u) => u.id === account.id);
        const user = fullUser ?? {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
          status: 'active' as const,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        set({ user: { ...user, lastLogin: new Date().toISOString() }, isAuthenticated: true });
        return { success: true };
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      switchRole: (role: UserRole) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ user: { ...currentUser, role } });
      },
      hasPermission: (permission: PermissionKey) => {
        const user = get().user;
        if (!user) return false;
        return getPermissions(user.role).includes(permission);
      },
    }),
    {
      name: 'electrostock-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
