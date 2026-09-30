'use client';

import { useState } from 'react';
import { Loader2, ArrowUpFromLine, Plus, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import { inventoryService } from '@/services/inventory-service';
import { stockOutSchema } from '@/lib/validation';
import { formatINR, calculateProfitPerUnit } from '@/lib/calculations';
import type { StockOutInput } from '@/types/transaction';

export default function StockOutPage() {
  const products = useInventoryStore((s) => s.products.filter((p) => p.stock > 0));
  const allSerials = useInventoryStore((s) => s.serials);
  const { toast } = useToast();

  const [form, setForm] = useState<StockOutInput>({
    productId: '', quantity: 1, serialNumbers: [],
    sellingPrice: 0, date: new Date().toISOString().split('T')[0],
    customerRef: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serialInput, setSerialInput] = useState('');

  const selectedProduct = products.find((p) => p.id === form.productId);
  const availableSerials = allSerials.filter((s) => s.productId === form.productId && s.status === 'available');

  const handleProductChange = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    setForm((prev) => ({
      ...prev, productId, sellingPrice: p?.sellingPrice ?? 0, serialNumbers: [],
    }));
  };

  const handleAddSerial = () => {
    if (!serialInput.trim()) return;
    const sn = serialInput.trim();
    if (form.serialNumbers.includes(sn)) {
      toast({ title: 'Duplicate', description: 'This serial number is already selected.', variant: 'destructive' });
      return;
    }
    setForm((prev) => ({ ...prev, serialNumbers: [...prev.serialNumbers, sn] }));
    setSerialInput('');
  };

  const handleRemoveSerial = (sn: string) => {
    setForm((prev) => ({ ...prev, serialNumbers: prev.serialNumbers.filter((s) => s !== sn) }));
  };

  const handleSubmit = () => {
    setErrors({});
    const result = stockOutSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { const f = i.path[0] as string; if (!fe[f]) fe[f] = i.message; });
      setErrors(fe);
      return;
    }

    if (selectedProduct && form.quantity > selectedProduct.stock) {
      toast({ title: 'Insufficient stock', description: `Available: ${selectedProduct.stock}, Requested: ${form.quantity}`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = inventoryService.stockOut(form);
      setLoading(false);
      if (res.success) {
        toast({ title: 'Stock removed successfully', description: `${form.quantity} units of ${selectedProduct?.name} sold.` });
        setForm({
          productId: '', quantity: 1, serialNumbers: [],
          sellingPrice: 0, date: new Date().toISOString().split('T')[0],
          customerRef: '', notes: '',
        });
      } else {
        toast({ title: 'Error', description: res.error, variant: 'destructive' });
      }
    }, 500);
  };

  const profit = selectedProduct ? calculateProfitPerUnit(selectedProduct.purchasePrice, form.sellingPrice) : 0;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Stock Out" description="Remove stock from inventory and record sales." />

      {products.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No products with available stock. Add stock first using Stock In.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Product *</Label>
                <Select value={form.productId} onValueChange={handleProductChange}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (Available: {p.stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-xs text-destructive">{errors.productId}</p>}
              </div>

              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" min="1" max={selectedProduct?.stock} value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
                {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">Available: {selectedProduct.stock} units</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Selling Price per Unit (₹) *</Label>
                <Input type="number" min="0" value={form.sellingPrice || ''} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} />
                {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice}</p>}
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label>Customer / Reference *</Label>
                <Input value={form.customerRef} onChange={(e) => setForm({ ...form, customerRef: e.target.value })} placeholder="e.g. CUST-Sharma Electronics" />
                {errors.customerRef && <p className="text-xs text-destructive">{errors.customerRef}</p>}
              </div>
            </div>

            {/* Serial / IMEI */}
            {availableSerials.length > 0 && (
              <div className="space-y-2">
                <Label>Serial / IMEI Numbers (Optional)</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {availableSerials.slice(0, 8).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (!form.serialNumbers.includes(s.serialNumber)) {
                          setForm((prev) => ({ ...prev, serialNumbers: [...prev.serialNumbers, s.serialNumber] }));
                        }
                      }}
                      className="rounded border border-border bg-muted/30 px-2 py-0.5 text-xs font-mono-code hover:border-primary/40"
                    >
                      {s.serialNumber}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSerial())}
                    placeholder="Enter serial or IMEI"
                    className="font-mono-code"
                  />
                  <Button type="button" variant="outline" onClick={handleAddSerial} className="gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
                </div>
                {form.serialNumbers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.serialNumbers.map((sn) => (
                      <span key={sn} className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-mono-code">
                        {sn}
                        <button onClick={() => handleRemoveSerial(sn)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={2} />
            </div>

            {/* Summary */}
            {selectedProduct && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Sales Value</p>
                  <p className="text-base font-bold font-mono-code">{formatINR(form.quantity * form.sellingPrice)}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Purchase Cost</p>
                  <p className="text-base font-bold font-mono-code">{formatINR(form.quantity * selectedProduct.purchasePrice)}</p>
                </div>
                <div className={`rounded-lg border p-3 text-center ${profit >= 0 ? 'border-success/20 bg-success/5' : 'border-destructive/20 bg-destructive/5'}`}>
                  <p className="text-xs text-muted-foreground">Profit / Loss</p>
                  <p className={`text-base font-bold font-mono-code ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatINR(form.quantity * profit)}
                  </p>
                </div>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={loading || !form.productId} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
              {loading ? 'Processing...' : 'Remove Stock'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
