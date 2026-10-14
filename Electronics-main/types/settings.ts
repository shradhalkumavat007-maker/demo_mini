export interface SystemSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  lowStockThresholdDefault: number;
  autoAlertLowStock: boolean;
  autoAlertExpiringWarranty: boolean;
  warrantyExpiryWarningDays: number;
  enableSoundAlerts: boolean;
  theme: 'light' | 'dark' | 'system';
}

export const defaultSettings: SystemSettings = {
  storeName: 'ElectroStock Electronics',
  storeEmail: 'support@electrostock.internal',
  storePhone: '+91 98765 43210',
  storeAddress: 'Electronics Hub, Tech City, Karnataka 560001',
  currency: 'INR',
  currencySymbol: '₹',
  taxRate: 18,
  lowStockThresholdDefault: 5,
  autoAlertLowStock: true,
  autoAlertExpiringWarranty: true,
  warrantyExpiryWarningDays: 30,
  enableSoundAlerts: false,
  theme: 'system',
};
