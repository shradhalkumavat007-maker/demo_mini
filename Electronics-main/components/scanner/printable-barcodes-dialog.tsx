'use client';

import { useState, useEffect } from 'react';
import {
  Barcode,
  QrCode,
  Printer,
  Copy,
  Check,
  Search,
  ExternalLink,
  Package,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/store/inventory-store';
import { generateQRCodeDataUrl } from '@/lib/product-assets';
import { formatINR } from '@/lib/calculations';
import type { Product } from '@/types/product';

interface PrintableBarcodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProductCode?: (code: string) => void;
}

export function PrintableBarcodesDialog({
  open,
  onOpenChange,
  onSelectProductCode,
}: PrintableBarcodesDialogProps) {
  const products = useInventoryStore((s) => s.products);
  const serials = useInventoryStore((s) => s.serials);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, [products, selectedProduct]);

  useEffect(() => {
    if (!selectedProduct) return;
    generateQRCodeDataUrl(selectedProduct.sku, { width: 220, margin: 2 }).then((url) => {
      setQrCodeUrl(url);
    });
  }, [selectedProduct]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productSerials = selectedProduct
    ? serials.filter((s) => s.productId === selectedProduct.id)
    : [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-border bg-card">
        <DialogHeader className="p-4 sm:p-5 bg-navy text-white border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" /> Product QR Codes & Barcodes Directory
              </DialogTitle>
              <DialogDescription className="text-xs text-white/70">
                View, test scan, or print barcodes for inventory products and assigned serial numbers
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs border-white/20 text-white hover:bg-white/10 gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" /> Print Sheet
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          {/* Left Product List */}
          <div className="md:col-span-5 border-r border-border p-3 space-y-3 bg-muted/20">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products or SKU..."
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-xs'
                        : 'bg-card border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground line-clamp-1">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono-code font-bold text-primary shrink-0">
                        {formatINR(p.sellingPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                      <span className="font-mono-code">{p.sku}</span>
                      <span>Stock: {p.stock}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Barcode Details & Actions */}
          <div className="md:col-span-7 p-5 flex flex-col justify-between space-y-4">
            {selectedProduct ? (
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="text-[10px] font-mono-code mb-1">
                    {selectedProduct.brand} • {selectedProduct.sku}
                  </Badge>
                  <h3 className="text-base font-bold text-foreground">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Model: <span className="font-mono-code">{selectedProduct.model || 'Standard'}</span> • Selling Price: {formatINR(selectedProduct.sellingPrice)}
                  </p>
                </div>

                {/* QR Code & Barcode Display Box */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-center gap-5 justify-center">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-border shrink-0 text-center">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt={`QR Code for ${selectedProduct.sku}`}
                        className="w-36 h-36 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-36 h-36 bg-muted flex items-center justify-center text-xs animate-pulse">
                        Rendering QR...
                      </div>
                    )}
                    <span className="text-[10px] font-mono-code text-slate-800 font-bold block mt-1">
                      {selectedProduct.sku}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Encoded SKU:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono-code font-bold text-foreground text-sm">
                          {selectedProduct.sku}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(selectedProduct.sku)}
                          title="Copy SKU"
                        >
                          {copiedCode === selectedProduct.sku ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {onSelectProductCode && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelectProductCode(selectedProduct.sku);
                          onOpenChange(false);
                        }}
                        className="text-xs h-8 gap-1.5 mt-2"
                      >
                        <Barcode className="h-3.5 w-3.5" /> Scan This Product Now
                      </Button>
                    )}
                  </div>
                </div>

                {/* Associated Serials & IMEIs */}
                {productSerials.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground block">
                      Tracked Serials & IMEIs in Inventory:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {productSerials.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (onSelectProductCode) {
                              onSelectProductCode(s.serialNumber);
                              onOpenChange(false);
                            } else {
                              handleCopy(s.serialNumber);
                            }
                          }}
                          className="px-2 py-1 rounded bg-muted hover:bg-primary/10 border border-border text-[11px] font-mono-code text-foreground flex items-center gap-1 transition-colors"
                          title="Click to scan serial"
                        >
                          <span>{s.serialNumber}</span>
                          {s.imei && <span className="text-muted-foreground">({s.imei})</span>}
                          <Badge variant="outline" className="text-[9px] py-0 px-1 ml-0.5">
                            {s.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Select a product from the list to view its QR barcode.
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
