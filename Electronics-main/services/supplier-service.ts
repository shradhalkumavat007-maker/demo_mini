import { useInventoryStore } from '@/store/inventory-store';
import { apiClient } from '@/services/api-client';
import type { Supplier, SupplierInput } from '@/types/supplier';

export const supplierService = {
  getSuppliers: (): Supplier[] => {
    return useInventoryStore.getState().suppliers;
  },

  getSupplier: (id: string): Supplier | undefined => {
    return useInventoryStore.getState().getSupplier(id);
  },

  createSupplier: async (input: SupplierInput): Promise<Supplier> => {
    const res = useInventoryStore.getState().addSupplier(input);
    try {
      await apiClient.createSupplier(res);
    } catch (e) {
      console.warn('[Backend Sync] createSupplier error:', e);
    }
    return res;
  },

  updateSupplier: async (id: string, input: Partial<SupplierInput> & Record<string, any>) => {
    const existing = useInventoryStore.getState().getSupplier(id);
    if (!existing) return;
    const merged: SupplierInput = {
      name: input.name ?? existing.name,
      company: input.company ?? existing.company,
      phone: input.phone ?? existing.phone,
      email: input.email ?? existing.email,
      address: input.address ?? existing.address,
      gstin: input.gstin !== undefined ? input.gstin : existing.gstin,
      status: input.status ?? existing.status,
    };
    useInventoryStore.getState().updateSupplier(id, merged);
    try {
      await apiClient.updateSupplier(id, merged);
    } catch (e) {
      console.warn('[Backend Sync] updateSupplier error:', e);
    }
  },

  deleteSupplier: async (id: string) => {
    useInventoryStore.getState().deleteSupplier(id);
    try {
      await apiClient.deleteSupplier(id);
    } catch (e) {
      console.warn('[Backend Sync] deleteSupplier error:', e);
    }
  },
};
