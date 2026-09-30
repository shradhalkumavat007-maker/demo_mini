'use client';

import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { useInventoryStore } from '@/store/inventory-store';
import { formatINR, formatDate, downloadCSV } from '@/lib/calculations';
import type { Transaction } from '@/types/transaction';
import { Badge } from '@/components/ui/badge';

export default function StockHistoryPage() {
  const transactions = useInventoryStore((s) => s.transactions);
  const users = useInventoryStore((s) => s.users);
  const products = useInventoryStore((s) => s.products);

  const handleExport = () => {
    const headers = ['Transaction ID', 'Product', 'Type', 'Quantity', 'Unit Price', 'Total Value', 'Profit/Loss', 'Date', 'User', 'Reference', 'Customer'];
    const rows = transactions.map((t) => [
      t.id, t.productName, t.type === 'stock_in' ? 'Stock In' : 'Stock Out',
      t.quantity, t.unitPrice, t.totalValue, t.profitLoss,
      formatDate(t.date), t.userName, t.reference, t.customerRef,
    ]);
    downloadCSV('stock-history.csv', headers, rows);
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'id', header: 'Transaction ID', sortable: true, sortValue: (t) => t.id,
      render: (t) => <span className="text-xs font-mono-code">{t.id}</span>,
    },
    {
      key: 'productName', header: 'Product', sortable: true, sortValue: (t) => t.productName,
      render: (t) => <span className="text-sm font-medium">{t.productName}</span>,
    },
    {
      key: 'type', header: 'Type', sortable: true, sortValue: (t) => t.type,
      render: (t) => (
        <Badge variant="outline" className={`gap-1 ${t.type === 'stock_in' ? 'bg-success/10 text-success border-success/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
          {t.type === 'stock_in' ? <ArrowDownToLine className="h-3 w-3" /> : <ArrowUpFromLine className="h-3 w-3" />}
          {t.type === 'stock_in' ? 'Stock In' : 'Stock Out'}
        </Badge>
      ),
    },
    {
      key: 'quantity', header: 'Qty', sortable: true, sortValue: (t) => t.quantity,
      render: (t) => <span className="text-sm font-semibold">{t.quantity}</span>,
    },
    {
      key: 'date', header: 'Date', sortable: true, sortValue: (t) => t.date,
      render: (t) => <span className="text-sm text-muted-foreground">{formatDate(t.date)}</span>,
    },
    {
      key: 'userName', header: 'User', sortable: true, sortValue: (t) => t.userName,
      render: (t) => <span className="text-sm">{t.userName}</span>,
    },
    {
      key: 'reference', header: 'Reference', render: (t) => (
        <span className="text-sm text-muted-foreground">{t.reference || t.customerRef || '—'}</span>
      ),
    },
    {
      key: 'totalValue', header: 'Value', sortable: true, sortValue: (t) => t.totalValue,
      render: (t) => <span className="text-sm font-mono-code">{formatINR(t.totalValue)}</span>,
    },
    {
      key: 'profitLoss', header: 'P/L', sortable: true, sortValue: (t) => t.profitLoss,
      render: (t) => t.type === 'stock_out' ? (
        <span className={`text-sm font-mono-code font-semibold ${t.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
          {formatINR(t.profitLoss)}
        </span>
      ) : <span className="text-sm text-muted-foreground">—</span>,
    },
  ];

  const productOptions = [...new Set(transactions.map((t) => t.productId))].map((pid) => {
    const p = products.find((prod) => prod.id === pid);
    return { label: p?.name ?? pid, value: pid };
  });

  const userOptions = [...new Set(transactions.map((t) => t.userId))].map((uid) => {
    const u = users.find((usr) => usr.id === uid);
    return { label: u?.name ?? uid, value: uid };
  });

  return (
    <div>
      <PageHeader title="Stock History" description="Complete transaction log of all stock movements." />
      <DataTable
        data={transactions}
        columns={columns}
        searchPlaceholder="Search transactions..."
        searchKeys={[(t) => t.id, (t) => t.productName, (t) => t.reference, (t) => t.customerRef]}
        filters={[
          { label: 'Type', key: 'type', options: [{ label: 'Stock In', value: 'stock_in' }, { label: 'Stock Out', value: 'stock_out' }], filterFn: (t: Transaction, v: string) => t.type === v },
          { label: 'Product', key: 'product', options: productOptions, filterFn: (t: Transaction, v: string) => t.productId === v },
          { label: 'User', key: 'user', options: userOptions, filterFn: (t: Transaction, v: string) => t.userId === v },
        ]}
        getRowId={(t) => t.id}
        onExport={handleExport}
        emptyTitle="No transactions yet"
        emptyDescription="Stock movements will appear here once you start using Stock In and Stock Out."
      />
    </div>
  );
}
