'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  PackageCheck,
  Printer,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { POStatusBadge } from '@/components/common/po-status-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatINR, formatDate, downloadCSV } from '@/lib/calculations';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchase';

export default function PurchaseOrdersPage() {
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);
  const updatePOStatus = useInventoryStore((s) => s.updatePOStatus);
  const receivePurchaseOrder = useInventoryStore((s) => s.receivePurchaseOrder);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<PurchaseOrderStatus>('pending');

  const handleReceive = (po: PurchaseOrder) => {
    // If not yet ordered, first mark ordered or directly receive
    if (po.status !== 'ordered' && po.status !== 'partially_received') {
      updatePOStatus(po.id, 'ordered');
    }

    const res = receivePurchaseOrder(po.id, user?.name ?? 'Admin', user?.id ?? 'usr-admin');
    if (!res.success) {
      toast({ title: 'Error receiving order', description: res.error, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Goods Received Successfully',
      description: `All items from ${po.poNumber} have been added to inventory stock!`,
    });
    setDetailsOpen(false);
  };

  const handleStatusChange = () => {
    if (!selectedPO) return;
    const res = updatePOStatus(selectedPO.id, newStatus);
    if (!res.success) {
      toast({ title: 'Status change error', description: res.error, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Status Updated',
      description: `${selectedPO.poNumber} status set to ${newStatus}.`,
    });
    setStatusDialogOpen(false);
  };

  const handleExport = () => {
    const headers = ['PO Number', 'Supplier', 'Items Count', 'Total Cost', 'Status', 'Order Date', 'Expected Date', 'Received Date'];
    const rows = purchaseOrders.map((p) => [
      p.poNumber,
      p.supplierName,
      p.items.length,
      p.totalCost,
      p.status,
      formatDate(p.createdDate),
      formatDate(p.expectedDate),
      p.receivedDate ? formatDate(p.receivedDate) : 'Pending',
    ]);
    downloadCSV('purchase_orders.csv', headers, rows);
  };

  const totalSpend = purchaseOrders.reduce((sum, p) => sum + p.totalCost, 0);
  const pendingCount = purchaseOrders.filter((p) => p.status === 'pending' || p.status === 'ordered').length;
  const receivedCount = purchaseOrders.filter((p) => p.status === 'received').length;

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'PO Number',
      sortable: true,
      sortValue: (p) => p.poNumber,
      render: (p) => (
        <span className="font-mono-code font-bold text-sm text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
          {p.poNumber}
        </span>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortable: true,
      sortValue: (p) => p.supplierName,
      render: (p) => <span className="font-medium text-sm text-foreground">{p.supplierName}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      render: (p) => (
        <span className="text-xs text-muted-foreground">
          {p.items.length} item{p.items.length > 1 ? 's' : ''} ({p.items.reduce((s, i) => s + i.quantity, 0)} units)
        </span>
      ),
    },
    {
      key: 'totalCost',
      header: 'Total Value',
      sortable: true,
      sortValue: (p) => p.totalCost,
      render: (p) => <span className="font-semibold text-sm text-foreground">{formatINR(p.totalCost)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (p) => p.status,
      render: (p) => <POStatusBadge status={p.status} />,
    },
    {
      key: 'dates',
      header: 'Order / Expected',
      render: (p) => (
        <div className="text-xs space-y-0.5">
          <div className="text-muted-foreground">{formatDate(p.createdDate)}</div>
          <div className="font-medium text-foreground">Exp: {formatDate(p.expectedDate)}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 gap-1"
            onClick={() => {
              setSelectedPO(p);
              setDetailsOpen(true);
            }}
          >
            <Eye className="h-3 w-3" /> View
          </Button>

          {p.status !== 'received' && p.status !== 'cancelled' && (
            <Button
              variant="default"
              size="sm"
              className="text-xs h-7 gap-1 bg-success hover:bg-success/90 text-white"
              onClick={() => handleReceive(p)}
            >
              <PackageCheck className="h-3 w-3" /> Receive
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Monitor vendor procurement lifecycles, accept inventory shipments, and view order receipts."
        actions={
          <Button asChild className="gap-2">
            <Link href="/purchase-center">
              <Plus className="h-4 w-4" /> New Purchase Order
            </Link>
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{purchaseOrders.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Progress / Pending</p>
              <h3 className="text-2xl font-bold mt-1 text-warning">{pendingCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Received & Stocked</p>
              <h3 className="text-2xl font-bold mt-1 text-success">{receivedCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <PackageCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Procurement Spend</p>
              <h3 className="text-xl font-bold mt-1 text-foreground">{formatINR(totalSpend)}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <DataTable
            data={purchaseOrders}
            columns={columns}
            searchPlaceholder="Search PO Number, Supplier..."
            searchKeys={['poNumber', 'supplierName', (p) => p.items.map((i) => i.productName).join(' ')]}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Draft', value: 'draft' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Ordered', value: 'ordered' },
                  { label: 'Received', value: 'received' },
                  { label: 'Cancelled', value: 'cancelled' },
                ],
                filterFn: (row, val) => row.status === val,
              },
            ]}
            onExport={handleExport}
            getRowId={(r) => r.id}
          />
        </CardContent>
      </Card>

      {/* Details & Invoice Drawer / Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          {selectedPO && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Purchase Order: {selectedPO.poNumber}
                  </DialogTitle>
                  <POStatusBadge status={selectedPO.status} />
                </div>
                <DialogDescription>
                  Ordered from <span className="font-semibold text-foreground">{selectedPO.supplierName}</span> on{' '}
                  {formatDate(selectedPO.createdDate)}
                </DialogDescription>
              </DialogHeader>

              {/* Summary details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block">Supplier:</span>
                  <span className="font-semibold text-foreground">{selectedPO.supplierName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Created By:</span>
                  <span className="font-semibold text-foreground">{selectedPO.userName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Expected Date:</span>
                  <span className="font-semibold text-foreground">{formatDate(selectedPO.expectedDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Received Date:</span>
                  <span className="font-semibold text-foreground">
                    {selectedPO.receivedDate ? formatDate(selectedPO.receivedDate) : 'Not Received'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Line Items</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
                      <tr>
                        <th className="p-2.5">Product</th>
                        <th className="p-2.5 text-right">Quantity</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedPO.items.map((item, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="p-2.5 font-medium text-foreground">{item.productName}</td>
                          <td className="p-2.5 text-right font-mono-code">{item.quantity}</td>
                          <td className="p-2.5 text-right font-mono-code">{formatINR(item.unitPrice)}</td>
                          <td className="p-2.5 text-right font-mono-code font-semibold">{formatINR(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/40 font-bold border-t border-border">
                      <tr>
                        <td colSpan={3} className="p-2.5 text-right">Grand Total:</td>
                        <td className="p-2.5 text-right text-primary font-mono-code text-sm">
                          {formatINR(selectedPO.totalCost)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedPO.notes && (
                <div className="text-xs p-3 bg-muted/40 rounded-lg text-muted-foreground">
                  <span className="font-medium text-foreground block mb-0.5">Notes:</span>
                  {selectedPO.notes}
                </div>
              )}

              <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                    <Printer className="h-3.5 w-3.5" /> Print Invoice
                  </Button>
                  {selectedPO.status !== 'received' && selectedPO.status !== 'cancelled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setNewStatus(selectedPO.status);
                        setStatusDialogOpen(true);
                      }}
                    >
                      Change Status
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {selectedPO.status !== 'received' && selectedPO.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      className="bg-success hover:bg-success/90 text-white gap-1.5 text-xs"
                      onClick={() => handleReceive(selectedPO)}
                    >
                      <PackageCheck className="h-4 w-4" /> Receive Items into Inventory
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Status Modal */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Set status for <span className="font-mono-code font-bold">{selectedPO?.poNumber}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as PurchaseOrderStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="ordered">Ordered from Supplier</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>Save Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
