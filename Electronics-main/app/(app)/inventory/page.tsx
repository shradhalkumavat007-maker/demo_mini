'use client';

import Link from 'next/link';
import {
  QrCode,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Smartphone,
  ShieldCheck,
  Package,
  Layers,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/store/inventory-store';
import { formatINR } from '@/lib/calculations';

export default function InventoryHubPage() {
  const products = useInventoryStore((s) => s.products);
  const serials = useInventoryStore((s) => s.serials);
  const warranties = useInventoryStore((s) => s.warranties);
  const transactions = useInventoryStore((s) => s.transactions);

  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValuation = products.reduce((acc, p) => acc + p.stock * p.purchasePrice, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const modules = [
    {
      title: 'Scan Product & POS',
      description: 'Optical camera & hardware barcode scanner with direct checkout.',
      href: '/scan-product',
      icon: QrCode,
      color: 'bg-primary/10 text-primary border-primary/20',
      actionLabel: 'Launch Scanner',
    },
    {
      title: 'Stock Inward (Stock In)',
      description: 'Record incoming supplier shipments and batch shipments.',
      href: '/inventory/stock-in',
      icon: ArrowDownToLine,
      color: 'bg-success/10 text-success border-success/20',
      actionLabel: 'Receive Stock',
    },
    {
      title: 'Stock Outward (Stock Out)',
      description: 'Process customer product dispatches, invoices, and sales.',
      href: '/inventory/stock-out',
      icon: ArrowUpFromLine,
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      actionLabel: 'Dispatch Stock',
    },
    {
      title: 'Stock History',
      description: 'Complete movement ledger with audit timestamps and unit costs.',
      href: '/inventory/history',
      icon: History,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      actionLabel: 'View Movement Ledger',
    },
    {
      title: 'Serial & IMEI Tracking',
      description: 'Granular hardware identification, IMEI registry, and tracking.',
      href: '/serial-imei',
      icon: Smartphone,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      actionLabel: 'Manage Serials',
    },
    {
      title: 'Warranty Management',
      description: 'Customer warranty policies, RMA claims, and certificates.',
      href: '/warranty',
      icon: ShieldCheck,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      actionLabel: 'Manage Warranties',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Operations Hub"
        description="Unified management workspace for inward/outward stock operations, barcodes, hardware serials, and customer warranties."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Available Units
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalStockUnits.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Inventory Valuation
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground font-mono-code">
                {formatINR(totalStockValuation)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Low Stock Warnings
              </p>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tracked Hardware Serials
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{serials.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <Smartphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className="border border-border hover:border-primary/40 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-2 border ${m.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold">{m.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{m.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild variant="outline" className="w-full text-xs font-medium">
                  <Link href={m.href}>{m.actionLabel} →</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
