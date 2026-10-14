'use client';

import { useState, useMemo } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Truck,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/store/inventory-store';
import {
  formatINR,
  formatDate,
  downloadCSV,
  getStockStatus,
  daysUntil,
} from '@/lib/calculations';

export default function ReportsPage() {
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const suppliers = useInventoryStore((s) => s.suppliers);
  const transactions = useInventoryStore((s) => s.transactions);
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);
  const warranties = useInventoryStore((s) => s.warranties);

  const [activeTab, setActiveTab] = useState('inventory');

  // 1. Inventory Report Data
  const inventoryReport = useMemo(() => {
    return products.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const sup = suppliers.find((s) => s.id === p.supplierId);
      const totalCostVal = p.stock * p.purchasePrice;
      const totalSalesVal = p.stock * p.sellingPrice;
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: cat?.name ?? 'General',
        brand: p.brand,
        stock: p.stock,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        totalCostVal,
        totalSalesVal,
        supplier: sup?.company ?? 'N/A',
        status: getStockStatus(p.stock, p.minStock),
      };
    });
  }, [products, categories, suppliers]);

  // 2. Stock In Report Data
  const stockInReport = useMemo(() => {
    return transactions.filter((t) => t.type === 'stock_in');
  }, [transactions]);

  // 3. Stock Out Report Data
  const stockOutReport = useMemo(() => {
    return transactions.filter((t) => t.type === 'stock_out');
  }, [transactions]);

  // 4. Supplier Performance Report Data
  const supplierReport = useMemo(() => {
    return suppliers.map((sup) => {
      const pos = purchaseOrders.filter((po) => po.supplierId === sup.id);
      const totalSpend = pos.reduce((s, p) => s + p.totalCost, 0);
      const receivedPOs = pos.filter((p) => p.status === 'received').length;
      const pendingPOs = pos.filter((p) => p.status === 'ordered' || p.status === 'pending').length;
      return {
        id: sup.id,
        company: sup.company,
        contact: sup.name,
        phone: sup.phone,
        totalOrders: pos.length,
        receivedOrders: receivedPOs,
        pendingOrders: pendingPOs,
        totalSpend,
      };
    });
  }, [suppliers, purchaseOrders]);

  // 5. Warranty Report Data
  const warrantyReport = useMemo(() => {
    return warranties.map((w) => ({
      ...w,
      daysLeft: daysUntil(w.endDate),
    }));
  }, [warranties]);

  // Export handlers
  const handleExportCurrent = () => {
    if (activeTab === 'inventory') {
      const headers = ['SKU', 'Product Name', 'Category', 'Brand', 'Stock', 'Unit Cost', 'Unit Selling', 'Total Valuation', 'Status'];
      const rows = inventoryReport.map((r) => [
        r.sku, r.name, r.category, r.brand, r.stock, r.purchasePrice, r.sellingPrice, r.totalCostVal, r.status,
      ]);
      downloadCSV('inventory_valuation_report.csv', headers, rows);
    } else if (activeTab === 'stock_in') {
      const headers = ['Txn ID', 'Date', 'Product', 'Quantity', 'Unit Cost', 'Total Cost', 'User', 'Reference'];
      const rows = stockInReport.map((t) => [
        t.id, formatDate(t.date), t.productName, t.quantity, t.unitPrice, t.totalValue, t.userName, t.reference,
      ]);
      downloadCSV('stock_in_transactions_report.csv', headers, rows);
    } else if (activeTab === 'stock_out') {
      const headers = ['Txn ID', 'Date', 'Product', 'Quantity', 'Selling Value', 'COGS', 'Profit/Loss', 'Customer'];
      const rows = stockOutReport.map((t) => [
        t.id, formatDate(t.date), t.productName, t.quantity, t.totalValue, t.purchaseCost, t.profitLoss, t.customerRef,
      ]);
      downloadCSV('sales_outflow_report.csv', headers, rows);
    } else if (activeTab === 'suppliers') {
      const headers = ['Supplier Company', 'Contact Person', 'Phone', 'Total Orders', 'Received Orders', 'Total Spend'];
      const rows = supplierReport.map((s) => [
        s.company, s.contact, s.phone, s.totalOrders, s.receivedOrders, s.totalSpend,
      ]);
      downloadCSV('supplier_procurement_report.csv', headers, rows);
    } else if (activeTab === 'warranties') {
      const headers = ['Serial Number', 'Product', 'Customer', 'Start Date', 'End Date', 'Days Left', 'Status'];
      const rows = warrantyReport.map((w) => [
        w.serialNumber, w.productName, w.customerName || w.customerRef, formatDate(w.startDate), formatDate(w.endDate), w.daysLeft, w.status,
      ]);
      downloadCSV('warranty_status_report.csv', headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics Center"
        description="Comprehensive audit-ready reports, inventory asset valuation, and procurement logs."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Printer className="h-4 w-4" /> Print Report
            </Button>
            <Button size="sm" onClick={handleExportCurrent} className="gap-1.5">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-lg grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="inventory" className="gap-1 text-xs">
            <Package className="h-3.5 w-3.5" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="stock_in" className="gap-1 text-xs">
            <ArrowDownToLine className="h-3.5 w-3.5" /> Stock In
          </TabsTrigger>
          <TabsTrigger value="stock_out" className="gap-1 text-xs">
            <ArrowUpFromLine className="h-3.5 w-3.5" /> Sales Outflow
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-1 text-xs">
            <Truck className="h-3.5 w-3.5" /> Suppliers
          </TabsTrigger>
          <TabsTrigger value="warranties" className="gap-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" /> Warranties
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Inventory Valuation Report */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-base font-semibold">Inventory Asset Valuation</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Total Valuation: <span className="font-bold text-foreground">{formatINR(inventoryReport.reduce((s, p) => s + p.totalCostVal, 0))}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <DataTable
                data={inventoryReport}
                columns={[
                  {
                    key: 'product',
                    header: 'Product Details',
                    sortable: true,
                    sortValue: (r) => r.name,
                    render: (r) => (
                      <div>
                        <div className="font-medium text-sm text-foreground">{r.name}</div>
                        <div className="text-xs text-muted-foreground font-mono-code">{r.sku} • {r.brand}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'category',
                    header: 'Category',
                    sortable: true,
                    sortValue: (r) => r.category,
                    render: (r) => <span className="text-xs">{r.category}</span>,
                  },
                  {
                    key: 'stock',
                    header: 'In Stock',
                    sortable: true,
                    sortValue: (r) => r.stock,
                    render: (r) => <span className="font-semibold text-sm">{r.stock} units</span>,
                  },
                  {
                    key: 'purchasePrice',
                    header: 'Unit Cost',
                    render: (r) => <span className="text-xs font-mono-code">{formatINR(r.purchasePrice)}</span>,
                  },
                  {
                    key: 'sellingPrice',
                    header: 'Selling Price',
                    render: (r) => <span className="text-xs font-mono-code">{formatINR(r.sellingPrice)}</span>,
                  },
                  {
                    key: 'totalCostVal',
                    header: 'Total Valuation',
                    sortable: true,
                    sortValue: (r) => r.totalCostVal,
                    render: (r) => <span className="font-bold text-sm text-primary">{formatINR(r.totalCostVal)}</span>,
                  },
                ]}
                searchPlaceholder="Search product or SKU..."
                searchKeys={['name', 'sku', 'brand', 'category']}
                onExport={handleExportCurrent}
                getRowId={(r) => r.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Stock In Report */}
        <TabsContent value="stock_in" className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-base font-semibold">Incoming Stock Batches & Procurement</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Total Incoming Spend: <span className="font-bold text-foreground">{formatINR(stockInReport.reduce((s, t) => s + t.totalValue, 0))}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <DataTable
                data={stockInReport}
                columns={[
                  {
                    key: 'id',
                    header: 'Reference',
                    render: (t) => (
                      <span className="font-mono-code text-xs bg-muted/60 px-2 py-0.5 rounded border border-border">
                        {t.id}
                      </span>
                    ),
                  },
                  {
                    key: 'productName',
                    header: 'Product',
                    sortable: true,
                    sortValue: (t) => t.productName,
                    render: (t) => <span className="font-medium text-sm text-foreground">{t.productName}</span>,
                  },
                  {
                    key: 'quantity',
                    header: 'Qty Received',
                    sortable: true,
                    sortValue: (t) => t.quantity,
                    render: (t) => <span className="font-semibold text-sm text-success font-mono-code">+{t.quantity}</span>,
                  },
                  {
                    key: 'totalValue',
                    header: 'Batch Cost',
                    sortable: true,
                    sortValue: (t) => t.totalValue,
                    render: (t) => <span className="font-medium text-sm">{formatINR(t.totalValue)}</span>,
                  },
                  {
                    key: 'userName',
                    header: 'Received By',
                    render: (t) => <span className="text-xs text-muted-foreground">{t.userName}</span>,
                  },
                  {
                    key: 'date',
                    header: 'Date',
                    sortable: true,
                    sortValue: (t) => t.date,
                    render: (t) => <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>,
                  },
                ]}
                searchPlaceholder="Search product or ref..."
                searchKeys={['id', 'productName', 'reference', 'userName']}
                onExport={handleExportCurrent}
                getRowId={(r) => r.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Sales Outflow Report */}
        <TabsContent value="stock_out" className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-base font-semibold">Sales Dispatches & Revenue Outflow</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Total Sales: <span className="font-bold text-foreground">{formatINR(stockOutReport.reduce((s, t) => s + t.totalValue, 0))}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <DataTable
                data={stockOutReport}
                columns={[
                  {
                    key: 'id',
                    header: 'Txn ID',
                    render: (t) => (
                      <span className="font-mono-code text-xs bg-muted/60 px-2 py-0.5 rounded border border-border">
                        {t.id}
                      </span>
                    ),
                  },
                  {
                    key: 'productName',
                    header: 'Product',
                    sortable: true,
                    sortValue: (t) => t.productName,
                    render: (t) => <span className="font-medium text-sm text-foreground">{t.productName}</span>,
                  },
                  {
                    key: 'quantity',
                    header: 'Qty Dispatched',
                    sortable: true,
                    sortValue: (t) => t.quantity,
                    render: (t) => <span className="font-semibold text-sm text-primary font-mono-code">-{t.quantity}</span>,
                  },
                  {
                    key: 'totalValue',
                    header: 'Sales Revenue',
                    sortable: true,
                    sortValue: (t) => t.totalValue,
                    render: (t) => <span className="font-bold text-sm text-foreground">{formatINR(t.totalValue)}</span>,
                  },
                  {
                    key: 'profitLoss',
                    header: 'Gross Profit',
                    sortable: true,
                    sortValue: (t) => t.profitLoss,
                    render: (t) => (
                      <span className={`font-semibold text-sm ${t.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatINR(t.profitLoss)}
                      </span>
                    ),
                  },
                  {
                    key: 'customerRef',
                    header: 'Customer',
                    render: (t) => <span className="text-xs text-muted-foreground">{t.customerRef || 'Standard'}</span>,
                  },
                  {
                    key: 'date',
                    header: 'Date',
                    sortable: true,
                    sortValue: (t) => t.date,
                    render: (t) => <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>,
                  },
                ]}
                searchPlaceholder="Search customer, product or ID..."
                searchKeys={['id', 'productName', 'customerRef']}
                onExport={handleExportCurrent}
                getRowId={(r) => r.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Suppliers Report */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Supplier Procurement Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <DataTable
                data={supplierReport}
                columns={[
                  {
                    key: 'company',
                    header: 'Supplier Company',
                    sortable: true,
                    sortValue: (s) => s.company,
                    render: (s) => (
                      <div>
                        <div className="font-semibold text-sm text-foreground">{s.company}</div>
                        <div className="text-xs text-muted-foreground">{s.contact} • {s.phone}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'totalOrders',
                    header: 'Total Orders',
                    sortable: true,
                    sortValue: (s) => s.totalOrders,
                    render: (s) => <span className="text-sm font-medium">{s.totalOrders} POs</span>,
                  },
                  {
                    key: 'receivedOrders',
                    header: 'Fulfilled Orders',
                    sortable: true,
                    sortValue: (s) => s.receivedOrders,
                    render: (s) => <Badge variant="outline" className="bg-success/10 text-success border-success/20">{s.receivedOrders} Received</Badge>,
                  },
                  {
                    key: 'pendingOrders',
                    header: 'In Transit',
                    render: (s) => <span className="text-xs text-muted-foreground">{s.pendingOrders} Orders</span>,
                  },
                  {
                    key: 'totalSpend',
                    header: 'Total Spend',
                    sortable: true,
                    sortValue: (s) => s.totalSpend,
                    render: (s) => <span className="font-bold text-sm text-primary">{formatINR(s.totalSpend)}</span>,
                  },
                ]}
                searchPlaceholder="Search supplier company or contact..."
                searchKeys={['company', 'contact', 'phone']}
                onExport={handleExportCurrent}
                getRowId={(r) => r.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Warranties Report */}
        <TabsContent value="warranties" className="space-y-4">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Warranty Expiration & Compliance Audit</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <DataTable
                data={warrantyReport}
                columns={[
                  {
                    key: 'serialNumber',
                    header: 'Serial / Product',
                    sortable: true,
                    sortValue: (w) => w.serialNumber,
                    render: (w) => (
                      <div>
                        <div className="font-mono-code text-xs font-semibold">{w.serialNumber}</div>
                        <div className="text-xs text-muted-foreground">{w.productName}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'customer',
                    header: 'Customer',
                    render: (w) => <span className="text-xs font-medium">{w.customerName || w.customerRef}</span>,
                  },
                  {
                    key: 'startDate',
                    header: 'Issued Date',
                    render: (w) => <span className="text-xs text-muted-foreground">{formatDate(w.startDate)}</span>,
                  },
                  {
                    key: 'endDate',
                    header: 'Expiry Date',
                    sortable: true,
                    sortValue: (w) => w.endDate,
                    render: (w) => <span className="text-xs text-foreground font-medium">{formatDate(w.endDate)}</span>,
                  },
                  {
                    key: 'daysLeft',
                    header: 'Remaining Days',
                    sortable: true,
                    sortValue: (w) => w.daysLeft,
                    render: (w) => (
                      <span className={`text-xs font-semibold ${w.daysLeft < 0 ? 'text-destructive' : w.daysLeft <= 30 ? 'text-warning' : 'text-success'}`}>
                        {w.daysLeft < 0 ? `Expired (${Math.abs(w.daysLeft)}d ago)` : `${w.daysLeft} days`}
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (w) => (
                      <Badge variant="outline" className={`capitalize text-xs ${w.status === 'active' ? 'bg-success/10 text-success border-success/20' : w.status === 'expiring_soon' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                        {w.status.replace(/_/g, ' ')}
                      </Badge>
                    ),
                  },
                ]}
                searchPlaceholder="Search customer or serial..."
                searchKeys={['serialNumber', 'productName', 'customerRef']}
                onExport={handleExportCurrent}
                getRowId={(r) => r.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
