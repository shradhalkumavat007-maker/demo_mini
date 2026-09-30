'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Package, IndianRupee, TrendingUp, Truck, ShieldCheck,
  Smartphone, History, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockStatusBadge } from '@/components/common/stock-status-badge';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ProductForm } from '@/components/products/product-form';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import {
  formatINR, formatDate, getStockStatus, calculateProfitPerUnit,
} from '@/lib/calculations';
import { useState } from 'react';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const product = useInventoryStore((s) => s.products.find((p) => p.id === params.id));
  const categories = useInventoryStore((s) => s.categories);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const transactions = useInventoryStore((s) => s.transactions);
  const serials = useInventoryStore((s) => s.serials);
  const deleteProduct = useInventoryStore((s) => s.deleteProduct);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!product) {
    return (
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 gap-2">
          <Link href="/products"><ArrowLeft className="h-4 w-4" /> Back to Products</Link>
        </Button>
        <EmptyState
          icon={Package}
          title="Product not found"
          description="This product may have been deleted or does not exist."
          action={{ label: 'Back to Products', onClick: () => router.push('/products') }}
        />
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const supplier = suppliers.find((s) => s.id === product.supplierId);
  const productTransactions = transactions.filter((t) => t.productId === product.id);
  const productSerials = serials.filter((s) => s.productId === product.id);
  const profit = calculateProfitPerUnit(product.purchasePrice, product.sellingPrice);
  const stockStatus = getStockStatus(product.stock, product.minStock);

  const handleDelete = () => {
    deleteProduct(product.id);
    toast({ title: 'Product deleted', description: `${product.name} has been removed.` });
    router.push('/products');
  };

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="gap-2">
        <Link href="/products"><ArrowLeft className="h-4 w-4" /> Back to Products</Link>
      </Button>

      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku} · ${product.brand} ${product.model}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/inventory/stock-in"><ArrowDownToLine className="h-4 w-4" /> Stock In</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/inventory/stock-out"><ArrowUpFromLine className="h-4 w-4" /> Stock Out</Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-border lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Package className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-base font-semibold">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.brand} · {product.model}</p>
            <div className="mt-4 w-full">
              <StockStatusBadge status={stockStatus} className="w-full justify-center" />
            </div>
            <div className="mt-4 w-full grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="text-xs text-muted-foreground">Current Stock</p>
                <p className="text-lg font-bold">{product.stock}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Min Stock</p>
                <p className="text-lg font-bold">{product.minStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Product Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={Package} label="SKU" value={product.sku} mono />
              <DetailRow icon={Package} label="Product ID" value={product.id} mono />
              <DetailRow icon={Package} label="Category" value={category?.name ?? '—'} />
              <DetailRow icon={Truck} label="Supplier" value={supplier?.company ?? '—'} />
              <DetailRow icon={IndianRupee} label="Purchase Price" value={formatINR(product.purchasePrice)} mono />
              <DetailRow icon={IndianRupee} label="Selling Price" value={formatINR(product.sellingPrice)} mono />
              <DetailRow
                icon={profit >= 0 ? TrendingUp : TrendingUp}
                label="Profit Per Unit"
                value={formatINR(profit)}
                valueClass={profit >= 0 ? 'text-success' : 'text-destructive'}
                mono
              />
              <DetailRow icon={ShieldCheck} label="Warranty" value={`${product.warrantyPeriodMonths} months`} />
            </div>
            {product.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions" className="gap-1.5"><History className="h-4 w-4" /> Stock History</TabsTrigger>
          <TabsTrigger value="serials" className="gap-1.5"><Smartphone className="h-4 w-4" /> Serial / IMEI</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Card className="border-border">
            <CardContent className="p-0">
              {productTransactions.length === 0 ? (
                <EmptyState icon={History} title="No transactions" description="No stock movements recorded for this product yet." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productTransactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono-code text-xs">{t.id}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${t.type === 'stock_in' ? 'text-success' : 'text-primary'}`}>
                            {t.type === 'stock_in' ? 'Stock In' : 'Stock Out'}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">{t.quantity}</TableCell>
                        <TableCell className="font-mono-code text-sm">{formatINR(t.totalValue)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(t.date)}</TableCell>
                        <TableCell className="text-sm">{t.userName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{t.reference || t.customerRef || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="serials">
          <Card className="border-border">
            <CardContent className="p-0">
              {productSerials.length === 0 ? (
                <EmptyState icon={Smartphone} title="No serial numbers" description="No serial or IMEI numbers tracked for this product." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Serial Number</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Customer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productSerials.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono-code text-sm">{s.serialNumber}</TableCell>
                        <TableCell className="font-mono-code text-sm text-muted-foreground">{s.imei ?? '—'}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium capitalize ${
                            s.status === 'available' ? 'text-success' :
                            s.status === 'sold' ? 'text-primary' :
                            s.status === 'reserved' ? 'text-warning' : 'text-destructive'
                          }`}>{s.status}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(s.dateAdded)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.customerRef ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductForm open={editOpen} onOpenChange={setEditOpen} editingProduct={product} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Product?"
        description={`This will permanently remove ${product.name} and its associated serial numbers. This action cannot be undone.`}
        confirmLabel="Delete Product"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, mono, valueClass }: {
  icon: typeof Package; label: string; value: string; mono?: boolean; valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${mono ? 'font-mono-code' : ''} ${valueClass ?? ''}`}>{value}</p>
      </div>
    </div>
  );
}
