'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Percent,
  Receipt,
  Download,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryStore } from '@/store/inventory-store';
import {
  formatINR,
  formatDate,
  downloadCSV,
  calculateTotalSalesValue,
  calculateTotalPurchaseCost,
  calculateGrossProfit,
  calculateLoss,
  calculateProfitMargin,
} from '@/lib/calculations';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Transaction } from '@/types/transaction';

export default function ProfitLossPage() {
  const transactions = useInventoryStore((s) => s.transactions);
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);

  const [dateFilter, setDateFilter] = useState<'7' | '30' | '365' | 'all'>('all');

  const filteredSales = useMemo(() => {
    const sales = transactions.filter((t) => t.type === 'stock_out');
    if (dateFilter === 'all') return sales;

    const days = parseInt(dateFilter);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return sales.filter((t) => new Date(t.date) >= cutoff);
  }, [transactions, dateFilter]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((s, t) => s + t.totalValue, 0);
    const totalCOGS = filteredSales.reduce((s, t) => s + t.purchaseCost, 0);
    const grossProfit = filteredSales.reduce((s, t) => s + Math.max(0, t.profitLoss), 0);
    const totalLoss = filteredSales.reduce((s, t) => s + (t.profitLoss < 0 ? Math.abs(t.profitLoss) : 0), 0);
    const netProfit = totalRevenue - totalCOGS;
    const profitMargin = calculateProfitMargin(totalRevenue, netProfit);

    return { totalRevenue, totalCOGS, grossProfit, totalLoss, netProfit, profitMargin };
  }, [filteredSales]);

  // Monthly or trend chart
  const trendData = useMemo(() => {
    const months: Record<string, { date: string; revenue: number; cost: number; profit: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    filteredSales.forEach((t) => {
      const d = new Date(t.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!months[key]) months[key] = { date: key, revenue: 0, cost: 0, profit: 0 };
      months[key].revenue += t.totalValue;
      months[key].cost += t.purchaseCost;
      months[key].profit += t.profitLoss;
    });

    return Object.values(months);
  }, [filteredSales]);

  // Category breakdown
  const categoryProfitData = useMemo(() => {
    const map: Record<string, { category: string; profit: number; revenue: number }> = {};

    filteredSales.forEach((t) => {
      const prod = products.find((p) => p.id === t.productId);
      const cat = categories.find((c) => c.id === prod?.categoryId);
      const catName = cat?.name || 'Electronics';

      if (!map[catName]) map[catName] = { category: catName, profit: 0, revenue: 0 };
      map[catName].profit += t.profitLoss;
      map[catName].revenue += t.totalValue;
    });

    return Object.values(map);
  }, [filteredSales, products, categories]);

  const handleExport = () => {
    const headers = ['Transaction ID', 'Date', 'Product', 'Quantity', 'Sales Revenue', 'Purchase Cost', 'Profit/Loss', 'Margin %', 'Customer'];
    const rows = filteredSales.map((t) => {
      const margin = t.totalValue > 0 ? ((t.profitLoss / t.totalValue) * 100).toFixed(1) : '0';
      return [
        t.id,
        formatDate(t.date),
        t.productName,
        t.quantity,
        t.totalValue,
        t.purchaseCost,
        t.profitLoss,
        `${margin}%`,
        t.customerRef || 'Standard',
      ];
    });
    downloadCSV('profit_and_loss_report.csv', headers, rows);
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Transaction',
      sortable: true,
      sortValue: (t) => t.id,
      render: (t) => (
        <span className="font-mono-code text-xs font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
          {t.id}
        </span>
      ),
    },
    {
      key: 'productName',
      header: 'Product & Qty',
      sortable: true,
      sortValue: (t) => t.productName,
      render: (t) => (
        <div className="space-y-0.5">
          <div className="font-medium text-sm text-foreground">{t.productName}</div>
          <div className="text-xs text-muted-foreground">{t.quantity} unit(s) sold</div>
        </div>
      ),
    },
    {
      key: 'totalValue',
      header: 'Revenue',
      sortable: true,
      sortValue: (t) => t.totalValue,
      render: (t) => <span className="font-medium text-sm text-foreground">{formatINR(t.totalValue)}</span>,
    },
    {
      key: 'purchaseCost',
      header: 'COGS',
      sortable: true,
      sortValue: (t) => t.purchaseCost,
      render: (t) => <span className="text-sm text-muted-foreground">{formatINR(t.purchaseCost)}</span>,
    },
    {
      key: 'profitLoss',
      header: 'Net Profit',
      sortable: true,
      sortValue: (t) => t.profitLoss,
      render: (t) => {
        const isProfit = t.profitLoss >= 0;
        return (
          <div className="flex items-center gap-1 font-semibold text-sm">
            {isProfit ? (
              <span className="text-success flex items-center gap-0.5">
                <TrendingUp className="h-3.5 w-3.5" /> +{formatINR(t.profitLoss)}
              </span>
            ) : (
              <span className="text-destructive flex items-center gap-0.5">
                <TrendingDown className="h-3.5 w-3.5" /> -{formatINR(Math.abs(t.profitLoss))}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'margin',
      header: 'Margin %',
      render: (t) => {
        const margin = t.totalValue > 0 ? (t.profitLoss / t.totalValue) * 100 : 0;
        return (
          <Badge
            variant="outline"
            className={margin >= 20 ? 'bg-success/10 text-success border-success/20' : margin >= 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}
          >
            {margin.toFixed(1)}%
          </Badge>
        );
      },
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      sortValue: (t) => t.date,
      render: (t) => <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss Statement"
        description="Comprehensive financial performance metrics, Cost of Goods Sold (COGS), and sales profitability."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-lg overflow-hidden bg-card text-xs">
              <button
                className={`px-3 py-1.5 transition-colors ${dateFilter === '7' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}
                onClick={() => setDateFilter('7')}
              >
                7 Days
              </button>
              <button
                className={`px-3 py-1.5 transition-colors ${dateFilter === '30' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}
                onClick={() => setDateFilter('30')}
              >
                30 Days
              </button>
              <button
                className={`px-3 py-1.5 transition-colors ${dateFilter === '365' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}
                onClick={() => setDateFilter('365')}
              >
                1 Year
              </button>
              <button
                className={`px-3 py-1.5 transition-colors ${dateFilter === 'all' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}
                onClick={() => setDateFilter('all')}
              >
                All Time
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export P&L
            </Button>
          </div>
        }
      />

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{formatINR(stats.totalRevenue)}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost of Goods (COGS)</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{formatINR(stats.totalCOGS)}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Realized Profit</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatINR(stats.netProfit)}
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Profit Margin</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">{stats.profitMargin.toFixed(1)}%</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Percent className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Revenue vs COGS vs Net Profit Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => formatINR(Number(value))} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#revenueGrad)" />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#22c55e" fillOpacity={1} fill="url(#profitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" /> Profit Contribution by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryProfitData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => formatINR(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Transactions Financial Ledger */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Sales Transactions Financial Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            data={filteredSales}
            columns={columns}
            searchPlaceholder="Search product, customer, or transaction ID..."
            searchKeys={['id', 'productName', 'customerRef']}
            onExport={handleExport}
            getRowId={(r) => r.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
