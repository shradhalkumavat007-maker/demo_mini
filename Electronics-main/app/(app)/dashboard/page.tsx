'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Package, Boxes, IndianRupee, ShoppingCart, TrendingUp, TrendingDown,
  AlertTriangle, XCircle, ArrowDownToLine, ArrowUpFromLine, ClipboardList,
  RefreshCw, Bell, ShieldCheck, Eye, QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { StockStatusBadge } from '@/components/common/stock-status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import { canViewFinancials } from '@/lib/permissions';
import {
  formatINR, formatNumber, getStockStatus, calculateStockValue,
  calculateTotalSalesValue, calculateTotalPurchaseCost, calculateGrossProfit,
  calculateLoss, calculateProfitMargin, calculateTotalStockInValue,
  formatDate, calculateProfitPerUnit,
} from '@/lib/calculations';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function DashboardPage() {
  const products = useInventoryStore((s) => s.products);
  const transactions = useInventoryStore((s) => s.transactions);
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);
  const warranties = useInventoryStore((s) => s.warranties);
  const user = useAuthStore((s) => s.user);

  const isStaff = user?.role === 'staff';
  const canSeeFinancials = canViewFinancials(user?.role ?? 'staff');

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const stockValue = calculateStockValue(products);
    const stockInValue = calculateTotalStockInValue(transactions);
    const salesValue = calculateTotalSalesValue(transactions);
    const purchaseCost = calculateTotalPurchaseCost(transactions);
    const grossProfit = calculateGrossProfit(transactions);
    const totalLoss = calculateLoss(transactions);
    const netProfit = grossProfit - totalLoss;
    const profitMargin = calculateProfitMargin(salesValue, netProfit);
    const lowStock = products.filter((p) => getStockStatus(p.stock, p.minStock) === 'low_stock').length;
    const outOfStock = products.filter((p) => getStockStatus(p.stock, p.minStock) === 'out_of_stock').length;
    const pendingPOs = purchaseOrders.filter((p) => p.status === 'pending' || p.status === 'approved' || p.status === 'ordered').length;
    const expiringWarranties = warranties.filter((w) => w.status === 'expiring_soon').length;
    const expiredWarranties = warranties.filter((w) => w.status === 'expired').length;

    return {
      totalProducts, totalStock, stockValue, stockInValue, salesValue,
      purchaseCost, grossProfit, totalLoss, netProfit, profitMargin,
      lowStock, outOfStock, pendingPOs, expiringWarranties, expiredWarranties,
    };
  }, [products, transactions, purchaseOrders, warranties]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; sales: number; purchases: number; profit: number; loss: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!months[key]) months[key] = { month: key, sales: 0, purchases: 0, profit: 0, loss: 0 };
      if (t.type === 'stock_in') months[key].purchases += t.totalValue;
      else {
        months[key].sales += t.totalValue;
        if (t.profitLoss > 0) months[key].profit += t.profitLoss;
        else months[key].loss += Math.abs(t.profitLoss);
      }
    });
    return Object.values(months).slice(-6);
  }, [transactions]);

  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; qty: number }> = {};
    transactions.filter((t) => t.type === 'stock_out').forEach((t) => {
      if (!counts[t.productId]) counts[t.productId] = { name: t.productName, qty: 0 };
      counts[t.productId].qty += t.quantity;
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const cats = useInventoryStore.getState().categories;
    return cats.map((c, i) => ({
      name: c.name,
      value: products.filter((p) => p.categoryId === c.id).reduce((s, p) => s + p.stock * p.purchasePrice, 0),
      color: CHART_COLORS[i % CHART_COLORS.length],
    })).filter((d) => d.value > 0);
  }, [products]);

  const recentTransactions = transactions.slice(0, 5);
  const lowStockProducts = products.filter((p) => getStockStatus(p.stock, p.minStock) !== 'in_stock').slice(0, 5);
  const pendingOrders = purchaseOrders.filter((p) => p.status !== 'received' && p.status !== 'cancelled').slice(0, 5);
  const expiringWarrantyList = warranties.filter((w) => w.status !== 'active').slice(0, 5);

  const quickActions = [
    { label: 'Scan Product', href: '/scan-product', icon: QrCode, perm: 'scan_product' },
    { label: 'Add Product', href: '/products?action=add', icon: Package, perm: 'products' },
    { label: 'Stock In', href: '/inventory/stock-in', icon: ArrowDownToLine, perm: 'stock_in' },
    { label: 'Stock Out', href: '/inventory/stock-out', icon: ArrowUpFromLine, perm: 'stock_out' },
    { label: 'Create PO', href: '/purchase-center?tab=create', icon: ClipboardList, perm: 'purchase_center' },
    { label: 'Reorder', href: '/reorder', icon: RefreshCw, perm: 'reorder' },
  ];

  const staffQuickActions = [
    { label: 'Scan Product', href: '/scan-product', icon: QrCode },
    { label: 'Stock In', href: '/inventory/stock-in', icon: ArrowDownToLine },
    { label: 'Stock Out', href: '/inventory/stock-out', icon: ArrowUpFromLine },
    { label: 'View Products', href: '/products', icon: Package },
    { label: 'View Alerts', href: '/alerts', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] ?? ''}`}
        description={isStaff ? 'Here is your inventory overview for today.' : 'Here is your business overview and key metrics.'}
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {(isStaff ? staffQuickActions : quickActions).map((action) => {
          const Icon = action.icon;
          return (
            <Button key={action.label} variant="outline" size="sm" asChild className="gap-2">
              <Link href={action.href}>
                <Icon className="h-4 w-4" /> {action.label}
              </Link>
            </Button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Products" value={formatNumber(stats.totalProducts)} icon={Package} variant="primary" />
        <KpiCard label="Total Stock" value={formatNumber(stats.totalStock)} icon={Boxes} variant="info" subtitle="units in inventory" />

        {canSeeFinancials ? (
          <>
            <KpiCard label="Stock Value" value={formatINR(stats.stockValue)} icon={IndianRupee} variant="success" />
            <KpiCard label="Purchase Value" value={formatINR(stats.stockInValue)} icon={ShoppingCart} variant="info" />
            <KpiCard label="Sales Value" value={formatINR(stats.salesValue)} icon={TrendingUp} variant="primary" />
            <KpiCard label="Gross Profit" value={formatINR(stats.grossProfit)} icon={TrendingUp} variant="success" />
            <KpiCard label="Total Loss" value={formatINR(stats.totalLoss)} icon={TrendingDown} variant="danger" />
            <KpiCard label="Profit Margin" value={`${stats.profitMargin.toFixed(1)}%`} icon={TrendingUp} variant={stats.profitMargin >= 0 ? 'success' : 'danger'} />
          </>
        ) : (
          <KpiCard label="Available Products" value={formatNumber(products.filter((p) => p.stock > 0).length)} icon={Package} variant="success" />
        )}

        <KpiCard label="Low Stock" value={stats.lowStock} icon={AlertTriangle} variant="warning" />
        <KpiCard label="Out of Stock" value={stats.outOfStock} icon={XCircle} variant="danger" />
      </div>

      {/* Charts */}
      {canSeeFinancials && monthlyData.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue & Purchase Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="sales" name="Sales" stroke="hsl(var(--chart-1))" fill="url(#colorSales)" strokeWidth={2} />
                  <Area type="monotone" dataKey="purchases" name="Purchases" stroke="hsl(var(--chart-5))" fill="url(#colorPurchases)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Profit vs Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="profit" name="Profit" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="loss" name="Loss" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Moving Products */}
        <Card className="border-border lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Moving Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No sales data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={110}
                    tickFormatter={(name: string) => (name.length > 16 ? `${name.slice(0, 14)}…` : name)}
                  />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="qty" name="Units Sold" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        {canSeeFinancials && categoryData.length > 0 && (
          <Card className="border-border lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stock Value by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.name}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="border-border lg:col-span-1">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/inventory/history">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    {t.type === 'stock_in' ? (
                      <ArrowDownToLine className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <ArrowUpFromLine className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{t.productName}</div>
                      <div className="text-xs text-muted-foreground">{t.quantity} units · {formatDate(t.date)}</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{formatINR(t.totalValue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock & Pending POs & Warranty */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Low / Out of Stock</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/products">View All</Link></Button>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">All products are well stocked</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Stock: {p.stock} · Min: {p.minStock}</div>
                    </div>
                    <StockStatusBadge status={getStockStatus(p.stock, p.minStock)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {!isStaff && (
          <Card className="border-border">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base">Pending Purchase Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link href="/purchase-orders">View All</Link></Button>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No pending orders</p>
              ) : (
                <div className="space-y-2">
                  {pendingOrders.map((po) => (
                    <Link key={po.id} href="/purchase-orders" className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5 hover:bg-muted/30 transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium font-mono-code truncate">{po.poNumber}</div>
                        <div className="text-xs text-muted-foreground truncate">{po.supplierName}</div>
                      </div>
                      <span className="text-sm font-semibold shrink-0">{formatINR(po.totalCost)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-border">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Warranty Alerts</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/warranty">View All</Link></Button>
          </CardHeader>
          <CardContent>
            {expiringWarrantyList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No warranty alerts</p>
            ) : (
              <div className="space-y-2">
                {expiringWarrantyList.map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{w.productName}</div>
                      <div className="text-xs text-muted-foreground font-mono-code">{w.serialNumber}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs shrink-0">
                      {w.status === 'expired' ? (
                        <span className="text-destructive font-medium">Expired</span>
                      ) : (
                        <span className="text-warning font-medium">Expiring</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
