export type PurchaseOrderStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status: PurchaseOrderStatus;
  createdDate: string;
  expectedDate: string;
  receivedDate: string | null;
  userId: string;
  userName: string;
  notes: string;
}

export interface PurchaseOrderInput {
  supplierId: string;
  items: Omit<PurchaseOrderItem, 'productName' | 'receivedQuantity' | 'total'>[];
  expectedDate: string;
  notes: string;
}
