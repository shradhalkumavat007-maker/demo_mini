import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/services/api-client';
import type { StockInInput, StockOutInput } from '@/types/transaction';
import type { CheckoutSaleInput } from '@/types/sale';

export const inventoryService = {
  stockIn: async (input: StockInInput) => {
    const user = useAuthStore.getState().user;
    const userName = user?.name || 'Administrator';
    const userId = user?.id || 'usr-admin';
    try {
      const apiRes = await apiClient.stockIn({ ...input, userName, userId });
      if (apiRes && apiRes.success === false) {
        return { success: false, error: apiRes.error || 'Database rejected stock in' };
      }
      const storeRes = useInventoryStore.getState().stockIn(input, userName, userId);
      return { success: true, transaction: apiRes?.transaction || storeRes.transaction };
    } catch (err: any) {
      console.error('[inventoryService] stockIn error:', err);
      return { success: false, error: err?.message || 'Database error during stock in' };
    }
  },
  stockOut: async (input: StockOutInput) => {
    const user = useAuthStore.getState().user;
    const userName = user?.name || 'Administrator';
    const userId = user?.id || 'usr-admin';
    try {
      const apiRes = await apiClient.stockOut({ ...input, userName, userId });
      if (apiRes && apiRes.success === false) {
        return { success: false, error: apiRes.error || 'Database rejected stock out' };
      }
      const storeRes = useInventoryStore.getState().stockOut(input, userName, userId);
      return { success: true, transaction: apiRes?.transaction || storeRes.transaction };
    } catch (err: any) {
      console.error('[inventoryService] stockOut error:', err);
      return { success: false, error: err?.message || 'Database error during stock out' };
    }
  },
  checkoutSale: async (input: CheckoutSaleInput) => {
    const user = useAuthStore.getState().user;
    const userName = user?.name || 'Administrator';
    const userId = user?.id || 'usr-admin';
    const result = useInventoryStore.getState().checkoutSale(input, userName, userId);
    if (result.success && result.receipt) {
      try {
        await apiClient.processSale(result.receipt);
      } catch (err) {
        console.warn('[Backend Sync] checkoutSale receipt save error:', err);
      }
      // Synchronize database stock decrement & transactions for each sold item only once
      try {
        await Promise.allSettled(
          input.items.map((item) =>
            apiClient.stockOut({
              productId: item.productId,
              quantity: item.quantity,
              sellingPrice: item.unitPrice,
              customerRef: input.customer?.name || 'Walk-in Customer',
              date: new Date().toISOString().split('T')[0],
              notes: `POS Sale Receipt #${result.receipt?.receiptNumber || ''}`,
              serialNumbers: item.serialNumbers || [],
              userName,
              userId,
            })
          )
        );
      } catch (err) {
        console.warn('[Backend Sync] checkoutSale item stockOut error:', err);
      }
    }
    return result;
  },
  getReceipt: (receiptNumber: string) => {
    return useInventoryStore.getState().getReceipt(receiptNumber);
  },
  getTransactions: () => useInventoryStore.getState().transactions,
};
