'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Phone,
  Mail,
  MapPin,
  Tag,
  Percent,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Hash,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatINR } from '@/lib/calculations';
import type { SaleCartItem, SaleCustomer } from '@/types/sale';

interface SaleCartProps {
  items: SaleCartItem[];
  customer: SaleCustomer;
  onCustomerChange: (customer: SaleCustomer) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
  orderDiscount: number;
  onOrderDiscountChange: (discount: number) => void;
}

export function SaleCart({
  items,
  customer,
  onCustomerChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToPayment,
  orderDiscount,
  onOrderDiscountChange,
}: SaleCartProps) {
  const [customerErrors, setCustomerErrors] = useState<{ name?: string; phone?: string }>({});

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalItemDiscounts = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const effectiveDiscount = Math.min(subtotal, orderDiscount);
  const grandTotal = Math.max(0, subtotal - effectiveDiscount);
  // 18% GST included breakdown
  const taxAmount = Math.round((grandTotal * 18) / 118);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Validate customer before proceeding
  const handleProceed = () => {
    const errors: { name?: string; phone?: string } = {};
    if (!customer.name.trim()) {
      errors.name = 'Customer name is required for receipt generation';
    }
    if (!customer.phone.trim()) {
      errors.phone = 'Phone number is required for transaction record';
    } else if (customer.phone.trim().length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors);
      return;
    }

    setCustomerErrors({});
    onProceedToPayment();
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border shadow-md bg-card/95 backdrop-blur-sm">
        <CardHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                Sale Cart / Checkout
                <Badge variant="secondary" className="text-xs px-2">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </Badge>
              </CardTitle>
            </div>
          </div>

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear Cart
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Cart Items List */}
          {items.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2 border-2 border-dashed border-border/80 rounded-xl bg-muted/10">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">Sale Cart is Empty</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Scan product barcodes using the camera scanner or click any demo sample barcode on the left.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 rounded-lg border border-border/70 bg-card hover:bg-muted/20 transition-colors flex items-start gap-3"
                >
                  {/* Thumbnail */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-12 h-12 rounded-md object-cover border border-border shrink-0"
                    />
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground truncate">
                          {item.productName}
                        </h4>
                        <span className="text-[11px] font-mono-code text-muted-foreground">
                          {item.sku} • {item.brand}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-foreground font-mono-code shrink-0">
                        {formatINR(item.total)}
                      </span>
                    </div>

                    {/* Serials / IMEI */}
                    {item.serialNumbers && item.serialNumbers.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">SN:</span>
                        {item.serialNumbers.map((sn) => (
                          <Badge
                            key={sn}
                            variant="outline"
                            className="text-[10px] font-mono-code px-1.5 py-0 h-4 bg-muted/50"
                          >
                            {sn}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Quantity & Unit Price Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-xs"
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center font-bold text-xs font-mono-code">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-xs"
                          disabled={item.quantity >= item.availableStock}
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-[11px] text-muted-foreground ml-1">
                          @ {formatINR(item.unitPrice)}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveItem(item.productId)}
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Details Form */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" /> Customer Details (Required for Receipt)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <Input
                    value={customer.name}
                    onChange={(e) => {
                      onCustomerChange({ ...customer, name: e.target.value });
                      if (customerErrors.name) setCustomerErrors({ ...customerErrors, name: undefined });
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className="pl-8 h-9 text-xs"
                  />
                </div>
                {customerErrors.name && (
                  <p className="text-[10px] text-destructive mt-0.5">{customerErrors.name}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-foreground block mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <Input
                    value={customer.phone}
                    onChange={(e) => {
                      onCustomerChange({ ...customer, phone: e.target.value });
                      if (customerErrors.phone) setCustomerErrors({ ...customerErrors, phone: undefined });
                    }}
                    placeholder="e.g. 9876543210"
                    maxLength={12}
                    className="pl-8 h-9 text-xs font-mono-code"
                  />
                </div>
                {customerErrors.phone && (
                  <p className="text-[10px] text-destructive mt-0.5">{customerErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Email (Optional for digital invoice)
                </label>
                <div className="relative">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <Input
                    type="email"
                    value={customer.email || ''}
                    onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Billing Address / City
                </label>
                <div className="relative">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                  <Input
                    value={customer.address || ''}
                    onChange={(e) => onCustomerChange({ ...customer, address: e.target.value })}
                    placeholder="Bangalore, Karnataka"
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Financial Breakdown */}
          <div className="pt-3 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Subtotal ({totalItemsCount} items):</span>
              <span className="font-mono-code font-medium text-foreground">{formatINR(subtotal)}</span>
            </div>

            {/* Overall Order Discount */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3 text-primary" /> Overall Order Discount:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-success font-mono-code font-semibold">
                  {effectiveDiscount > 0 ? `-₹${effectiveDiscount.toLocaleString('en-IN')}` : '₹0'}
                </span>
                <Input
                  type="number"
                  min={0}
                  max={subtotal}
                  value={orderDiscount || ''}
                  placeholder="₹0"
                  onChange={(e) => onOrderDiscountChange(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 h-7 text-xs font-mono-code text-right"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>GST Included (18% CGST + SGST):</span>
              <span className="font-mono-code text-muted-foreground">
                {formatINR(taxAmount)} (Tax-inclusive)
              </span>
            </div>

            <Separator className="my-1" />

            {/* Grand Total */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Grand Total
                </span>
                <p className="text-[10px] text-muted-foreground">All taxes & discounts included</p>
              </div>
              <div className="text-xl font-extrabold text-primary font-mono-code">
                {formatINR(grandTotal)}
              </div>
            </div>
          </div>

          {/* Checkout Action Button */}
          <Button
            onClick={handleProceed}
            disabled={items.length === 0}
            className="w-full h-12 text-sm font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform active:scale-[0.99]"
          >
            Proceed to Payment <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
