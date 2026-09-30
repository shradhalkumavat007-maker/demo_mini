import type { Warranty } from '@/types/warranty';
import { getWarrantyStatus } from '@/lib/calculations';

function calcEndDate(startDate: string, months: number): string {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

const rawWarranties: Omit<Warranty, 'status'>[] = [
  {
    id: 'war-1',
    productId: 'prod-1',
    productName: 'Samsung 55" Crystal 4K Smart TV',
    serialNumber: 'SAM55KLA001',
    customerRef: 'CUST-Sharma Electronics',
    startDate: '2024-02-10T00:00:00Z',
    endDate: '2025-02-10T00:00:00Z',
  },
  {
    id: 'war-2',
    productId: 'prod-1',
    productName: 'Samsung 55" Crystal 4K Smart TV',
    serialNumber: 'SAM55KLA002',
    customerRef: 'CUST-Verma Retail',
    startDate: '2024-03-15T00:00:00Z',
    endDate: '2025-03-15T00:00:00Z',
  },
  {
    id: 'war-3',
    productId: 'prod-6',
    productName: 'Dell Inspiron 15 Laptop (i5/8GB/512GB)',
    serialNumber: 'DELLINSP15A01',
    customerRef: 'CUST-Gupta Office',
    startDate: '2024-05-02T00:00:00Z',
    endDate: '2025-05-02T00:00:00Z',
  },
  {
    id: 'war-4',
    productId: 'prod-5',
    productName: 'Samsung Galaxy S24 5G (256GB)',
    serialNumber: 'SAMGS24B001',
    customerRef: 'CUST-Individual Sale',
    startDate: '2024-07-15T00:00:00Z',
    endDate: '2025-07-15T00:00:00Z',
  },
  {
    id: 'war-5',
    productId: 'prod-7',
    productName: 'HP Pavilion 14 Laptop (Ryzen 5/16GB/512GB)',
    serialNumber: 'HP PAV14A001',
    customerRef: 'CUST-Kapoor Designs',
    startDate: '2024-08-15T00:00:00Z',
    endDate: '2025-08-15T00:00:00Z',
  },
  {
    id: 'war-6',
    productId: 'prod-2',
    productName: 'LG 43" Full HD LED TV',
    serialNumber: 'LG43FHD00A1',
    customerRef: 'CUST-Patel Stores',
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2025-06-01T00:00:00Z',
  },
  {
    id: 'war-7',
    productId: 'prod-3',
    productName: 'Sony SRS-XB23 Bluetooth Speaker',
    serialNumber: 'SONXB23A0001',
    customerRef: 'CUST-Reddy Mart',
    startDate: '2024-04-05T00:00:00Z',
    endDate: '2024-10-05T00:00:00Z',
  },
  {
    id: 'war-8',
    productId: 'prod-3',
    productName: 'Sony SRS-XB23 Bluetooth Speaker',
    serialNumber: 'SONXB23A0002',
    customerRef: 'CUST-Reddy Mart',
    startDate: '2024-04-05T00:00:00Z',
    endDate: '2024-10-05T00:00:00Z',
  },
];

export const mockWarranties: Warranty[] = rawWarranties.map((w) => ({
  ...w,
  status: getWarrantyStatus(w.startDate, w.endDate),
}));
