'use client';

import { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  Bell,
  Shield,
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useInventoryStore } from '@/store/inventory-store';
import { useToast } from '@/hooks/use-toast';
import type { SystemSettings } from '@/types/settings';

export default function SettingsPage() {
  const settings = useInventoryStore((s) => s.settings);
  const updateSettings = useInventoryStore((s) => s.updateSettings);
  const resetDemoData = useInventoryStore((s) => s.resetDemoData);
  const fullStoreState = useInventoryStore.getState();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast({
      title: 'Settings Saved',
      description: 'Your system configuration has been successfully updated.',
    });
  };

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      storeName: formData.storeName,
      products: fullStoreState.products,
      categories: fullStoreState.categories,
      suppliers: fullStoreState.suppliers,
      transactions: fullStoreState.transactions,
      purchaseOrders: fullStoreState.purchaseOrders,
      serials: fullStoreState.serials,
      warranties: fullStoreState.warranties,
      settings: formData,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `electrostock_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Backup Downloaded',
      description: 'Complete inventory and system database exported.',
    });
  };

  const handleReset = () => {
    resetDemoData();
    setFormData({ ...useInventoryStore.getState().settings });
    toast({
      title: 'Demo Data Restored',
      description: 'All inventories, mock transactions, and settings have been reset.',
    });
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="System Settings"
        description="Configure organization profile, automated reorder thresholds, tax policies, and database backups."
        actions={
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Store Profile */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Company & Store Information
            </CardTitle>
            <CardDescription className="text-xs">
              Displayed on invoices, customer warranty certificates, and purchase orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="storeName">Store / Business Name</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storeEmail">Business Support Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={formData.storeEmail}
                  onChange={(e) => handleChange('storeEmail', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="storePhone">Contact Phone Number</Label>
                <Input
                  id="storePhone"
                  value={formData.storePhone}
                  onChange={(e) => handleChange('storePhone', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storeAddress">Store Physical Address</Label>
                <Input
                  id="storeAddress"
                  value={formData.storeAddress}
                  onChange={(e) => handleChange('storeAddress', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Currency & Financial Rules */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Currency & Tax Rules
            </CardTitle>
            <CardDescription className="text-xs">
              Configure local valuation currency and tax calculation percentages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency Code</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Input
                  id="currencySymbol"
                  value={formData.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="taxRate">Standard GST / Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Automation & Inventory Thresholds */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Inventory & Warning Rules
            </CardTitle>
            <CardDescription className="text-xs">
              Set automated notifications for stock replenishment and expiring warranties.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="minStock">Default Minimum Stock Threshold</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="1"
                  value={formData.lowStockThresholdDefault}
                  onChange={(e) => handleChange('lowStockThresholdDefault', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="warDays">Warranty Expiry Alert Window (Days)</Label>
                <Input
                  id="warDays"
                  type="number"
                  min="1"
                  value={formData.warrantyExpiryWarningDays}
                  onChange={(e) => handleChange('warrantyExpiryWarningDays', parseInt(e.target.value) || 30)}
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">Auto-generate Low Stock Alerts</div>
                  <div className="text-xs text-muted-foreground">Trigger critical alerts whenever items reach min threshold</div>
                </div>
                <Switch
                  checked={formData.autoAlertLowStock}
                  onCheckedChange={(v) => handleChange('autoAlertLowStock', v)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-foreground">Expiring Warranty Notifications</div>
                  <div className="text-xs text-muted-foreground">Alert staff when customer warranty is within 30 days of expiry</div>
                </div>
                <Switch
                  checked={formData.autoAlertExpiringWarranty}
                  onCheckedChange={(v) => handleChange('autoAlertExpiringWarranty', v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Display & Theme Preferences */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Laptop className="h-4 w-4 text-primary" /> Appearance & Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" /> Light Mode
              </Button>
              <Button
                type="button"
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" /> Dark Mode
              </Button>
              <Button
                type="button"
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setTheme('system')}
              >
                <Laptop className="h-4 w-4" /> System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 5. Data Management & Disaster Recovery */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Data Management & Backups
            </CardTitle>
            <CardDescription className="text-xs">
              Export system snapshots or reset the application data to sample state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleExportBackup}
                className="gap-2 text-xs"
              >
                <Download className="h-4 w-4" /> Export Complete System Backup (JSON)
              </Button>

              <Button
                type="button"
                variant="outline"
                className="gap-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setResetConfirmOpen(true)}
              >
                <RotateCcw className="h-4 w-4" /> Reset to Demo Mock Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset System Data?"
        description="This will restore all products, suppliers, categories, transactions, and warranties to original demo records. Any newly created entries will be reset."
        confirmLabel="Confirm Reset"
        onConfirm={handleReset}
        destructive
      />
    </div>
  );
}
