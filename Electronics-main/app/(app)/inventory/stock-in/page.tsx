'use client';

import { useState } from 'react';
import { Loader2, ArrowDownToLine, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { inventoryService } from '@/services/inventory-service';
import { stockInSchema } from '@/lib/validation';
import { formatINR, generateSerialNumber, generateIMEI } from '@/lib/calculations';
import type { StockInInput } from '@/types/transaction';

export default function StockInPage() {
  const products = useInventoryStore((s) => s.products);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [form, setForm] = useState<StockInInput>({
    productId: '', supplierId: '', quantity: 1, purchasePrice: 0,
    serialNumbers: [], date: new Date().toISOString().split('T')[0],
    reference: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serialInput, setSerialInput] = useState('');

  const selectedProduct = products.find((p) => p.id === form.productId);

  const handleProductChange = (productId: string) => {
    if (!productId || productId === form.productId) return;
    const p = products.find((prod) => prod.id === productId);
    setForm((prev) => ({
      ...prev,
      productId,
      supplierId: p?.supplierId ?? prev.supplierId,
      purchasePrice: p?.purchasePrice ?? 0,
    }));
  };

  const handleAddSerial = () => {
    if (!serialInput.trim()) return;
    const sn = serialInput.trim();
    if (form.serialNumbers.includes(sn)) {
      toast({ title: 'Duplicate', description: 'This serial number is already in the list.', variant: 'destructive' });
      return;
    }
    setForm((prev) => ({ ...prev, serialNumbers: [...prev.serialNumbers, sn] }));
    setSerialInput('');
  };

  const handleGenerateSerial = () => {
    const sn = generateSerialNumber();
    setForm((prev) => ({ ...prev, serialNumbers: [...prev.serialNumbers, sn] }));
  };

  const handleGenerateIMEI = () => {
    const imei = generateIMEI();
    setForm((prev) => ({ ...prev, serialNumbers: [...prev.serialNumbers, imei] }));
  };

  const handleRemoveSerial = (sn: string) => {
    setForm((prev) => ({ ...prev, serialNumbers: prev.serialNumbers.filter((s) => s !== sn) }));
  };

  const handleSubmit = async () => {
    setErrors({});
    const result = stockInSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { const f = i.path[0] as string; if (!fe[f]) fe[f] = i.message; });
      setErrors(fe);
      return;
    }

    setLoading(true);
    try {
      const productName = selectedProduct?.name || 'Product';
      const addedQty = form.quantity;
      const res = await inventoryService.stockIn({
        ...form,
        serialNumbers: Array.isArray(form.serialNumbers) ? form.serialNumbers : [],
      });
      if (res && res.success) {
        toast({ title: 'Stock added successfully', description: `${addedQty} units of ${productName} added.` });
        setForm({
          productId: '', supplierId: '', quantity: 1, purchasePrice: 0,
          serialNumbers: [], date: new Date().toISOString().split('T')[0],
          reference: '', notes: '',
        });
      } else {
        toast({ title: 'Error', description: res?.error || 'Failed to add stock', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Stock In error:', err);
      toast({ title: 'Stock In Error', description: err?.message || 'Unexpected error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Stock In" description="Add new stock to your inventory." />

      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Product *</Label>
              <Select value={form.productId || undefined} onValueChange={handleProductChange}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && <p className="text-xs text-destructive">{errors.productId}</p>}
            </div>

            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={form.supplierId || undefined} onValueChange={(v) => { if (v && v !== form.supplierId) setForm((prev) => ({ ...prev, supplierId: v })); }}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.filter((s) => s.status === 'active').map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId && <p className="text-xs text-destructive">{errors.supplierId}</p>}
            </div>

            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input type="number" min="1" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
            </div>

            <div className="space-y-2">
              <Label>Purchase Price per Unit (₹) *</Label>
              <Input type="number" min="0" value={form.purchasePrice || ''} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })} />
              {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice}</p>}
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label>Reference / GRN</Label>
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="e.g. GRN-005" />
            </div>
          </div>

          {/* Serial / IMEI */}
          <div className="space-y-2">
            <Label>Serial / IMEI Numbers (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSerial())}
                placeholder="Enter serial or IMEI number"
                className="font-mono-code"
              />
              <Button type="button" variant="outline" onClick={handleAddSerial} className="gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleGenerateSerial} className="text-xs">Generate Serial</Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleGenerateIMEI} className="text-xs">Generate IMEI</Button>
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

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." rows={2} />
          </div>

          {/* Summary */}
          {selectedProduct && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Stock In Value</p>
                <p className="text-lg font-bold font-mono-code">{formatINR(form.quantity * form.purchasePrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">New Stock Level</p>
                <p className="text-lg font-bold">{selectedProduct.stock + form.quantity}</p>
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={loading || !form.productId} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
            {loading ? 'Processing...' : 'Add Stock'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
