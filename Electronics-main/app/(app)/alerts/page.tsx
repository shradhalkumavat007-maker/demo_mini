'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable, type Column } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import { formatDateTime, formatDate, downloadCSV } from '@/lib/calculations';
import type { Alert, AlertType, AlertSeverity } from '@/types/alert';

export default function AlertsPage() {
  const alerts = useInventoryStore((s) => s.alerts);
  const markAlertRead = useInventoryStore((s) => s.markAlertRead);
  const resolveAlert = useInventoryStore((s) => s.resolveAlert);
  const generateAlerts = useInventoryStore((s) => s.generateAlerts);
  const { toast } = useToast();

  const handleMarkAllRead = () => {
    alerts.forEach((a) => {
      if (!a.read) markAlertRead(a.id);
    });
    toast({ title: 'Marked all as read', description: 'All alerts marked as viewed.' });
  };

  const handleRefresh = () => {
    generateAlerts();
    toast({ title: 'Alerts Refreshed', description: 'System scanned inventory and warranties.' });
  };

  const handleExport = () => {
    const headers = ['Severity', 'Type', 'Title', 'Message', 'Product', 'Read', 'Resolved', 'Timestamp'];
    const rows = alerts.map((a) => [
      a.severity,
      a.type,
      a.title,
      a.message,
      a.productName || 'N/A',
      a.read ? 'Yes' : 'No',
      a.resolved ? 'Yes' : 'No',
      a.createdAt,
    ]);
    downloadCSV('system_alerts.csv', headers, rows);
  };

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.severity === 'danger').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'danger':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
            <XCircle className="h-3 w-3" /> Critical
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
            <AlertTriangle className="h-3 w-3" /> Warning
          </Badge>
        );
      case 'info':
      default:
        return (
          <Badge variant="outline" className="bg-info/10 text-info border-info/20 gap-1">
            <Info className="h-3 w-3" /> Info
          </Badge>
        );
    }
  };

  const getQuickAction = (alert: Alert) => {
    switch (alert.type) {
      case 'out_of_stock':
      case 'low_stock':
        return (
          <Button asChild size="sm" variant="outline" className="text-xs h-7 gap-1">
            <Link href="/purchase-center">
              Reorder <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        );
      case 'warranty_expiring':
      case 'warranty_expired':
        return (
          <Button asChild size="sm" variant="outline" className="text-xs h-7 gap-1">
            <Link href="/warranty">
              Warranty <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        );
      case 'pending_po':
        return (
          <Button asChild size="sm" variant="outline" className="text-xs h-7 gap-1">
            <Link href="/purchase-orders">
              View PO <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        );
      default:
        return null;
    }
  };

  const columns: Column<Alert>[] = [
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      sortValue: (a) => (a.severity === 'danger' ? 1 : a.severity === 'warning' ? 2 : 3),
      render: (a) => getSeverityBadge(a.severity),
    },
    {
      key: 'details',
      header: 'Alert Details',
      sortable: true,
      sortValue: (a) => a.title,
      render: (a) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {!a.read && <span className="h-2 w-2 rounded-full bg-primary inline-block shrink-0" />}
            <span className={`text-sm font-semibold ${!a.read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {a.title}
            </span>
            {a.resolved && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] py-0">
                Resolved
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground max-w-xl">{a.message}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category',
      render: (a) => (
        <Badge variant="secondary" className="capitalize text-xs">
          {a.type.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      sortable: true,
      sortValue: (a) => a.createdAt,
      render: (a) => <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(a.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <div className="flex items-center gap-1.5">
          {getQuickAction(a)}
          {!a.read && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAlertRead(a.id)}
            >
              Mark Read
            </Button>
          )}
          {!a.resolved && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 text-success hover:text-success hover:bg-success/10"
              onClick={() => resolveAlert(a.id)}
            >
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Alerts & Notifications"
        description="Monitor system-generated inventory anomalies, stock shortages, warranty expirations, and procurement delays."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
              <RefreshCw className="h-4 w-4" /> Scan & Refresh
            </Button>
            <Button variant="default" size="sm" onClick={handleMarkAllRead} className="gap-1.5">
              <CheckCheck className="h-4 w-4" /> Mark All as Read
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unread Alerts</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">{unreadCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Critical / Danger</p>
              <h3 className="text-2xl font-bold mt-1 text-destructive">{criticalCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warnings</p>
              <h3 className="text-2xl font-bold mt-1 text-warning">{warningCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resolved</p>
              <h3 className="text-2xl font-bold mt-1 text-success">{resolvedCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <DataTable
            data={alerts}
            columns={columns}
            searchPlaceholder="Search alerts by title or description..."
            searchKeys={['title', 'message', 'type', (a) => a.productName || '']}
            filters={[
              {
                key: 'severity',
                label: 'Severity',
                options: [
                  { label: 'Critical', value: 'danger' },
                  { label: 'Warning', value: 'warning' },
                  { label: 'Info', value: 'info' },
                ],
                filterFn: (row, val) => row.severity === val,
              },
              {
                key: 'status',
                label: 'Read Status',
                options: [
                  { label: 'Unread', value: 'unread' },
                  { label: 'Read', value: 'read' },
                ],
                filterFn: (row, val) => (val === 'unread' ? !row.read : row.read),
              },
            ]}
            onExport={handleExport}
            getRowId={(r) => r.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
