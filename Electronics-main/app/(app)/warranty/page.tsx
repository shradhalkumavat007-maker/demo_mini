'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Plus,
  Search,
  FileCheck,
  AlertTriangle,
  Printer,
  Calendar,
  User,
  Phone,
  Mail,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { WarrantyStatusBadge } from '@/components/common/warranty-status-badge';
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
import { Textarea } from '@/components/ui/textarea';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import { formatDate, downloadCSV, daysUntil } from '@/lib/calculations';
import type { Warranty, WarrantyClaim } from '@/types/warranty';

export default function WarrantyPage() {
  const warranties = useInventoryStore((s) => s.warranties);
  const products = useInventoryStore((s) => s.products);
  const addWarranty = useInventoryStore((s) => s.addWarranty);
  const claimWarranty = useInventoryStore((s) => s.claimWarranty);
  const { toast } = useToast();

  // Register Dialog
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Claim Dialog
  const [claimOpen, setClaimOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [claimStatus, setClaimStatus] = useState<WarrantyClaim['status']>('in_repair');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Certificate Modal
  const [certOpen, setCertOpen] = useState(false);
  const [certWarranty, setCertWarranty] = useState<Warranty | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !serialNumber.trim() || !customerName.trim()) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    addWarranty({
      productId: selectedProductId,
      serialNumber: serialNumber.trim(),
      customerRef: customerName.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      startDate: new Date(startDate).toISOString(),
      durationMonths: !isNaN(parseInt(durationMonths)) && parseInt(durationMonths) >= 0 ? parseInt(durationMonths) : 12,
    });

    toast({
      title: 'Warranty Registered',
      description: `Warranty certificate generated for ${customerName}.`,
    });
    setRegisterOpen(false);
    setSelectedProductId('');
    setSerialNumber('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty || !issueDescription.trim()) {
      toast({ title: 'Please describe the warranty issue', variant: 'destructive' });
      return;
    }

    claimWarranty(selectedWarranty.id, issueDescription.trim(), claimStatus, resolutionNotes.trim());
    toast({
      title: 'Claim Processed',
      description: `Claim recorded for serial ${selectedWarranty.serialNumber} (${claimStatus}).`,
    });
    setClaimOpen(false);
    setSelectedWarranty(null);
    setIssueDescription('');
    setResolutionNotes('');
  };

  const handleExport = () => {
    const headers = ['Serial Number', 'Product Name', 'Customer Name', 'Status', 'Start Date', 'End Date', 'Days Remaining'];
    const rows = warranties.map((w) => [
      w.serialNumber,
      w.productName,
      w.customerName || w.customerRef,
      w.status,
      formatDate(w.startDate),
      formatDate(w.endDate),
      daysUntil(w.endDate),
    ]);
    downloadCSV('warranty_records.csv', headers, rows);
  };

  const totalWarranties = warranties.length;
  const activeCount = warranties.filter((w) => w.status === 'active').length;
  const expiringCount = warranties.filter((w) => w.status === 'expiring_soon').length;
  const expiredCount = warranties.filter((w) => w.status === 'expired').length;

  const columns: Column<Warranty>[] = [
    {
      key: 'serialNumber',
      header: 'Device & Serial',
      sortable: true,
      sortValue: (w) => w.serialNumber,
      render: (w) => (
        <div className="space-y-1">
          <div className="font-medium text-sm text-foreground">{w.productName}</div>
          <span className="font-mono-code text-xs bg-muted px-2 py-0.5 rounded border border-border text-foreground">
            SN: {w.serialNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      sortValue: (w) => w.customerName || w.customerRef,
      render: (w) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-medium text-foreground">{w.customerName || w.customerRef}</div>
          {w.customerPhone && <div className="text-muted-foreground">{w.customerPhone}</div>}
          {w.customerEmail && <div className="text-muted-foreground">{w.customerEmail}</div>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Warranty Status',
      sortable: true,
      sortValue: (w) => w.status,
      render: (w) => <WarrantyStatusBadge status={w.status} />,
    },
    {
      key: 'duration',
      header: 'Coverage Period',
      render: (w) => {
        const remaining = daysUntil(w.endDate);
        return (
          <div className="space-y-0.5 text-xs">
            <div className="text-muted-foreground">
              {formatDate(w.startDate)} - {formatDate(w.endDate)}
            </div>
            <div className={remaining < 0 ? 'text-destructive font-medium' : remaining <= 30 ? 'text-warning font-medium' : 'text-success font-medium'}>
              {remaining < 0 ? `Expired ${Math.abs(remaining)} days ago` : `${remaining} days remaining`}
            </div>
          </div>
        );
      },
    },
    {
      key: 'claims',
      header: 'Claims',
      render: (w) => {
        const count = w.claims?.length || 0;
        return count > 0 ? (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {count} Claim{count > 1 ? 's' : ''}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (w) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 gap-1"
            onClick={() => {
              setCertWarranty(w);
              setCertOpen(true);
            }}
          >
            <FileCheck className="h-3 w-3" /> Certificate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 gap-1"
            onClick={() => {
              setSelectedWarranty(w);
              setClaimOpen(true);
            }}
          >
            <Wrench className="h-3 w-3" /> Claim
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warranty Management"
        description="Manage customer warranty coverages, claims, expiry tracking, and repair service requests."
        actions={
          <Button onClick={() => setRegisterOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Register New Warranty
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Coverages</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalWarranties}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Coverages</p>
              <h3 className="text-2xl font-bold mt-1 text-success">{activeCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiring Soon (≤30d)</p>
              <h3 className="text-2xl font-bold mt-1 text-warning">{expiringCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expired</p>
              <h3 className="text-2xl font-bold mt-1 text-destructive">{expiredCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
              <ShieldX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <DataTable
            data={warranties}
            columns={columns}
            searchPlaceholder="Search customer, serial, or product..."
            searchKeys={['serialNumber', 'productName', 'customerRef', (w) => w.customerName || '']}
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Active', value: 'active' },
                  { label: 'Expiring Soon', value: 'expiring_soon' },
                  { label: 'Expired', value: 'expired' },
                ],
                filterFn: (row, val) => row.status === val,
              },
            ]}
            onExport={handleExport}
            getRowId={(r) => r.id}
          />
        </CardContent>
      </Card>

      {/* Register Warranty Modal */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleRegister}>
            <DialogHeader>
              <DialogTitle>Register Customer Warranty</DialogTitle>
              <DialogDescription>
                Issue a new digital warranty certificate for a customer purchase.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Select Product *</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.brand})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Device Serial Number *</Label>
                <Input
                  placeholder="e.g. SN-SAM-2024-991"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="font-mono-code"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Customer Name *</Label>
                  <Input
                    placeholder="e.g. Rajesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+91 98765 00000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Warranty Duration</Label>
                  <Select value={durationMonths} onValueChange={setDurationMonths}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 Months (No Warranty)</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months (1 Year)</SelectItem>
                      <SelectItem value="24">24 Months (2 Years)</SelectItem>
                      <SelectItem value="36">36 Months (3 Years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Issue Warranty</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Claim Processing Modal */}
      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleClaim}>
            <DialogHeader>
              <DialogTitle>File Warranty Claim / Repair</DialogTitle>
              <DialogDescription>
                Process customer RMA request for SN: <span className="font-mono-code font-bold">{selectedWarranty?.serialNumber}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-md text-xs space-y-1">
                <div><span className="font-semibold">Product:</span> {selectedWarranty?.productName}</div>
                <div><span className="font-semibold">Customer:</span> {selectedWarranty?.customerName || selectedWarranty?.customerRef}</div>
                <div><span className="font-semibold">Expires:</span> {selectedWarranty?.endDate ? formatDate(selectedWarranty.endDate) : ''}</div>
              </div>

              <div className="space-y-1.5">
                <Label>Issue / Defect Description *</Label>
                <Textarea
                  placeholder="e.g. Device screen flickers intermittently, audio jack not responsive."
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Claim Status / Action</Label>
                <Select value={claimStatus} onValueChange={(v) => setClaimStatus(v as WarrantyClaim['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_repair">Send to Service Center (In Repair)</SelectItem>
                    <SelectItem value="replaced">Approved - Replace Unit</SelectItem>
                    <SelectItem value="refunded">Approved - Refund Customer</SelectItem>
                    <SelectItem value="pending">Pending Technician Review</SelectItem>
                    <SelectItem value="rejected">Rejected (Out of Scope)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Technician Notes (Optional)</Label>
                <Input
                  placeholder="Ticket reference or technician diagnostic"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClaimOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Claim</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Warranty Certificate Modal */}
      <Dialog open={certOpen} onOpenChange={setCertOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" /> Warranty Certificate
            </DialogTitle>
          </DialogHeader>

          {certWarranty && (
            <div className="p-6 border-2 border-primary/20 rounded-xl bg-card space-y-5 my-2">
              <div className="text-center border-b border-border pb-4">
                <h3 className="text-lg font-bold uppercase tracking-wider text-primary">Official Warranty Certificate</h3>
                <p className="text-xs text-muted-foreground mt-1">ElectroStock Verified Coverage Guarantee</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Customer:</span>
                  <span className="font-semibold text-sm text-foreground">{certWarranty.customerName || certWarranty.customerRef}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Coverage Status:</span>
                  <div className="mt-0.5"><WarrantyStatusBadge status={certWarranty.status} /></div>
                </div>
                <div>
                  <span className="text-muted-foreground block">Product:</span>
                  <span className="font-semibold text-foreground">{certWarranty.productName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Serial Number:</span>
                  <span className="font-mono-code font-bold text-foreground">{certWarranty.serialNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Valid From:</span>
                  <span className="font-semibold text-foreground">{formatDate(certWarranty.startDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Valid Until:</span>
                  <span className="font-semibold text-foreground">{formatDate(certWarranty.endDate)}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/60 rounded-md text-[11px] text-muted-foreground leading-relaxed">
                This certificate entitles the bearer to manufacturer authorized service and parts replacement for hardware defects according to ElectroStock Standard Warranty Terms.
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <Button variant="ghost" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Printer className="h-4 w-4" /> Print Certificate
            </Button>
            <Button onClick={() => setCertOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
