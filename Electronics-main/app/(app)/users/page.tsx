'use client';

import { useState } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  Lock,
  Mail,
  Check,
  X,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatDate, getInitials, downloadCSV } from '@/lib/calculations';
import type { User, UserRole, UserStatus } from '@/types/user';

export default function UsersPage() {
  const users = useInventoryStore((s) => s.users);
  const addUser = useInventoryStore((s) => s.addUser);
  const updateUser = useInventoryStore((s) => s.updateUser);
  const deleteUser = useInventoryStore((s) => s.deleteUser);
  const toggleUserStatus = useInventoryStore((s) => s.toggleUserStatus);
  const currentUser = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('staff');
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: name.trim(),
        email: email.trim(),
        role,
        status: editingUser.status,
      });
      toast({ title: 'User Updated', description: `${name} has been updated.` });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        role,
        status: 'active',
      });
      toast({ title: 'User Created', description: `Account created for ${name}.` });
    }

    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentUser?.id) {
      toast({ title: 'Action Denied', description: 'You cannot delete your own account.', variant: 'destructive' });
      setDeleteTarget(null);
      return;
    }

    deleteUser(deleteTarget.id);
    toast({ title: 'User Deleted', description: `${deleteTarget.name} has been removed.` });
    setDeleteTarget(null);
  };

  const handleToggleStatus = (u: User) => {
    if (u.id === currentUser?.id) {
      toast({ title: 'Action Denied', description: 'You cannot deactivate your own account.', variant: 'destructive' });
      return;
    }
    toggleUserStatus(u.id);
    toast({
      title: 'Status Changed',
      description: `${u.name} is now ${u.status === 'active' ? 'inactive' : 'active'}.`,
    });
  };

  const handleExport = () => {
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Last Login', 'Created At'];
    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.status,
      u.lastLogin ? formatDate(u.lastLogin) : 'Never',
      formatDate(u.createdAt),
    ]);
    downloadCSV('users_directory.csv', headers, rows);
  };

  const activeCount = users.filter((u) => u.status === 'active').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const managerCount = users.filter((u) => u.role === 'manager').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 capitalize">
            Administrator
          </Badge>
        );
      case 'manager':
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize">
            Manager
          </Badge>
        );
      case 'staff':
      default:
        return (
          <Badge variant="outline" className="bg-secondary/40 text-secondary-foreground border-border capitalize">
            Staff / Cashier
          </Badge>
        );
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      sortValue: (u) => u.name,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
            {getInitials(u.name)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">{u.name}</div>
            <div className="text-xs text-muted-foreground truncate">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      sortValue: (u) => u.role,
      render: (u) => getRoleBadge(u.role),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (u) => u.status,
      render: (u) => (
        <Badge
          variant="outline"
          className={u.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}
        >
          {u.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Active',
      sortable: true,
      sortValue: (u) => u.lastLogin || '',
      render: (u) => (
        <span className="text-xs text-muted-foreground">
          {u.lastLogin ? formatDate(u.lastLogin) : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => handleOpenEdit(u)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`text-xs h-7 px-2 ${u.status === 'active' ? 'text-warning hover:text-warning' : 'text-success hover:text-success'}`}
            onClick={() => handleToggleStatus(u)}
          >
            {u.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(u)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Access Management"
        description="Configure system user accounts, assign role permissions, and control staff authentication."
        actions={
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add New User
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Accounts</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{users.length}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <UsersIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Users</p>
              <h3 className="text-2xl font-bold mt-1 text-success">{activeCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Admins & Managers</p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                {adminCount + managerCount}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Staff / Cashiers</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{staffCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <Lock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <DataTable
            data={users}
            columns={columns}
            searchPlaceholder="Search user name or email..."
            searchKeys={['name', 'email']}
            filters={[
              {
                key: 'role',
                label: 'Role',
                options: [
                  { label: 'Admin', value: 'admin' },
                  { label: 'Manager', value: 'manager' },
                  { label: 'Staff', value: 'staff' },
                ],
                filterFn: (row, val) => row.role === val,
              },
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ],
                filterFn: (row, val) => row.status === val,
              },
            ]}
            onExport={handleExport}
            getRowId={(r) => r.id}
          />
        </CardContent>
      </Card>

      {/* Role Permission Matrix Card */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Role Access & Permission Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-3">Module / Feature</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Manager</th>
                  <th className="p-3 text-center">Staff / Cashier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-medium text-foreground">Dashboard & General Metrics</td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">Product Catalog & Categories</td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><span className="text-muted-foreground">View Only</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">Stock In / Stock Out (Sales)</td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">Serial & IMEI Tracking</td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">Warranty Registration & Claims</td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">Purchase Orders & Suppliers</td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">Profit & Loss Financials</td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-foreground">User Management & System Settings</td>
                  <td className="p-3 text-center"><Check className="h-4 w-4 text-success mx-auto" /></td>
                  <td className="p-3 text-center"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                  <td className="p-3 text-center"><X className="h-4 w-4 text-muted-foreground/40 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit User Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User Account' : 'Create Staff Account'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user profile details and role.' : 'Add a new operator to ElectroStock.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Anand Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. anand@electrostock.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role">Assign Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                    <SelectItem value="manager">Manager (Inventory, POs & Reports)</SelectItem>
                    <SelectItem value="staff">Staff / Cashier (Stock In/Out & Warranty)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingUser ? 'Save Changes' : 'Create User'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User Account"
        description={`Are you sure you want to permanently delete user ${deleteTarget?.name}? This action cannot be reversed.`}
        confirmLabel="Delete User"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
