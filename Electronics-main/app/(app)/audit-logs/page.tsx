'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileCheck2,
  ShieldAlert,
  Search,
  Download,
  Filter,
  RefreshCw,
  User,
  Clock,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Package,
  ShoppingCart,
  Truck,
  Settings,
  LogIn,
  LogOut,
  ArrowDownToLine,
  ArrowUpFromLine,
  Shield,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventoryStore } from '@/store/inventory-store';
import { useAuthStore } from '@/store/auth-store';
import { canViewAuditLogs, getRoleLabel } from '@/lib/permissions';
import { downloadCSV, formatDate, getInitials } from '@/lib/calculations';
import type { AuditLog, AuditAction } from '@/types/audit';

export default function AuditLogsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const auditLogs = useInventoryStore((s) => s.auditLogs);

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const isAuthorized = user && canViewAuditLogs(user.role);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (userFilter !== 'all' && log.userName !== userFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inDesc = log.description.toLowerCase().includes(q);
        const inRelated = log.relatedId?.toLowerCase().includes(q);
        const inAction = log.actionLabel.toLowerCase().includes(q);
        const inUser = log.userName.toLowerCase().includes(q);
        if (!inDesc && !inRelated && !inAction && !inUser) return false;
      }
      return true;
    });
  }, [auditLogs, actionFilter, userFilter, searchQuery]);

  // Unique users for filter
  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.userName))).filter(Boolean);
  }, [auditLogs]);

  // KPI Metrics
  const totalLogs = auditLogs.length;
  const securityLogs = auditLogs.filter(
    (l) => l.action === 'login' || l.action === 'logout' || l.action.startsWith('user_')
  ).length;
  const inventoryLogs = auditLogs.filter(
    (l) => l.action.startsWith('stock_') || l.action.startsWith('product_')
  ).length;
  const purchaseLogs = auditLogs.filter(
    (l) => l.action.startsWith('purchase_') || l.action.startsWith('supplier_')
  ).length;

  const handleExport = () => {
    const headers = [
      'Log ID',
      'Date',
      'Time',
      'Action',
      'User Name',
      'User Role',
      'Related ID',
      'Description',
      'IP Address',
    ];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.date,
      l.time,
      l.actionLabel,
      l.userName,
      l.userRole,
      l.relatedId || '—',
      l.description,
      l.ipAddress || '—',
    ]);
    downloadCSV(`electrostock_audit_logs_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-3.5 w-3.5 text-info" />;
      case 'logout':
        return <LogOut className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'stock_in':
        return <ArrowDownToLine className="h-3.5 w-3.5 text-success" />;
      case 'stock_out':
        return <ArrowUpFromLine className="h-3.5 w-3.5 text-primary" />;
      case 'payment_completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case 'product_created':
      case 'product_updated':
      case 'product_deleted':
        return <Package className="h-3.5 w-3.5 text-purple-600" />;
      case 'purchase_order_created':
      case 'purchase_order_approved':
      case 'stock_received':
        return <ShoppingCart className="h-3.5 w-3.5 text-amber-600" />;
      case 'supplier_created':
      case 'supplier_updated':
      case 'supplier_deleted':
        return <Truck className="h-3.5 w-3.5 text-indigo-600" />;
      case 'settings_updated':
        return <Settings className="h-3.5 w-3.5 text-cyan-600" />;
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
      case 'user_status_changed':
        return <Shield className="h-3.5 w-3.5 text-rose-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  // If user is not admin, show Access Denied card (Requirement 3, 4, 15)
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          System Audit Logs are strictly restricted to System Administrators. Your current role is{' '}
          <strong className="text-foreground">{user ? getRoleLabel(user.role) : 'Unassigned'}</strong>.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Audit Logs"
        description="Tamper-evident operational audit trail recording security, inventory movements, transactions, and user administration events."
        actions={
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Audit CSV
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Audit Events
              </p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalLogs}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Inventory & Stock
              </p>
              <h3 className="text-2xl font-bold mt-1 text-success">{inventoryLogs}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Procurement & POs
              </p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {purchaseLogs}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Auth & Security
              </p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                {securityLogs}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="border border-border">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search description, reference, operator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">User Sign In</SelectItem>
                <SelectItem value="logout">User Sign Out</SelectItem>
                <SelectItem value="stock_in">Stock Inward</SelectItem>
                <SelectItem value="stock_out">Stock Outward</SelectItem>
                <SelectItem value="stock_received">PO Stock Received</SelectItem>
                <SelectItem value="payment_completed">Payment Completed</SelectItem>
                <SelectItem value="purchase_order_created">PO Created</SelectItem>
                <SelectItem value="purchase_order_approved">PO Approved</SelectItem>
                <SelectItem value="product_created">Product Added</SelectItem>
                <SelectItem value="product_updated">Product Updated</SelectItem>
                <SelectItem value="supplier_created">Supplier Added</SelectItem>
                <SelectItem value="user_created">User Created</SelectItem>
                <SelectItem value="settings_updated">Settings Changed</SelectItem>
              </SelectContent>
            </Select>

            {/* User Filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operators</SelectItem>
                {uniqueUsers.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || actionFilter !== 'all' || userFilter !== 'all') && (
            <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
              <span>
                Showing {filteredLogs.length} of {auditLogs.length} log records
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActionFilter('all');
                  setUserFilter('all');
                }}
                className="h-6 text-xs px-2 text-primary"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Logs Table */}
      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/70 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3 w-36">Timestamp</th>
                <th className="p-3 w-48">Event / Action</th>
                <th className="p-3 w-44">Operator</th>
                <th className="p-3 w-36">Related Ref</th>
                <th className="p-3">Description</th>
                <th className="p-3 w-28 text-right">Device / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    {/* Timestamp */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono-code font-semibold text-foreground">{log.date}</div>
                      <div className="text-[11px] text-muted-foreground font-mono-code">{log.time}</div>
                    </td>

                    {/* Action */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-muted/70 shrink-0">
                          {getActionIcon(log.action)}
                        </div>
                        <span className="font-semibold text-foreground text-xs">{log.actionLabel}</span>
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                          {getInitials(log.userName)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-foreground block truncate">{log.userName}</span>
                          <span className="text-[10px] text-muted-foreground capitalize">{log.userRole}</span>
                        </div>
                      </div>
                    </td>

                    {/* Related ID */}
                    <td className="p-3 whitespace-nowrap">
                      {log.relatedId ? (
                        <Badge variant="outline" className="font-mono-code text-[11px] bg-muted/40">
                          {log.relatedId}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="p-3">
                      <span className="text-foreground text-xs leading-relaxed">{log.description}</span>
                    </td>

                    {/* IP */}
                    <td className="p-3 whitespace-nowrap text-right font-mono-code text-[11px] text-muted-foreground">
                      {log.ipAddress || '192.168.1.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
