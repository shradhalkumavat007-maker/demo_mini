export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired';

export interface Warranty {
  id: string;
  productId: string;
  productName: string;
  serialNumber: string;
  customerRef: string;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
}
