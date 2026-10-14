export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired';

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  date: string;
  issueDescription: string;
  status: 'pending' | 'in_repair' | 'replaced' | 'refunded' | 'rejected';
  resolutionNotes?: string;
}

export interface Warranty {
  id: string;
  productId: string;
  productName: string;
  serialNumber: string;
  customerRef: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
  claims?: WarrantyClaim[];
  notes?: string;
}

export interface WarrantyInput {
  productId: string;
  serialNumber: string;
  customerRef: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  startDate: string;
  durationMonths: number;
  notes?: string;
}

