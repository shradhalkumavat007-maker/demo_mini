'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Printer,
  PlusCircle,
  CheckCircle2,
  Share2,
  FileText,
  History,
  TrendingUp,
  FileBarChart,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Store,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatINR, formatDateTime } from '@/lib/calculations';
import { downloadReceiptPDF, printReceiptPDF } from '@/lib/receipt-pdf';
import type { SaleReceipt } from '@/types/sale';
import { useToast } from '@/hooks/use-toast';

interface ReceiptViewProps {
  receipt: SaleReceipt;
  onNewSale: () => void;
}

export function ReceiptView({ receipt, onNewSale }: ReceiptViewProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Handle Download PDF
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadReceiptPDF(receipt);
      toast({
        title: 'Receipt Downloaded',
        description: `Saved as ElectroStock_Receipt_${receipt.receiptNumber}.pdf`,
      });
    } catch (err: any) {
      console.error('PDF Download Error:', err);
      toast({
        title: 'Download Failed',
        description: 'Unable to generate PDF receipt. Please try printing.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle Print Receipt
  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      await printReceiptPDF(receipt);
    } catch (err) {
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in-fade">
      {/* 1. SUCCESS CONFIRMATION BANNER */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs">
                Payment Successful
              </Badge>
              <span className="text-xs text-white/80 font-mono-code">
                {receipt.receiptNumber}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
              Transaction Completed & Receipt Issued
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              Stock automatically decremented • Profit logged • Warranty registered for customer
            </p>
          </div>
        </div>

        {/* Action Buttons: Download PDF, Print, New Sale */}
        <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 sm:flex-none bg-white text-navy hover:bg-white/90 font-bold text-xs gap-1.5 shadow-md"
          >
            <Download className="h-4 w-4 text-primary" />
            {isDownloading ? 'Generating PDF...' : 'Download PDF Receipt'}
          </Button>

          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            variant="outline"
            className="flex-1 sm:flex-none border-white/40 text-white hover:bg-white/10 font-medium text-xs gap-1.5"
          >
            <Printer className="h-4 w-4" /> Print Receipt
          </Button>

          <Button
            onClick={onNewSale}
            className="flex-1 sm:flex-none bg-navy/80 hover:bg-navy text-white font-bold text-xs gap-1.5 border border-white/20"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" /> New Sale
          </Button>
        </div>
      </div>

      {/* 2. ON-SCREEN EXECUTIVE RECEIPT DOCUMENT PREVIEW */}
      <Card className="border border-border/80 shadow-2xl bg-card overflow-hidden print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="bg-navy text-white p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                  ⚡
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {receipt.businessInfo.name}
                </h1>
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

        <CardContent className="p-6 space-y-6">
          {/* Customer & Transaction Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                Billed To (Customer Details)
              </span>
              <h3 className="text-sm font-bold text-foreground">{receipt.customer.name}</h3>
              <p className="text-xs text-muted-foreground">Phone: {receipt.customer.phone}</p>
              {receipt.customer.email && (
                <p className="text-xs text-muted-foreground">Email: {receipt.customer.email}</p>
              )}
              {receipt.customer.address && (
                <p className="text-xs text-muted-foreground">Address: {receipt.customer.address}</p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
                Payment Settlement
              </span>
              <div className="flex sm:justify-end items-center gap-2">
                <Badge className="bg-success text-white font-bold text-xs uppercase">
                  {receipt.paymentStatus}
                </Badge>
                <span className="text-xs font-bold text-foreground uppercase">
                  via {receipt.paymentMethod}
                </span>
              </div>
              {receipt.paymentReference && (
                <p className="text-xs font-mono-code text-muted-foreground">
                  Ref: {receipt.paymentReference}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                State of Supply: Karnataka (Code: 29)
              </p>
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/70 px-4 py-2.5 grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="col-span-1">#</span>
              <span className="col-span-4">Product Details</span>
              <span className="col-span-2">Serial / IMEI</span>
              <span className="col-span-1 text-center">Qty</span>
              <span className="col-span-2 text-right">Unit Price</span>
              <span className="col-span-2 text-right">Total Amt</span>
            </div>

            <div className="divide-y divide-border">
              {receipt.items.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 grid grid-cols-12 text-xs items-center hover:bg-muted/20 transition-colors"
                >
                  <span className="col-span-1 font-mono-code text-muted-foreground">{idx + 1}</span>
                  <div className="col-span-4 pr-2">
                    <span className="font-semibold text-foreground block">{item.productName}</span>
                    <span className="text-[11px] font-mono-code text-muted-foreground">
                      SKU: {item.sku} • Model: {item.model || 'Standard'}
                    </span>
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    {item.serialNumbers && item.serialNumbers.length > 0 ? (
                      <span className="font-mono-code text-[11px] text-foreground block truncate">
                        SN: {item.serialNumbers.join(', ')}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Auto-Tracked</span>
                    )}
                    <span className="text-[10px] text-primary flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />{' '}
                      {item.warrantyPeriodMonths === 0
                        ? '0M (No Warranty)'
                        : `${item.warrantyPeriodMonths || 12}M Warranty`}
                    </span>
                  </div>
                  <span className="col-span-1 text-center font-bold font-mono-code">
                    {item.quantity}
                  </span>
                  <span className="col-span-2 text-right font-mono-code text-muted-foreground text-[11px]">
                    {formatINR(item.unitPrice)}
                    {item.discount > 0 && (
                      <span className="block text-success text-[10px]">-{formatINR(item.discount)}</span>
                    )}
                  </span>
                  <span className="col-span-2 text-right font-bold font-mono-code text-foreground">
                    {formatINR(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals & Warranty Statement (Split 2-Column) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            {/* Warranty & Store Policy */}
            <div className="sm:col-span-7 p-4 rounded-xl bg-muted/20 border border-border/80 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Warranty & Store Guarantee
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All electronic products listed above include manufacturer warranty support. Serial numbers
                have been logged in the national database. In case of hardware claims, present this invoice
                at any authorized brand service center or contact ElectroStock Support.
              </p>
              <div className="pt-1 text-[11px] text-primary font-medium">
                Customer Care: {receipt.businessInfo.email} • {receipt.businessInfo.phone}
              </div>
            </div>

            {/* Calculations Box */}
            <div className="sm:col-span-5 space-y-2 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono-code font-medium text-foreground">
                  {formatINR(receipt.subtotal)}
                </span>
              </div>

              {receipt.discount > 0 && (
                <div className="flex items-center justify-between text-xs text-success">
                  <span>Discount Applied:</span>
                  <span className="font-mono-code font-bold">
                    -{formatINR(receipt.discount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>GST (18% Included):</span>
                <span className="font-mono-code">{formatINR(receipt.taxAmount)}</span>
              </div>

              <Separator className="my-1.5" />

              {/* Grand Total — full-width blue block, amount wraps if large */}
              <div className="rounded-lg bg-primary p-3 flex flex-col gap-1">
                <span className="text-[11px] font-extrabold uppercase text-white/80 tracking-wider">Grand Total</span>
                <span className="text-lg font-black text-white font-mono-code break-all leading-tight">
                  {formatINR(receipt.grandTotal)}
                </span>
                <span className="text-[10px] text-white/70">
                  {receipt.paymentMethod.toUpperCase()} · {receipt.paymentStatus.toUpperCase()}
                </span>
              </div>

              <div className="pt-1 text-[11px] text-muted-foreground text-right">
                Net Profit: <span className="font-mono-code font-semibold text-success">+{formatINR(receipt.totalProfit)}</span>
              </div>
            </div>
          </div>

          {/* Thank You Note */}
          <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
            <h4 className="text-sm font-bold text-foreground">
              Thank you for shopping at ElectroStock!
            </h4>
            <p className="text-xs text-muted-foreground">
              We appreciate your business. Visit us again at www.electrostock.internal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. POST-TRANSACTION INVENTORY & REPORT INTEGRATION SHORTCUTS */}
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
              Reports & Sales Outflow
            </h4>
            <p className="text-[11px] text-muted-foreground">Export audit logs & tax reports</p>
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
              Profit & Loss
            </h4>
            <p className="text-[11px] text-muted-foreground">+{formatINR(receipt.totalProfit)} margin logged</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
