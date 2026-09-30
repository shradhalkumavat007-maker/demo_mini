import {
  LayoutDashboard,
  Package,
  FolderTree,
  Truck,
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Smartphone,
  ShieldCheck,
  ShoppingCart,
  ClipboardList,
  RefreshCw,
  Bell,
  TrendingUp,
  FileBarChart,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { PermissionKey } from '@/lib/permissions';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: PermissionKey;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', href: '/products', icon: Package, permission: 'products' },
      { label: 'Categories', href: '/categories', icon: FolderTree, permission: 'categories' },
      { label: 'Suppliers', href: '/suppliers', icon: Truck, permission: 'suppliers' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { label: 'Stock In', href: '/inventory/stock-in', icon: ArrowDownToLine, permission: 'stock_in' },
      { label: 'Stock Out', href: '/inventory/stock-out', icon: ArrowUpFromLine, permission: 'stock_out' },
      { label: 'Stock History', href: '/inventory/history', icon: History, permission: 'stock_history' },
      { label: 'Serial / IMEI', href: '/serial-imei', icon: Smartphone, permission: 'serial_imei' },
      { label: 'Warranty', href: '/warranty', icon: ShieldCheck, permission: 'warranty' },
    ],
  },
  {
    label: 'Purchase & Reorder',
    items: [
      { label: 'Purchase Center', href: '/purchase-center', icon: ShoppingCart, permission: 'purchase_center' },
      { label: 'Purchase Orders', href: '/purchase-orders', icon: ClipboardList, permission: 'purchase_orders' },
      { label: 'Reorder Suggestions', href: '/reorder', icon: RefreshCw, permission: 'reorder' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Alerts', href: '/alerts', icon: Bell, permission: 'alerts' },
      { label: 'Profit & Loss', href: '/profit-loss', icon: TrendingUp, permission: 'profit_loss' },
      { label: 'Reports', href: '/reports', icon: FileBarChart, permission: 'reports' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', href: '/users', icon: Users, permission: 'users' },
      { label: 'Settings', href: '/settings', icon: Settings, permission: 'settings' },
    ],
  },
];
