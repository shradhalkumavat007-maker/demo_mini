'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Eye, Pencil, Trash2, Truck, Mail, Phone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import { supplierSchema } from '@/lib/validation';
import { supplierService } from '@/services/supplier-service';
import { formatINR, downloadCSV } from '@/lib/calculations';
import type { Supplier, SupplierInput } from '@/types/supplier';

const emptyForm: SupplierInput = {
  name: '', company: '', phone: '', email: '', address: '', gstin: '', status: 'active',
};

export default function SuppliersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suppliers = useInventoryStore((s) => s.suppliers);
  const products = useInventoryStore((s) => s.products);
  const purchaseOrders = useInventoryStore((s) => s.purchaseOrders);
  const addSupplier = useInventoryStore((s) => s.addSupplier);
  const updateSupplier = useInventoryStore((s) => s.updateSupplier);
  const deleteSupplier = useInventoryStore((s) => s.deleteSupplier);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setEditing(null);
      setForm(emptyForm);
      setOpen(true);
      router.replace('/suppliers');
    }
  }, [searchParams, router]);

  const handleSave = async () => {
    setErrors({});
    const result = supplierSchema.safeParse(form);
    if (!result.success) {
      const fe: Record<string, string> = {};
      result.error.issues.forEach((i) => { const f = i.path[0] as string; if (!fe[f]) fe[f] = i.message; });
      setErrors(fe);
      return;
    }
    if (editing) {
      await supplierService.updateSupplier(editing.id, form);
      toast({ title: 'Supplier updated', description: `${form.company} has been updated.` });
    } else {
      await supplierService.createSupplier(form);
      toast({ title: 'Supplier added', description: `${form.company} has been added.` });
    }
    setOpen(false);
  };

  const handleExport = () => {
    const headers = ['Supplier Name', 'Company', 'Phone', 'Email', 'GSTIN', 'Status'];
    const rows = suppliers.map((s) => [s.name, s.company, s.phone, s.email, s.gstin, s.status]);
    downloadCSV('suppliers.csv', headers, rows);
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'name', header: 'Supplier', sortable: true, sortValue: (s) => s.name,
      render: (s) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{s.name}</div>
            <div className="text-xs text-muted-foreground truncate">{s.company}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (s) => <span className="text-sm">{s.phone}</span> },
    { key: 'email', header: 'Email', render: (s) => <span className="text-sm text-muted-foreground">{s.email}</span> },
    {
      key: 'products', header: 'Products', sortable: true,
      sortValue: (s) => products.filter((p) => p.supplierId === s.id).length,
      render: (s) => <span className="text-sm">{products.filter((p) => p.supplierId === s.id).length}</span>,
    },
    {
      key: 'totalPurchases', header: 'Total Purchases', sortable: true,
      sortValue: (s) => purchaseOrders.filter((p) => p.supplierId === s.id).reduce((sum, p) => sum + p.totalCost, 0),
      render: (s) => {
        const total = purchaseOrders.filter((p) => p.supplierId === s.id).reduce((sum, p) => sum + p.totalCost, 0);
        return <span className="text-sm font-mono-code">{formatINR(total)}</span>;
      },
    },
    {
      key: 'pending', header: 'Pending Orders', sortable: true,
      sortValue: (s) => purchaseOrders.filter((p) => p.supplierId === s.id && p.status !== 'received' && p.status !== 'cancelled').length,
      render: (s) => <span className="text-sm">{purchaseOrders.filter((p) => p.supplierId === s.id && p.status !== 'received' && p.status !== 'cancelled').length}</span>,
    },
    {
      key: 'status', header: 'Status', sortable: true, sortValue: (s) => s.status,
      render: (s) => (
        <Badge variant="outline" className={s.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
          {s.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/suppliers/${s.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(s); setForm({ name: s.name, company: s.company, phone: s.phone, email: s.email, address: s.address, gstin: s.gstin, status: s.status }); setOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(s)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Manage your supplier relationships and contacts."
        actions={<Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> Add Supplier</Button>}
      />
      <DataTable
        data={suppliers}
        columns={columns}
        searchPlaceholder="Search suppliers..."
        searchKeys={[(s) => s.name, (s) => s.company, (s) => s.email, (s) => s.phone]}
        filters={[{ label: 'Status', key: 'status', options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }], filterFn: (s: Supplier, v: string) => s.status === v }]}
        getRowId={(s) => s.id}
        onRowClick={(s) => router.push(`/suppliers/${s.id}`)}
        onExport={handleExport}
        emptyTitle="No suppliers yet"
        emptyDescription="Add your first supplier to start managing purchases."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Contact Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rajesh Mehta" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Mehta Electronics" />
                {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@company.in" />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Address *</Label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full business address" rows={2} />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              </div>
              <div className="space-y-2">
                <Label>GSTIN</Label>
                <Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="27AABCM1234L1Z5" className="font-mono-code" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update Supplier' : 'Add Supplier'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Supplier?"
        description={`This will remove ${deleteTarget?.company}. Products linked to this supplier will need reassignment.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) { deleteSupplier(deleteTarget.id); toast({ title: 'Supplier deleted' }); setDeleteTarget(null); }
        }}
        destructive
      />
    </div>
  );
}
