import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/services/api-client';
import type { Product, ProductInput } from '@/types/product';

export const productService = {
  getProducts: () => useInventoryStore.getState().products,
  getProduct: (id: string) => useInventoryStore.getState().getProduct(id),
  createProduct: async (input: ProductInput): Promise<Product> => {
    const tempId = `prod-${Date.now()}`;
    const payload = {
      id: tempId,
      ...input,
      stock: Number(input.stock ?? 0),
      minStock: Number(input.minStock ?? 5),
      purchasePrice: Number(input.purchasePrice ?? 0),
      sellingPrice: Number(input.sellingPrice ?? 0),
      warrantyPeriodMonths: Number(input.warrantyPeriodMonths ?? 0),
    };
    const saved = await apiClient.createProduct(payload);
    const finalProduct: Product = {
      id: saved?.id || tempId,
      ...input,
      stock: saved?.stock ?? payload.stock,
      minStock: saved?.minStock ?? payload.minStock,
      purchasePrice: saved?.purchasePrice ?? payload.purchasePrice,
      sellingPrice: saved?.sellingPrice ?? payload.sellingPrice,
      warrantyPeriodMonths: saved?.warrantyPeriodMonths ?? payload.warrantyPeriodMonths,
      createdAt: saved?.createdAt || new Date().toISOString(),
      updatedAt: saved?.updatedAt || new Date().toISOString(),
    };
    useInventoryStore.getState().addProduct(finalProduct);
    return finalProduct;
  },
  updateProduct: async (id: string, input: ProductInput): Promise<void> => {
    await apiClient.updateProduct(id, input);
    useInventoryStore.getState().updateProduct(id, input);
  },
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.deleteProduct(id);
    useInventoryStore.getState().deleteProduct(id);
  },
  checkSkuUnique: (sku: string, excludeId?: string) => {
    const products = useInventoryStore.getState().products;
    return !products.some((p) => p.sku === sku && p.id !== excludeId);
  },
};

export type { Product, ProductInput };
