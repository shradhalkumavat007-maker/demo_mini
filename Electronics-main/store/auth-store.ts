import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types/user';
import { demoAccounts, mockUsers } from '@/data/mock-users';
import { getPermissions, getRoleLabel, type PermissionKey } from '@/lib/permissions';
import { useInventoryStore } from '@/store/inventory-store';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  registerStaff: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: PermissionKey) => boolean;
}

// In-memory password store for self-registered accounts
const registeredPasswords: Record<string, string> = {};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password.trim();

        // 1. Check known test / demo accounts
        const account = demoAccounts.find(
          (a) => a.email.toLowerCase() === cleanEmail && a.password === cleanPass
        );

        let authenticatedUser: User | null = null;

        if (account) {
          const invUsers = useInventoryStore.getState().users;
          const matched = invUsers.find((u) => u.id === account.id || u.email.toLowerCase() === cleanEmail);
          authenticatedUser = matched ?? {
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role,
            status: 'active' as const,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
        } else {
          // 2. Check registered users in inventory store
          const invUsers = useInventoryStore.getState().users;
          const foundUser = invUsers.find((u) => u.email.toLowerCase() === cleanEmail);

          if (foundUser) {
            // Check against stored password for self-registered accounts
            const storedPass = registeredPasswords[cleanEmail];
            if (storedPass) {
              if (cleanPass !== storedPass) {
                return { success: false, error: 'Incorrect password.' };
              }
            } else if (cleanPass.length < 4) {
              return { success: false, error: 'Password must be at least 4 characters.' };
            }
            authenticatedUser = foundUser;
          }
        }

        if (!authenticatedUser) {
          return {
            success: false,
            error: 'Invalid credentials. Please verify your email and password, or use test accounts.',
          };
        }

        if (authenticatedUser.status === 'inactive') {
          return {
            success: false,
            error: 'Your account has been deactivated. Please contact an Administrator.',
          };
        }

        const now = new Date().toISOString();
        const updatedUser: User = { ...authenticatedUser, lastLogin: now };

        set({ user: updatedUser, isAuthenticated: true });

        // Update lastLogin in inventory store
        useInventoryStore.getState().updateUser(updatedUser.id, {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
        });

        // Audit log
        try {
          useInventoryStore.getState().addAuditLog({
            action: 'login',
            actionLabel: 'User Sign In',
            userName: updatedUser.name,
            userId: updatedUser.id,
            userRole: updatedUser.role,
            description: `${updatedUser.name} (${getRoleLabel(updatedUser.role)}) logged into ElectroStock`,
          });
        } catch (e) {}

        return { success: true };
      },

      registerStaff: (name: string, email: string, password: string) => {
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = password.trim();

        if (!cleanName || !cleanEmail || !cleanPass) {
          return { success: false, error: 'Name, email and password are required.' };
        }

        if (cleanPass.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        // Check demo accounts first
        const isDemoAccount = demoAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
        if (isDemoAccount) {
          return { success: false, error: 'An account with this email address already exists.' };
        }

        const existing = useInventoryStore
          .getState()
          .users.find((u) => u.email.toLowerCase() === cleanEmail);

        if (existing) {
          return { success: false, error: 'An account with this email address already exists.' };
        }

        // Strictly enforce staff role for public registration
        const newStaffUser: User = {
          id: `usr-${Date.now().toString(36)}`,
          name: cleanName,
          email: cleanEmail,
          role: 'staff',
          status: 'active',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        // Store the password for future login
        registeredPasswords[cleanEmail] = cleanPass;

        useInventoryStore.getState().addUser(newStaffUser);

        // Do NOT auto-login; redirect to sign-in instead
        try {
          useInventoryStore.getState().addAuditLog({
            action: 'user_created',
            actionLabel: 'Staff Self-Registered',
            userName: newStaffUser.name,
            userId: newStaffUser.id,
            userRole: 'staff',
            description: `New staff member ${newStaffUser.name} (${newStaffUser.email}) self-registered`,
          });
        } catch (e) {}

        return { success: true };
      },

      logout: () => {
        const currentUser = get().user;
        if (currentUser) {
          try {
            useInventoryStore.getState().addAuditLog({
              action: 'logout',
              actionLabel: 'User Sign Out',
              userName: currentUser.name,
              userId: currentUser.id,
              userRole: currentUser.role,
              description: `${currentUser.name} signed out of ElectroStock`,
            });
          } catch (e) {}
        }
        set({ user: null, isAuthenticated: false });
      },

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
