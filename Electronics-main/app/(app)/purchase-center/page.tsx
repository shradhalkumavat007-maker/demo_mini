'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Building,
  Package,
  Calendar,
  CreditCard,
  Send,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatINR, getStockStatus } from '@/lib/calculations';
import type { PurchaseOrderItem } from '@/types/purchase';

interface LineItemDraft {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export default function PurchaseCenterPage() {
  const router = useRouter();
  const suppliers = useInventoryStore((s) => s.suppliers);
  const products = useInventoryStore((s) => s.products);
  const createPurchaseOrder = useInventoryStore((s) => s.createPurchaseOrder);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItemDraft[]>([
    { productId: '', quantity: 10, unitPrice: 0 },
  ]);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === supplierId),
    [suppliers, supplierId]
  );

  // Low stock products suitable for reordering
  const lowStockProducts = useMemo(
    () => products.filter((p) => getStockStatus(p.stock, p.minStock) !== 'in_stock'),
    [products]
  );

  const addItemRow = () => {
    setItems((prev) => [...prev, { productId: '', quantity: 10, unitPrice: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItemDraft, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const prod = products.find((p) => p.id === value);
          if (prod) {
            updated.unitPrice = prod.purchasePrice;
          }
        }
        return updated;
      })
    );
  };

  const addLowStockItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const exists = items.some((item) => item.productId === productId);
    if (exists) {
      toast({ title: 'Item already in order', description: prod.name });
      return;
    }
    const needed = Math.max(prod.minStock * 2 - prod.stock, 5);
    setItems((prev) => [
      ...prev.filter((item) => item.productId !== ''),
      { productId, quantity: needed, unitPrice: prod.purchasePrice },
    ]);
    toast({ title: 'Added to order', description: `${prod.name} (${needed} units)` });
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0),
    [items]
  );

  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast({ title: 'Please select a supplier', variant: 'destructive' });
      return;
    }

    const validItems = items.filter((i) => i.productId && i.quantity > 0 && i.unitPrice >= 0);
    if (validItems.length === 0) {
      toast({ title: 'Please add at least one valid product line item', variant: 'destructive' });
      return;
    }

    const po = createPurchaseOrder(
      {
        supplierId,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
        expectedDate,
        notes,
      },
      user?.name ?? 'Admin',
      user?.id ?? 'usr-admin'
    );

    toast({
      title: 'Purchase Order Created',
      description: `PO ${po.poNumber} has been generated successfully.`,
    });

    router.push('/purchase-orders');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Center"
        description="Create and issue procurement purchase orders directly to suppliers."
        actions={
          <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
            View All Orders
          </Button>
        }
      />

      {/* Low stock quick add suggestions */}
      {lowStockProducts.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-warning font-semibold text-sm">
              <AlertTriangle className="h-4 w-4" /> Recommended Low-Stock Items to Reorder
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 6).map((p) => (
                <Button
                  key={p.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addLowStockItem(p.id)}
                  className="text-xs bg-background h-8 gap-1.5"
                >
                  <Plus className="h-3 w-3" />
                  {p.name} (Stock: {p.stock}/{p.minStock})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: PO Details & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" /> Supplier & Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="Select supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.company} ({s.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expectedDate">Expected Delivery Date</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                  />
                </div>
              </div>

              {selectedSupplier && (
                <div className="p-3 bg-muted/60 rounded-lg text-xs grid grid-cols-2 sm:grid-cols-3 gap-2 text-muted-foreground border border-border">
                  <div>
                    <span className="font-medium text-foreground">Contact:</span> {selectedSupplier.name}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Phone:</span> {selectedSupplier.phone}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Email:</span> {selectedSupplier.email}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Address:</span> {selectedSupplier.address}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-foreground">Payment Terms:</span> Net 30 Days
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="notes">Order Notes / Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g. Include fragile hardware packaging, deliver before 5 PM."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Order Items ({items.length})
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Product
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border bg-card/50 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <Label className="text-xs text-muted-foreground mb-1 block">Product</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(val) => updateItem(idx, 'productId', val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Choose product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24">
                    <Label className="text-xs text-muted-foreground mb-1 block">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      className="h-9 text-xs"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>

                  <div className="w-32">
                    <Label className="text-xs text-muted-foreground mb-1 block">Unit Cost (₹)</Label>
                    <Input
                      type="number"
                      min="0"
                      className="h-9 text-xs"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>

                  <div className="w-28 text-right sm:text-right">
                    <Label className="text-xs text-muted-foreground mb-1 block">Subtotal</Label>
                    <div className="text-sm font-semibold text-foreground pt-1.5">
                      {formatINR((item.quantity || 0) * (item.unitPrice || 0))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive sm:mt-5"
                    onClick={() => removeItemRow(idx)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <Card className="border border-border sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Line Items:</span>
                  <span className="font-medium text-foreground">{items.length} product(s)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Units:</span>
                  <span className="font-medium text-foreground">
                    {items.reduce((s, i) => s + (i.quantity || 0), 0)} units
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Items Subtotal:</span>
                  <span className="font-medium text-foreground">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated GST (18%):</span>
                  <span className="font-medium text-foreground">{formatINR(tax)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-base text-foreground">
                  <span>Total Cost:</span>
                  <span className="text-primary text-lg">{formatINR(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full gap-2 text-sm font-semibold" size="lg">
                  <Send className="h-4 w-4" /> Issue Purchase Order
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Issuing this order creates a draft PO and notifies the inventory system. Stock is received when goods arrive.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
