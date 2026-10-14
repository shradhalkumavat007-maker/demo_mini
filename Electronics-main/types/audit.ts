import type { UserRole } from './user';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'stock_in'
  | 'stock_out'
  | 'supplier_created'
  | 'supplier_updated'
  | 'supplier_deleted'
  | 'purchase_order_created'
  | 'purchase_order_approved'
  | 'stock_received'
  | 'payment_completed'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_status_changed'
  | 'settings_updated';

export interface AuditLog {
  id: string;
  action: AuditAction;
  actionLabel: string;
  userName: string;
  userId: string;
  userRole: UserRole;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm:ss
  timestamp: string;  // ISO string
  relatedId?: string; // Product SKU, PO number, Txn ID, Supplier ID, etc.
  description: string;
  ipAddress?: string;
}
