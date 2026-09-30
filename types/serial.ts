export type SerialStatus = 'available' | 'sold' | 'reserved' | 'service';

export interface SerialImei {
  id: string;
  productId: string;
  productName: string;
  serialNumber: string;
  imei: string | null;
  status: SerialStatus;
  warrantyId: string | null;
  dateAdded: string;
  dateSold: string | null;
  customerRef: string | null;
}
