export type AlertType =
  | 'low_stock'
  | 'out_of_stock'
  | 'warranty_expiring'
  | 'warranty_expired'
  | 'pending_po';

export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  productId: string | null;
  productName: string | null;
  read: boolean;
  resolved: boolean;
  createdAt: string;
}
