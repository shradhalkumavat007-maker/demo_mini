'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Barcode, Check, FileText, Loader2 } from 'lucide-react';
import { downloadBarcodeLabelsPDF } from '@/lib/barcode-labels-pdf';
import { formatINR } from '@/lib/calculations';
import { useToast } from '@/hooks/use-toast';

interface BarcodePrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sku: string;
  productName: string;
  brand?: string;
  price?: number;
  qrDataUrl?: string;
}

export function BarcodePrintModal({
  open,
  onOpenChange,
  sku,
  productName,
  brand = '',
  price = 0,
  qrDataUrl,
}: BarcodePrintModalProps) {
  const [quantity, setQuantity] = useState<number>(12);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    if (!sku) return;
    const qty = Math.max(1, Math.min(200, Number(quantity) || 1));
    setIsGeneratingPdf(true);
    try {
      await downloadBarcodeLabelsPDF({
        sku,
        productName,
        brand,
        price,
        quantity: qty,
        qrDataUrl,
      });
      toast({
        title: 'Barcode Labels Downloaded! 📄',
        description: `Successfully generated ${qty} barcode label stickers in PDF format.`,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error generating PDF',
        description: err?.message || 'Could not generate PDF sheet.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    const qty = Math.max(1, Math.min(200, Number(quantity) || 1));
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast({
        title: 'Popup Blocked',
        description: 'Please allow popups to open the print dialog, or use Download PDF.',
        variant: 'destructive',
      });
      return;
    }

    const labelsHtml = Array.from({ length: qty })
      .map(
        (_, i) => `
        <div class="label-card">
          <div class="header">
            <span class="brand">${brand.toUpperCase() || 'ELECTROSTOCK'}</span>
            ${price > 0 ? `<span class="price">₹${Math.round(price).toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div class="title">${productName || 'Electronics Item'}</div>
          <div class="body">
            <img src="${qrDataUrl}" alt="${sku}" class="qr-img" />
            <div class="sku-info">
              <div class="sku-code">${sku}</div>
              <div class="sub-text">SCANNABLE BARCODE</div>
              <div class="sub-text">GENUINE PRODUCT</div>
            </div>
          </div>
          <div class="footer">
            <span>Label #${i + 1} of ${qty}</span>
            <span>ElectroStock ERP</span>
          </div>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode Labels - ${sku} (${qty} pcs)</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #0f172a;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8mm;
              padding: 5mm;
            }
            .label-card {
              border: 1px dashed #cbd5e1;
              border-radius: 6px;
              padding: 8px 10px;
              box-sizing: border-box;
              page-break-inside: avoid;
              background: #fff;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              min-height: 120px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 11px;
              font-weight: bold;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 4px;
            }
            .brand {
              color: #1e293b;
              letter-spacing: 0.5px;
            }
            .price {
              color: #16a34a;
            }
            .title {
              font-size: 11px;
              color: #475569;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-top: 4px;
            }
            .body {
              display: flex;
              align-items: center;
              gap: 10px;
              margin: 6px 0;
            }
            .qr-img {
              width: 52px;
              height: 52px;
              object-fit: contain;
            }
            .sku-info {
              flex: 1;
            }
            .sku-code {
              font-family: monospace;
              font-weight: 700;
              font-size: 13px;
              color: #0f172a;
            }
            .sub-text {
              font-size: 9px;
              color: #64748b;
              margin-top: 2px;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              font-size: 8.5px;
              color: #94a3b8;
              border-top: 1px solid #f8fafc;
              padding-top: 3px;
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${labelsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Print & Download Barcode Labels</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Generate sticker labels sheet for physical inventory & shelves
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Product info banner */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono-code text-[11px] font-bold text-primary border-primary/30">
                {sku}
              </Badge>
              {price > 0 && <span className="font-bold text-xs text-success">{formatINR(price)}</span>}
            </div>
            <p className="text-xs font-medium text-foreground truncate">{productName || 'Product'}</p>
            {brand && <p className="text-[11px] text-muted-foreground">Brand: {brand}</p>}
          </div>

          {/* Quantity selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="barcode-qty" className="text-xs font-semibold">
                How many barcode labels to print?
              </Label>
              <span className="text-xs font-mono-code font-bold text-primary">{quantity} Labels</span>
            </div>
            <Input
              id="barcode-qty"
              type="number"
              min="1"
              max="200"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))}
              className="text-base font-semibold"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground mr-1">Quick Select:</span>
              {[1, 4, 12, 21, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                    quantity === preset
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {preset} {preset === 1 ? 'Label' : 'Labels'}
                </button>
              ))}
            </div>
          </div>

          {/* Single Sticker Preview Box */}
          <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Sticker Label Preview:</span>
              <span className="text-primary font-semibold">A4 Sheet Layout (3 × 7 Grid)</span>
            </div>
            <div className="bg-white text-slate-900 rounded-md p-3 border border-slate-200 shadow-sm flex items-center gap-3">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={sku} className="w-14 h-14 object-contain rounded border border-slate-100" />
              ) : (
                <div className="w-14 h-14 bg-slate-100 rounded flex items-center justify-center">
                  <Barcode className="h-6 w-6 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {brand || 'ELECTROSTOCK'}
                  </span>
                  {price > 0 && <span className="text-xs font-bold text-emerald-600">₹{Math.round(price)}</span>}
                </div>
                <div className="text-xs font-bold text-slate-900 font-mono-code truncate">{sku}</div>
                <p className="text-[10px] text-slate-500 truncate">{productName || 'Product Title'}</p>
                <div className="text-[9px] text-slate-400 mt-0.5">Scannable SKU Barcode Tag</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBrowserPrint}
            className="w-full sm:w-auto text-xs gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Print Now
          </Button>
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="w-full sm:w-auto text-xs gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {isGeneratingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download PDF Sheet ({quantity} Labels)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
