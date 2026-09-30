import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import type { StockInInput, StockOutInput } from '@/types/transaction';

export const inventoryService = {
  stockIn: (input: StockInInput) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'Not authenticated' };
    return useInventoryStore.getState().stockIn(input, user.name, user.id);
  },
  stockOut: (input: StockOutInput) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'Not authenticated' };
    return useInventoryStore.getState().stockOut(input, user.name, user.id);
  },
  getTransactions: () => useInventoryStore.getState().transactions,
};
