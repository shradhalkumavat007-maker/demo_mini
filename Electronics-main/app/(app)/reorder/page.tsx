'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RefreshCw,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Building,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { StockStatusBadge } from '@/components/common/stock-status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatINR, getStockStatus, downloadCSV } from '@/lib/calculations';
import type { Product } from '@/types/product';

interface ReorderItem {
  product: Product;
  currentStock: number;
  minStock: number;
  deficit: number;
  suggestedQty: number;
  estimatedCost: number;
  supplierName: string;
  status: 'out_of_stock' | 'low_stock';
}

export default function ReorderPage() {
  const router = useRouter();
  const products = useInventoryStore((s) => s.products);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const categories = useInventoryStore((s) => s.categories);
  const createPurchaseOrder = useInventoryStore((s) => s.createPurchaseOrder);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const reorderItems: ReorderItem[] = useMemo(() => {
    return products
      .filter((p) => p.stock <= p.minStock)
      .map((p) => {
        const sup = suppliers.find((s) => s.id === p.supplierId);
        const status: 'out_of_stock' | 'low_stock' = p.stock === 0 ? 'out_of_stock' : 'low_stock';
        const suggestedQty = Math.max(p.minStock * 2 - p.stock, 5);
        const estimatedCost = suggestedQty * p.purchasePrice;
        return {
          product: p,
          currentStock: p.stock,
          minStock: p.minStock,
          deficit: Math.max(0, p.minStock - p.stock),
          suggestedQty,
          estimatedCost,
          supplierName: sup?.company ?? 'Default Supplier',
          status,
        };
      })
      .sort((a, b) => (a.status === 'out_of_stock' ? -1 : 1));
  }, [products, suppliers]);

  const outOfStockCount = reorderItems.filter((i) => i.status === 'out_of_stock').length;
  const lowStockCount = reorderItems.filter((i) => i.status === 'low_stock').length;
  const totalEstimatedCost = reorderItems.reduce((s, i) => s + i.estimatedCost, 0);

  const handleBulkReorder = () => {
    if (reorderItems.length === 0) {
      toast({ title: 'No reorder items needed', description: 'All products have healthy inventory levels.' });
      return;
    }

    // Group items by supplier
    const supplierGroups: Record<string, ReorderItem[]> = {};
    reorderItems.forEach((item) => {
      const supId = item.product.supplierId || suppliers[0]?.id || 'sup-1';
      if (!supplierGroups[supId]) supplierGroups[supId] = [];
      supplierGroups[supId].push(item);
    });

    let poCount = 0;
    Object.entries(supplierGroups).forEach(([supId, items]) => {
      createPurchaseOrder(
        {
          supplierId: supId,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.suggestedQty,
            unitPrice: i.product.purchasePrice,
          })),
          expectedDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          notes: 'Auto-generated from Intelligent Reorder Suggestions.',
        },
        user?.name ?? 'Admin',
        user?.id ?? 'usr-admin'
      );
      poCount++;
    });

    toast({
      title: 'Bulk POs Created',
      description: `Created ${poCount} Purchase Order(s) for ${reorderItems.length} replenishment items.`,
    });

    router.push('/purchase-orders');
  };

  const handleSingleReorder = (item: ReorderItem) => {
    const supId = item.product.supplierId || suppliers[0]?.id || 'sup-1';
    const po = createPurchaseOrder(
      {
        supplierId: supId,
        items: [
          {
            productId: item.product.id,
            quantity: item.suggestedQty,
            unitPrice: item.product.purchasePrice,
          },
        ],
        expectedDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        notes: `Quick Reorder for ${item.product.name}`,
      },
      user?.name ?? 'Admin',
      user?.id ?? 'usr-admin'
    );

    toast({
      title: 'Purchase Order Created',
      description: `PO ${po.poNumber} created for ${item.suggestedQty} units of ${item.product.name}.`,
    });

    router.push('/purchase-orders');
  };

  const handleExport = () => {
    const headers = ['Product Name', 'SKU', 'Current Stock', 'Min Stock', 'Deficit', 'Suggested Qty', 'Unit Cost', 'Estimated Cost', 'Supplier', 'Status'];
    const rows = reorderItems.map((i) => [
      i.product.name,
      i.product.sku,
      i.currentStock,
      i.minStock,
      i.deficit,
      i.suggestedQty,
      i.product.purchasePrice,
      i.estimatedCost,
      i.supplierName,
      i.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock',
    ]);
    downloadCSV('reorder_suggestions.csv', headers, rows);
  };

  const columns: Column<ReorderItem>[] = [
    {
      key: 'product',
      header: 'Product',
      sortable: true,
      sortValue: (i) => i.product.name,
      render: (i) => (
        <div className="space-y-0.5">
          <div className="font-medium text-sm text-foreground">{i.product.name}</div>
          <div className="text-xs text-muted-foreground font-mono-code">{i.product.sku}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Stock Status',
      sortable: true,
      sortValue: (i) => i.status,
      render: (i) => <StockStatusBadge status={i.status} />,
    },
    {
      key: 'stockLevel',
      header: 'Stock Level',
      render: (i) => {
        const percentage = Math.min(100, Math.round((i.currentStock / (i.minStock || 1)) * 100));
        return (
          <div className="space-y-1.5 w-32">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">{i.currentStock} units</span>
              <span className="text-muted-foreground">Min: {i.minStock}</span>
            </div>
            <Progress value={percentage} className="h-1.5" />
          </div>
        );
      },
    },
    {
      key: 'suggestedQty',
      header: 'Suggested Qty',
      sortable: true,
      sortValue: (i) => i.suggestedQty,
      render: (i) => (
        <span className="font-semibold text-sm text-primary font-mono-code bg-primary/10 px-2 py-0.5 rounded">
          +{i.suggestedQty} units
        </span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      sortable: true,
      sortValue: (i) => i.supplierName,
      render: (i) => <span className="text-xs font-medium text-foreground">{i.supplierName}</span>,
    },
    {
      key: 'estimatedCost',
      header: 'Est. Cost',
      sortable: true,
      sortValue: (i) => i.estimatedCost,
      render: (i) => <span className="font-semibold text-sm text-foreground">{formatINR(i.estimatedCost)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (i) => (
        <Button
          size="sm"
          className="text-xs h-7 gap-1"
          onClick={() => handleSingleReorder(i)}
        >
          <ShoppingCart className="h-3 w-3" /> Quick PO
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reorder Suggestions"
        description="Automated inventory replenishment recommendations based on stock minimum thresholds and sales lead times."
        actions={
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleBulkReorder}
              disabled={reorderItems.length === 0}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Generate PO for All ({reorderItems.length})
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Replenishment Needed</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{reorderItems.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <RefreshCw className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Critical Out of Stock</p>
              <h3 className="text-2xl font-bold mt-1 text-destructive">{outOfStockCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock Warning</p>
              <h3 className="text-2xl font-bold mt-1 text-warning">{lowStockCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Reorder Est.</p>
              <h3 className="text-xl font-bold mt-1 text-foreground">{formatINR(totalEstimatedCost)}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <DataTable
            data={reorderItems}
            columns={columns}
            searchPlaceholder="Search product or supplier..."
            searchKeys={[(i) => i.product.name, (i) => i.product.sku, 'supplierName']}
            filters={[
              {
                key: 'status',
                label: 'Severity',
                options: [
                  { label: 'Out of Stock', value: 'out_of_stock' },
                  { label: 'Low Stock', value: 'low_stock' },
                ],
                filterFn: (row, val) => row.status === val,
              },
            ]}
            onExport={handleExport}
            getRowId={(r) => r.product.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
