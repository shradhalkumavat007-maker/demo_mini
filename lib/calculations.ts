import type { StockStatus, Product } from '@/types/product';
import type { WarrantyStatus } from '@/types/warranty';
import type { ProductInput } from '@/types/product';
import type { Transaction, TransactionType } from '@/types/transaction';
import type { PurchaseOrderItem } from '@/types/purchase';
import type { Alert, AlertType } from '@/types/alert';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRDecimal(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock === 0) return 'out_of_stock';
  if (stock <= minStock) return 'low_stock';
  return 'in_stock';
}

export function getStockStatusLabel(status: StockStatus): string {
  return status === 'in_stock' ? 'In Stock' : status === 'low_stock' ? 'Low Stock' : 'Out of Stock';
}

export function getWarrantyStatus(startDate: string, endDate: string): WarrantyStatus {
  const end = new Date(endDate);
  const now = new Date();
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'active';
}

export function getWarrantyStatusLabel(status: WarrantyStatus): string {
  return status === 'active' ? 'Active' : status === 'expiring_soon' ? 'Expiring Soon' : 'Expired';
}

export function calculateStockValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);
}

export function calculateInventorySellingValue(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0);
}

export function calculateProfitPerUnit(purchasePrice: number, sellingPrice: number): number {
  return sellingPrice - purchasePrice;
}

export function calculateProfitMargin(salesValue: number, profit: number): number {
  if (salesValue === 0) return 0;
  return (profit / salesValue) * 100;
}

export function calculateLoss(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'stock_out' && t.profitLoss < 0)
    .reduce((sum, t) => sum + Math.abs(t.profitLoss), 0);
}

export function calculateTotalProfit(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'stock_out')
    .reduce((sum, t) => sum + t.profitLoss, 0);
}

export function calculateGrossProfit(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'stock_out' && t.profitLoss > 0)
    .reduce((sum, t) => sum + t.profitLoss, 0);
}

export function calculateTotalSalesValue(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'stock_out')
    .reduce((sum, t) => sum + t.totalValue, 0);
}

export function calculateTotalPurchaseCost(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'stock_out')
    .reduce((sum, t) => sum + t.purchaseCost, 0);
}

export function calculateTotalStockInValue(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'stock_in')
    .reduce((sum, t) => sum + t.totalValue, 0);
}

export function calculatePurchaseOrderTotal(items: PurchaseOrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function getReorderSuggestions(products: Product[]) {
  return products
    .filter((p) => p.stock <= p.minStock)
    .map((p) => {
      const suggestedQty = Math.max(p.minStock * 2 - p.stock, p.minStock);
      return {
        productId: p.id,
        productName: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
        suggestedQty,
        supplierId: p.supplierId,
        purchasePrice: p.purchasePrice,
        estimatedCost: suggestedQty * p.purchasePrice,
      };
    });
}

export function generateId(prefix: string = ''): string {
  return prefix + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4);
}

export function generatePONumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PO-${new Date().getFullYear()}-${num}`;
}

export function generateTransactionId(type: TransactionType): string {
  const prefix = type === 'stock_in' ? 'STK-IN' : 'STK-OUT';
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${num}`;
}

export function generateSerialNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateIMEI(): string {
  let result = '';
  for (let i = 0; i < 15; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export function isLowStock(stock: number, minStock: number): boolean {
  return stock <= minStock && stock > 0;
}

export function isOutOfStock(stock: number): boolean {
  return stock === 0;
}

export function getAlertSeverity(type: AlertType): Alert['severity'] {
  switch (type) {
    case 'out_of_stock':
    case 'warranty_expired':
      return 'danger';
    case 'low_stock':
    case 'warranty_expiring':
    case 'pending_po':
      return 'warning';
    default:
      return 'info';
  }
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

export function isWithinDateRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}

export function getProductInputDefault(): ProductInput {
  return {
    name: '',
    sku: '',
    categoryId: '',
    brand: '',
    model: '',
    supplierId: '',
    minStock: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    warrantyPeriodMonths: 12,
    description: '',
    imageUrl: null,
  };
}
