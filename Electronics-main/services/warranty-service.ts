import { useInventoryStore } from '@/store/inventory-store';
import { apiClient } from '@/services/api-client';
import type { Warranty, WarrantyInput, WarrantyClaim } from '@/types/warranty';

export const warrantyService = {
  getWarranties: (): Warranty[] => {
    return useInventoryStore.getState().warranties;
  },

  getWarrantyBySerial: (serialNumber: string): Warranty | undefined => {
    return useInventoryStore.getState().warranties.find((w) => w.serialNumber === serialNumber);
  },

  registerWarranty: async (input: WarrantyInput): Promise<Warranty> => {
    const w = useInventoryStore.getState().addWarranty(input);
    try {
      await apiClient.createWarranty(w);
    } catch (e) {
      console.warn('[Backend Sync] createWarranty note:', e);
    }
    return w;
  },

  submitClaim: async (
    warrantyId: string,
    issueDescription: string,
    status?: WarrantyClaim['status'],
    notes?: string
  ) => {
    const res = useInventoryStore.getState().claimWarranty(warrantyId, issueDescription, status, notes);
    try {
      await apiClient.claimWarranty(warrantyId, { issueDescription, status, notes });
    } catch (e) {
      console.warn('[Backend Sync] claimWarranty note:', e);
    }
    return res;
  },
};
