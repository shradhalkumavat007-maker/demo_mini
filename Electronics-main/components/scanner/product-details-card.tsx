'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  ShieldCheck,
  Truck,
  Hash,
  Smartphone,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  TrendingUp,
  Info,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StockStatusBadge } from '@/components/common/stock-status-badge';
import { formatINR, getStockStatus } from '@/lib/calculations';
import { getProductImageUrl } from '@/lib/product-assets';
import type { Product, Category } from '@/types/product';
import type { Supplier } from '@/types/supplier';
import type { SerialImei } from '@/types/serial';
import type { SaleCartItem } from '@/types/sale';

interface ProductDetailsCardProps {
  product: Product;
  category?: Category;
  supplier?: Supplier;
  availableSerials: SerialImei[];
  matchedSerial?: SerialImei | null;
  onAddToCart: (item: SaleCartItem) => void;
  onQuickCheckout?: (item: SaleCartItem) => void;
  onRestock?: (productId: string, quantity: number) => void;
}

export function ProductDetailsCard({
  product,
  category,
  supplier,
  availableSerials,
  matchedSerial,
  onAddToCart,
  onQuickCheckout,
  onRestock,
}: ProductDetailsCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSerialNumbers, setSelectedSerialNumbers] = useState<string[]>([]);
  const [itemDiscount, setItemDiscount] = useState(0);

  // Available stock
  const stockStatus = getStockStatus(product.stock, product.minStock);
  const isOutOfStock = product.stock <= 0;

  // Whenever product or matchedSerial changes, reset or pre-select serial
  useEffect(() => {
    setQuantity(1);
    setItemDiscount(0);
    if (matchedSerial) {
      setSelectedSerialNumbers([matchedSerial.serialNumber]);
    } else if (availableSerials.length > 0) {
      setSelectedSerialNumbers([availableSerials[0].serialNumber]);
    } else {
      setSelectedSerialNumbers([]);
    }
  }, [product.id, matchedSerial, availableSerials]);

  // Adjust quantity
  const handleQtyChange = (delta: number) => {
    const next = Math.max(1, Math.min(product.stock, quantity + delta));
    setQuantity(next);
  };

  // Toggle selected serial
  const toggleSerial = (sn: string) => {
    if (selectedSerialNumbers.includes(sn)) {
      setSelectedSerialNumbers(selectedSerialNumbers.filter((s) => s !== sn));
    } else {
      if (selectedSerialNumbers.length < quantity) {
        setSelectedSerialNumbers([...selectedSerialNumbers, sn]);
      } else {
        // Replace first
        setSelectedSerialNumbers([...selectedSerialNumbers.slice(1), sn]);
      }
    }
  };

  // Calculate financials
  const unitPrice = product.sellingPrice;
  const lineSubtotal = unitPrice * quantity;
  const lineTotal = Math.max(0, lineSubtotal - itemDiscount);
  const unitProfit = product.sellingPrice - product.purchasePrice;
  const totalProfit = (unitProfit * quantity) - itemDiscount;
  const profitMargin = lineTotal > 0 ? ((totalProfit / lineTotal) * 100).toFixed(1) : '0';

  // Find IMEI if matched or from selected serial
  const activeSerialObj = availableSerials.find((s) => selectedSerialNumbers.includes(s.serialNumber)) || matchedSerial;
  const imeiNumber = activeSerialObj?.imei || (category?.name === 'Smartphones' ? 'Auto-detected on checkout' : null);

  // Build CartItem object
  const buildCartItem = (): SaleCartItem => ({
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    brand: product.brand,
    model: product.model,
    category: category?.name || 'General',
    unitPrice: product.sellingPrice,
    purchasePrice: product.purchasePrice,
    quantity,
    availableStock: product.stock,
    serialNumbers: selectedSerialNumbers.length > 0 ? selectedSerialNumbers : undefined,
    imeiNumbers: activeSerialObj?.imei ? [activeSerialObj.imei] : undefined,
    discount: itemDiscount,
    total: lineTotal,
    warrantyPeriodMonths: typeof product.warrantyPeriodMonths === 'number' ? product.warrantyPeriodMonths : 0,
    imageUrl: getProductImageUrl(product),
    supplierName: supplier?.name,
    supplierCompany: supplier?.company,
    supplierPhone: supplier?.phone,
    supplierEmail: supplier?.email,
    supplierGstin: supplier?.gstin,
  });

  return (
    <Card className="border-2 border-primary/20 shadow-lg bg-card/95 backdrop-blur-sm overflow-hidden animate-in-fade">
      {/* Top Banner with Product Name and Live Status */}
      <div className="bg-gradient-to-r from-navy via-navy/95 to-primary/90 text-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/30 hover:bg-primary/40 text-primary-foreground border-primary/40 text-[11px] font-mono-code">
                {product.brand}
              </Badge>
              <Badge variant="outline" className="text-white/80 border-white/20 text-[11px]">
                {category?.name || 'Consumer Electronics'}
              </Badge>
            </div>
            {/* 1. Product Name */}
            <h2 className="text-lg sm:text-xl font-bold mt-1 text-white tracking-tight">
              {product.name}
            </h2>
          </div>
          {/* 8. Available Stock Badge */}
          <div className="flex sm:flex-col items-end gap-1">
            <StockStatusBadge status={stockStatus} />
            <span className="text-[11px] text-white/70 font-mono-code font-semibold">
              {product.stock} units available
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Main 2-Column Product Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: 12. Product Image & Key Metrics */}
          <div className="md:col-span-4 flex flex-col space-y-3">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-border shadow-md bg-muted/30 group">
              <img
                src={getProductImageUrl(product)}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/70 backdrop-blur-md text-white border-none text-[11px] font-mono-code">
                  SKU: {product.sku}
                </Badge>
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-2 gap-2 bg-muted/30 p-2.5 rounded-lg border border-border/60 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Margin</span>
                <p className="text-sm font-bold text-success flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {profitMargin}%
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Unit Profit</span>
                <p className="text-sm font-bold text-success font-mono-code">
                  +{formatINR(unitProfit)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Full Specifications (All 13 fields) */}
          <div className="md:col-span-8 space-y-4">
            {/* Price Tags Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/20">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  6. Selling Price
                </span>
                <div className="text-2xl font-extrabold text-primary font-mono-code">
                  {formatINR(product.sellingPrice)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  7. Purchase / Cost Price
                </span>
                <div className="text-base font-semibold text-muted-foreground line-through decoration-muted-foreground/50 font-mono-code">
                  {formatINR(product.purchasePrice)}
                </div>
                <span className="text-[11px] text-success font-medium">Cost: {formatINR(product.purchasePrice)}</span>
              </div>
            </div>

            {/* Spec Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 2. Product ID / SKU */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-muted-foreground block text-[11px]">Product ID / SKU:</span>
                <span className="font-mono-code font-bold text-foreground text-sm">
                  {product.id} • {product.sku}
                </span>
              </div>

              {/* 3. Brand & 4. Model */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-muted-foreground block text-[11px]">Brand & Model:</span>
                <span className="font-semibold text-foreground text-sm">
                  {product.brand} • <span className="font-mono-code">{product.model || 'Standard'}</span>
                </span>
              </div>

              {/* 5. Category */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-muted-foreground block text-[11px]">Category:</span>
                <span className="font-semibold text-foreground text-sm">
                  {category?.name || 'General Electronics'}
                </span>
              </div>

              {/* 11. Warranty Details */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="h-3 w-3 text-primary" /> 11. Warranty Policy:
                </span>
                <span className="font-bold text-primary text-sm">
                  {product.warrantyPeriodMonths === 0
                    ? '0 Months (No Warranty)'
                    : `${product.warrantyPeriodMonths || 12} Months Comprehensive`}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {product.warrantyPeriodMonths === 0
                    ? 'No manufacturer or store warranty applicable.'
                    : 'Full coverage for manufacturing defects & hardware failure.'}
                </p>
              </div>

              {/* 9. Serial Number */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Hash className="h-3 w-3 text-primary" /> 9. Serial Number:
                  </span>
                  {availableSerials.length > 0 && (
                    <span className="text-[10px] text-primary font-medium">
                      {availableSerials.length} verified units in stock
                    </span>
                  )}
                </div>

                {availableSerials.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {availableSerials.map((sn) => {
                      const isSelected = selectedSerialNumbers.includes(sn.serialNumber);
                      return (
                        <button
                          key={sn.id}
                          type="button"
                          onClick={() => toggleSerial(sn.serialNumber)}
                          className={`px-2 py-1 rounded text-xs font-mono-code font-medium border transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                              : 'bg-background hover:bg-muted text-foreground border-border'
                          }`}
                        >
                          {sn.serialNumber} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="font-mono-code text-xs text-muted-foreground">
                    Auto-generated on sale confirmation (Standard Serial)
                  </span>
                )}
              </div>

              {/* 10. IMEI Number */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 sm:col-span-2">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Smartphone className="h-3 w-3 text-primary" /> 10. IMEI Number:
                </span>
                <span className="font-mono-code font-bold text-foreground text-sm">
                  {imeiNumber ? (
                    <span className="text-success">{imeiNumber}</span>
                  ) : (
                    <span className="text-muted-foreground">N/A (Standard Non-Cellular Hardware)</span>
                  )}
                </span>
              </div>

              {/* 13. Supplier Information */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/60 sm:col-span-2 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider">
                  <Truck className="h-3.5 w-3.5 text-primary" /> 13. Supplier Information:
                </span>
                {supplier ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Company:</span>
                      <span className="font-semibold text-foreground">{supplier.company}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Contact & Phone:</span>
                      <span className="text-foreground">{supplier.name} • {supplier.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">GSTIN / Email:</span>
                      <span className="font-mono-code text-[11px] text-muted-foreground truncate block">
                        {supplier.gstin || supplier.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Direct OEM Manufacturer Distribution</span>
                )}
              </div>
            </div>

            {/* Quantity Selector & Item Discount */}
            <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Quantity (Max: {product.stock})
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => handleQtyChange(-1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.max(1, Math.min(product.stock, val)));
                    }}
                    disabled={isOutOfStock}
                    className="w-16 h-9 text-center font-bold font-mono-code text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={quantity >= product.stock || isOutOfStock}
                    onClick={() => handleQtyChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Line Discount (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={lineSubtotal}
                  value={itemDiscount || ''}
                  placeholder="₹0"
                  onChange={(e) => setItemDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isOutOfStock}
                  className="h-9 font-mono-code text-sm"
                />
              </div>
            </div>

            {/* Action Buttons: Add to Cart and Quick Checkout */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                onClick={() => onAddToCart(buildCartItem())}
                disabled={isOutOfStock}
                className="flex-1 min-w-[180px] h-11 gap-2 text-sm font-semibold shadow-md"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Sale Cart ({formatINR(lineTotal)})
              </Button>

              {onQuickCheckout && (
                <Button
                  onClick={() => onQuickCheckout(buildCartItem())}
                  disabled={isOutOfStock}
                  className="flex-1 min-w-[160px] h-11 gap-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  <Zap className="h-4 w-4" /> Quick Checkout <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {isOutOfStock && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs">
                <p className="text-destructive font-medium flex items-center gap-1.5">
                  <span>⚠️</span> Product is Out of Stock. Cannot checkout.
                </p>
                {onRestock && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onRestock(product.id, 10)}
                    className="h-8 text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive hover:text-white shrink-0 shadow-xs"
                  >
                    ⚡ Quick Restock (+10)
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
