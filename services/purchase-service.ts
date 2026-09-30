import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import type { PurchaseOrderInput, PurchaseOrderStatus } from '@/types/purchase';

export const purchaseService = {
  createPurchaseOrder: (input: PurchaseOrderInput) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    return useInventoryStore.getState().createPurchaseOrder(input, user.name, user.id);
  },
  updatePOStatus: (id: string, status: PurchaseOrderStatus) =>
    useInventoryStore.getState().updatePOStatus(id, status),
  receivePurchaseOrder: (id: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false, error: 'Not authenticated' };
    return useInventoryStore.getState().receivePurchaseOrder(id, user.name, user.id);
  },
  getPurchaseOrders: () => useInventoryStore.getState().purchaseOrders,
};
