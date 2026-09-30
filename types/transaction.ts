export type TransactionType = 'stock_in' | 'stock_out';

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  purchaseCost: number;
  profitLoss: number;
  date: string;
  userId: string;
  userName: string;
  reference: string;
  customerRef: string;
  notes: string;
  serialNumbers: string[];
}

export interface StockInInput {
  productId: string;
  supplierId: string;
  quantity: number;
  purchasePrice: number;
  serialNumbers: string[];
  date: string;
  reference: string;
  notes: string;
}

export interface StockOutInput {
  productId: string;
  quantity: number;
  serialNumbers: string[];
  sellingPrice: number;
  date: string;
  customerRef: string;
  notes: string;
}
