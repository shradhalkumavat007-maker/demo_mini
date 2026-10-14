import QRCode from 'qrcode';
import type { Product } from '@/types/product';

/**
 * Curated high-definition product imagery for electronics
 */
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // Televisions
  'SAM-TV-55-C4K': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
  'LG-TV-43-FHD': 'https://images.unsplash.com/photo-1577975882846-431adc8c2009?auto=format&fit=crop&w=600&q=80',
  'SON-TV-65-OLED': 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80',
  // Smartphones
  'APL-IP15-128': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
  'SAM-S24-256': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
  'ONE-12R-256': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  // Laptops
  'DEL-INS-15': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  'HP-PAV-14': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  'LEN-IP3-15': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
  'APL-MBA-M2': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
  // Audio
  'SON-SPK-XB23': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
  'JBL-T760NC': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'BOS-QC45': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
  'BOAT-AB141': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
  // Peripherals
  'LOG-MX-M3S': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
  'LOG-K380': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  'SAM-T7-1TB': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
  // Printers
  'CAN-G3010': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
  'HP-LJM126A': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'cat-1': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80', // TVs
  'cat-2': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80', // Phones
  'cat-3': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80', // Laptops
  'cat-4': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80', // Audio
  'cat-5': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80', // Peripherals
  'cat-6': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80', // Printers
};

/**
 * Returns a high-res image URL for any product
 */
export function getProductImageUrl(product: { sku?: string; categoryId?: string; imageUrl?: string | null }): string {
  if (product.imageUrl) return product.imageUrl;
  if (product.sku && PRODUCT_IMAGE_MAP[product.sku]) {
    return PRODUCT_IMAGE_MAP[product.sku];
  }
  if (product.categoryId && CATEGORY_FALLBACK_IMAGES[product.categoryId]) {
    return CATEGORY_FALLBACK_IMAGES[product.categoryId];
  }
  return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80';
}

/**
 * Quick-Scan Demo Barcodes for fast testing
 */
export interface DemoBarcodeSample {
  label: string;
  code: string;
  type: 'sku' | 'serial' | 'imei';
  productName: string;
  badge: string;
}

export const DEMO_BARCODE_SAMPLES: DemoBarcodeSample[] = [
  {
    label: 'Samsung 55" TV (SKU)',
    code: 'SAM-TV-55-C4K',
    type: 'sku',
    productName: 'Samsung 55" Crystal 4K Smart TV',
    badge: 'SKU Barcode',
  },
  {
    label: 'Samsung TV Serial (In Stock)',
    code: 'SAM55KLA003',
    type: 'serial',
    productName: 'Samsung 55" Crystal 4K Smart TV',
    badge: 'Serial No.',
  },
  {
    label: 'Galaxy S24 (Serial & IMEI)',
    code: 'SAMGS24B0002',
    type: 'serial',
    productName: 'Samsung Galaxy S24 5G (256GB)',
    badge: 'Serial No.',
  },
  {
    label: 'Apple iPhone 15 (IMEI)',
    code: '356789012345001',
    type: 'imei',
    productName: 'Apple iPhone 15 (128GB)',
    badge: 'IMEI Scan',
  },
  {
    label: 'Sony Speaker (SKU)',
    code: 'SON-SPK-XB23',
    type: 'sku',
    productName: 'Sony SRS-XB23 Bluetooth Speaker',
    badge: 'SKU Barcode',
  },
  {
    label: 'HP Pavilion 14 (Serial)',
    code: 'HP PAV14A002',
    type: 'serial',
    productName: 'HP Pavilion 14 Laptop',
    badge: 'Serial No.',
  },
  {
    label: 'LG 43" TV (SKU)',
    code: 'LG-TV-43-FHD',
    type: 'sku',
    productName: 'LG 43" Full HD LED TV',
    badge: 'SKU Barcode',
  },
  {
    label: 'Test Invalid Barcode',
    code: 'INVALID-BARCODE-999',
    type: 'sku',
    productName: 'Unknown Product',
    badge: 'Test Invalid',
  },
];

/**
 * Generate a dynamic QR Code Data URL with standard configuration
 */
export async function generateQRCodeDataUrl(
  text: string,
  options: { width?: number; margin?: number; darkColor?: string; lightColor?: string } = {}
): Promise<string> {
  const {
    width = 256,
    margin = 2,
    darkColor = '#0f172a',
    lightColor = '#ffffff',
  } = options;

  try {
    return await QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return '';
  }
}

/**
 * Build dynamic UPI Payment string
 */
export function buildUPIPaymentString(options: {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  transactionId: string;
}): string {
  const { payeeVpa, payeeName, amount, transactionNote, transactionId } = options;
  const params = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: transactionNote,
    tr: transactionId,
  });
  return `upi://pay?${params.toString()}`;
}
