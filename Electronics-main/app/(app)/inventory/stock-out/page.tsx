'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Loader2,
  ArrowUpFromLine,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageHeader } from '@/components/layout/page-header';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import { inventoryService } from '@/services/inventory-service';
import { stockOutSchema } from '@/lib/validation';
import { formatINR, calculateProfitPerUnit } from '@/lib/calculations';
import type { StockOutInput } from '@/types/transaction';

export default function StockOutPage() {
  const allProducts = useInventoryStore((s) => s.products);
  const allSerials = useInventoryStore((s) => s.serials);
  const { toast } = useToast();

  // Memoize products with stock > 0 so reference remains stable across renders
  const products = useMemo(
    () => allProducts.filter((p) => p.stock > 0),
    [allProducts]
  );

  const [form, setForm] = useState<StockOutInput>({
    productId: '',
    quantity: 1,
    serialNumbers: [],
    sellingPrice: 0,
    date: new Date().toISOString().split('T')[0],
    customerRef: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    detail: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [serialInput, setSerialInput] = useState('');

  // Memoize selected product
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === form.productId),
    [products, form.productId]
  );

  // Memoize available serials for this product
  const availableSerials = useMemo(
    () =>
      allSerials.filter(
        (s) => s.productId === form.productId && s.status === 'available'
      ),
    [allSerials, form.productId]
  );

  // Guard against redundant state updates to prevent any render loops
  const handleProductChange = useCallback(
    (productId: string) => {
      if (!productId || productId === form.productId) return;
      const p = products.find((prod) => prod.id === productId);
      setForm((prev) => {
        if (prev.productId === productId) return prev;
        return {
          ...prev,
          productId,
          sellingPrice: p?.sellingPrice ?? 0,
          serialNumbers: [],
          quantity: 1,
        };
      });
      setErrorMessage(null);
      setSuccessMessage(null);
      setErrors({});
    },
    [form.productId, products]
  );

  const handleAddSerial = useCallback(() => {
    if (!serialInput.trim()) return;
    const sn = serialInput.trim();
    if (form.serialNumbers.includes(sn)) {
      setErrorMessage(`Serial number "${sn}" is already selected.`);
      toast({
        title: 'Duplicate Serial',
        description: `Serial "${sn}" is already in the list.`,
        variant: 'destructive',
      });
      return;
    }

    if (form.serialNumbers.length >= form.quantity) {
      setErrorMessage(
        `You cannot select more serial numbers (${form.serialNumbers.length + 1}) than the stock out quantity (${form.quantity}). Increase quantity first or remove an existing serial.`
      );
      toast({
        title: 'Limit Exceeded',
        description: `Selected serials cannot exceed quantity (${form.quantity}).`,
        variant: 'destructive',
      });
      return;
    }

    setErrorMessage(null);
    setForm((prev) => ({ ...prev, serialNumbers: [...prev.serialNumbers, sn] }));
    setSerialInput('');
  }, [form.serialNumbers, form.quantity, serialInput, toast]);

  const handleRemoveSerial = useCallback((sn: string) => {
    setForm((prev) => ({
      ...prev,
      serialNumbers: prev.serialNumbers.filter((s) => s !== sn),
    }));
  }, []);

  const handleAutoSelectSerials = useCallback(() => {
    const needed = form.quantity - form.serialNumbers.length;
    if (needed <= 0) return;
    const unselected = availableSerials
      .filter((s) => !form.serialNumbers.includes(s.serialNumber))
      .slice(0, needed)
      .map((s) => s.serialNumber);

    if (unselected.length > 0) {
      setForm((prev) => ({
        ...prev,
        serialNumbers: [...prev.serialNumbers, ...unselected],
      }));
      setErrorMessage(null);
    }
  }, [form.quantity, form.serialNumbers, availableSerials]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setErrors({});

    try {
      // 1. Validate Form Fields
      const result = stockOutSchema.safeParse(form);
      if (!result.success) {
        const fe: Record<string, string> = {};
        result.error.issues.forEach((i) => {
          const f = i.path[0] as string;
          if (!fe[f]) fe[f] = i.message;
        });
        setErrors(fe);
        setErrorMessage('Please fill in all required fields marked below.');
        return;
      }

      // 2. Validate Product Availability
      if (!selectedProduct) {
        const msg = 'Please select a valid product with available stock.';
        setErrorMessage(msg);
        toast({ title: 'Invalid Product', description: msg, variant: 'destructive' });
        return;
      }

      // 3. Validate Stock Quantity
      if (form.quantity > selectedProduct.stock) {
        const msg = `Insufficient stock! Available in inventory: ${selectedProduct.stock} units, but requested: ${form.quantity} units.`;
        setErrorMessage(msg);
        toast({ title: 'Insufficient Stock', description: msg, variant: 'destructive' });
        return;
      }

      // 4. Validate Serial Numbers Count vs Quantity
      if (form.serialNumbers.length > form.quantity) {
        const msg = `Selected serials (${form.serialNumbers.length}) exceeds the transaction quantity (${form.quantity}). Please adjust serials.`;
        setErrorMessage(msg);
        toast({ title: 'Serial Count Mismatch', description: msg, variant: 'destructive' });
        return;
      }

      setLoading(true);

      // Save product metadata before state mutation
      const productName = selectedProduct.name;
      const soldQty = form.quantity;
      const sellingTotal = soldQty * form.sellingPrice;

      // 5. Execute stock out transaction safely
      const res = await inventoryService.stockOut({
        productId: form.productId,
        quantity: form.quantity,
        sellingPrice: form.sellingPrice,
        customerRef: form.customerRef.trim() || 'Direct Customer',
        date: form.date || new Date().toISOString().split('T')[0],
        notes: form.notes?.trim() || '',
        serialNumbers: Array.isArray(form.serialNumbers) ? form.serialNumbers : [],
      });

      if (res && res.success) {
        const successDetail = `Sold ${soldQty} unit(s) of ${productName} for ${formatINR(
          sellingTotal
        )} to ${form.customerRef || 'Direct Customer'}.`;

        setSuccessMessage({
          title: 'Stock Out Completed Successfully!',
          detail: successDetail,
        });

        toast({
          title: 'Stock Removed Successfully',
          description: successDetail,
        });

        // Reset form cleanly
        setForm({
          productId: '',
          quantity: 1,
          serialNumbers: [],
          sellingPrice: 0,
          date: new Date().toISOString().split('T')[0],
          customerRef: '',
          notes: '',
        });
      } else {
        const errText = res?.error || 'Failed to complete stock out transaction.';
        setErrorMessage(errText);
        toast({
          title: 'Stock Out Failed',
          description: errText,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Unhandled stock out error:', err);
      const crashMsg =
        err?.message || 'An unexpected error occurred while processing stock out.';
      setErrorMessage(`System Error: ${crashMsg}`);
      toast({
        title: 'Processing Error',
        description: crashMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const profit = useMemo(
    () =>
      selectedProduct
        ? calculateProfitPerUnit(selectedProduct.purchasePrice, form.sellingPrice)
        : 0,
    [selectedProduct, form.sellingPrice]
  );

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Stock Out"
        description="Remove stock from inventory, allocate serial numbers, and record customer sales."
      />

      {/* Screen Error Display */}
      {errorMessage && (
        <Alert variant="destructive" className="border-destructive/60 bg-destructive/10">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Stock Out Problem Encountered</AlertTitle>
          <AlertDescription className="mt-1 text-sm font-medium">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Screen Success Display */}
      {successMessage && (
        <Alert className="border-success/40 bg-success/10 text-success dark:border-success/30">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <AlertTitle className="font-semibold text-success">
            {successMessage.title}
          </AlertTitle>
          <AlertDescription className="mt-1 text-sm text-success/90">
            {successMessage.detail}
          </AlertDescription>
        </Alert>
      )}

      {products.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              No products with available stock in inventory.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add stock first using the Stock In page before recording a sale.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-select">Product *</Label>
                <Select
                  value={form.productId || undefined}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger id="product-select">
                    <SelectValue placeholder="Select product to stock out" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) — Available: {p.stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && (
                  <p className="text-xs text-destructive">{errors.productId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity-input">Quantity *</Label>
                <Input
                  id="quantity-input"
                  type="number"
                  min="1"
                  max={selectedProduct?.stock || 9999}
                  value={form.quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setErrorMessage(null);
                    setForm((prev) => ({
                      ...prev,
                      quantity: isNaN(val) ? 1 : Math.max(1, val),
                    }));
                  }}
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity}</p>
                )}
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">
                    In Stock: <span className="font-semibold text-foreground">{selectedProduct.stock}</span> units
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price-input">Selling Price per Unit (₹) *</Label>
                <Input
                  id="price-input"
                  type="number"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setErrorMessage(null);
                    setForm((prev) => ({
                      ...prev,
                      sellingPrice: isNaN(val) ? 0 : Math.max(0, val),
                    }));
                  }}
                />
                {errors.sellingPrice && (
                  <p className="text-xs text-destructive">{errors.sellingPrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-input">Date *</Label>
                <Input
                  id="date-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setForm((prev) => ({ ...prev, date: e.target.value }));
                  }}
                />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-ref">Customer / Reference *</Label>
                <Input
                  id="customer-ref"
                  value={form.customerRef}
                  onChange={(e) => {
                    setErrorMessage(null);
                    setForm((prev) => ({ ...prev, customerRef: e.target.value }));
                  }}
                  placeholder="e.g. CUST-Sharma Electronics or Retail Invoice #1024"
                />
                {errors.customerRef && (
                  <p className="text-xs text-destructive">{errors.customerRef}</p>
                )}
              </div>
            </div>

            {/* Serial / IMEI Section */}
            {selectedProduct && availableSerials.length > 0 && (
              <div className="space-y-2.5 rounded-lg border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Select Serial / IMEI Numbers (Optional)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Selected: {form.serialNumbers.length} / {form.quantity}
                  </span>
                </div>

                {availableSerials.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Available in stock (click to add):
                      </p>
                      {form.serialNumbers.length < form.quantity && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleAutoSelectSerials}
                          className="h-6 gap-1 text-xs text-primary hover:text-primary"
                        >
                          <Sparkles className="h-3 w-3" /> Auto-fill {form.quantity} Serials
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 border rounded bg-background">
                      {availableSerials.map((s) => {
                        const isSelected = form.serialNumbers.includes(s.serialNumber);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={isSelected}
                            onClick={() => {
                              if (form.serialNumbers.length >= form.quantity) {
                                setErrorMessage(
                                  `Quantity is set to ${form.quantity}. Increase quantity if you want to select more serial numbers.`
                                );
                                return;
                              }
                              setErrorMessage(null);
                              setForm((prev) => ({
                                ...prev,
                                serialNumbers: [...prev.serialNumbers, s.serialNumber],
                              }));
                            }}
                            className={`rounded border px-2 py-0.5 text-xs font-mono-code transition-colors ${
                              isSelected
                                ? 'border-primary/40 bg-primary/10 text-primary opacity-60 cursor-not-allowed'
                                : 'border-border bg-muted/40 hover:border-primary hover:bg-muted/80'
                            }`}
                          >
                            {s.serialNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Input
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSerial())}
                    placeholder="Or type custom serial / IMEI number"
                    className="font-mono-code text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSerial}
                    className="gap-1.5 shrink-0"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>

                {form.serialNumbers.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-foreground mb-1.5">
                      Selected Serial Numbers for this Sale:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {form.serialNumbers.map((sn) => (
                        <span
                          key={sn}
                          className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-mono-code text-foreground"
                        >
                          {sn}
                          <button
                            type="button"
                            onClick={() => handleRemoveSerial(sn)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes-textarea">Notes & Remarks</Label>
              <Textarea
                id="notes-textarea"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional sale details, warranty remarks, or payment mode..."
                rows={2}
              />
            </div>

            {/* Financial Summary */}
            {selectedProduct && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Sales Value</p>
                  <p className="text-base font-bold font-mono-code text-foreground">
                    {formatINR(form.quantity * form.sellingPrice)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Purchase Cost</p>
                  <p className="text-base font-bold font-mono-code text-foreground">
                    {formatINR(form.quantity * selectedProduct.purchasePrice)}
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-3 text-center ${
                    profit >= 0
                      ? 'border-success/30 bg-success/5'
                      : 'border-destructive/30 bg-destructive/5'
                  }`}
                >
                  <p className="text-xs text-muted-foreground">Estimated Profit</p>
                  <p
                    className={`text-base font-bold font-mono-code ${
                      profit >= 0 ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {formatINR(form.quantity * profit)}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !form.productId}
              className="w-full gap-2 text-base font-medium py-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Stock Out...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="h-4 w-4" />
                  Confirm & Remove Stock
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
