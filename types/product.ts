export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  brand: string;
  model: string;
  supplierId: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  sellingPrice: number;
  warrantyPeriodMonths: number;
  description: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  categoryId: string;
  brand: string;
  model: string;
  supplierId: string;
  minStock: number;
  purchasePrice: number;
  sellingPrice: number;
  warrantyPeriodMonths: number;
  description: string;
  imageUrl: string | null;
}
