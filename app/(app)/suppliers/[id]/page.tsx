'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, Mail, Phone, Building2, MapPin, FileText, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import { POStatusBadge } from '@/components/common/po-status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { useInventoryStore } from '@/store/inventory-store';
import { formatINR, formatDate } from '@/lib/calculations';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplier = useInventoryStore((s) => s.suppliers.find((sup) => sup.id === params.id));
  const products = useInventoryStore((s) => s.products);
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);

  if (!supplier) {
    return (
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 gap-2">
          <Link href="/suppliers"><ArrowLeft className="h-4 w-4" /> Back to Suppliers</Link>
        </Button>
        <EmptyState icon={Truck} title="Supplier not found" description="This supplier may have been deleted." action={{ label: 'Back to Suppliers', onClick: () => router.push('/suppliers') }} />
      </div>
    );
  }

  const supplierProducts = products.filter((p) => p.supplierId === supplier.id);
  const supplierPOs = purchaseOrders.filter((p) => p.supplierId === supplier.id);
  const totalPurchaseValue = supplierPOs.reduce((sum, p) => sum + p.totalCost, 0);
  const pendingOrders = supplierPOs.filter((p) => p.status !== 'received' && p.status !== 'cancelled').length;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="gap-2">
        <Link href="/suppliers"><ArrowLeft className="h-4 w-4" /> Back to Suppliers</Link>
      </Button>

      <PageHeader title={supplier.company} description={supplier.name} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-border lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Supplier Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{supplier.company}</span></div>
            <div className="flex items-center gap-2.5"><Truck className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{supplier.name}</span></div>
            <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{supplier.phone}</span></div>
            <div className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{supplier.email}</span></div>
            <div className="flex items-start gap-2.5"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" /><span className="text-sm">{supplier.address}</span></div>
            {supplier.gstin && <div className="flex items-center gap-2.5"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-mono-code">{supplier.gstin}</span></div>}
            <div>
              <Badge variant="outline" className={supplier.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
                {supplier.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
          <Card className="border-border"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Products Supplied</div><div className="text-2xl font-bold mt-1">{supplierProducts.length}</div></CardContent></Card>
          <Card className="border-border"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Total Purchase Value</div><div className="text-2xl font-bold mt-1 font-mono-code">{formatINR(totalPurchaseValue)}</div></CardContent></Card>
          <Card className="border-border"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Pending Orders</div><div className="text-2xl font-bold mt-1">{pendingOrders}</div></CardContent></Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Products Supplied</CardTitle></CardHeader>
          <CardContent className="p-0">
            {supplierProducts.length === 0 ? (
              <EmptyState icon={Package} title="No products" description="No products supplied by this supplier." />
            ) : (
              <Table>
                <TableHeader><TableRow className="bg-muted/30"><TableHead>Product</TableHead><TableHead>Stock</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
                <TableBody>
                  {supplierProducts.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/products/${p.id}`)}>
                      <TableCell className="text-sm font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm">{p.stock}</TableCell>
                      <TableCell className="text-sm font-mono-code">{formatINR(p.sellingPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Purchase Orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            {supplierPOs.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="No purchase orders" description="No orders placed with this supplier." />
            ) : (
              <Table>
                <TableHeader><TableRow className="bg-muted/30"><TableHead>PO Number</TableHead><TableHead>Total</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {supplierPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-mono-code text-xs">{po.poNumber}</TableCell>
                      <TableCell className="font-mono-code text-sm">{formatINR(po.totalCost)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(po.createdDate)}</TableCell>
                      <TableCell><POStatusBadge status={po.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
