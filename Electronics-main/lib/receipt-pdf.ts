import { jsPDF } from 'jspdf';
import type { SaleReceipt } from '@/types/sale';
import { generateQRCodeDataUrl } from '@/lib/product-assets';
import { formatDate, formatDateTime, formatINR } from '@/lib/calculations';

/**
 * Generates an executive, professional PDF Payment Receipt using jsPDF
 */
export async function generateReceiptPDF(receipt: SaleReceipt): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Colors
  const primaryNavy = [15, 23, 42]; // #0f172a
  const accentBlue = [37, 99, 235]; // #2563eb
  const textDark = [30, 41, 59]; // #1e293b
  const textMuted = [100, 116, 139]; // #64748b
  const borderGray = [226, 232, 240]; // #e2e8f0
  const lightBg = [248, 250, 252]; // #f8fafc
  const successGreen = [22, 163, 74]; // #16a34a

  let y = margin;

  // 1. HEADER BANNER
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'F');

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ElectroStock', margin + 8, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(190, 210, 245);
  doc.text('PREMIUM CONSUMER ELECTRONICS & INVENTORY POS', margin + 8, y + 21);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${receipt.businessInfo.address} | Phone: ${receipt.businessInfo.phone}`,
    margin + 8,
    y + 28
  );

  // Right Side Header Badge: TAX INVOICE / RECEIPT
  doc.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.roundedRect(pageWidth - margin - 52, y + 6, 44, 22, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TAX INVOICE', pageWidth - margin - 30, y + 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('ORIGINAL FOR RECIPIENT', pageWidth - margin - 30, y + 21, { align: 'center' });

  y += 40;

  // 2. INVOICE META & CUSTOMER DETAILS (2-Column Box)
  const colWidth = (contentWidth - 6) / 2; // 88mm each
  const infoBoxHeight = 36;

  // Left Box: Customer Details
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, colWidth, infoBoxHeight, 2, 2, 'FD');

  doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('BILLED TO (CUSTOMER DETAILS)', margin + 5, y + 7);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(receipt.customer.name || 'Direct Customer', margin + 5, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Phone: ${receipt.customer.phone || 'N/A'}`, margin + 5, y + 20);
  doc.text(`Email: ${receipt.customer.email || 'N/A'}`, margin + 5, y + 25);
  if (receipt.customer.address) {
    doc.text(`Address: ${receipt.customer.address.slice(0, 38)}`, margin + 5, y + 30);
  }

  // Right Box: Invoice & Transaction Details
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin + colWidth + 6, y, colWidth, infoBoxHeight, 2, 2, 'FD');

  doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TRANSACTION DETAILS', margin + colWidth + 11, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

  doc.text('Receipt No:', margin + colWidth + 11, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.receiptNumber, margin + colWidth + 40, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Txn ID:', margin + colWidth + 11, y + 19);
  doc.text(receipt.transactionId, margin + colWidth + 40, y + 19);

  doc.text('Date & Time:', margin + colWidth + 11, y + 24);
  doc.text(formatDateTime(receipt.date), margin + colWidth + 40, y + 24);

  doc.text('Payment:', margin + colWidth + 11, y + 29);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  doc.text(
    `${receipt.paymentMethod.toUpperCase()} (${receipt.paymentStatus.toUpperCase()})`,
    margin + colWidth + 40,
    y + 29
  );

  y += infoBoxHeight + 8;

  // 3. ITEMS TABLE
  // Table Header
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  const colX = {
    idx: margin + 4,
    item: margin + 14,
    serials: margin + 72,
    qty: margin + 116,
    price: margin + 132,
    disc: margin + 152,
    total: margin + contentWidth - 2,
  };

  doc.text('#', colX.idx, y + 5.5);
  doc.text('PRODUCT / MODEL / SKU', colX.item, y + 5.5);
  doc.text('SERIAL / IMEI / WARRANTY', colX.serials, y + 5.5);
  doc.text('QTY', colX.qty, y + 5.5);
  doc.text('PRICE', colX.price, y + 5.5);
  doc.text('DISC', colX.disc, y + 5.5);
  doc.text('AMT', colX.total, y + 5.5, { align: 'right' });

  y += 8;

  // Table Body Rows
  receipt.items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const rowHeight = 15;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    // Bottom border
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    // # index
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${idx + 1}`, colX.idx, y + 6);

    // Product Name & SKU / Model
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const shortName = item.productName.length > 32 ? item.productName.slice(0, 30) + '...' : item.productName;
    doc.text(shortName, colX.item, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`SKU: ${item.sku} | Model: ${item.model || 'Std'}`, colX.item, y + 11);

    // Serials & IMEI
    const serialText = item.serialNumbers && item.serialNumbers.length > 0
      ? `SN: ${item.serialNumbers.join(', ')}`
      : 'SN: Auto-Registered';
    const imeiText = item.imeiNumbers && item.imeiNumbers.length > 0
      ? ` | IMEI: ${item.imeiNumbers.join(', ')}`
      : '';
    const warrantyText = item.warrantyPeriodMonths === 0 ? 'Warranty: None (0M)' : `Warranty: ${item.warrantyPeriodMonths || 12}M`;

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const fullSerialStr = (serialText + imeiText).slice(0, 32);
    doc.text(fullSerialStr, colX.serials, y + 6);

    doc.setFontSize(7);
    doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
    doc.text(warrantyText, colX.serials, y + 11);

    // Qty
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${item.quantity}`, colX.qty + 2, y + 7);

    // Unit Price
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Rs.${item.unitPrice.toLocaleString('en-IN')}`, colX.price, y + 7);

    // Discount
    doc.text(item.discount > 0 ? `Rs.${item.discount.toLocaleString('en-IN')}` : '-', colX.disc, y + 7);

    // Line Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Rs.${item.total.toLocaleString('en-IN')}`, colX.total, y + 7, { align: 'right' });

    y += rowHeight;
  });

  y += 6;

  // 4. SUMMARY BLOCK & DYNAMIC VERIFICATION QR CODE (Split-view)
  const summaryBoxWidth = 84;
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;
  const qrBoxWidth = contentWidth - summaryBoxWidth - 6;

  // Left Side: Warranty & Payment Info Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, qrBoxWidth, 48, 2, 2, 'FD');

  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('WARRANTY & PAYMENT CONFIRMATION', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('• Manufacturer Warranty: 12-24 Months warranty applies from purchase date.', margin + 5, y + 14);
  doc.text('• Serial & IMEI numbers are permanently logged for direct warranty service.', margin + 5, y + 19);
  doc.text(`• Payment Method: ${receipt.paymentMethod.toUpperCase()} | Ref: ${receipt.paymentReference || receipt.transactionId}`, margin + 5, y + 24);
  doc.text(`• Store GSTIN: ${receipt.businessInfo.gstin} | State Code: 29`, margin + 5, y + 29);

  // Generate and embed Dynamic Verification QR Code
  try {
    const qrPayload = JSON.stringify({
      receiptNo: receipt.receiptNumber,
      txnId: receipt.transactionId,
      amount: receipt.grandTotal,
      date: receipt.date.slice(0, 10),
      store: 'ElectroStock',
    });
    const qrDataUrl = await generateQRCodeDataUrl(qrPayload, { width: 140, margin: 1 });
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', margin + qrBoxWidth - 28, y + 18, 24, 24);
      doc.setFontSize(6.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('Scan to Verify', margin + qrBoxWidth - 16, y + 45, { align: 'center' });
    }
  } catch (e) {
    console.warn('QR Code embedding failed in PDF:', e);
  }

  // Right Side: Financial Calculation Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, 48, 2, 2, 'FD');

  const sLabelX = summaryBoxX + 6;
  const sValX = summaryBoxX + summaryBoxWidth - 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

  // Subtotal
  doc.text('Subtotal:', sLabelX, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Rs.${receipt.subtotal.toLocaleString('en-IN')}`, sValX, y + 8, { align: 'right' });

  // Discount
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Discount:', sLabelX, y + 14);
  doc.setTextColor(successGreen[0], successGreen[1], successGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(
    receipt.discount > 0 ? `-Rs.${receipt.discount.toLocaleString('en-IN')}` : 'Rs. 0',
    sValX,
    y + 14,
    { align: 'right' }
  );

  // GST Breakdown (18% included)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('GST / Tax (18% Incl.):', sLabelX, y + 20);
  doc.text(`Rs.${receipt.taxAmount.toLocaleString('en-IN')}`, sValX, y + 20, { align: 'right' });

  // Divider
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(summaryBoxX + 4, y + 24, summaryBoxX + summaryBoxWidth - 4, y + 24);

  // Grand Total Banner - auto-size font so large amounts fit
  doc.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.roundedRect(summaryBoxX + 2, y + 26, summaryBoxWidth - 4, 18, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('GRAND TOTAL', summaryBoxX + 7, y + 33);

  const grandTotalStr = `Rs.${receipt.grandTotal.toLocaleString('en-IN')}`;
  // Shrink font if the total string is long
  const gtFontSize = grandTotalStr.length > 14 ? 9 : grandTotalStr.length > 11 ? 11 : 13;
  doc.setFontSize(gtFontSize);
  doc.text(grandTotalStr, sValX - 2, y + 40, { align: 'right' });

  y += 56;

  // 5. THANK YOU & FOOTER SECTION
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(
    'Thank you for choosing ElectroStock! We appreciate your business.',
    pageWidth / 2,
    y + 7,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(190, 210, 245);
  doc.text(
    'For support, warranty claims or inquiries: support@electrostock.internal | +91 98765 43210 | www.electrostock.internal',
    pageWidth / 2,
    y + 13,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads the receipt PDF directly to the user's browser
 */
export async function downloadReceiptPDF(receipt: SaleReceipt): Promise<void> {
  const doc = await generateReceiptPDF(receipt);
  const cleanNumber = receipt.receiptNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`ElectroStock_Receipt_${cleanNumber}.pdf`);
}

/**
 * Prints the receipt PDF directly using browser print
 */
export async function printReceiptPDF(receipt: SaleReceipt): Promise<void> {
  const doc = await generateReceiptPDF(receipt);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
}

/**
 * Returns a Blob URL for previewing the PDF inside an iframe or viewer
 */
export async function getReceiptPDFBlobUrl(receipt: SaleReceipt): Promise<string> {
  const doc = await generateReceiptPDF(receipt);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
