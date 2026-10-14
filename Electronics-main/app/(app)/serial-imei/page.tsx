'use client';

import { useState } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import { formatDate, downloadCSV } from '@/lib/calculations';
import type { SerialImei, SerialStatus } from '@/types/serial';

export default function SerialImeiPage() {
  const serials = useInventoryStore((s) => s.serials);
  const products = useInventoryStore((s) => s.products);
  const addSerial = useInventoryStore((s) => s.addSerial);
  const updateSerialStatus = useInventoryStore((s) => s.updateSerialStatus);
  const { toast } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei, setImei] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status Change Dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<SerialImei | null>(null);
  const [newStatus, setNewStatus] = useState<SerialStatus>('available');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copied to clipboard', description: text });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast({ title: 'Please select a product', variant: 'destructive' });
      return;
    }
    if (!serialNumber.trim()) {
      toast({ title: 'Please enter a serial number', variant: 'destructive' });
      return;
    }

    const res = addSerial(selectedProductId, serialNumber.trim(), imei.trim() || null);
    if (!res.success) {
      toast({ title: 'Error adding serial', description: res.error, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Serial Number Registered',
      description: `Serial ${serialNumber} successfully added to inventory.`,
    });
    setAddOpen(false);
    setSelectedProductId('');
    setSerialNumber('');
    setImei('');
  };

  const handleStatusUpdate = () => {
    if (!selectedSerial) return;
    updateSerialStatus(selectedSerial.id, newStatus);
    toast({
      title: 'Status Updated',
      description: `${selectedSerial.serialNumber} status changed to ${newStatus}.`,
    });
    setStatusDialogOpen(false);
    setSelectedSerial(null);
  };

  const handleExport = () => {
    const headers = ['Serial Number', 'IMEI', 'Product Name', 'Status', 'Date Added', 'Date Sold', 'Customer Ref'];
    const rows = serials.map((s) => [
      s.serialNumber,
      s.imei || 'N/A',
      s.productName,
      s.status,
      s.dateAdded,
      s.dateSold || 'N/A',
      s.customerRef || 'N/A',
    ]);
    downloadCSV('serial_imei_inventory.csv', headers, rows);
  };

  const getStatusBadge = (status: SerialStatus) => {
    switch (status) {
      case 'available':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Available
          </Badge>
        );
      case 'sold':
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
            <ShieldCheck className="h-3 w-3" /> Sold
          </Badge>
        );
      case 'service':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
            <AlertCircle className="h-3 w-3" /> In Service / RMA
          </Badge>
        );
      case 'reserved':
        return (
          <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground border-border gap-1">
            <Clock className="h-3 w-3" /> Reserved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalSerials = serials.length;
  const availableCount = serials.filter((s) => s.status === 'available').length;
  const soldCount = serials.filter((s) => s.status === 'sold').length;
  const serviceCount = serials.filter((s) => s.status === 'service').length;

  const columns: Column<SerialImei>[] = [
    {
      key: 'serialNumber',
      header: 'Serial / IMEI',
      sortable: true,
      sortValue: (s) => s.serialNumber,
      render: (s) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-code font-semibold text-sm text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
              {s.serialNumber}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => copyToClipboard(s.serialNumber, s.id + '-sn')}
            >
              {copiedId === s.id + '-sn' ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          {s.imei && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-[11px] uppercase tracking-wider text-muted-foreground/80">IMEI:</span>
              <span className="font-mono-code">{s.imei}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(s.imei!, s.id + '-imei')}
              >
                {copiedId === s.id + '-imei' ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-2.5 w-2.5" />}
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'productName',
      header: 'Product',
      sortable: true,
      sortValue: (s) => s.productName,
      render: (s) => (
        <div className="font-medium text-sm text-foreground">
          {s.productName}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (s) => s.status,
      render: (s) => getStatusBadge(s.status),
    },
    {
      key: 'dateAdded',
      header: 'Date Added',
      sortable: true,
      sortValue: (s) => s.dateAdded,
      render: (s) => <span className="text-xs text-muted-foreground">{formatDate(s.dateAdded)}</span>,
    },
    {
      key: 'customerRef',
      header: 'Customer / Ref',
      render: (s) => (
        <span className="text-xs text-muted-foreground">
          {s.customerRef || s.dateSold ? (
            <span className="text-foreground">{s.customerRef || 'Standard Sale'}</span>
          ) : (
            '—'
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7"
          onClick={() => {
            setSelectedSerial(s);
            setNewStatus(s.status);
            setStatusDialogOpen(true);
          }}
        >
          Change Status
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Serial & IMEI Management"
        description="Track individual serialized devices, smartphones, and warrantied electronics."
        actions={
          <>
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Register Serial / IMEI
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Serialized</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalSerials}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Stock / Available</p>
              <h3 className="text-2xl font-bold mt-1 text-success">{availableCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sold Units</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">{soldCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Service / RMA</p>
              <h3 className="text-2xl font-bold mt-1 text-warning">{serviceCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <DataTable
            data={serials}
            columns={columns}
            searchPlaceholder="Search Serial, IMEI, or Product..."
            searchKeys={['serialNumber', 'imei', 'productName', 'customerRef']}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Available', value: 'available' },
                  { label: 'Sold', value: 'sold' },
                  { label: 'In Service', value: 'service' },
                  { label: 'Reserved', value: 'reserved' },
                ],
                filterFn: (row, val) => row.status === val,
              },
            ]}
            onExport={handleExport}
            getRowId={(r) => r.id}
          />
        </CardContent>
      </Card>

      {/* Add Serial Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleAddSerial}>
            <DialogHeader>
              <DialogTitle>Register Serial / IMEI</DialogTitle>
              <DialogDescription>
                Attach a unique serial number or IMEI to an existing product in the catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="serial">Serial Number *</Label>
                <Input
                  id="serial"
                  placeholder="e.g. SN-IPH-2024-8891"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="font-mono-code"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="imei">IMEI Number (Optional for phones/cellular)</Label>
                <Input
                  id="imei"
                  placeholder="e.g. 863920194850123 (15 digits)"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="font-mono-code"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Serial</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Status Modal */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Serial Status</DialogTitle>
            <DialogDescription>
              Change status for <span className="font-mono-code font-bold">{selectedSerial?.serialNumber}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <Label>Select New Status</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as SerialStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available (In Stock)</SelectItem>
                <SelectItem value="sold">Sold to Customer</SelectItem>
                <SelectItem value="service">In Service / RMA Defective</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Save Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
