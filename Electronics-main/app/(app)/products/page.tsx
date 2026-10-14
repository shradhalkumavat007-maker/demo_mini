'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Eye, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { StockStatusBadge } from '@/components/common/stock-status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ProductForm } from '@/components/products/product-form';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/product-service';
import { formatINR, getStockStatus, downloadCSV } from '@/lib/calculations';
import type { Product } from '@/types/product';
import type { Category } from '@/types/product';
import type { Supplier } from '@/types/supplier';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const deleteProduct = useInventoryStore((s) => s.deleteProduct);
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setEditingProduct(null);
      setFormOpen(true);
      router.replace('/products');
    }
  }, [searchParams, router]);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await productService.deleteProduct(deleteTarget.id);
      toast({ title: 'Product deleted', description: `${deleteTarget.name} has been removed from database.` });
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err?.message || 'Could not delete product.', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, toast]);

  const handleExport = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Brand', 'Model', 'Stock', 'Min Stock', 'Purchase Price', 'Selling Price', 'Supplier', 'Status'];
    const rows = products.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const sup = suppliers.find((s) => s.id === p.supplierId);
      return [
        p.name, p.sku, cat?.name ?? '', p.brand, p.model, p.stock, p.minStock,
        p.purchasePrice, p.sellingPrice, sup?.company ?? '',
        getStockStatus(p.stock, p.minStock),
      ];
    });
    downloadCSV('products.csv', headers, rows);
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{p.name}</div>
            <div className="text-xs text-muted-foreground font-mono-code">{p.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'productId',
      header: 'Product ID',
      render: (p) => <span className="text-xs font-mono-code text-muted-foreground">{p.id}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortValue: (p) => categories.find((c) => c.id === p.categoryId)?.name ?? '',
      render: (p) => <span className="text-sm">{categories.find((c) => c.id === p.categoryId)?.name ?? '—'}</span>,
    },
    { key: 'brand', header: 'Brand', sortable: true, sortValue: (p) => p.brand, render: (p) => <span className="text-sm">{p.brand}</span> },
    { key: 'model', header: 'Model', render: (p) => <span className="text-sm text-muted-foreground">{p.model}</span> },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      sortValue: (p) => p.stock,
      render: (p) => <span className="text-sm font-semibold">{p.stock}</span>,
    },
    {
      key: 'purchasePrice',
      header: 'Purchase Price',
      sortable: true,
      sortValue: (p) => p.purchasePrice,
      render: (p) => <span className="text-sm font-mono-code">{formatINR(p.purchasePrice)}</span>,
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      sortable: true,
      sortValue: (p) => p.sellingPrice,
      render: (p) => <span className="text-sm font-mono-code">{formatINR(p.sellingPrice)}</span>,
    },
    {
      key: 'warranty',
      header: 'Warranty',
      render: (p) => (
        <span className="text-sm text-muted-foreground">
          {p.warrantyPeriodMonths === 0 ? '0 months (No Warranty)' : `${p.warrantyPeriodMonths} months`}
        </span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      sortable: true,
      sortValue: (p) => suppliers.find((s) => s.id === p.supplierId)?.company ?? '',
      render: (p) => <span className="text-sm text-muted-foreground">{suppliers.find((s) => s.id === p.supplierId)?.company ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (p) => getStockStatus(p.stock, p.minStock),
      render: (p) => <StockStatusBadge status={getStockStatus(p.stock, p.minStock)} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/products/${p.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(p)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    { label: 'Status', key: 'status', options: [
      { label: 'In Stock', value: 'in_stock' },
      { label: 'Low Stock', value: 'low_stock' },
      { label: 'Out of Stock', value: 'out_of_stock' },
    ], filterFn: (p: Product, v: string) => getStockStatus(p.stock, p.minStock) === v },
    { label: 'Category', key: 'category', options: categories.map((c) => ({ label: c.name, value: c.id })), filterFn: (p: Product, v: string) => p.categoryId === v },
    { label: 'Brand', key: 'brand', options: Array.from(new Set(products.map((p) => p.brand))).map((b) => ({ label: b, value: b })), filterFn: (p: Product, v: string) => p.brand === v },
    { label: 'Supplier', key: 'supplier', options: suppliers.map((s) => ({ label: s.company, value: s.id })), filterFn: (p: Product, v: string) => p.supplierId === v },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog with full CRUD operations."
        actions={<Button onClick={handleAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>}
      />
      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder="Search products..."
        searchKeys={[(p) => p.name, (p) => p.sku, (p) => p.brand, (p) => p.model]}
        filters={filterOptions}
        getRowId={(p) => p.id}
        onRowClick={(p) => router.push(`/products/${p.id}`)}
        onExport={handleExport}
        emptyTitle="No products yet"
        emptyDescription="Add your first product to start managing inventory."
      />

      <ProductForm open={formOpen} onOpenChange={setFormOpen} editingProduct={editingProduct} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product?"
        description={`This will permanently remove ${deleteTarget?.name} and its associated serial numbers. This action cannot be undone.`}
        confirmLabel="Delete Product"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
