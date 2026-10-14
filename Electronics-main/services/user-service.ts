import { useInventoryStore } from '@/store/inventory-store';
import { apiClient } from '@/services/api-client';
import type { User, UserInput, UserRole } from '@/types/user';

export const userService = {
  getUsers: (): User[] => {
    return useInventoryStore.getState().users;
  },

  getUser: (id: string): User | undefined => {
    return useInventoryStore.getState().users.find((u) => u.id === id);
  },

  createUser: (input: UserInput) => {
    useInventoryStore.getState().addUser(input);
    apiClient.createUser(input).catch((e) => console.warn('[Backend Sync] createUser note:', e));
  },

  updateUser: (id: string, input: UserInput) => {
    useInventoryStore.getState().updateUser(id, input);
  },

  deleteUser: (id: string) => {
    useInventoryStore.getState().deleteUser(id);
  },

  updateRole: (id: string, role: UserRole) => {
    useInventoryStore.getState().updateUserRole(id, role);
  },

  toggleStatus: (id: string) => {
    useInventoryStore.getState().toggleUserStatus(id);
  },
};
