'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/product-service';
import { productSchema } from '@/lib/validation';
import { formatINR, calculateProfitPerUnit, getProductInputDefault } from '@/lib/calculations';
import type { Product, ProductInput } from '@/types/product';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct?: Product | null;
}

export function ProductForm({ open, onOpenChange, editingProduct }: ProductFormProps) {
  const router = useRouter();
  const categories = useInventoryStore((s) => s.categories);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const { toast } = useToast();

  const [form, setForm] = useState<ProductInput>(getProductInputDefault());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        sku: editingProduct.sku,
        categoryId: editingProduct.categoryId,
        brand: editingProduct.brand,
        model: editingProduct.model,
        supplierId: editingProduct.supplierId,
        minStock: editingProduct.minStock,
        purchasePrice: editingProduct.purchasePrice,
        sellingPrice: editingProduct.sellingPrice,
        warrantyPeriodMonths: editingProduct.warrantyPeriodMonths,
        description: editingProduct.description,
        imageUrl: editingProduct.imageUrl,
      });
    } else {
      setForm(getProductInputDefault());
    }
    setErrors({});
  }, [editingProduct, open]);

  const profit = calculateProfitPerUnit(form.purchasePrice, form.sellingPrice);

  const handleSubmit = () => {
    setErrors({});
    const result = productSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!productService.checkSkuUnique(form.sku, editingProduct?.id)) {
      setErrors({ sku: 'SKU already exists. Please use a unique SKU.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (editingProduct) {
        productService.updateProduct(editingProduct.id, form);
        toast({ title: 'Product updated', description: `${form.name} has been updated successfully.` });
      } else {
        productService.createProduct(form);
        toast({ title: 'Product added', description: `${form.name} has been added successfully.` });
      }
      setLoading(false);
      onOpenChange(false);
    }, 400);
  };

  const setField = (field: keyof ProductInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. Samsung 55&quot; Crystal 4K Smart TV"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => setField('sku', e.target.value)}
                placeholder="e.g. SAM-TV-55-C4K"
                className="font-mono-code"
              />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={(e) => setField('brand', e.target.value)}
                placeholder="e.g. Samsung"
              />
              {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(e) => setField('model', e.target.value)}
                placeholder="e.g. UA55CUE70AKLXL"
              />
              {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setField('categoryId', v)}>
                <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={form.supplierId} onValueChange={(v) => setField('supplierId', v)}>
                <SelectTrigger id="supplier"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.filter((s) => s.status === 'active').map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId && <p className="text-xs text-destructive">{errors.supplierId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (₹) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                value={form.purchasePrice || ''}
                onChange={(e) => setField('purchasePrice', Number(e.target.value))}
                placeholder="0"
              />
              {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                value={form.sellingPrice || ''}
                onChange={(e) => setField('sellingPrice', Number(e.target.value))}
                placeholder="0"
              />
              {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Minimum Stock *</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={form.minStock || ''}
                onChange={(e) => setField('minStock', Number(e.target.value))}
                placeholder="0"
              />
              {errors.minStock && <p className="text-xs text-destructive">{errors.minStock}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty Period (Months)</Label>
              <Input
                id="warranty"
                type="number"
                min="0"
                value={form.warrantyPeriodMonths || ''}
                onChange={(e) => setField('warrantyPeriodMonths', Number(e.target.value))}
                placeholder="12"
              />
              {errors.warrantyPeriodMonths && <p className="text-xs text-destructive">{errors.warrantyPeriodMonths}</p>}
            </div>
          </div>

          {/* Live Profit Calculation */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Profit Per Unit</p>
              <p className={`text-lg font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatINR(profit)}
              </p>
            </div>
            {profit >= 0 ? (
              <div className="flex items-center gap-1.5 text-success">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Profitable</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-destructive">
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm font-medium">Loss per unit</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Product description..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {editingProduct ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
