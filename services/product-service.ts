import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import type { Product, ProductInput } from '@/types/product';

export const productService = {
  getProducts: () => useInventoryStore.getState().products,
  getProduct: (id: string) => useInventoryStore.getState().getProduct(id),
  createProduct: (input: ProductInput) => useInventoryStore.getState().addProduct(input),
  updateProduct: (id: string, input: ProductInput) => useInventoryStore.getState().updateProduct(id, input),
  deleteProduct: (id: string) => useInventoryStore.getState().deleteProduct(id),
  checkSkuUnique: (sku: string, excludeId?: string) => {
    const products = useInventoryStore.getState().products;
    return !products.some((p) => p.sku === sku && p.id !== excludeId);
  },
};

export type { Product, ProductInput };
