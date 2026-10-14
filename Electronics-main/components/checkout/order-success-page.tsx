'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Download,
  Printer,
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  ShoppingBag,
  History,
  FileBarChart,
  TrendingUp,
  Receipt as ReceiptIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatINR, formatDateTime } from '@/lib/calculations';
import { downloadReceiptPDF, printReceiptPDF } from '@/lib/receipt-pdf';
import type { SaleReceipt } from '@/types/sale';
import { useToast } from '@/hooks/use-toast';

interface OrderSuccessPageProps {
  receipt: SaleReceipt;
  onNewSale?: () => void;
  onClose?: () => void;
}

export function OrderSuccessPage({ receipt, onNewSale, onClose }: OrderSuccessPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showFullInvoicePreview, setShowFullInvoicePreview] = useState(false);

  // Handle Download PDF Receipt using real order & payment data
  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await downloadReceiptPDF(receipt);
      toast({
        title: 'PDF Receipt Downloaded',
        description: `Saved as ElectroStock_Receipt_${receipt.receiptNumber}.pdf`,
      });
    } catch (err: any) {
      console.error('PDF Download Error:', err);
      toast({
        title: 'Download Failed',
        description: 'Unable to generate PDF receipt. Please use the Print option.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Print Receipt using real order & payment data
  const handlePrintReceipt = async () => {
    try {
      setIsPrinting(true);
      await printReceiptPDF(receipt);
    } catch (err) {
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  // Handle Back to Dashboard
  const handleBackToDashboard = () => {
    if (onClose) onClose();
    router.push('/dashboard');
  };

  // Copy receipt number to clipboard
  const handleCopyReceiptNumber = () => {
    navigator.clipboard.writeText(receipt.receiptNumber);
    setCopiedReceipt(true);
    toast({
      title: 'Receipt Number Copied',
      description: receipt.receiptNumber,
    });
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const content = (
    <div className="fixed inset-0 z-[9999] min-h-screen w-full bg-background overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Top Ambient Glow Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
        {/* ============================================================ */}
        {/* 1. HERO CELEBRATION HEADER                                   */}
        {/* ============================================================ */}
        <div className="text-center space-y-4 pt-4 sm:pt-6">
          {/* Animated Celebration Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/25 border-2 border-white/20">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-white animate-in zoom-in duration-300" />
            </div>
            <div className="absolute -top-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-md animate-bounce">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          {/* User-Requested Exact Title */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
              Congratulations! 🎉 Thank you for shopping with ElectroStock!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Your payment has been successfully confirmed. The order is permanently saved to the database,
              inventory has been deducted, and your digital warranty receipt has been issued.
            </p>
          </div>

          {/* Quick Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Badge className="bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold px-3 py-1 text-xs gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Payment Confirmed
            </Badge>

            <button
              onClick={handleCopyReceiptNumber}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code font-bold bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors cursor-pointer"
              title="Click to copy receipt number"
            >
              <Hash className="h-3 w-3 text-primary" />
              <span>{receipt.receiptNumber}</span>
              {copiedReceipt ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>

            <Badge variant="outline" className="text-xs text-muted-foreground border-border px-3 py-1 gap-1.5">
              <Calendar className="h-3 w-3 text-primary" />
              {formatDateTime(receipt.date)}
            </Badge>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. ACTION BUTTONS TOOLBAR (Prominent & Working)             */}
        {/* ============================================================ */}
        <div className="bg-card/90 backdrop-blur-md border border-border shadow-lg rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground text-center sm:text-left flex items-center gap-2">
            <ReceiptIcon className="h-4 w-4 text-primary shrink-0" />
            <span>Digital Tax Invoice &amp; Warranty Card generated</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
            {/* Download PDF Receipt */}
            <Button
              id="download-pdf-receipt-btn"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm h-10 px-4 gap-2 shadow-md cursor-pointer"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Generating PDF...' : 'Download PDF Receipt'}
            </Button>

            {/* Print Receipt */}
            <Button
              id="print-receipt-btn"
              onClick={handlePrintReceipt}
              disabled={isPrinting}
              variant="outline"
              className="border-border hover:bg-muted font-semibold text-xs sm:text-sm h-10 px-4 gap-2 cursor-pointer"
            >
              <Printer className="h-4 w-4 text-foreground" />
              {isPrinting ? 'Printing...' : 'Print Receipt'}
            </Button>

            {/* Back to Dashboard */}
            <Button
              id="back-to-dashboard-btn"
              onClick={handleBackToDashboard}
              variant="secondary"
              className="font-bold text-xs sm:text-sm h-10 px-4 gap-2 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Back to Dashboard
            </Button>

            {/* Optional New Sale shortcut */}
            {onNewSale && (
              <Button
                id="new-sale-btn"
                onClick={onNewSale}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-10 px-4 gap-2 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                New Sale
              </Button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. ORDER & PAYMENT METRICS SUMMARY CARDS                     */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Amount */}
          <Card className="border-border/80 bg-card shadow-sm hover:border-primary/50 transition-colors">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Total Amount Paid
              </span>
              <div className="text-2xl font-black text-primary font-mono-code tracking-tight">
                {formatINR(receipt.grandTotal)}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Fully Settled
              </span>
            </CardContent>
          </Card>

          {/* Card 2: Customer Name */}
          <Card className="border-border/80 bg-card shadow-sm hover:border-primary/50 transition-colors">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Customer Name
              </span>
              <div className="text-base font-bold text-foreground truncate" title={receipt.customer.name}>
                {receipt.customer.name || 'Walk-in Customer'}
              </div>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                <Phone className="h-3 w-3 shrink-0" /> {receipt.customer.phone || 'No phone recorded'}
              </span>
            </CardContent>
          </Card>

          {/* Card 3: Payment Method */}
          <Card className="border-border/80 bg-card shadow-sm hover:border-primary/50 transition-colors">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Payment Method
              </span>
              <div className="text-base font-extrabold text-foreground uppercase flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                {receipt.paymentMethod}
              </div>
              <span className="text-[11px] font-mono-code text-muted-foreground truncate block">
                {receipt.paymentReference ? `Ref: ${receipt.paymentReference}` : `Txn: ${receipt.transactionId}`}
              </span>
            </CardContent>
          </Card>

          {/* Card 4: Receipt / Order Number */}
          <Card className="border-border/80 bg-card shadow-sm hover:border-primary/50 transition-colors">
            <CardContent className="p-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Receipt / Order No.
              </span>
              <div className="text-sm font-bold text-foreground font-mono-code truncate" title={receipt.receiptNumber}>
                {receipt.receiptNumber}
              </div>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-primary shrink-0" /> Warranty Activated
              </span>
            </CardContent>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* 4. PURCHASED PRODUCTS DETAILS CARD                          */}
        {/* ============================================================ */}
        <Card className="border-border/80 bg-card shadow-md overflow-hidden">
          <CardHeader className="p-4 sm:p-5 bg-muted/40 border-b border-border flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  Purchased Products &amp; Identification
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {receipt.items.length} {receipt.items.length === 1 ? 'product' : 'products'} verified and registered
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-xs font-mono-code bg-background">
              GST 18% Included
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20 border-b border-border">
              <span className="col-span-1">#</span>
              <span className="col-span-4">Product Details &amp; SKU</span>
              <span className="col-span-2">Model</span>
              <span className="col-span-2">Serial / IMEI</span>
              <span className="col-span-1 text-center">Qty</span>
              <span className="col-span-2 text-right">Total Amount</span>
            </div>

            {/* Product Rows */}
            <div className="divide-y divide-border">
              {receipt.items.map((item, idx) => {
                // Serial & IMEI representation
                const serialList = item.serialNumbers && item.serialNumbers.length > 0
                  ? item.serialNumbers.join(', ')
                  : null;
                const imeiList = item.imeiNumbers && item.imeiNumbers.length > 0
                  ? item.imeiNumbers.join(', ')
                  : null;

                return (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="p-4 sm:px-5 sm:py-4 md:grid md:grid-cols-12 md:items-center gap-3 hover:bg-muted/10 transition-colors space-y-2 md:space-y-0"
                  >
                    {/* Index */}
                    <div className="hidden md:block col-span-1 font-mono-code text-xs text-muted-foreground font-semibold">
                      {idx + 1}
                    </div>

                    {/* Product Name & Brand/SKU */}
                    <div className="col-span-4 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{item.productName}</span>
                        {item.brand && (
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-4">
                            {item.brand}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs font-mono-code text-muted-foreground">
                        SKU: {item.sku}
                      </div>
                    </div>

                    {/* Model */}
                    <div className="col-span-2 text-xs">
                      <span className="md:hidden text-[11px] font-bold text-muted-foreground uppercase mr-2">Model:</span>
                      <span className="font-semibold text-foreground font-mono-code bg-muted/50 px-2 py-0.5 rounded">
                        {item.model || 'Standard'}
                      </span>
                    </div>

                    {/* Serial / IMEI */}
                    <div className="col-span-2 space-y-1 text-xs">
                      <span className="md:hidden text-[11px] font-bold text-muted-foreground uppercase block">
                        Serial / IMEI:
                      </span>
                      {serialList ? (
                        <div className="font-mono-code text-[11px] text-foreground bg-primary/5 border border-primary/20 rounded px-2 py-0.5 inline-block">
                          <span className="font-bold text-primary mr-1">SN:</span>
                          <span>{serialList}</span>
                        </div>
                      ) : null}

                      {imeiList ? (
                        <div className="font-mono-code text-[11px] text-foreground bg-teal-500/5 border border-teal-500/20 rounded px-2 py-0.5 inline-block">
                          <span className="font-bold text-teal-600 mr-1">IMEI:</span>
                          <span>{imeiList}</span>
                        </div>
                      ) : null}

                      {!serialList && !imeiList && (
                        <span className="text-[11px] text-muted-foreground font-mono-code italic">
                          Auto-Tracked &amp; Logged
                        </span>
                      )}

                      <div className="text-[10px] text-primary flex items-center gap-1 font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        {item.warrantyPeriodMonths === 0
                          ? 'Standard Policy'
                          : `${item.warrantyPeriodMonths || 12}M Manufacturer Warranty`}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1 text-left md:text-center text-xs">
                      <span className="md:hidden text-[11px] font-bold text-muted-foreground uppercase mr-2">Qty:</span>
                      <Badge variant="outline" className="font-mono-code font-bold text-xs bg-background">
                        {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                      </Badge>
                    </div>

                    {/* Total Amount */}
                    <div className="col-span-2 text-left md:text-right space-y-0.5">
                      <span className="md:hidden text-[11px] font-bold text-muted-foreground uppercase mr-2">Amount:</span>
                      <span className="text-base font-extrabold text-foreground font-mono-code block">
                        {formatINR(item.total)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono-code block">
                        @{formatINR(item.unitPrice)} each
                        {item.discount > 0 && ` (-${formatINR(item.discount)} off)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* 5. SPLIT DETAILS: CUSTOMER INFO + FINANCIAL SETTLEMENT      */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Customer & Store Info (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-border/80 bg-card shadow-sm">
              <CardHeader className="p-4 border-b border-border">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" /> Customer &amp; Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">
                      Customer Name
                    </span>
                    <p className="font-bold text-sm text-foreground">{receipt.customer.name}</p>
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-primary" /> {receipt.customer.phone}
                    </p>
                    {receipt.customer.email && (
                      <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-primary" /> {receipt.customer.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">
                      Billing Address / Location
                    </span>
                    <p className="text-foreground flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{receipt.customer.address || 'In-Store POS Customer'}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1.5 font-mono-code">
                      State of Supply: Karnataka (Code: 29)
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Warranty & Support Banner */}
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Manufacturer Guarantee &amp; Support
                  </span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    All listed products have been recorded in the national inventory ledger. In case of
                    hardware service or warranty claims, present this receipt number or downloaded PDF invoice.
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium pt-0.5">
                    Helpdesk: {receipt.businessInfo.email} • {receipt.businessInfo.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settlement Calculations & Totals (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-border/80 bg-card shadow-sm">
              <CardHeader className="p-4 border-b border-border">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Financial Settlement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-mono-code font-semibold text-foreground">
                      {formatINR(receipt.subtotal)}
                    </span>
                  </div>

                  {receipt.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Discount Applied:</span>
                      <span className="font-mono-code font-bold">
                        -{formatINR(receipt.discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>GST (18% Included):</span>
                    <span className="font-mono-code text-foreground">
                      {formatINR(receipt.taxAmount)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Grand Total Highlight Box */}
                <div className="rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white p-4 space-y-1 shadow-md">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 block">
                    Total Amount Paid
                  </span>
                  <div className="text-3xl font-black font-mono-code text-white tracking-tight">
                    {formatINR(receipt.grandTotal)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/80 pt-1">
                    <span>Payment: <strong className="text-white uppercase">{receipt.paymentMethod}</strong></span>
                    <span className="bg-white/20 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                      {receipt.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Action Buttons in summary footer */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    size="sm"
                    className="w-full text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF Receipt
                  </Button>

                  <Button
                    onClick={handlePrintReceipt}
                    disabled={isPrinting}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. COLLAPSIBLE FORMAL TAX INVOICE PREVIEW                    */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <button
            onClick={() => setShowFullInvoicePreview(!showFullInvoicePreview)}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ReceiptIcon className="h-4 w-4 text-primary" />
              {showFullInvoicePreview ? 'Hide Formal Tax Invoice Document' : 'View Formal Tax Invoice Document Preview'}
            </span>
            {showFullInvoicePreview ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showFullInvoicePreview && (
            <Card className="border border-border/80 shadow-2xl bg-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Document Header */}
              <div className="bg-navy text-white p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                        ⚡
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-white">
                        {receipt.businessInfo.name}
                      </h2>
                    </div>
                    <p className="text-xs text-white/70 mt-1 max-w-md">
                      {receipt.businessInfo.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/60 mt-1">
                      <span>Phone: {receipt.businessInfo.phone}</span>
                      <span>•</span>
                      <span>Email: {receipt.businessInfo.email}</span>
                      <span>•</span>
                      <span className="font-mono-code">GSTIN: {receipt.businessInfo.gstin}</span>
                    </div>
                  </div>

                  <div className="sm:text-right bg-white/5 p-3 rounded-xl border border-white/10 sm:border-none sm:bg-transparent">
                    <Badge className="bg-primary hover:bg-primary text-white text-xs font-bold px-3 py-1">
                      ORIGINAL TAX INVOICE
                    </Badge>
                    <div className="mt-2 text-xs text-white/80 space-y-0.5">
                      <div>Receipt #: <span className="font-mono-code font-bold text-white">{receipt.receiptNumber}</span></div>
                      <div>Txn ID: <span className="font-mono-code text-white/90">{receipt.transactionId}</span></div>
                      <div>Date: <span className="text-white">{formatDateTime(receipt.date)}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground text-center">
                  This electronic tax invoice was created on confirmation of payment via {receipt.paymentMethod.toUpperCase()} and is legally compliant under GST Rules.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ============================================================ */}
        {/* 7. POST-TRANSACTION AUDIT & INVENTORY SHORTCUTS              */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/inventory/history"
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/60 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Stock History Log
              </h4>
              <p className="text-[11px] text-muted-foreground">View stock out entry #{receipt.receiptNumber}</p>
            </div>
          </Link>

          <Link
            href="/reports"
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/60 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
              <FileBarChart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-teal-600 transition-colors">
                Reports &amp; Sales Outflow
              </h4>
              <p className="text-[11px] text-muted-foreground">Export audit logs &amp; tax reports</p>
            </div>
          </Link>

          <Link
            href="/profit-loss"
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/60 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                Profit &amp; Loss
              </h4>
              <p className="text-[11px] text-muted-foreground">+{formatINR(receipt.totalProfit)} margin logged</p>
            </div>
          </Link>
        </div>

        {/* ============================================================ */}
        {/* 8. BOTTOM NAVIGATION BAR                                     */}
        {/* ============================================================ */}
        <div className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center sm:text-left">
            <span>ElectroStock Inventory POS System • Receipt #{receipt.receiptNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleBackToDashboard}
              variant="default"
              className="font-bold text-xs sm:text-sm h-10 px-5 gap-2 cursor-pointer"
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </Button>

            {onNewSale && (
              <Button
                onClick={onNewSale}
                variant="outline"
                className="font-semibold text-xs sm:text-sm h-10 px-5 gap-2 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                Start New Sale
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
