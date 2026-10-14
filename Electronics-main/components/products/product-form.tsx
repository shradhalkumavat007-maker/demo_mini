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
import { Loader2, TrendingUp, TrendingDown, Sparkles, Barcode, Copy, Check, Download, Printer } from 'lucide-react';
import { generateQRCodeDataUrl } from '@/lib/product-assets';
import { BarcodePrintModal } from '@/components/products/barcode-print-modal';

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
  const [barcodeQrUrl, setBarcodeQrUrl] = useState<string>('');
  const [copiedSku, setCopiedSku] = useState(false);
  const [manualSkuEdited, setManualSkuEdited] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Helper to generate SKU string based on current values
  const computeSku = (brand?: string, catId?: string, model?: string, name?: string) => {
    const brandPrefix = (brand || name?.split(' ')[0] || 'ELC')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3) || 'ELC';
    const cat = categories.find((c) => c.id === catId);
    const catPrefix = cat
      ? cat.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 2)
      : 'GN';
    const modelPrefix = (model || name?.split(' ').slice(1, 3).join('') || 'STD')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4) || 'STD';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${brandPrefix}-${catPrefix}-${modelPrefix}-${randomSuffix}`;
  };

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
      setManualSkuEdited(true);
    } else {
      const initialForm = getProductInputDefault();
      const autoSku = computeSku(initialForm.brand, initialForm.categoryId, initialForm.model, initialForm.name);
      setForm({ ...initialForm, sku: autoSku });
      setManualSkuEdited(false);
    }
    setErrors({});
  }, [editingProduct, open]);

  // Update live barcode visual whenever SKU changes
  useEffect(() => {
    if (!form.sku) {
      setBarcodeQrUrl('');
      return;
    }
    let isCurrent = true;
    generateQRCodeDataUrl(form.sku, { width: 120, margin: 1 }).then((url) => {
      if (isCurrent) setBarcodeQrUrl(url);
    });
    return () => {
      isCurrent = false;
    };
  }, [form.sku]);

  const profit = calculateProfitPerUnit(form.purchasePrice, form.sellingPrice);

  const handleSubmit = async () => {
    setErrors({});
    const payload: ProductInput = {
      ...form,
      minStock: Number(form.minStock) || 0,
      purchasePrice: Number(form.purchasePrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      warrantyPeriodMonths: typeof form.warrantyPeriodMonths === 'number' ? form.warrantyPeriodMonths : (parseInt(form.warrantyPeriodMonths as any) || 0),
    };

    const result = productSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!productService.checkSkuUnique(payload.sku, editingProduct?.id)) {
      setErrors({ sku: 'SKU already exists. Please use a unique SKU.' });
      return;
    }

    setLoading(true);
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
        toast({ title: 'Product updated', description: `${payload.name} has been updated successfully.` });
      } else {
        await productService.createProduct(payload);
        toast({ title: 'Product added', description: `${payload.name} has been saved to database permanently.` });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err?.message || 'Could not persist product to database. Please check values.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySku = () => {
    if (!form.sku) return;
    navigator.clipboard.writeText(form.sku);
    setCopiedSku(true);
    toast({ title: 'SKU Copied', description: `${form.sku} copied to clipboard.` });
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleDownloadSingleBarcode = () => {
    if (!barcodeQrUrl || !form.sku) return;
    const a = document.createElement('a');
    a.href = barcodeQrUrl;
    a.download = `barcode-${form.sku.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({
      title: 'Barcode Image Downloaded! 📥',
      description: `Saved barcode file for ${form.sku}.`,
    });
  };

  const setField = (field: keyof ProductInput, value: string | number) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (!editingProduct && !manualSkuEdited && (field === 'brand' || field === 'categoryId' || field === 'model' || field === 'name')) {
        next.sku = computeSku(
          field === 'brand' ? (value as string) : next.brand,
          field === 'categoryId' ? (value as string) : next.categoryId,
          field === 'model' ? (value as string) : next.model,
          field === 'name' ? (value as string) : next.name
        );
      }
      return next;
    });
  };

  const handleManualSkuChange = (val: string) => {
    setManualSkuEdited(true);
    setForm((prev) => ({ ...prev, sku: val }));
  };

  const handleAutoGenerateSku = () => {
    const generated = computeSku(form.brand, form.categoryId, form.model, form.name);
    setManualSkuEdited(false);
    setForm((prev) => ({ ...prev, sku: generated }));
    toast({ title: 'New Barcode SKU Generated', description: generated });
  };

  return (
    <>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="sku">SKU / Barcode *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoGenerateSku}
                  className="h-6 text-[11px] px-2 gap-1 text-primary hover:bg-primary/10 font-semibold"
                >
                  <Sparkles className="h-3 w-3" /> Regenerate
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => handleManualSkuChange(e.target.value)}
                  placeholder="e.g. SAM-TV-55-C4K"
                  className="font-mono-code pr-8"
                />
                <Barcode className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {form.sku && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 space-y-2 mt-1.5">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-md border border-border shadow-sm shrink-0">
                      {barcodeQrUrl ? (
                        <img src={barcodeQrUrl} alt={`Barcode ${form.sku}`} className="w-14 h-14 object-contain" />
                      ) : (
                        <div className="w-14 h-14 bg-muted animate-pulse rounded" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                          <Barcode className="h-3 w-3" /> Auto Barcode
                        </span>
                        <button
                          type="button"
                          onClick={handleCopySku}
                          className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted"
                        >
                          {copiedSku ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                          {copiedSku ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="font-mono-code font-bold text-xs truncate text-foreground">
                        {form.sku}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Scannable via camera scanner & hardware wedge.
                      </p>
                    </div>
                  </div>

                  {/* Actions: Download Single Barcode & Print / Batch Labels Sheet with Quantity */}
                  <div className="flex items-center gap-2 pt-1 border-t border-primary/10">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadSingleBarcode}
                      disabled={!barcodeQrUrl}
                      className="h-7 text-[11px] px-2.5 gap-1.5 bg-background hover:bg-muted font-medium flex-1 text-foreground"
                    >
                      <Download className="h-3.5 w-3.5 text-primary" /> Download Barcode
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPrintModalOpen(true)}
                      disabled={!form.sku}
                      className="h-7 text-[11px] px-2.5 gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 font-medium flex-1"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print / Batch Labels
                    </Button>
                  </div>
                </div>
              )}
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
                value={form.purchasePrice !== undefined && form.purchasePrice !== null ? form.purchasePrice : ''}
                onChange={(e) => setField('purchasePrice', e.target.value === '' ? '' : Number(e.target.value))}
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
                value={form.sellingPrice !== undefined && form.sellingPrice !== null ? form.sellingPrice : ''}
                onChange={(e) => setField('sellingPrice', e.target.value === '' ? '' : Number(e.target.value))}
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
                value={form.minStock !== undefined && form.minStock !== null ? form.minStock : ''}
                onChange={(e) => setField('minStock', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
              />
              {errors.minStock && <p className="text-xs text-destructive">{errors.minStock}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="warranty">Warranty Period (Months)</Label>
                {Number(form.warrantyPeriodMonths) === 0 ? (
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    0 Months (No Warranty)
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {form.warrantyPeriodMonths} Months
                  </span>
                )}
              </div>
              <Input
                id="warranty"
                type="number"
                min="0"
                value={form.warrantyPeriodMonths !== undefined && form.warrantyPeriodMonths !== null ? form.warrantyPeriodMonths : ''}
                onChange={(e) => setField('warrantyPeriodMonths', e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-0.5">Quick select:</span>
                {[
                  { label: '0M (No Warranty)', val: 0 },
                  { label: '6M', val: 6 },
                  { label: '12M (1 Yr)', val: 12 },
                  { label: '24M (2 Yrs)', val: 24 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setField('warrantyPeriodMonths', preset.val)}
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                      Number(form.warrantyPeriodMonths) === preset.val
                        ? 'bg-primary text-primary-foreground border-primary font-medium shadow-sm'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
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

    <BarcodePrintModal
      open={printModalOpen}
      onOpenChange={setPrintModalOpen}
      sku={form.sku}
      productName={form.name}
      brand={form.brand}
      price={Number(form.sellingPrice) || 0}
      qrDataUrl={barcodeQrUrl}
    />
  </>
  );
}
