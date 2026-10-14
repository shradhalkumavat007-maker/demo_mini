import { jsPDF } from 'jspdf';
import { generateQRCodeDataUrl } from '@/lib/product-assets';

export interface BarcodeLabelOptions {
  sku: string;
  productName: string;
  brand?: string;
  price?: number;
  quantity: number;
  qrDataUrl?: string;
}

/**
 * Generates and downloads a multi-label barcode sticker PDF
 * Formatted for standard A4 sticker paper (3 columns x 7 rows = 21 labels per page)
 */
export async function downloadBarcodeLabelsPDF(options: BarcodeLabelOptions): Promise<void> {
  const { sku, productName, brand = '', price, quantity, qrDataUrl } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 10;
  const marginY = 12;

  const cols = 3;
  const rows = 7;
  const labelsPerPage = cols * rows;

  const labelWidth = (pageWidth - marginX * 2 - (cols - 1) * 4) / cols; // ~60mm
  const labelHeight = (pageHeight - marginY * 2 - (rows - 1) * 4) / rows; // ~35mm

  // Ensure we have a high-res QR data URL
  const qrImage = qrDataUrl || (await generateQRCodeDataUrl(sku, { width: 180, margin: 1 }));

  let currentLabel = 0;

  while (currentLabel < quantity) {
    if (currentLabel > 0 && currentLabel % labelsPerPage === 0) {
      doc.addPage();
    }

    const pageIndex = currentLabel % labelsPerPage;
    const col = pageIndex % cols;
    const row = Math.floor(pageIndex / cols);

    const x = marginX + col * (labelWidth + 4);
    const y = marginY + row * (labelHeight + 4);

    // Label card outline (light gray dotted border for cutting guide)
    doc.setDrawColor(200, 205, 215);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, labelWidth, labelHeight, 2, 2, 'S');

    // Header: Brand / Store Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const brandText = brand.toUpperCase() || 'ELECTROSTOCK';
    doc.text(brandText.slice(0, 20), x + 3, y + 5);

    // Price tag (top right)
    if (price && price > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // green
      const priceText = `INR ${Math.round(price).toLocaleString('en-IN')}`;
      doc.text(priceText, x + labelWidth - 3, y + 5, { align: 'right' });
    }

    // Product Title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    const cleanName = productName || 'Electronics Product';
    const truncatedName = cleanName.length > 32 ? cleanName.slice(0, 30) + '...' : cleanName;
    doc.text(truncatedName, x + 3, y + 9);

    // QR / Barcode image (centered or left side)
    const imgSize = 16;
    if (qrImage) {
      try {
        doc.addImage(qrImage, 'PNG', x + 3, y + 11, imgSize, imgSize);
      } catch (e) {
        // Fallback
      }
    }

    // SKU Text details (right of the QR code)
    const textStartX = x + imgSize + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sku, textStartX, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text('SCANNABLE SKU BARCODE', textStartX, y + 20);
    doc.text('GENUINE PRODUCT TAG', textStartX, y + 24);

    // Tiny bottom rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(x + 3, y + labelHeight - 4, x + labelWidth - 3, y + labelHeight - 4);

    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Label #${currentLabel + 1} of ${quantity}`, x + 3, y + labelHeight - 1.5);
    doc.text('ElectroStock ERP', x + labelWidth - 3, y + labelHeight - 1.5, { align: 'right' });

    currentLabel++;
  }

  // Save the PDF
  const cleanSku = sku.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`barcode-labels-${cleanSku}-${quantity}pcs.pdf`);
}
