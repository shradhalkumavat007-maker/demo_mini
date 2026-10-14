export type PaymentMethod = 'upi' | 'cash' | 'card' | 'other';
export type PaymentStatus = 'completed' | 'pending' | 'failed';

export interface SaleCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface SaleCartItem {
  productId: string;
  productName: string;
  sku: string;
  brand: string;
  model: string;
  category: string;
  unitPrice: number;
  purchasePrice: number;
  quantity: number;
  availableStock: number;
  serialNumbers?: string[];
  imeiNumbers?: string[];
  discount: number; // item discount in INR
  total: number; // (unitPrice * quantity) - discount
  warrantyPeriodMonths: number;
  imageUrl?: string | null;
  supplierName?: string;
  supplierCompany?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierGstin?: string;
}

export interface BusinessInfo {
  name: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  website: string;
}

export interface SaleReceipt {
  receiptNumber: string;
  transactionId: string;
  date: string;
  businessInfo: BusinessInfo;
  customer: SaleCustomer;
  items: SaleCartItem[];
  subtotal: number;
  discount: number;
  taxRate: number; // e.g., 18%
  taxAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentDetails?: {
    cashTendered?: number;
    changeDue?: number;
    cardLast4?: string;
    cardType?: string;
    upiId?: string;
    authCode?: string;
  };
  totalProfit: number;
  notes?: string;
}

export interface CheckoutSaleInput {
  customer: SaleCustomer;
  items: SaleCartItem[];
  subtotal: number;
  discount: number;
  taxRate?: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentDetails?: {
    cashTendered?: number;
    changeDue?: number;
    cardLast4?: string;
    cardType?: string;
    upiId?: string;
    authCode?: string;
  };
  notes?: string;
}
